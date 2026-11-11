import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Navbar from '../common/Navbar';
import LoadingSpinner from '../common/LoadingSpinner';

/* ---------- Small UI helpers (presentation only) ---------- */

const iconProps = {
    className: 'h-5 w-5',
    fill: 'none',
    viewBox: '0 0 24 24',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
};

const TicketIcon = () => (
    <svg {...iconProps}>
        <path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4Z" />
        <path d="M13 5v2M13 11v2M13 17v2" />
    </svg>
);

const ClockIcon = () => (
    <svg {...iconProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
    </svg>
);

const CheckIcon = () => (
    <svg {...iconProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="m8.5 12 2.5 2.5 4.5-5" />
    </svg>
);

const UserIcon = () => (
    <svg {...iconProps}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" />
    </svg>
);

const ArrowIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
);

const InboxIcon = () => (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 13h5l1.5 3h5L16 13h5" />
        <path d="M5.5 5h13L21 13v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5l2.5-8Z" />
    </svg>
);

const StatCard = ({ label, value, icon, iconClass, valueClass = 'text-[#2F3E46]' }) => (
    <div className="rounded-2xl border border-[#E5E9E6] bg-white p-5 shadow-[0_1px_2px_rgba(47,62,70,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-14px_rgba(47,62,70,0.25)]">
        <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
                <p className="text-sm font-medium text-[#5B6B65]">{label}</p>
                <p className={`mt-2 text-3xl font-semibold tracking-tight ${valueClass}`}>{value}</p>
            </div>
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
                {icon}
            </div>
        </div>
    </div>
);

const Avatar = ({ name, muted = false }) => (
    <span
        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${muted ? 'bg-[#F1F3F2] text-[#8A9993]' : 'bg-[#E3EDE8] text-[#4F7566]'
            }`}
    >
        {name ? name.charAt(0).toUpperCase() : '?'}
    </span>
);

const badgeBase =
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap';

/* ---------- Page ---------- */

const AgentDashboard = () => {
    const [tickets, setTickets] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!socket || !isConnected) return;

        const onNew = (t) => {
            setTickets(prev => prev.some(x => x._id === t._id) ? prev : [t, ...prev]);
            toast('New ticket received!');
        };
        const onChanged = (t) =>
            setTickets(prev => prev.map(x => x._id === t._id ? t : x));

        socket.on('new-ticket', onNew);
        socket.on('ticket-status-changed', onChanged);
        return () => {
            socket.off('new-ticket', onNew);
            socket.off('ticket-status-changed', onChanged);
        };
    }, [socket, isConnected]);

    const fetchData = async () => {
        try {
            const [ticketsRes, statsRes] = await Promise.all([
                api.get('/tickets'),
                api.get('/tickets/statistics')
            ]);

            setTickets(ticketsRes.data);
            setStats(statsRes.data);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'New': 'bg-[#EAF1F6] text-[#3E6A85] ring-[#D3E2EC]',
            'Assigned': 'bg-[#FBF3E4] text-[#9A6B1F] ring-[#F1E2C4]',
            'In Progress': 'bg-[#E3EDE8] text-[#4F7566] ring-[#CFE0D7]',
            'Resolved': 'bg-[#E6F2EA] text-[#2F7A4F] ring-[#CBE5D4]'
        };
        return colors[status] || 'bg-[#F1F3F2] text-[#5B6B65] ring-[#E5E9E6]';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'Low': 'bg-[#E3EDE8] text-[#4F7566] ring-[#CFE0D7]',
            'Medium': 'bg-[#FBF3E4] text-[#9A6B1F] ring-[#F1E2C4]',
            'High': 'bg-[#FBEAEA] text-[#A94442] ring-[#F3D4D4]'
        };
        return colors[priority] || 'bg-[#F1F3F2] text-[#5B6B65] ring-[#E5E9E6]';
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    const myTicketsCount = tickets.filter(t => t.agent?._id === user?._id).length;

    return (
        <div className="min-h-screen bg-[#F6F8F6]">
            <Navbar />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B9080]">
                            Support Desk
                        </p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#2F3E46] sm:text-3xl">
                            Agent Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-[#5B6B65] sm:text-base">
                            Welcome back, <span className="font-medium capitalize text-[#2F3E46]">{user?.name}</span>
                        </p>
                    </div>

                    <div
                        className={`inline-flex items-center gap-2 self-start rounded-full border px-3 py-1.5 text-xs font-medium sm:self-auto ${isConnected
                            ? 'border-[#CFE0D7] bg-[#E3EDE8] text-[#4F7566]'
                            : 'border-[#E5E9E6] bg-white text-[#8A9993]'
                            }`}
                    >
                        <span className="relative flex h-2 w-2">
                            {isConnected && (
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6B9080] opacity-60" />
                            )}
                            <span className={`relative inline-flex h-2 w-2 rounded-full ${isConnected ? 'bg-[#6B9080]' : 'bg-[#B5C0BB]'}`} />
                        </span>
                        {isConnected ? 'Live updates on' : 'Offline'}
                    </div>
                </div>

                {/* Statistics Cards */}
                {stats && (
                    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
                        <StatCard
                            label="Total Tickets"
                            value={stats.total}
                            icon={<TicketIcon />}
                            iconClass="bg-[#E3EDE8] text-[#6B9080]"
                        />
                        <StatCard
                            label="Open Tickets"
                            value={stats.open}
                            icon={<ClockIcon />}
                            iconClass="bg-[#FBF3E4] text-[#B7832F]"
                            valueClass="text-[#9A6B1F]"
                        />
                        <StatCard
                            label="Resolved"
                            value={stats.resolved}
                            icon={<CheckIcon />}
                            iconClass="bg-[#E6F2EA] text-[#2F7A4F]"
                            valueClass="text-[#2F7A4F]"
                        />
                        <StatCard
                            label="Your Tickets"
                            value={myTicketsCount}
                            icon={<UserIcon />}
                            iconClass="bg-[#6B9080] text-white"
                            valueClass="text-[#6B9080]"
                        />
                    </div>
                )}

                {/* Tickets */}
                <div className="overflow-hidden rounded-2xl border border-[#E5E9E6] bg-white shadow-[0_1px_2px_rgba(47,62,70,0.04)]">
                    <div className="flex items-center justify-between gap-4 border-b border-[#E5E9E6] px-5 py-4 sm:px-6">
                        <div>
                            <h2 className="text-lg font-semibold text-[#2F3E46]">All Tickets</h2>
                            <p className="text-sm text-[#5B6B65]">Manage and respond to customer requests</p>
                        </div>
                        <span className="rounded-full bg-[#E3EDE8] px-3 py-1 text-xs font-semibold text-[#4F7566]">
                            {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
                        </span>
                    </div>

                    {tickets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E3EDE8] text-[#6B9080]">
                                <InboxIcon />
                            </div>
                            <h3 className="mt-4 text-base font-semibold text-[#2F3E46]">No tickets yet</h3>
                            <p className="mt-1 max-w-sm text-sm text-[#5B6B65]">
                                New customer tickets will appear here automatically.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop table */}
                            <div className="hidden overflow-x-auto md:block">
                                <table className="min-w-full">
                                    <thead className="bg-[#F6F8F6]">
                                        <tr>
                                            {['Ticket #', 'Subject', 'Customer', 'Priority', 'Status', 'Assigned To', 'Action'].map((heading) => (
                                                <th
                                                    key={heading}
                                                    className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#5B6B65] ${heading === 'Action' ? 'text-right' : 'text-left'
                                                        }`}
                                                >
                                                    {heading}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E5E9E6]">
                                        {tickets.map((ticket) => (
                                            <tr key={ticket._id} className="transition-colors hover:bg-[#F6F8F6]">
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <span className="font-mono text-sm font-semibold text-[#2F3E46]">
                                                        {ticket.ticketNumber}
                                                    </span>
                                                </td>
                                                <td className="max-w-xs px-6 py-4">
                                                    <p className="truncate text-sm font-medium text-[#2F3E46]" title={ticket.subject}>
                                                        {ticket.subject}
                                                    </p>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <Avatar name={ticket.customer?.name} />
                                                        <span className="text-sm text-[#5B6B65]">
                                                            {ticket.customer?.name || 'Unknown'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <span className={`${badgeBase} ${getPriorityColor(ticket.priority)}`}>
                                                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                                                        {ticket.priority}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <span className={`${badgeBase} ${getStatusColor(ticket.status)}`}>
                                                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                                                        {ticket.status}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <Avatar name={ticket.agent?.name} muted={!ticket.agent} />
                                                        <span className={`text-sm ${ticket.agent ? 'text-[#5B6B65]' : 'italic text-[#8A9993]'}`}>
                                                            {ticket.agent?.name || 'Unassigned'}
                                                        </span>
                                                        {ticket.agent?._id === user?._id && (
                                                            <span className="rounded-md bg-[#6B9080] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                                                                You
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right">
                                                    <Link
                                                        to={`/agent/tickets/${ticket._id}`}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E9E6] bg-white px-3 py-1.5 text-sm font-medium text-[#6B9080] transition-all hover:border-[#6B9080] hover:bg-[#6B9080] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9080] focus-visible:ring-offset-2"
                                                    >
                                                        View
                                                        <ArrowIcon />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile cards */}
                            <ul className="divide-y divide-[#E5E9E6] md:hidden">
                                {tickets.map((ticket) => (
                                    <li key={ticket._id} className="px-5 py-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="font-mono text-xs font-semibold text-[#6B9080]">
                                                    {ticket.ticketNumber}
                                                </p>
                                                <p className="mt-0.5 truncate text-sm font-semibold text-[#2F3E46]">
                                                    {ticket.subject}
                                                </p>
                                            </div>
                                            <span className={`${badgeBase} ${getStatusColor(ticket.status)}`}>
                                                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                                                {ticket.status}
                                            </span>
                                        </div>

                                        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                                            <div>
                                                <p className="text-[#8A9993]">Customer</p>
                                                <p className="mt-0.5 truncate font-medium text-[#5B6B65]">
                                                    {ticket.customer?.name || 'Unknown'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[#8A9993]">Assigned To</p>
                                                <p className="mt-0.5 truncate font-medium text-[#5B6B65]">
                                                    {ticket.agent?.name || 'Unassigned'}
                                                    {ticket.agent?._id === user?._id && ' (You)'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between">
                                            <span className={`${badgeBase} ${getPriorityColor(ticket.priority)}`}>
                                                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                                                {ticket.priority}
                                            </span>
                                            <Link
                                                to={`/agent/tickets/${ticket._id}`}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#6B9080] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#5A7D6E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9080] focus-visible:ring-offset-2"
                                            >
                                                View
                                                <ArrowIcon />
                                            </Link>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AgentDashboard;
