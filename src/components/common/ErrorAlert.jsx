import React from 'react';
import { FaExclamationCircle, FaTimes } from 'react-icons/fa';

const ErrorAlert = ({ error, onDismiss, className = '' }) => {
  if (!error) return null;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <FaExclamationCircle className="text-red-600 h-5 w-5" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {typeof error === 'string' ? error : error.message || 'An error occurred'}
          </h3>
          {typeof error === 'object' && error.details && (
            <div className="mt-1 text-sm text-red-700">
              {Array.isArray(error.details) ? (
                <ul className="list-disc list-inside">
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
            onClick={onDismiss}
            className="flex-shrink-0 ml-4 text-red-600 hover:text-red-800 transition-colors"
          >
            <FaTimes size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;