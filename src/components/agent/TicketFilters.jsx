import React, { useState } from 'react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import { TICKET_STATUS, TICKET_PRIORITY } from '../../utils/constants';

const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#5B6B65]';

const fieldClass =
    'w-full rounded-lg border border-[#E5E9E6] bg-white px-3 py-2.5 text-sm text-[#2F3E46] shadow-[0_1px_2px_rgba(47,62,70,0.04)] transition-colors placeholder:text-[#9AA8A2] hover:border-[#C9D6CF] focus:border-[#6B9080] focus:outline-none focus:ring-4 focus:ring-[#6B9080]/15';

const TicketFilters = ({ onFilterChange, initialFilters = {} }) => {
    const [filters, setFilters] = useState({
        status: initialFilters.status || '',
        priority: initialFilters.priority || '',
        search: initialFilters.search || ''
    });

    const handleChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleClear = () => {
        const cleared = { status: '', priority: '', search: '' };
        setFilters(cleared);
        onFilterChange(cleared);
    };

    const activeCount = Object.values(filters).filter(Boolean).length;

    return (
        <div className="mb-6 rounded-2xl border border-[#E5E9E6] bg-white p-4 shadow-[0_1px_2px_rgba(47,62,70,0.04)] sm:p-5">
            <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E3EDE8] text-[#6B9080]">
                    <FaFilter size={12} />
                </div>
                <h3 className="text-sm font-semibold text-[#2F3E46]">Filter Tickets</h3>
                {activeCount > 0 && (
                    <span className="rounded-full bg-[#6B9080] px-2 py-0.5 text-[11px] font-semibold text-white">
                        {activeCount} active
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <label className={labelClass}>
                        Search
                    </label>
                    <div className="relative">
                        <FaSearch
                            size={13}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA8A2]"
                        />
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => handleChange('search', e.target.value)}
                            placeholder="Search tickets..."
                            className={`${fieldClass} pl-9`}
                        />
                    </div>
                </div>
                <div>
                    <label className={labelClass}>
                        Status
                    </label>
                    <select
                        value={filters.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                        className={fieldClass}
                    >
                        <option value="">All Status</option>
                        {Object.values(TICKET_STATUS).map((status) => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className={labelClass}>
                        Priority
                    </label>
                    <select
                        value={filters.priority}
                        onChange={(e) => handleChange('priority', e.target.value)}
                        className={fieldClass}
                    >
                        <option value="">All Priorities</option>
                        {Object.values(TICKET_PRIORITY).map((priority) => (
                            <option key={priority} value={priority}>{priority}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-end">
                    <button
                        onClick={handleClear}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#E5E9E6] bg-white px-4 py-2.5 text-sm font-medium text-[#5B6B65] transition-colors hover:border-[#6B9080] hover:bg-[#E3EDE8] hover:text-[#2F3E46] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9080] focus-visible:ring-offset-2"
                    >
                        <FaTimes size={12} />
                        Clear Filters
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TicketFilters;
