import React from 'react';
import { FaInbox } from 'react-icons/fa';

const EmptyState = ({
    title = 'No items found',
    description = 'There are no items to display at this time.',
    icon = <FaInbox className="h-12 w-12 text-[#6B9080]" />,
    action,
    actionText
}) => {
    return (
        <div className="px-4 py-12 text-center">
            <div className="mb-4 flex justify-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#E3EDE8]">
                    {icon}
                </span>
            </div>

            <h3 className="mb-1 text-lg font-semibold text-[#2F3E46]">
                {title}
            </h3>
            <p className="mx-auto max-w-md text-sm leading-6 text-[#5B6B65]">
                {description}
            </p>

            {action && actionText && (
                <button
                    type="button"
                    onClick={action}
                    className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-[#6B9080] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#5A7D6E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9080] focus-visible:ring-offset-2"
                >
                    {actionText}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
