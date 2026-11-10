import React from 'react';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../utils/constants';

const StatusBadge = ({ status, type = 'status' }) => {
    const colors = type === 'priority' ? PRIORITY_COLORS : STATUS_COLORS;
    const colorClass = colors[status] || 'bg-gray-100 text-gray-800';

    return (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
            {status}
        </span>
    );
};

export default StatusBadge;