import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaTicketAlt, FaClock, FaCheckCircle, FaArrowRight, FaComments } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';
import Navbar from '../common/Navbar';
import LoadingSpinner from '../common/LoadingSpinner';

const badgeBase =
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap';

const cardClass =
    'rounded-2xl border border-[#E5E9E6] bg-white shadow-[0_1px_2px_rgba(47,62,70,0.04)]';

const MyTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { socket } = useSocket();

    useEffect(() => {
        fetchTickets();
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('ticket-status-changed', (updatedTicket) => {
            setTickets(prev =>
                prev.map(ticket =>
                    ticket._id === updatedTicket._id ? updatedTicket : ticket
                )
            );
        });

        return () => {
            socket.off('ticket-status-changed');
        };
    }, [socket]);

    const fetchTickets = async () => {
        try {
            const response = await api.get('/tickets');
            setTickets(response.data);
        } catch (error) {
            toast.error('Failed to load tickets');
            console.error('Error fetching tickets:', error);
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

    const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;
    const openCount = tickets.length - resolvedCount;

    const summary = [
        { label: 'Total tickets', value: tickets.length, icon: <FaTicketAlt />, iconClass: 'bg-[#E3EDE8] text-[#6B9080]' },
        { label: 'Open', value: openCount, icon: <FaClock />, iconClass: 'bg-[#FBF3E4] text-[#B7832F]' },
        { label: 'Resolved', value: resolvedCount, icon: <FaCheckCircle />, iconClass: 'bg-[#E6F2EA] text-[#2F7A4F]' }
    ];

    return (
        <div className="min-h-screen bg-[#F6F8F6] text-[#5B6B65]">
            <Navbar />
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                {/* Header */}
                <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B9080]">Support center</p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#2F3E46] sm:text-3xl">
                            My tickets
                        </h1>
                        <p className="mt-1 text-sm text-[#5B6B65] sm:text-base">
                            Keep track of your support requests and updates.
                        </p>
                    </div>
                    <Link
                        to="/tickets/create"
                        className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-lg bg-[#6B9080] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(47,62,70,0.12)] transition-colors hover:bg-[#5A7D6E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9080] focus-visible:ring-offset-2 sm:self-auto"
                    >
                        <FaPlus size={12} />
                        Create new ticket
                    </Link>
                </header>

                {tickets.length === 0 ? (
                    <section className={`${cardClass} flex flex-col items-center px-6 py-16 text-center`}>
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E3EDE8] text-[#6B9080]">
                            <FaComments size={22} />
                        </div>
                        <h2 className="mt-4 text-base font-semibold text-[#2F3E46]">No tickets yet</h2>
                        <p className="mt-1 text-sm text-[#5B6B65]">
                            Create your first ticket to get started.
                        </p>
                        <Link
                            to="/tickets/create"
                            className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#6B9080] bg-white px-4 text-sm font-medium text-[#5A7D6E] transition-colors hover:bg-[#E3EDE8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9080] focus-visible:ring-offset-2"
                        >
                            <FaPlus size={11} />
                            Create a ticket
                        </Link>
                    </section>
                ) : (
                    <>
                        {/* Summary */}
                        <section aria-label="Ticket summary" className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {summary.map((item) => (
                                <article key={item.label} className={`${cardClass} flex items-center gap-4 p-5`}>
                                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.iconClass}`}>
                                        {item.icon}
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium text-[#5B6B65]">{item.label}</p>
                                        <p className="text-2xl font-semibold tracking-tight text-[#2F3E46]">{item.value}</p>
                                    </div>
                                </article>
                            ))}
                        </section>

                        {/* Mobile cards */}
                        <div className="md:hidden">
                            <h2 className="mb-3 text-sm font-semibold text-[#2F3E46]">
                                All tickets <span className="ml-1 font-medium text-[#8A9993]">({tickets.length})</span>
                            </h2>
                            <div className="space-y-3">
                                {tickets.map((ticket) => (
                                    <article key={ticket._id} className={`${cardClass} p-4`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="font-mono text-xs font-semibold text-[#6B9080]">
                                                    Ticket #{ticket.ticketNumber}
                                                </p>
                                                <h3 className="mt-1 break-words text-sm font-semibold text-[#2F3E46]">
                                                    {ticket.subject}
                                                </h3>
                                            </div>
                                            <span className={`${badgeBase} ${getStatusColor(ticket.status)}`}>
                                                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                                                {ticket.status}
                                            </span>
                                        </div>

                                        <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-[#E5E9E6] pt-3 text-xs">
                                            <div className="min-w-0">
                                                <dt className="text-[#8A9993]">Category</dt>
                                                <dd className="mt-1 truncate font-medium text-[#2F3E46]">{ticket.category}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-[#8A9993]">Priority</dt>
                                                <dd className="mt-1">
                                                    <span className={`${badgeBase} px-2 py-0.5 ${getPriorityColor(ticket.priority)}`}>
                                                        {ticket.priority}
                                                    </span>
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-[#8A9993]">Date</dt>
                                                <dd className="mt-1 font-medium text-[#2F3E46]">
                                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                                </dd>
                                            </div>
                                        </dl>

                                        <Link
                                            to={`/tickets/${ticket._id}`}
                                            className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#6B9080] text-sm font-medium text-white transition-colors hover:bg-[#5A7D6E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9080] focus-visible:ring-offset-2"
                                        >
                                            View ticket
                                            <FaArrowRight size={11} />
                                        </Link>
                                    </article>
                                ))}
                            </div>
                        </div>

                        {/* Desktop table */}
                        <div className={`${cardClass} hidden overflow-hidden md:block`}>
                            <div className="flex items-center justify-between border-b border-[#E5E9E6] px-6 py-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-[#2F3E46]">All tickets</h2>
                                    <p className="text-sm text-[#5B6B65]">Click a ticket to see the conversation</p>
                                </div>
                                <span className="rounded-full bg-[#E3EDE8] px-3 py-1 text-xs font-semibold text-[#4F7566]">
                                    {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-[#F6F8F6]">
                                        <tr>
                                            {['Ticket #', 'Subject', 'Category', 'Priority', 'Status', 'Date', 'Action'].map((heading) => (
                                                <th
                                                    key={heading}
                                                    className={`whitespace-nowrap px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#5B6B65] ${heading === 'Action' ? 'text-right' : 'text-left'}`}
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
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-[#5B6B65]">
                                                    {ticket.category}
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
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-[#5B6B65]">
                                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right">
                                                    <Link
                                                        to={`/tickets/${ticket._id}`}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E9E6] bg-white px-3 py-1.5 text-sm font-medium text-[#6B9080] transition-all hover:border-[#6B9080] hover:bg-[#6B9080] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9080] focus-visible:ring-offset-2"
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
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default MyTickets;
