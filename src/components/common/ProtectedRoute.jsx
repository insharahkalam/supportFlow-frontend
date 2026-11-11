import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // If no roles specified, just check authentication
    if (allowedRoles.length === 0) {
        return children;
    }

    // Check if user has allowed role
    if (!allowedRoles.includes(user?.role)) {
        // Redirect based on role
        switch (user?.role) {
            case 'admin':
                return <Navigate to="/admin/dashboard" />;
            case 'agent':
                return <Navigate to="/agent/dashboard" />;
            case 'customer':
            default:
                return <Navigate to="/tickets" />;
        }
    }

    return children;
};

export default ProtectedRoute;