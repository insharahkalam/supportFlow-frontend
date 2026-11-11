import React from 'react';

const StatusBadge = ({ status, type = 'status' }) => {
    const label = String(status ?? '');
    const normalizedStatus = label.toLowerCase();

    const colorClass =
        type === 'priority'
            ? ['urgent', 'high', 'critical'].includes(normalizedStatus)
                ? 'border-[#6B9080] bg-[#6B9080] text-white'
                : ['medium', 'normal'].includes(normalizedStatus)
                    ? 'border-[#E5E9E6] bg-[#E3EDE8] text-[#5A7D6E]'
                    : 'border-[#E5E9E6] bg-[#F6F8F6] text-[#5B6B65]'
            : ['resolved', 'closed', 'completed'].includes(normalizedStatus)
                ? 'border-[#E5E9E6] bg-[#E3EDE8] text-[#5A7D6E]'
                : ['open', 'pending', 'in progress'].includes(normalizedStatus)
                    ? 'border-[#E5E9E6] bg-[#F6F8F6] text-[#5B6B65]'
                    : 'border-[#E5E9E6] bg-white text-[#5B6B65]';

    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold leading-5 ${colorClass}`}
        >
            {label}
        </span>
    );
};

export default StatusBadge;
