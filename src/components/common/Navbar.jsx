import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaSignOutAlt, FaTicketAlt, FaTachometerAlt } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getDashboardLink = () => {
        if (user?.role === 'admin') return '/admin/dashboard';
        if (user?.role === 'agent') return '/agent/dashboard';
        return '/tickets';
    };

    return (
        <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to={getDashboardLink()} className="flex items-center">
                            <FaTicketAlt className="text-primary-600 text-xl mr-2" />
                            <span className="font-bold text-xl text-gray-900">Support Desk</span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link
                            to={getDashboardLink()}
                            className="text-gray-700 hover:text-primary-600 flex items-center gap-1"
                        >
                            <FaTachometerAlt className="text-sm" />
                            <span className="hidden sm:inline">Dashboard</span>
                        </Link>

                        <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-700 hidden sm:inline">
                                <FaUser className="inline mr-1" />
                                {user?.name}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="text-gray-700 hover:text-primary-600 flex items-center gap-1"
                            >
                                <FaSignOutAlt />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;