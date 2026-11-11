import React from 'react';
import { FaExclamationCircle, FaTimes } from 'react-icons/fa';

const ErrorAlert = ({ error, onDismiss, className = '' }) => {
  if (!error) return null;

  return (
    <div
      className={`rounded-lg border border-[#E5E9E6] bg-[#F6F8F6] p-4 ${className}`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="shrink-0">
          <FaExclamationCircle className="h-5 w-5 text-[#6B9080]" />
        </div>

        <div className="ml-3 min-w-0 flex-1">
          <h3 className="text-sm font-medium text-[#2F3E46]">
            {typeof error === 'string'
              ? error
              : error.message || 'An error occurred'}
          </h3>

          {typeof error === 'object' && error.details && (
            <div className="mt-1 text-sm text-[#5B6B65]">
              {Array.isArray(error.details) ? (
                <ul className="list-inside list-disc space-y-1">
                  {error.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              ) : (
                <p>{error.details}</p>
              )}
            </div>
          )}
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss alert"
            className="ml-4 shrink-0 rounded p-1 text-[#5B6B65] transition-colors hover:bg-[#E3EDE8] hover:text-[#2F3E46] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9080]"
          >
            <FaTimes size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;
