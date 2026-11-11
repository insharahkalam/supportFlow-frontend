import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmColor = 'bg-[#6B9080] hover:bg-[#5A7D6E]',
    icon = <FaExclamationTriangle className="h-6 w-6 text-[#6B9080]" />
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#2F3E46]/50 px-4 py-6"
            role="presentation"
        >
            <div
                className="w-full max-w-md rounded-xl border border-[#E5E9E6] bg-white p-6 shadow-xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirmation-modal-title"
            >
                <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E3EDE8]">
                        {icon}
                    </span>
                    <h3
                        id="confirmation-modal-title"
                        className="text-lg font-semibold text-[#2F3E46]"
                    >
                        {title}
                    </h3>
                </div>

                <p className="mb-6 text-sm leading-6 text-[#5B6B65]">
                    {message}
                </p>

                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`min-h-11 flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9080] focus-visible:ring-offset-2 ${confirmColor}`}
                    >
                        {confirmText}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="min-h-11 flex-1 rounded-lg border border-[#E5E9E6] bg-[#F6F8F6] px-4 py-2 text-sm font-semibold text-[#5B6B65] transition-colors hover:bg-[#E3EDE8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9080] focus-visible:ring-offset-2"
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
