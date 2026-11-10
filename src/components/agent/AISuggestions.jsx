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
        if (confidence >= 0.8) return 'text-green-600';
        if (confidence >= 0.6) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <FaRobot className="text-blue-600 text-xl" />
                    <h3 className="font-semibold text-blue-900">AI Analysis</h3>
                    {suggestion.confidence && (
                        <span className={`text-xs font-medium ${getConfidenceColor(suggestion.confidence)} ml-2`}>
                            Confidence: {Math.round(suggestion.confidence * 100)}%
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    {!isEditing && (
                        <button
                            onClick={handleEdit}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 transition-colors"
                            title="Edit suggestions"
                        >
                            <FaEdit size={14} />
                        </button>
                    )}
                    <button
                        onClick={onDismiss}
                        className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors"
                        title="Dismiss suggestions"
                    >
                        <FaTimes size={14} />
                    </button>
                </div>
            </div>

            {isEditing ? (
                <div className="space-y-3">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Category</label>
                        <select
                            value={editedSuggestion.category}
                            onChange={(e) => setEditedSuggestion({ ...editedSuggestion, category: e.target.value })}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Technical">Technical</option>
                            <option value="Billing">Billing</option>
                            <option value="Account">Account</option>
                            <option value="Product">Product</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Priority</label>
                        <select
                            value={editedSuggestion.priority}
                            onChange={(e) => setEditedSuggestion({ ...editedSuggestion, priority: e.target.value })}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Summary</label>
                        <textarea
                            value={editedSuggestion.summary}
                            onChange={(e) => setEditedSuggestion({ ...editedSuggestion, summary: e.target.value })}
                            rows="2"
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSaveEdit}
                            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                            Save Changes
                        </button>
                        <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700 w-20">Category:</span>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {suggestion.category}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700 w-20">Priority:</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${suggestion.priority === 'High'
                                    ? 'bg-red-100 text-red-800'
                                    : suggestion.priority === 'Medium'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-green-100 text-green-800'
                                }`}>
                                {suggestion.priority}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <span className="font-medium text-gray-700 w-20">Summary:</span>
                            <span className="text-gray-700 flex-1">{suggestion.summary}</span>
                        </div>
                    </div>
                    <div className="mt-3 flex gap-3">
                        <button
                            onClick={handleApply}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                            <FaCheck size={12} />
                            Apply Suggestions
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default AISuggestions;