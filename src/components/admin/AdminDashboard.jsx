import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Navbar from '../common/Navbar';
import LoadingSpinner from '../common/LoadingSpinner';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/tickets/statistics');
            setStats(response.data);
        } catch (error) {
            toast.error('Failed to load statistics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600">Welcome, {user?.name}</p>
                </div>

                {stats && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <div className="card">
                                <p className="text-sm text-gray-500">Total Tickets</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="card">
                                <p className="text-sm text-gray-500">Open Tickets</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.open}</p>
                            </div>
                            <div className="card">
                                <p className="text-sm text-gray-500">Resolved</p>
                                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                            </div>
                            <div className="card">
                                <p className="text-sm text-gray-500">Resolution Rate</p>
                                <p className="text-2xl font-bold text-primary-600">
                                    {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="card">
                                <h3 className="font-semibold text-gray-900 mb-3">By Priority</h3>
                                <div className="space-y-2">
                                    {stats.byPriority.map((item) => (
                                        <div key={item._id} className="flex justify-between text-sm">
                                            <span>{item._id}</span>
                                            <span className="font-medium">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="card">
                                <h3 className="font-semibold text-gray-900 mb-3">By Category</h3>
                                <div className="space-y-2">
                                    {stats.byCategory.map((item) => (
                                        <div key={item._id} className="flex justify-between text-sm">
                                            <span>{item._id}</span>
                                            <span className="font-medium">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="card">
                                <h3 className="font-semibold text-gray-900 mb-3">By Status</h3>
                                <div className="space-y-2">
                                    {stats.byStatus.map((item) => (
                                        <div key={item._id} className="flex justify-between text-sm">
                                            <span>{item._id}</span>
                                            <span className="font-medium">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="card mt-8">
                            <h3 className="font-semibold text-gray-900 mb-3">Recent Tickets</h3>
                            <div className="space-y-3">
                                {stats.recentTickets.map((ticket) => (
                                    <div key={ticket._id} className="flex justify-between items-center border-b pb-2">
                                        <div>
                                            <p className="font-medium text-sm">{ticket.ticketNumber}</p>
                                            <p className="text-sm text-gray-500">{ticket.subject}</p>
                                            <p className="text-xs text-gray-400">By: {ticket.customer?.name}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full ${ticket.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;