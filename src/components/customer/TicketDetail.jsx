import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FaArrowLeft,
    FaPaperPlane,
    FaCheckCircle,
    FaComments,
    FaLock,
    FaTag,
    FaFlag,
    FaCalendarAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Navbar from '../common/Navbar';
import LoadingSpinner from '../common/LoadingSpinner';

/* ---------- Presentation helpers ---------- */

const cardClass =
    'rounded-2xl border border-[#E5E9E6] bg-white shadow-[0_1px_2px_rgba(47,62,70,0.04)]';

const badgeBase =
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap';

const STATUS_STEPS = ['New', 'Assigned', 'In Progress', 'Resolved'];

const getPriorityColor = (priority) => {
    const colors = {
        'Low': 'bg-[#E3EDE8] text-[#4F7566] ring-[#CFE0D7]',
        'Medium': 'bg-[#FBF3E4] text-[#9A6B1F] ring-[#F1E2C4]',
        'High': 'bg-[#FBEAEA] text-[#A94442] ring-[#F3D4D4]'
    };
    return colors[priority] || 'bg-[#F1F3F2] text-[#5B6B65] ring-[#E5E9E6]';
};

const Avatar = ({ name, tone = 'bg-[#E3EDE8] text-[#4F7566]' }) => (
    <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${tone}`}>
        {name ? name.charAt(0).toUpperCase() : '?'}
    </span>
);

const TicketDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { socket, isConnected, joinTicket, leaveTicket } = useSocket();
    const [ticket, setTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchTicketDetails();
    }, [id]);

    useEffect(() => {
        if (!socket || !isConnected) return;

        joinTicket(id);

        const handleNewMessage = ({ message, ticketId }) => {
            if (String(ticketId) === String(id)) {
                setMessages(prev => prev.some(m => m._id === message._id) ? prev : [...prev, message]);
            }
        };
        const handleTicketUpdated = (updated) => {
            if (String(updated._id) === String(id)) setTicket(updated);
        };

        socket.on('new-message', handleNewMessage);
        socket.on('ticket-updated', handleTicketUpdated);

        return () => {
            socket.off('new-message', handleNewMessage);
            socket.off('ticket-updated', handleTicketUpdated);
            leaveTicket(id);
        };
    }, [socket, isConnected, id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchTicketDetails = async () => {
        try {
            const [ticketRes, messagesRes] = await Promise.all([
                api.get(`/tickets/${id}`),
                api.get(`/messages/${id}`)
            ]);

            setTicket(ticketRes.data);
            setMessages(messagesRes.data);
        } catch (error) {
            toast.error('Failed to load ticket details');
            navigate('/tickets');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const response = await api.post('/messages', {
                ticketId: id,
                content: newMessage
            });

            setMessages(prev => prev.some(m => m._id === response.data._id) ? prev : [...prev, response.data]);

            setNewMessage('');
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'New': 'bg-[#EAF1F6] text-[#3E6A85] ring-[#D3E2EC]',
            'Assigned': 'bg-[#FBF3E4] text-[#9A6B1F] ring-[#F1E2C4]',
            'In Progress': 'bg-[#E3EDE8] text-[#4F7566] ring-[#CFE0D7]',
            'Resolved': 'bg-[#E6F2EA] text-[#2F7A4F] ring-[#CBE5D4]'
        };
        return colors[status] || 'bg-[#F1F3F2] text-[#5B6B65] ring-[#E5E9E6]';
    };

    const isMine = user?.role === 'admin' || ticket?.agent?._id === user?._id;

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!ticket) {
        return (
            <div className="min-h-screen bg-[#F6F8F6] text-[#5B6B65]">
                <Navbar />
                <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
                    <section className={`${cardClass} flex flex-col items-center px-6 py-16 text-center`}>
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E3EDE8] text-[#6B9080]">
                            <FaComments size={22} />
                        </div>
                        <p className="mt-4 text-base font-semibold text-[#2F3E46]">Ticket not found</p>
                        <p className="mt-1 text-sm text-[#5B6B65]">
                            This ticket may have been removed or the link is incorrect.
                        </p>
                    </section>
                </main>
            </div>
        );
    }

    const currentStep = STATUS_STEPS.indexOf(ticket.status);

    return (
        <div className="min-h-screen bg-[#F6F8F6] text-[#5B6B65]">
            <Navbar />
            <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
                <button
                    type="button"
                    onClick={() => navigate('/tickets')}
                    className="mb-5 inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-[#5A7D6E] transition-colors hover:bg-[#E3EDE8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9080]"
                >
                    <FaArrowLeft size={12} />
                    Back to my tickets
                </button>

                {/* Ticket header */}
                <section className={`${cardClass} mb-6 p-5 sm:p-7`}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                            <span className="inline-flex rounded-md bg-[#E3EDE8] px-2 py-0.5 font-mono text-xs font-semibold text-[#4F7566]">
                                Ticket #{ticket.ticketNumber}
                            </span>
                            <h1 className="mt-3 break-words text-xl font-semibold tracking-tight text-[#2F3E46] sm:text-2xl">
                                {ticket.subject}
                            </h1>
                        </div>
                        <span className={`${badgeBase} w-fit shrink-0 ${getStatusColor(ticket.status)}`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                            {ticket.status}
                        </span>
                    </div>

                    {/* Status progress */}
                    {currentStep !== -1 && (
                        <ol className="mt-6 grid grid-cols-4 gap-2" aria-label="Ticket progress">
                            {STATUS_STEPS.map((step, index) => {
                                const done = index <= currentStep;
                                return (
                                    <li key={step} className="min-w-0">
                                        <div className={`h-1.5 rounded-full ${done ? 'bg-[#6B9080]' : 'bg-[#EEF1EF]'}`} />
                                        <p className={`mt-2 truncate text-[11px] font-medium sm:text-xs ${index === currentStep ? 'text-[#2F3E46]' : done ? 'text-[#6B9080]' : 'text-[#9AA8A2]'}`}>
                                            {step}
                                        </p>
                                    </li>
                                );
                            })}
                        </ol>
                    )}

                    <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-[#E5E9E6] pt-5 sm:grid-cols-3">
                        <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F6F8F6] text-[#6B9080]">
                                <FaTag size={13} />
                            </span>
                            <div className="min-w-0">
                                <dt className="text-xs font-medium text-[#8A9993]">Category</dt>
                                <dd className="mt-0.5 break-words text-sm font-semibold text-[#2F3E46]">{ticket.category}</dd>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F6F8F6] text-[#6B9080]">
                                <FaFlag size={13} />
                            </span>
                            <div className="min-w-0">
                                <dt className="text-xs font-medium text-[#8A9993]">Priority</dt>
                                <dd className="mt-1">
                                    <span className={`${badgeBase} ${getPriorityColor(ticket.priority)}`}>
                                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                                        {ticket.priority}
                                    </span>
                                </dd>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F6F8F6] text-[#6B9080]">
                                <FaCalendarAlt size={13} />
                            </span>
                            <div className="min-w-0">
                                <dt className="text-xs font-medium text-[#8A9993]">Created</dt>
                                <dd className="mt-0.5 text-sm font-semibold text-[#2F3E46]">
                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                </dd>
                            </div>
                        </div>
                    </dl>

                    {ticket.resolutionNote && (
                        <div className="mt-6 flex gap-3 rounded-xl border border-[#CBE5D4] bg-[#E6F2EA] p-4">
                            <FaCheckCircle className="mt-0.5 shrink-0 text-[#2F7A4F]" size={17} />
                            <div>
                                <p className="text-sm font-semibold text-[#2F7A4F]">Resolution note</p>
                                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#2F3E46]">{ticket.resolutionNote}</p>
                            </div>
                        </div>
                    )}
                </section>

                {/* Conversation */}
                <section className={`${cardClass} overflow-hidden`}>
                    <div className="flex items-center justify-between gap-3 border-b border-[#E5E9E6] px-5 py-4 sm:px-6">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E3EDE8] text-[#6B9080]">
                                <FaComments size={14} />
                            </span>
                            <div>
                                <h2 className="text-base font-semibold text-[#2F3E46]">Conversation</h2>
                                <p className="text-xs text-[#8A9993]">
                                    Messages about ticket #{ticket.ticketNumber}
                                </p>
                            </div>
                        </div>
                        <span className="shrink-0 text-xs font-medium text-[#8A9993]">
                            {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                        </span>
                    </div>

                    <div className="max-h-[min(60vh,32rem)] min-h-56 space-y-4 overflow-y-auto bg-[#FBFCFB] px-4 py-5 sm:px-6">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E3EDE8] text-[#6B9080]">
                                    <FaComments size={18} />
                                </div>
                                <p className="mt-3 text-sm font-medium text-[#2F3E46]">No messages yet</p>
                                <p className="mt-0.5 text-xs text-[#8A9993]">Our support team will reply here.</p>
                            </div>
                        ) : (
                            messages.map((message) => {
                                const mine = message.sender._id === user?._id;
                                return (
                                    <div
                                        key={message._id}
                                        className={`flex items-end gap-2.5 ${mine ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {!mine && <Avatar name={message.sender.name} />}
                                        <div
                                            className={`max-w-[85%] break-words rounded-2xl px-4 py-3 sm:max-w-[72%] ${mine
                                                ? 'rounded-br-md bg-[#6B9080] text-white'
                                                : 'rounded-bl-md border border-[#E5E9E6] bg-white text-[#2F3E46]'
                                                }`}
                                        >
                                            <p className={`mb-1 text-xs font-semibold ${mine ? 'text-white' : 'text-[#2F3E46]'}`}>
                                                {message.sender.name}{' '}
                                                <span className={`font-normal capitalize ${mine ? 'text-white/75' : 'text-[#8A9993]'}`}>
                                                    ({message.sender.role})
                                                </span>
                                            </p>
                                            <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                                            <p className={`mt-1.5 text-right text-[11px] ${mine ? 'text-white/75' : 'text-[#8A9993]'}`}>
                                                {new Date(message.createdAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        {mine && <Avatar name={message.sender.name} tone="bg-[#6B9080] text-white" />}
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {ticket.status !== 'Resolved' && (
                        <form onSubmit={handleSendMessage} className="flex gap-3 border-t border-[#E5E9E6] bg-white p-4 sm:px-6">
                            <label htmlFor="ticket-message" className="sr-only">Type your message</label>
                            <input
                                id="ticket-message"
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="h-11 min-w-0 flex-1 rounded-lg border border-[#E5E9E6] bg-white px-3.5 text-sm text-[#2F3E46] outline-none transition placeholder:text-[#9AA8A2] hover:border-[#C9D6CF] focus:border-[#6B9080] focus:ring-4 focus:ring-[#6B9080]/15 disabled:bg-[#F6F8F6] disabled:opacity-70"
                                disabled={sending}
                            />
                            <button
                                type="submit"
                                disabled={sending || !newMessage.trim()}
                                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#6B9080] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(47,62,70,0.12)] transition-colors hover:bg-[#5A7D6E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9080] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:px-5"
                            >
                                <FaPaperPlane size={12} />
                                <span className="hidden sm:inline">{sending ? 'Sending...' : 'Send'}</span>
                            </button>
                        </form>
                    )}

                    {ticket.status === 'Resolved' && (
                        <div className="flex items-center justify-center gap-2 border-t border-[#E5E9E6] bg-[#F6F8F6] px-4 py-5 text-center text-sm text-[#5B6B65]">
                            <FaLock size={12} className="shrink-0 text-[#8A9993]" />
                            This ticket has been resolved. Contact support if you need to reopen it.
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default TicketDetail;
