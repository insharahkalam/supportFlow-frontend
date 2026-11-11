import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaRobot, FaPaperPlane, FaCheckCircle, FaUserPlus, FaPlay, FaRedo, FaHandPaper, FaTag, FaFlag, FaUser, FaHeadset, FaComments, FaLock } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Navbar from '../common/Navbar';
import LoadingSpinner from '../common/LoadingSpinner';
import AISuggestions from './AISuggestions';
import ConfirmationModal from '../common/ConfirmationModal';

/* ---------- Shared style tokens (presentation only) ---------- */

const cardClass =
    'rounded-2xl border border-[#E5E9E6] bg-white shadow-[0_1px_2px_rgba(47,62,70,0.04)]';

const btnPrimary =
    'inline-flex items-center justify-center gap-2 rounded-lg bg-[#6B9080] px-4 py-2.5 text-sm font-medium text-white shadow-[0_1px_2px_rgba(47,62,70,0.12)] transition-colors hover:bg-[#5A7D6E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9080] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

const btnSecondary =
    'inline-flex items-center justify-center gap-2 rounded-lg border border-[#E5E9E6] bg-white px-4 py-2.5 text-sm font-medium text-[#2F3E46] transition-colors hover:border-[#C9D6CF] hover:bg-[#F6F8F6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9080] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

const inputClass =
    'w-full rounded-lg border border-[#E5E9E6] bg-white px-3.5 py-2.5 text-sm text-[#2F3E46] transition-colors placeholder:text-[#9AA8A2] hover:border-[#C9D6CF] focus:border-[#6B9080] focus:outline-none focus:ring-4 focus:ring-[#6B9080]/15 disabled:bg-[#F6F8F6] disabled:opacity-70';

const badgeBase =
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap';

const overlayClass =
    'fixed inset-0 z-50 flex items-center justify-center bg-[#2F3E46]/40 p-4 backdrop-blur-sm';

const modalClass =
    'w-full max-w-md rounded-2xl border border-[#E5E9E6] bg-white p-6 shadow-[0_24px_60px_-20px_rgba(47,62,70,0.35)]';

const Avatar = ({ name, size = 'h-8 w-8', tone = 'bg-[#E3EDE8] text-[#4F7566]' }) => (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full text-xs font-semibold ${size} ${tone}`}>
        {name ? name.charAt(0).toUpperCase() : '?'}
    </span>
);

const TicketView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { socket, joinTicket, isConnected, leaveTicket } = useSocket();
    const [ticket, setTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [agents, setAgents] = useState([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [resolutionNote, setResolutionNote] = useState('');
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [showAISuggestions, setShowAISuggestions] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState(null);
    const [loadingAI, setLoadingAI] = useState(false);
    const [showReopenModal, setShowReopenModal] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchTicketDetails();
        fetchAgents();
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


    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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

            // Check if AI suggestions exist
            if (ticketRes.data.aiSuggestion?.processed) {
                setAiSuggestion({
                    category: ticketRes.data.aiSuggestion.category,
                    priority: ticketRes.data.aiSuggestion.priority,
                    summary: ticketRes.data.aiSuggestion.summary,
                    confidence: 0.8,
                    isApplied: true
                });
            }
        } catch (error) {
            toast.error('Failed to load ticket details');
            navigate('/agent/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const fetchAgents = async () => {
        try {
            const response = await api.get('/tickets/agents');
            setAgents(response.data);
        } catch (error) {
            console.error('Failed to fetch agents:', error);
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

            setMessages(prev => [...prev, response.data]);
            setNewMessage('');
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleStatusChange = async (status) => {
        try {
            await api.patch(`/tickets/${id}/status`, { status });
            toast.success(`Ticket status updated to ${status}`);
            fetchTicketDetails();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update status');
        }
    };

    const handleClaim = async () => {
        try {
            await api.patch(`/tickets/${id}/assign`, {}); // agent khud claim karta hai
            toast.success('Ticket claimed');
            fetchTicketDetails();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to claim ticket');
        }
    };

    // AI suggestion edit/confirm: agent ke review ke baad hi final hota hai
    const saveAiReview = async (s) => {
        try {
            await api.patch(`/tickets/${id}/ai-review`, {
                category: s.category,
                priority: s.priority,
                summary: s.summary
            });
            toast.success('AI suggestion confirmed');
            setShowAISuggestions(false);
            fetchTicketDetails();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save AI review');
        }
    };

    const handleViewAI = () => {
        if (ticket.aiSuggestion?.processed) {
            setAiSuggestion({
                category: ticket.aiSuggestion.category,
                priority: ticket.aiSuggestion.priority,
                summary: ticket.aiSuggestion.summary
            });
            setShowAISuggestions(true);
        } else {
            handleGetAISuggestions();
        }
    };

    const handleAssign = async (agentId) => {
        try {
            await api.patch(`/tickets/${id}/assign`, { agentId });
            toast.success('Ticket assigned successfully');
            setShowAssignModal(false);
            fetchTicketDetails();
        } catch (error) {
            toast.error('Failed to assign ticket');
        }
    };

    const handleResolve = async () => {
        if (!resolutionNote.trim()) {
            toast.error('Please provide a resolution note');
            return;
        }

        try {
            await api.patch(`/tickets/${id}/status`, {
                status: 'Resolved',
                resolutionNote
            });
            toast.success('Ticket resolved successfully');
            setShowResolveModal(false);
            fetchTicketDetails();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to resolve ticket');
        }
    };

    const handleReopen = async () => {
        try {
            await api.patch(`/tickets/${id}/reopen`);
            toast.success('Ticket reopened');
            setShowReopenModal(false);
            fetchTicketDetails();
        } catch (error) {
            toast.error('Failed to reopen ticket');
        }
    };

    const handleGetAISuggestions = async () => {
        setLoadingAI(true);
        try {
            const response = await api.get(`/ai/suggestions/${id}`);
            setAiSuggestion(response.data);
            setShowAISuggestions(true);
            toast.success('AI suggestions loaded');
        } catch (error) {
            toast.error('Failed to get AI suggestions');
        } finally {
            setLoadingAI(false);
        }
    };

    const handleApplyAISuggestions = async () => {
        try {
            await api.post(`/ai/suggestions/${id}/apply`);
            toast.success('AI suggestions applied to ticket');
            setShowAISuggestions(false);
            fetchTicketDetails();
        } catch (error) {
            toast.error('Failed to apply AI suggestions');
        }
    };

    const handleEditAISuggestions = async (editedSuggestion) => {
        try {
            await api.put(`/ai/suggestions/${id}/edit`, editedSuggestion);
            setAiSuggestion(editedSuggestion);
            toast.success('AI suggestions updated');
            fetchTicketDetails();
        } catch (error) {
            toast.error('Failed to update AI suggestions');
        }
    };

    const handleDismissAISuggestions = () => {
        setShowAISuggestions(false);
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

    const getPriorityColor = (priority) => {
        const colors = {
            'Low': 'bg-[#E3EDE8] text-[#4F7566] ring-[#CFE0D7]',
            'Medium': 'bg-[#FBF3E4] text-[#9A6B1F] ring-[#F1E2C4]',
            'High': 'bg-[#FBEAEA] text-[#A94442] ring-[#F3D4D4]'
        };
        return colors[priority] || 'bg-[#F1F3F2] text-[#5B6B65] ring-[#E5E9E6]';
    };

    const isMine = user?.role === 'admin' || ticket?.agent?._id === user?._id;

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!ticket) {
        return (
            <div className="min-h-screen bg-[#F6F8F6]">
                <Navbar />
                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className={`${cardClass} flex flex-col items-center px-6 py-16 text-center`}>
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E3EDE8] text-[#6B9080]">
                            <FaComments size={22} />
                        </div>
                        <p className="mt-4 text-base font-semibold text-[#2F3E46]">Ticket not found</p>
                        <p className="mt-1 text-sm text-[#5B6B65]">
                            This ticket may have been removed or you may not have access to it.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const showClaim = ticket.status !== 'Resolved' && !ticket.agent;
    const showAssign = ticket.status !== 'Resolved' && user?.role === 'admin';
    const showStart = ticket.status !== 'Resolved' && ticket.status === 'Assigned' && isMine;
    const showResolve = ticket.status !== 'Resolved' && ['Assigned', 'In Progress'].includes(ticket.status) && isMine;
    const showReopen = ticket.status === 'Resolved';
    const hasActions = showClaim || showAssign || showStart || showResolve || showReopen;

    return (
        <div className="min-h-screen bg-[#F6F8F6]">
            <Navbar />
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                {/* Header */}
                <div className={`${cardClass} mb-6 p-5 sm:p-6`}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-md bg-[#E3EDE8] px-2 py-0.5 font-mono text-xs font-semibold text-[#4F7566]">
                                    Ticket #{ticket.ticketNumber}
                                </span>
                                <span className={`${badgeBase} ${getStatusColor(ticket.status)}`}>
                                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                                    {ticket.status}
                                </span>
                            </div>
                            <h1 className="mt-3 break-words text-xl font-semibold tracking-tight text-[#2F3E46] sm:text-2xl">
                                {ticket.subject}
                            </h1>
                        </div>
                        <button
                            onClick={() => navigate('/agent/dashboard')}
                            className={`${btnSecondary} shrink-0 self-start`}
                        >
                            <FaArrowLeft size={12} />
                            Back to Dashboard
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main column */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Resolution note */}
                        {ticket.resolutionNote && (
                            <div className="flex gap-3 rounded-2xl border border-[#CBE5D4] bg-[#E6F2EA] p-4 sm:p-5">
                                <FaCheckCircle className="mt-0.5 shrink-0 text-[#2F7A4F]" size={18} />
                                <div>
                                    <p className="text-sm font-semibold text-[#2F7A4F]">Resolution Note</p>
                                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[#2F3E46]">
                                        {ticket.resolutionNote}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* AI Suggestions panel */}
                        {showAISuggestions && aiSuggestion && (
                            <AISuggestions
                                suggestion={aiSuggestion}
                                onApply={saveAiReview}
                                onEdit={saveAiReview}
                                onDismiss={handleDismissAISuggestions}
                            />
                        )}

                        {/* Conversation */}
                        <div className={`${cardClass} flex flex-col overflow-hidden`}>
                            <div className="flex items-center justify-between border-b border-[#E5E9E6] px-5 py-4 sm:px-6">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E3EDE8] text-[#6B9080]">
                                        <FaComments size={14} />
                                    </div>
                                    <h2 className="text-base font-semibold text-[#2F3E46]">Conversation</h2>
                                </div>
                                <span className="text-xs font-medium text-[#8A9993]">
                                    {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                                </span>
                            </div>

                            <div className="max-h-[28rem] min-h-[16rem] space-y-4 overflow-y-auto bg-[#FBFCFB] px-4 py-5 sm:px-6">
                                {messages.length === 0 ? (
                                    <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E3EDE8] text-[#6B9080]">
                                            <FaComments size={18} />
                                        </div>
                                        <p className="mt-3 text-sm font-medium text-[#2F3E46]">No messages yet</p>
                                        <p className="mt-0.5 text-xs text-[#8A9993]">Start the conversation with the customer.</p>
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
                                                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 sm:max-w-[70%] ${mine
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
                                                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                                                        {message.content}
                                                    </p>
                                                    <p className={`mt-1 text-[11px] ${mine ? 'text-white/75' : 'text-[#8A9993]'}`}>
                                                        {new Date(message.createdAt).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                                {mine && (
                                                    <Avatar name={message.sender.name} tone="bg-[#6B9080] text-white" />
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            {ticket.status !== 'Resolved' && (
                                <div className="border-t border-[#E5E9E6] bg-white px-4 py-4 sm:px-6">
                                    {isMine ? (
                                        <form onSubmit={handleSendMessage} className="flex gap-3">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Type your reply..."
                                                className={`${inputClass} flex-1`}
                                                disabled={sending}
                                            />
                                            <button
                                                type="submit"
                                                disabled={sending || !newMessage.trim()}
                                                className={`${btnPrimary} px-5`}
                                            >
                                                <FaPaperPlane size={12} />
                                                <span className="hidden sm:inline">{sending ? 'Sending...' : 'Reply'}</span>
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2 rounded-lg bg-[#FBF3E4] px-4 py-3 text-center text-sm text-[#9A6B1F]">
                                            <FaHandPaper size={13} className="shrink-0" />
                                            Reply karne ke liye pehle "Claim Ticket" dabao.
                                        </div>
                                    )}
                                </div>
                            )}

                            {ticket.status === 'Resolved' && (
                                <div className="flex items-center justify-center gap-2 border-t border-[#E5E9E6] bg-[#F6F8F6] px-4 py-4 text-center text-sm text-[#5B6B65]">
                                    <FaLock size={12} className="shrink-0 text-[#8A9993]" />
                                    This ticket has been resolved. Contact support if you need to reopen it.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar (shown first on mobile) */}
                    <aside className="order-first space-y-6 lg:order-none">
                        {/* Details */}
                        <div className={`${cardClass} p-5`}>
                            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#5B6B65]">
                                Ticket Details
                            </h3>
                            <dl className="space-y-4 text-sm">
                                <div className="flex items-center justify-between gap-3">
                                    <dt className="flex items-center gap-2 text-[#5B6B65]">
                                        <FaTag size={12} className="text-[#9AA8A2]" />
                                        Category
                                    </dt>
                                    <dd className="font-medium text-[#2F3E46]">{ticket.category}</dd>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <dt className="flex items-center gap-2 text-[#5B6B65]">
                                        <FaFlag size={12} className="text-[#9AA8A2]" />
                                        Priority
                                    </dt>
                                    <dd>
                                        <span className={`${badgeBase} ${getPriorityColor(ticket.priority)}`}>
                                            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                                            {ticket.priority}
                                        </span>
                                    </dd>
                                </div>
                                <div className="border-t border-[#E5E9E6] pt-4">
                                    <dt className="mb-2 flex items-center gap-2 text-[#5B6B65]">
                                        <FaUser size={12} className="text-[#9AA8A2]" />
                                        Customer
                                    </dt>
                                    <dd className="flex items-center gap-2.5">
                                        <Avatar name={ticket.customer?.name} />
                                        <span className="font-medium text-[#2F3E46]">{ticket.customer?.name}</span>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="mb-2 flex items-center gap-2 text-[#5B6B65]">
                                        <FaHeadset size={12} className="text-[#9AA8A2]" />
                                        Agent
                                    </dt>
                                    <dd className="flex items-center gap-2.5">
                                        <Avatar
                                            name={ticket.agent?.name}
                                            tone={ticket.agent ? 'bg-[#6B9080] text-white' : 'bg-[#F1F3F2] text-[#8A9993]'}
                                        />
                                        <span className={ticket.agent ? 'font-medium text-[#2F3E46]' : 'italic text-[#8A9993]'}>
                                            {ticket.agent?.name || 'Unassigned'}
                                        </span>
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Actions */}
                        {hasActions && (
                            <div className={`${cardClass} p-5`}>
                                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#5B6B65]">
                                    Actions
                                </h3>
                                <div className="flex flex-col gap-2.5">
                                    {ticket.status !== 'Resolved' && (
                                        <>
                                            {!ticket.agent && (
                                                <button onClick={handleClaim} className={`${btnPrimary} w-full`}>
                                                    <FaHandPaper size={13} />
                                                    Claim Ticket
                                                </button>
                                            )}
                                            {user?.role === 'admin' && (
                                                <button onClick={() => setShowAssignModal(true)} className={`${btnSecondary} w-full`}>
                                                    <FaUserPlus size={13} />
                                                    {ticket.agent ? 'Reassign' : 'Assign Ticket'}
                                                </button>
                                            )}
                                            {ticket.status === 'Assigned' && isMine && (
                                                <button onClick={() => handleStatusChange('In Progress')} className={`${btnPrimary} w-full`}>
                                                    <FaPlay size={11} />
                                                    Start Working
                                                </button>
                                            )}
                                            {['Assigned', 'In Progress'].includes(ticket.status) && isMine && (
                                                <button onClick={() => setShowResolveModal(true)} className={`${btnPrimary} w-full`}>
                                                    <FaCheckCircle size={13} />
                                                    Resolve Ticket
                                                </button>
                                            )}
                                        </>
                                    )}
                                    {ticket.status === 'Resolved' && (
                                        <button onClick={() => setShowReopenModal(true)} className={`${btnSecondary} w-full`}>
                                            <FaRedo size={12} />
                                            Reopen Ticket
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* AI Suggestions summary */}
                        {ticket.aiSuggestion?.processed && !showAISuggestions && (
                            <div className={`${cardClass} p-5`}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E3EDE8] text-[#6B9080]">
                                            <FaRobot size={14} />
                                        </div>
                                        <h3 className="text-sm font-semibold text-[#2F3E46]">AI Analysis</h3>
                                    </div>
                                    <span
                                        className={`${badgeBase} ${ticket.aiSuggestion.reviewed
                                            ? 'bg-[#E6F2EA] text-[#2F7A4F] ring-[#CBE5D4]'
                                            : 'bg-[#FBF3E4] text-[#9A6B1F] ring-[#F1E2C4]'
                                            }`}
                                    >
                                        {ticket.aiSuggestion.reviewed ? 'Reviewed' : 'Needs your review'}
                                    </span>
                                </div>

                                <p className="mt-3 text-sm leading-relaxed text-[#5B6B65]">{ticket.aiSuggestion.summary}</p>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="rounded-md bg-[#F6F8F6] px-2 py-1 text-xs text-[#5B6B65]">
                                        Category: <span className="font-medium text-[#2F3E46]">{ticket.aiSuggestion.category}</span>
                                    </span>
                                    <span className="rounded-md bg-[#F6F8F6] px-2 py-1 text-xs text-[#5B6B65]">
                                        Priority: <span className="font-medium text-[#2F3E46]">{ticket.aiSuggestion.priority}</span>
                                    </span>
                                </div>

                                <button
                                    onClick={handleViewAI}
                                    disabled={loadingAI}
                                    className={`${ticket.aiSuggestion.reviewed ? btnSecondary : btnPrimary} mt-4 w-full`}
                                >
                                    <FaRobot size={13} />
                                    {ticket.aiSuggestion.reviewed ? 'View Details' : 'Review'}
                                </button>
                            </div>
                        )}
                    </aside>
                </div>

                {/* Assign Modal */}
                {showAssignModal && (
                    <div className={overlayClass}>
                        <div className={modalClass}>
                            <div className="mb-1 flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3EDE8] text-[#6B9080]">
                                    <FaUserPlus size={14} />
                                </div>
                                <h3 className="text-lg font-semibold text-[#2F3E46]">Assign Ticket</h3>
                            </div>
                            <p className="mb-4 text-sm text-[#5B6B65]">Choose an agent to handle this ticket.</p>
                            <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
                                {agents.map((agent) => (
                                    <button
                                        key={agent._id}
                                        onClick={() => handleAssign(agent._id)}
                                        className="flex w-full items-center gap-3 rounded-xl border border-[#E5E9E6] px-3.5 py-2.5 text-left transition-colors hover:border-[#6B9080] hover:bg-[#F6F8F6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9080]"
                                    >
                                        <Avatar name={agent.name} />
                                        <span className="min-w-0">
                                            <span className="block truncate text-sm font-medium text-[#2F3E46]">{agent.name}</span>
                                            <span className="block truncate text-xs text-[#8A9993]">({agent.email})</span>
                                        </span>
                                    </button>
                                ))}
                                {agents.length === 0 && (
                                    <p className="py-6 text-center text-sm text-[#8A9993]">No agents available</p>
                                )}
                            </div>
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className={`${btnSecondary} mt-5 w-full`}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Resolve Modal */}
                {showResolveModal && (
                    <div className={overlayClass}>
                        <div className={modalClass}>
                            <div className="mb-1 flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E6F2EA] text-[#2F7A4F]">
                                    <FaCheckCircle size={15} />
                                </div>
                                <h3 className="text-lg font-semibold text-[#2F3E46]">Resolve Ticket</h3>
                            </div>
                            <p className="mb-4 text-sm text-[#5B6B65]">Add a short note explaining how this was resolved.</p>
                            <textarea
                                value={resolutionNote}
                                onChange={(e) => setResolutionNote(e.target.value)}
                                className={`${inputClass} resize-y leading-relaxed`}
                                rows="4"
                                placeholder="Please provide a resolution note..."
                            />
                            <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row">
                                <button
                                    onClick={() => setShowResolveModal(false)}
                                    className={`${btnSecondary} flex-1`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleResolve}
                                    className={`${btnPrimary} flex-1`}
                                >
                                    Resolve
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reopen Confirmation Modal */}
                <ConfirmationModal
                    isOpen={showReopenModal}
                    onClose={() => setShowReopenModal(false)}
                    onConfirm={handleReopen}
                    title="Reopen Ticket"
                    message="Are you sure you want to reopen this resolved ticket? This will remove the resolution note and allow further updates."
                    confirmText="Yes, Reopen"
                    cancelText="Cancel"
                    confirmColor="bg-[#C28B33] hover:bg-[#A8762A]"
                />
            </div>
        </div>
    );
};

export default TicketView;
