import React, { useState } from 'react';
import { FaRobot, FaCheck, FaTimes, FaEdit } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AISuggestions = ({ suggestion, onApply, onDismiss, onEdit }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedSuggestion, setEditedSuggestion] = useState(suggestion);

    if (!suggestion) {
        return null;
    }

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSaveEdit = () => {
        onEdit(editedSuggestion);
        setIsEditing(false);
        toast.success('AI suggestions updated');
    };

    const handleCancelEdit = () => {
        setEditedSuggestion(suggestion);
        setIsEditing(false);
    };

    const handleApply = () => {
        onApply(suggestion);
        toast.success('AI suggestions applied successfully');
    };

    const getConfidenceColor = (confidence) => {
        if (confidence >= 0.8) return 'bg-[#E6F2EA] text-[#2F7A4F] ring-[#CBE5D4]';
        if (confidence >= 0.6) return 'bg-[#FBF3E4] text-[#9A6B1F] ring-[#F1E2C4]';
        return 'bg-[#FBEAEA] text-[#A94442] ring-[#F3D4D4]';
    };

    const getConfidenceBarColor = (confidence) => {
        if (confidence >= 0.8) return 'bg-[#2F7A4F]';
        if (confidence >= 0.6) return 'bg-[#C28B33]';
        return 'bg-[#A94442]';
    };

    const getPriorityColor = (priority) =>
        priority === 'High'
            ? 'bg-[#FBEAEA] text-[#A94442] ring-[#F3D4D4]'
            : priority === 'Medium'
                ? 'bg-[#FBF3E4] text-[#9A6B1F] ring-[#F1E2C4]'
                : 'bg-[#E3EDE8] text-[#4F7566] ring-[#CFE0D7]';

    const badgeBase =
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap';

    const fieldClass =
        'mt-1.5 w-full rounded-lg border border-[#E5E9E6] bg-white px-3 py-2 text-sm text-[#2F3E46] shadow-[0_1px_2px_rgba(47,62,70,0.04)] transition-colors placeholder:text-[#9AA8A2] hover:border-[#C9D6CF] focus:border-[#6B9080] focus:outline-none focus:ring-4 focus:ring-[#6B9080]/15';

    const labelClass = 'text-xs font-semibold uppercase tracking-wider text-[#5B6B65]';

    return (
        <div className="overflow-hidden rounded-2xl border border-[#E5E9E6] bg-white shadow-[0_1px_2px_rgba(47,62,70,0.04)]">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[#E5E9E6] bg-[#F6F8F6] px-4 py-3.5 sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E3EDE8] text-[#6B9080]">
                        <FaRobot className="text-base" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-[#2F3E46]">AI Analysis</h3>
                        <p className="text-xs text-[#5B6B65]">
                            {isEditing ? 'Review and adjust the suggestions' : 'Suggested by SupportFlow AI'}
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    {!isEditing && (
                        <button
                            onClick={handleEdit}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6B9080] transition-colors hover:bg-[#E3EDE8] hover:text-[#5A7D6E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9080]"
                            title="Edit suggestions"
                            aria-label="Edit suggestions"
                        >
                            <FaEdit size={14} />
                        </button>
                    )}
                    <button
                        onClick={onDismiss}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#8A9993] transition-colors hover:bg-[#EEF1EF] hover:text-[#2F3E46] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9080]"
                        title="Dismiss suggestions"
                        aria-label="Dismiss suggestions"
                    >
                        <FaTimes size={14} />
                    </button>
                </div>
            </div>

            <div className="px-4 py-4 sm:px-5">
                {/* Confidence */}
                {suggestion.confidence && (
                    <div className="mb-4 flex items-center gap-3">
                        <span className={`${badgeBase} ${getConfidenceColor(suggestion.confidence)}`}>
                            Confidence: {Math.round(suggestion.confidence * 100)}%
                        </span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#EEF1EF]">
                            <div
                                className={`h-full rounded-full ${getConfidenceBarColor(suggestion.confidence)}`}
                                style={{ width: `${Math.min(Math.round(suggestion.confidence * 100), 100)}%` }}
                            />
                        </div>
                    </div>
                )}

                {isEditing ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>Category</label>
                                <select
                                    value={editedSuggestion.category}
                                    onChange={(e) => setEditedSuggestion({ ...editedSuggestion, category: e.target.value })}
                                    className={fieldClass}
                                >
                                    <option value="Technical">Technical</option>
                                    <option value="Billing">Billing</option>
                                    <option value="Account">Account</option>
                                    <option value="Product">Product</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Priority</label>
                                <select
                                    value={editedSuggestion.priority}
                                    onChange={(e) => setEditedSuggestion({ ...editedSuggestion, priority: e.target.value })}
                                    className={fieldClass}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Summary</label>
                            <textarea
                                value={editedSuggestion.summary}
                                onChange={(e) => setEditedSuggestion({ ...editedSuggestion, summary: e.target.value })}
                                rows="3"
                                className={`${fieldClass} resize-y leading-relaxed`}
                            />
                        </div>
                        <div className="flex flex-col-reverse gap-2 border-t border-[#E5E9E6] pt-4 sm:flex-row sm:justify-end">
                            <button
                                onClick={handleCancelEdit}
                                className="inline-flex items-center justify-center rounded-lg border border-[#E5E9E6] bg-white px-4 py-2 text-sm font-medium text-[#5B6B65] transition-colors hover:bg-[#F6F8F6] hover:text-[#2F3E46] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9080] focus-visible:ring-offset-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6B9080] px-4 py-2 text-sm font-medium text-white shadow-[0_1px_2px_rgba(47,62,70,0.12)] transition-colors hover:bg-[#5A7D6E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9080] focus-visible:ring-offset-2"
                            >
                                <FaCheck size={12} />
                                Save Changes
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <dl className="space-y-3 text-sm">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                                <dt className="w-24 shrink-0 text-xs font-semibold uppercase tracking-wider text-[#5B6B65]">
                                    Category
                                </dt>
                                <dd>
                                    <span className={`${badgeBase} bg-[#EAF1F6] text-[#3E6A85] ring-[#D3E2EC]`}>
                                        {suggestion.category}
                                    </span>
                                </dd>
                            </div>
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                                <dt className="w-24 shrink-0 text-xs font-semibold uppercase tracking-wider text-[#5B6B65]">
                                    Priority
                                </dt>
                                <dd>
                                    <span className={`${badgeBase} ${getPriorityColor(suggestion.priority)}`}>
                                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                                        {suggestion.priority}
                                    </span>
                                </dd>
                            </div>
                            <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                                <dt className="w-24 shrink-0 pt-0.5 text-xs font-semibold uppercase tracking-wider text-[#5B6B65]">
                                    Summary
                                </dt>
                                <dd className="flex-1 rounded-lg bg-[#F6F8F6] px-3 py-2.5 leading-relaxed text-[#2F3E46]">
                                    {suggestion.summary}
                                </dd>
                            </div>
                        </dl>
                        <div className="mt-4 flex flex-col gap-2 border-t border-[#E5E9E6] pt-4 sm:flex-row sm:justify-end">
                            <button
                                onClick={handleApply}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6B9080] px-4 py-2 text-sm font-medium text-white shadow-[0_1px_2px_rgba(47,62,70,0.12)] transition-colors hover:bg-[#5A7D6E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9080] focus-visible:ring-offset-2"
                            >
                                <FaCheck size={12} />
                                Apply Suggestions
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AISuggestions;
