import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Navbar from '../common/Navbar';
import LoadingSpinner from '../common/LoadingSpinner';
import { Link } from 'react-router-dom';
import {
    FaTicketAlt,
    FaClock,
    FaCheckCircle,
    FaChartLine,
    FaFlag,
    FaTags,
    FaStream,
    FaArrowRight,
    FaInbox
} from 'react-icons/fa';

/* ---------- Presentation helpers ---------- */

const badgeBase =
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap capitalize';

const getStatusColor = (status) => {
    const colors = {
        'new': 'bg-[#EAF1F6] text-[#3E6A85] ring-[#D3E2EC]',
        'assigned': 'bg-[#FBF3E4] text-[#9A6B1F] ring-[#F1E2C4]',
        'in progress': 'bg-[#E3EDE8] text-[#4F7566] ring-[#CFE0D7]',
        'resolved': 'bg-[#E6F2EA] text-[#2F7A4F] ring-[#CBE5D4]'
    };
    return colors[String(status || '').toLowerCase()] || 'bg-[#F1F3F2] text-[#5B6B65] ring-[#E5E9E6]';
};

const getPriorityColor = (priority) => {
    const colors = {
        'low': 'bg-[#E3EDE8] text-[#4F7566] ring-[#CFE0D7]',
        'medium': 'bg-[#FBF3E4] text-[#9A6B1F] ring-[#F1E2C4]',
        'high': 'bg-[#FBEAEA] text-[#A94442] ring-[#F3D4D4]'
    };
    return colors[String(priority || '').toLowerCase()] || 'bg-[#F1F3F2] text-[#5B6B65] ring-[#E5E9E6]';
};

const getBarColor = (key) => {
    const colors = {
        'high': 'bg-[#C46B69]',
        'medium': 'bg-[#C28B33]',
        'low': 'bg-[#6B9080]',
        'new': 'bg-[#5B8BAA]',
        'assigned': 'bg-[#C28B33]',
        'in progress': 'bg-[#6B9080]',
        'resolved': 'bg-[#2F7A4F]'
    };
    return colors[String(key || '').toLowerCase()] || 'bg-[#6B9080]';
};

const Avatar = ({ name, muted = false }) => (
    <span
        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${muted ? 'bg-[#F1F3F2] text-[#8A9993]' : 'bg-[#E3EDE8] text-[#4F7566]'
            }`}
    >
        {name ? name.charAt(0).toUpperCase() : '?'}
    </span>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [statsRes, ticketsRes] = await Promise.all([
                api.get('/tickets/statistics'),
                api.get('/tickets')
            ]);
            setStats(statsRes.data);
            setTickets(ticketsRes.data);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    const resolutionRate = stats?.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

    const summaryCards = [
        {
            label: 'Total Tickets',
            value: stats?.total,
            detail: 'Across all requests',
            icon: <FaTicketAlt />,
            iconClass: 'bg-[#E3EDE8] text-[#6B9080]',
            valueClass: 'text-[#2F3E46]'
        },
        {
            label: 'Open Tickets',
            value: stats?.open,
            detail: 'Awaiting resolution',
            icon: <FaClock />,
            iconClass: 'bg-[#FBF3E4] text-[#B7832F]',
            valueClass: 'text-[#9A6B1F]'
        },
        {
            label: 'Resolved',
            value: stats?.resolved,
            detail: 'Successfully closed',
            icon: <FaCheckCircle />,
            iconClass: 'bg-[#E6F2EA] text-[#2F7A4F]',
            valueClass: 'text-[#2F7A4F]'
        },
        {
            label: 'Resolution Rate',
            value: `${resolutionRate}%`,
            detail: 'Of all tickets resolved',
            icon: <FaChartLine />,
            iconClass: 'bg-[#6B9080] text-white',
            valueClass: 'text-[#6B9080]',
            progress: resolutionRate
        }
    ];

    const breakdowns = stats
        ? [
            { title: 'By Priority', items: stats.byPriority, icon: <FaFlag /> },
            { title: 'By Category', items: stats.byCategory, icon: <FaTags /> },
            { title: 'By Status', items: stats.byStatus, icon: <FaStream /> }
        ]
        : [];

    return (
        <div className="min-h-screen bg-[#F6F8F6]">
            <Navbar />

            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                {/* Header */}
                <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B9080]">
                            Support overview
                        </p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#2F3E46] sm:text-3xl">
                            Admin Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-[#5B6B65] sm:text-base">
                            Welcome, <span className="font-medium text-[#2F3E46]">{user?.name}</span>
                        </p>
                    </div>
                    <p className="inline-flex items-center gap-2 self-start rounded-full border border-[#E5E9E6] bg-white px-3 py-1.5 text-xs font-medium text-[#5B6B65] sm:self-auto">
                        <span className="h-2 w-2 rounded-full bg-[#6B9080]" />
                        A clear view of your support activity
                    </p>
                </header>

                {stats && (
                    <>
                        {/* Summary cards */}
                        <section
                            aria-label="Ticket summary"
                            className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 lg:gap-5"
                        >
                            {summaryCards.map((card) => (
                                <article
                                    key={card.label}
                                    className="rounded-2xl border border-[#E5E9E6] bg-white p-5 shadow-[0_1px_2px_rgba(47,62,70,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-14px_rgba(47,62,70,0.25)]"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <p className="text-sm font-medium text-[#5B6B65]">
                                            {card.label}
                                        </p>
                                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base ${card.iconClass}`}>
                                            {card.icon}
                                        </span>
                                    </div>
                                    <p className={`mt-3 text-3xl font-semibold tracking-tight ${card.valueClass}`}>
                                        {card.value}
                                    </p>
                                    {typeof card.progress === 'number' ? (
                                        <div className="mt-3">
                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#EEF1EF]">
                                                <div
                                                    className="h-full rounded-full bg-[#6B9080] transition-all duration-500"
                                                    style={{ width: `${Math.min(card.progress, 100)}%` }}
                                                />
                                            </div>
                                            <p className="mt-2 text-xs text-[#8A9993]">{card.detail}</p>
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-xs text-[#8A9993]">
                                            {card.detail}
                                        </p>
                                    )}
                                </article>
                            ))}
                        </section>

                        {/* Breakdowns */}
                        <section
                            aria-label="Ticket breakdowns"
                            className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5"
                        >
                            {breakdowns.map((breakdown) => (
                                <article
                                    key={breakdown.title}
                                    className="rounded-2xl border border-[#E5E9E6] bg-white p-5 shadow-[0_1px_2px_rgba(47,62,70,0.04)]"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E3EDE8] text-sm text-[#6B9080]">
                                            {breakdown.icon}
                                        </span>
                                        <h2 className="text-base font-semibold text-[#2F3E46]">
                                            {breakdown.title}
                                        </h2>
                                    </div>

                                    <div className="mt-5 space-y-4">
                                        {(breakdown.items || []).map((item) => {
                                            const pct = stats.total > 0 ? Math.round((item.count / stats.total) * 100) : 0;
                                            return (
                                                <div key={item._id}>
                                                    <div className="mb-1.5 flex items-center justify-between gap-4 text-sm">
                                                        <span className="flex items-center gap-2 capitalize text-[#5B6B65]">
                                                            <span className={`h-2 w-2 rounded-full ${getBarColor(item._id)}`} />
                                                            {item._id}
                                                        </span>
                                                        <span className="flex items-baseline gap-1.5">
                                                            <span className="font-semibold text-[#2F3E46]">{item.count}</span>
                                                            <span className="text-xs text-[#8A9993]">{pct}%</span>
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#EEF1EF]">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${getBarColor(item._id)}`}
                                                            style={{ width: `${Math.min(pct, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {(!breakdown.items || breakdown.items.length === 0) && (
                                            <p className="py-4 text-center text-sm text-[#8A9993]">No data yet</p>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </section>

                        {/* All tickets */}
                        <section className="overflow-hidden rounded-2xl border border-[#E5E9E6] bg-white shadow-[0_1px_2px_rgba(47,62,70,0.04)]">
                            <div className="flex items-center justify-between gap-4 border-b border-[#E5E9E6] px-5 py-4 sm:px-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-[#2F3E46]">
                                        All Tickets
                                    </h2>
                                    <p className="text-sm text-[#5B6B65]">
                                        Review ticket details and assigned agents
                                    </p>
                                </div>
                                <span className="shrink-0 rounded-full bg-[#E3EDE8] px-3 py-1 text-xs font-semibold text-[#4F7566]">
                                    {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
                                </span>
                            </div>

                            {tickets.length > 0 ? (
                                <>
                                    {/* Desktop table */}
                                    <div className="hidden overflow-x-auto md:block">
                                        <table className="min-w-full">
                                            <thead className="bg-[#F6F8F6]">
                                                <tr>
                                                    {[
                                                        'Ticket #',
                                                        'Subject',
                                                        'Customer',
                                                        'Priority',
                                                        'Status',
                                                        'Agent',
                                                        'Action'
                                                    ].map((heading) => (
                                                        <th
                                                            key={heading}
                                                            scope="col"
                                                            className={`whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#5B6B65] sm:px-6 ${heading === 'Action' ? 'text-right' : 'text-left'
                                                                }`}
                                                        >
                                                            {heading}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-[#E5E9E6]">
                                                {tickets.map((ticket) => (
                                                    <tr
                                                        key={ticket._id}
                                                        className="transition-colors hover:bg-[#F6F8F6]"
                                                    >
                                                        <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                                                            <span className="font-mono text-sm font-semibold text-[#2F3E46]">
                                                                {ticket.ticketNumber}
                                                            </span>
                                                        </td>
                                                        <td className="max-w-xs px-5 py-4 sm:px-6">
                                                            <p className="truncate text-sm font-medium text-[#2F3E46]" title={ticket.subject}>
                                                                {ticket.subject}
                                                            </p>
                                                        </td>
                                                        <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                                                            <div className="flex items-center gap-2.5">
                                                                <Avatar name={ticket.customer?.name} />
                                                                <span className="text-sm text-[#5B6B65]">
                                                                    {ticket.customer?.name}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                                                            <span className={`${badgeBase} ${getPriorityColor(ticket.priority)}`}>
                                                                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                                                                {ticket.priority}
                                                            </span>
                                                        </td>
                                                        <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                                                            <span className={`${badgeBase} ${getStatusColor(ticket.status)}`}>
                                                                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                                                                {ticket.status}
                                                            </span>
                                                        </td>
                                                        <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                                                            <div className="flex items-center gap-2.5">
                                                                <Avatar name={ticket.agent?.name} muted={!ticket.agent} />
                                                                <span className={`text-sm ${ticket.agent ? 'text-[#5B6B65]' : 'italic text-[#8A9993]'}`}>
                                                                    {ticket.agent?.name || 'Unassigned'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="whitespace-nowrap px-5 py-4 text-right sm:px-6">
                                                            <Link
                                                                to={`/agent/tickets/${ticket._id}`}
                                                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E9E6] bg-white px-3 py-1.5 text-sm font-medium text-[#6B9080] transition-all hover:border-[#6B9080] hover:bg-[#6B9080] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9080] focus-visible:ring-offset-2"
                                                            >
                                                                View
                                                                <FaArrowRight size={11} />
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
                                                            {ticket.customer?.name}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[#8A9993]">Agent</p>
                                                        <p className="mt-0.5 truncate font-medium text-[#5B6B65]">
                                                            {ticket.agent?.name || 'Unassigned'}
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
                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#6B9080] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#5A7D6E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9080] focus-visible:ring-offset-2"
                                                    >
                                                        View
                                                        <FaArrowRight size={11} />
                                                    </Link>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E3EDE8] text-[#6B9080]">
                                        <FaInbox size={22} />
                                    </div>
                                    <p className="mt-4 text-base font-semibold text-[#2F3E46]">No tickets to display.</p>
                                    <p className="mt-1 text-sm text-[#5B6B65]">New tickets will show up here as customers submit them.</p>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
