import React from 'react';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';

const SuccessAlert = ({ message, onDismiss, className = '' }) => {
    if (!message) return null;

    return (
        <div
            className={`rounded-lg border border-[#E5E9E6] bg-[#E3EDE8] p-4 ${className}`}
            role="status"
        >
            <div className="flex items-start">
                <div className="shrink-0">
                    <FaCheckCircle className="h-5 w-5 text-[#6B9080]" />
                </div>

                <div className="ml-3 min-w-0 flex-1">
                    <p className="text-sm text-[#2F3E46]">
                        {typeof message === 'string'
                            ? message
                            : message.message || 'Success!'}
                    </p>
                </div>

                {onDismiss && (
                    <button
                        type="button"
                        onClick={onDismiss}
                        aria-label="Dismiss alert"
                        className="ml-4 shrink-0 rounded p-1 text-[#5B6B65] transition-colors hover:bg-white/70 hover:text-[#2F3E46] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9080]"
                    >
                        <FaTimes size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default SuccessAlert;
