import React from 'react';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';

const SuccessAlert = ({ message, onDismiss, className = '' }) => {
    if (!message) return null;

    return (
        <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <FaCheckCircle className="text-green-600 h-5 w-5" />
                </div>
                <div className="ml-3 flex-1">
                    <p className="text-sm text-green-800">
                        {typeof message === 'string' ? message : message.message || 'Success!'}
                    </p>
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="flex-shrink-0 ml-4 text-green-600 hover:text-green-800 transition-colors"
                    >
                        <FaTimes size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default SuccessAlert;