import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMagic, FaLightbulb, FaPaperPlane } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Navbar from '../common/Navbar';
import AISuggestions from '../agent/AISuggestions';
import LoadingSpinner from '../common/LoadingSpinner';

const labelClass = 'mb-2 block text-sm font-semibold text-[#2F3E46]';

const fieldClass =
    'block w-full rounded-lg border border-[#E5E9E6] bg-white px-3.5 py-3 text-sm text-[#2F3E46] shadow-[0_1px_2px_rgba(47,62,70,0.04)] outline-none transition placeholder:text-[#9AA8A2] hover:border-[#C9D6CF] focus:border-[#6B9080] focus:ring-4 focus:ring-[#6B9080]/15';

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
        <div className="min-h-screen bg-[#F6F8F6] text-[#5B6B65]">
            <Navbar />
            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
                <button
                    type="button"
                    onClick={() => navigate('/tickets')}
                    className="mb-5 inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-[#5A7D6E] transition-colors hover:bg-[#E3EDE8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9080]"
                >
                    <FaArrowLeft size={12} />
                    Back to my tickets
                </button>

                <div className="mb-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B9080]">Support request</p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#2F3E46] sm:text-3xl">
                        Create a new ticket
                    </h1>
                    <p className="mt-1 text-sm leading-6 text-[#5B6B65] sm:text-base">
                        Tell us what’s happening and we’ll help you find a solution.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Form */}
                    <section className="rounded-2xl border border-[#E5E9E6] bg-white p-5 shadow-[0_1px_2px_rgba(47,62,70,0.04)] sm:p-8 lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className={labelClass}>
                                    Subject <span className="text-[#6B9080]">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className={fieldClass}
                                    placeholder="Brief subject of your issue"
                                    required
                                    maxLength={100}
                                />
                                <p className="mt-2 text-right text-xs text-[#8A9993]">
                                    {subject.length}/100
                                </p>
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Description <span className="text-[#6B9080]">*</span>
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows="6"
                                    className={`${fieldClass} resize-y leading-6`}
                                    placeholder="Share the details that will help us understand your issue..."
                                    required
                                    minLength={10}
                                />
                                <p className="mt-2 text-right text-xs text-[#8A9993]">
                                    {description.length}/5000 characters
                                </p>
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Category <span className="font-normal text-[#8A9993]">(optional)</span>
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className={fieldClass}
                                >
                                    <option value="">Select a category</option>
                                    <option value="Technical">Technical</option>
                                    <option value="Billing">Billing</option>
                                    <option value="Account">Account</option>
                                    <option value="Product">Product</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {!showAiSuggestion && (
                                <div className="flex flex-col gap-4 rounded-xl border border-[#CFE0D7] bg-[#E3EDE8]/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-3">
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#6B9080] shadow-[0_1px_2px_rgba(47,62,70,0.06)]">
                                            <FaMagic size={14} />
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-[#2F3E46]">Need help categorizing?</p>
                                            <p className="mt-0.5 text-xs leading-5 text-[#5B6B65]">
                                                Get suggested ticket details from your description.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAnalyze}
                                        disabled={analyzing || !description}
                                        className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-[#6B9080] bg-white px-4 text-sm font-medium text-[#5A7D6E] transition-colors hover:bg-[#6B9080] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9080] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-[#5A7D6E] sm:w-auto"
                                    >
                                        {analyzing ? (
                                            <>
                                                <LoadingSpinner className="h-4 w-4" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <FaMagic size={12} />
                                                AI analyze
                                            </>
                                        )}
                                    </button>
                                    {analyzing && (
                                        <span className="sr-only">This may take a few seconds...</span>
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

                            <div className="flex flex-col-reverse gap-3 border-t border-[#E5E9E6] pt-6 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => navigate('/tickets')}
                                    className="h-11 rounded-lg border border-[#E5E9E6] bg-white px-5 text-sm font-medium text-[#5B6B65] transition-colors hover:bg-[#F6F8F6] hover:text-[#2F3E46] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9080] focus-visible:ring-offset-2 sm:min-w-28"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || analyzing}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#6B9080] px-5 text-sm font-medium text-white shadow-[0_1px_2px_rgba(47,62,70,0.12)] transition-colors hover:bg-[#5A7D6E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9080] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-40"
                                >
                                    {loading ? (
                                        <>
                                            <span
                                                aria-hidden="true"
                                                className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                                            />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <FaPaperPlane size={12} />
                                            Create ticket
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* Tips */}
                    <aside className="h-fit rounded-2xl border border-[#E5E9E6] bg-white p-5 shadow-[0_1px_2px_rgba(47,62,70,0.04)] sm:p-6">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FBF3E4] text-[#B7832F]">
                                <FaLightbulb size={13} />
                            </span>
                            <h2 className="text-sm font-semibold text-[#2F3E46]">Tips for a faster reply</h2>
                        </div>
                        <ul className="mt-4 space-y-3 text-sm leading-6 text-[#5B6B65]">
                            {[
                                'Use a short, clear subject.',
                                'Describe what happened and what you expected.',
                                'Include any error messages you saw.',
                                'Mention steps you’ve already tried.'
                            ].map((tip) => (
                                <li key={tip} className="flex gap-2.5">
                                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6B9080]" />
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default CreateTicket;
