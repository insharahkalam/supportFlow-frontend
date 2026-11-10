import React from 'react';
import { FaInbox } from 'react-icons/fa';

const EmptyState = ({
    title = 'No items found',
    description = 'There are no items to display at this time.',
    icon = <FaInbox className="text-gray-400 h-12 w-12" />,
    action,
    actionText
}) => {
    return (
        <div className="text-center py-12">
            <div className="flex justify-center mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
            <p className="text-gray-500 text-sm">{description}</p>
            {action && actionText && (
                <button
                    onClick={action}
                    className="mt-4 btn-primary"
                >
                    {actionText}
                </button>
            )}
        </div>
    );
};

export default EmptyState;