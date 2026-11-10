import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Navbar from '../common/Navbar';
import AISuggestions from '../agent/AISuggestions';
import LoadingSpinner from '../common/LoadingSpinner';

const CreateTicket = () => {
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState(null);
    const [showAiSuggestion, setShowAiSuggestion] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/tickets', {
                subject,
                description,
                category: category || undefined
            });

            toast.success('Ticket created successfully!');

            // If AI suggestions were shown but not applied, they're still saved
            navigate(`/tickets/${response.data._id}`);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to create ticket');
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async () => {
        if (!description) {
            toast.error('Please enter a description to analyze');
            return;
        }

        if (description.length < 10) {
            toast.error('Please provide more details (at least 10 characters)');
            return;
        }

        setAnalyzing(true);
        try {
            const response = await api.post('/ai/analyze', {
                description,
                subject,
                category: category || undefined
            });

            const data = response.data;

            // If there's a fallback, show a warning
            if (data.fallback) {
                toast.warning('Using fallback suggestions (AI service unavailable)');
                setAiSuggestion(data.fallback);
            } else {
                setAiSuggestion(data);
                toast.success('AI analysis complete!');
            }

            setShowAiSuggestion(true);
        } catch (error) {
            console.error('AI Analysis error:', error);
            toast.error('AI analysis failed. You can still submit the ticket manually.');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleApplyAiSuggestion = async () => {
        if (aiSuggestion) {
            setCategory(aiSuggestion.category);
            // Update the ticket with AI suggestions
            try {
                // If we had a ticket ID, we could save it, but for new ticket we just apply to form
                setShowAiSuggestion(false);
                toast.success('AI suggestions applied to form!');
            } catch (error) {
                toast.error('Failed to apply AI suggestions');
            }
        }
    };

    const handleDismissAiSuggestion = () => {
        setShowAiSuggestion(false);
        setAiSuggestion(null);
    };

    const handleEditAiSuggestion = (editedSuggestion) => {
        setAiSuggestion(editedSuggestion);
        toast.success('AI suggestions updated');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="card">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Ticket</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Subject *
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="input-field"
                                placeholder="Brief subject of your issue"
                                required
                                maxLength={100}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="6"
                                className="input-field"
                                placeholder="Detailed description of your issue..."
                                required
                                minLength={10}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {description.length}/5000 characters
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category (Optional)
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="input-field"
                            >
                                <option value="">Select a category</option>
                                <option value="Technical">Technical</option>
                                <option value="Billing">Billing</option>
                                <option value="Account">Account</option>
                                <option value="Product">Product</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* AI Suggestion Section */}
                        {!showAiSuggestion && (
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={handleAnalyze}
                                    disabled={analyzing || !description}
                                    className="btn-secondary flex items-center gap-2"
                                >
                                    {analyzing ? (
                                        <>
                                            <LoadingSpinner className="w-4 h-4" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        '🤖 AI Analyze Ticket'
                                    )}
                                </button>
                                {analyzing && (
                                    <span className="text-sm text-gray-500 self-center">
                                        This may take a few seconds...
                                    </span>
                                )}
                            </div>
                        )}

                        {showAiSuggestion && aiSuggestion && (
                            <AISuggestions
                                suggestion={aiSuggestion}
                                onApply={handleApplyAiSuggestion}
                                onDismiss={handleDismissAiSuggestion}
                                onEdit={handleEditAiSuggestion}
                            />
                        )}

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading || analyzing}
                                className="btn-primary flex-1"
                            >
                                {loading ? 'Creating...' : 'Create Ticket'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/tickets')}
                                className="btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateTicket;