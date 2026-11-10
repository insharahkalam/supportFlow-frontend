import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Navbar from '../common/Navbar';
import LoadingSpinner from '../common/LoadingSpinner';
import AISuggestions from './AISuggestions';
import ConfirmationModal from '../common/ConfirmationModal';

const TicketView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { socket, joinTicket, leaveTicket } = useSocket();
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
        joinTicket(id);

        return () => {
            leaveTicket(id);
        };
    }, [id]);

    useEffect(() => {
        if (!socket) return;

        socket.on('new-message', ({ message, ticketId }) => {
            if (ticketId === id) {
                setMessages(prev => [...prev, message]);
            }
        });

        socket.on('ticket-updated', (updatedTicket) => {
            if (updatedTicket._id === id) {
                setTicket(updatedTicket);
            }
        });

        return () => {
            socket.off('new-message');
            socket.off('ticket-updated');
        };
    }, [socket, id]);

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
            'New': 'bg-blue-100 text-blue-800',
            'Assigned': 'bg-yellow-100 text-yellow-800',
            'In Progress': 'bg-purple-100 text-purple-800',
            'Resolved': 'bg-green-100 text-green-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'Low': 'bg-green-100 text-green-800',
            'Medium': 'bg-yellow-100 text-yellow-800',
            'High': 'bg-red-100 text-red-800'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
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
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500">Category:</span>
                            <span className="ml-2 font-medium">{ticket.category}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Priority:</span>
                            <span className={`ml-2 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                                {ticket.priority}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500">Customer:</span>
                            <span className="ml-2 font-medium">{ticket.customer?.name}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Agent:</span>
                            <span className="ml-2 font-medium">{ticket.agent?.name || 'Unassigned'}</span>
                        </div>
                    </div>

                    {/* AI Suggestions Display */}
                    {ticket.aiSuggestion?.processed && !showAISuggestions && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-sm font-medium text-blue-900">AI Analysis Applied</h3>
                                    <p className="text-sm text-blue-700 mt-1">{ticket.aiSuggestion.summary}</p>
                                    <div className="flex gap-4 mt-2 text-xs text-blue-600">
                                        <span>Category: {ticket.aiSuggestion.category}</span>
                                        <span>Priority: {ticket.aiSuggestion.priority}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleGetAISuggestions}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    )}

                    {ticket.resolutionNote && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm font-medium text-green-800">Resolution Note:</p>
                            <p className="text-sm text-green-700 mt-1">{ticket.resolutionNote}</p>
                        </div>
                    )}
                </div>

                {/* AI Suggestions Modal */}
                {showAISuggestions && aiSuggestion && (
                    <div className="mb-6">
                        <AISuggestions
                            suggestion={aiSuggestion}
                            onApply={handleApplyAISuggestions}
                            onDismiss={handleDismissAISuggestions}
                            onEdit={handleEditAISuggestions}
                        />
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 mb-6">
                    {ticket.status !== 'Resolved' && (
                        <>
                            {!ticket.agent && (
                                <button
                                    onClick={() => setShowAssignModal(true)}
                                    className="btn-secondary"
                                >
                                    Assign Ticket
                                </button>
                            )}
                            {ticket.status === 'New' && (
                                <button
                                    onClick={() => handleStatusChange('In Progress')}
                                    className="btn-primary"
                                >
                                    Start Working
                                </button>
                            )}
                            {ticket.status === 'In Progress' && (
                                <button
                                    onClick={() => setShowResolveModal(true)}
                                    className="btn-primary"
                                >
                                    Resolve Ticket
                                </button>
                            )}
                            {!ticket.aiSuggestion?.processed && (
                                <button
                                    onClick={handleGetAISuggestions}
                                    disabled={loadingAI}
                                    className="btn-secondary flex items-center gap-2"
                                >
                                    {loadingAI ? (
                                        <>
                                            <LoadingSpinner className="w-4 h-4" />
                                            Loading...
                                        </>
                                    ) : (
                                        '🤖 Get AI Suggestions'
                                    )}
                                </button>
                            )}
                        </>
                    )}
                    {ticket.status === 'Resolved' && (
                        <button
                            onClick={() => setShowReopenModal(true)}
                            className="btn-secondary"
                        >
                            Reopen Ticket
                        </button>
                    )}
                    <button
                        onClick={() => navigate('/agent/dashboard')}
                        className="btn-secondary"
                    >
                        Back to Dashboard
                    </button>
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
                            placeholder="Type your reply..."
                            className="input-field flex-1"
                            disabled={sending}
                        />
                        <button
                            type="submit"
                            disabled={sending || !newMessage.trim()}
                            className="btn-primary px-6"
                        >
                            {sending ? 'Sending...' : 'Reply'}
                        </button>
                    </form>
                )}

                {ticket.status === 'Resolved' && (
                    <div className="text-center text-sm text-gray-500">
                        This ticket has been resolved. Contact support if you need to reopen it.
                    </div>
                )}

                {/* Assign Modal */}
                {showAssignModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full">
                            <h3 className="text-lg font-semibold mb-4">Assign Ticket</h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {agents.map((agent) => (
                                    <button
                                        key={agent._id}
                                        onClick={() => handleAssign(agent._id)}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg border border-gray-200"
                                    >
                                        {agent.name} ({agent.email})
                                    </button>
                                ))}
                                {agents.length === 0 && (
                                    <p className="text-gray-500 text-center py-4">No agents available</p>
                                )}
                            </div>
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="mt-4 btn-secondary w-full"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Resolve Modal */}
                {showResolveModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full">
                            <h3 className="text-lg font-semibold mb-4">Resolve Ticket</h3>
                            <textarea
                                value={resolutionNote}
                                onChange={(e) => setResolutionNote(e.target.value)}
                                className="input-field"
                                rows="4"
                                placeholder="Please provide a resolution note..."
                            />
                            <div className="mt-4 flex gap-3">
                                <button
                                    onClick={handleResolve}
                                    className="btn-primary flex-1"
                                >
                                    Resolve
                                </button>
                                <button
                                    onClick={() => setShowResolveModal(false)}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
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
                    confirmColor="bg-yellow-600 hover:bg-yellow-700"
                />
            </div>
        </div>
    );
};

export default TicketView;