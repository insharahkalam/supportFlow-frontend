import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Navbar from '../common/Navbar';
import LoadingSpinner from '../common/LoadingSpinner';

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

    // useEffect(() => {
    //     fetchTicketDetails();
    //     joinTicket(id);

    //     return () => {
    //         leaveTicket(id);
    //     };
    // }, [id]);

    // useEffect(() => {
    //     if (!socket) return;

    //     socket.on('new-message', ({ message, ticketId }) => {
    //         if (ticketId === id) {
    //             setMessages(prev => [...prev, message]);
    //         }
    //     });

    //     socket.on('ticket-updated', (updatedTicket) => {
    //         if (updatedTicket._id === id) {
    //             setTicket(updatedTicket);
    //         }
    //     });

    //     return () => {
    //         socket.off('new-message');
    //         socket.off('ticket-updated');
    //     };
    // }, [socket, id]);

    // useEffect(() => {
    //     scrollToBottom();
    // }, [messages]);




    // 1) Sirf data fetch
    useEffect(() => {
        fetchTicketDetails();
    }, [id]);

    // 2) Room join + listeners (socket connect hone ke baad)
    useEffect(() => {
        if (!socket || !isConnected) return;

        joinTicket(id);

        const handleNewMessage = ({ message, ticketId }) => {
            if (String(ticketId) === String(id)) {
                setMessages(prev =>
                    prev.some(m => m._id === message._id) ? prev : [...prev, message]
                );
            }
        };

        const handleTicketUpdated = (updatedTicket) => {
            if (String(updatedTicket._id) === String(id)) {
                setTicket(updatedTicket);
            }
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

            setMessages(prev => [...prev, response.data]);
            setNewMessage('');
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'New': 'bg-blue-100 text-blue-800',
            'Assigned': 'bg-yellow-100 text-yellow-800',
            'In Progress': 'bg-purple-100 text-purple-800',
            'Resolved': 'bg-green-100 text-green-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!ticket) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="card text-center py-12">
                        <p className="text-gray-500">Ticket not found</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="card mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{ticket.subject}</h1>
                            <p className="text-sm text-gray-500 mt-1">Ticket #{ticket.ticketNumber}</p>
                        </div>
                        <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                        </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500">Category:</span>
                            <span className="ml-2 font-medium">{ticket.category}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Priority:</span>
                            <span className="ml-2 font-medium">{ticket.priority}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Created:</span>
                            <span className="ml-2 font-medium">
                                {new Date(ticket.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    {ticket.resolutionNote && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg">
                            <p className="text-sm font-medium text-green-800">Resolution Note:</p>
                            <p className="text-sm text-green-700 mt-1">{ticket.resolutionNote}</p>
                        </div>
                    )}
                </div>

                {/* Messages */}
                <div className="card mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Conversation</h2>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {messages.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No messages yet</p>
                        ) : (
                            messages.map((message) => (
                                <div
                                    key={message._id}
                                    className={`flex ${message.sender._id === user?._id ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[70%] rounded-lg px-4 py-2 ${message.sender._id === user?._id
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-gray-100 text-gray-900'
                                            }`}
                                    >
                                        <p className="text-xs font-medium mb-1">
                                            {message.sender.name} ({message.sender.role})
                                        </p>
                                        <p className="text-sm">{message.content}</p>
                                        <p className="text-xs mt-1 opacity-70">
                                            {new Date(message.createdAt).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Message Input */}
                {ticket.status !== 'Resolved' && (
                    <form onSubmit={handleSendMessage} className="flex gap-4">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="input-field flex-1"
                            disabled={sending}
                        />
                        <button
                            type="submit"
                            disabled={sending || !newMessage.trim()}
                            className="btn-primary px-6"
                        >
                            {sending ? 'Sending...' : 'Send'}
                        </button>
                    </form>
                )}

                {ticket.status === 'Resolved' && (
                    <div className="text-center text-sm text-gray-500">
                        This ticket has been resolved. Contact support if you need to reopen it.
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketDetail;