import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        const SOCKET_URL = (import.meta.env.VITE_APP_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');

        const newSocket = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: true,
            auth: { token: localStorage.getItem('token') }
        });

        newSocket.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
            newSocket.on('connect_error', (err) => {
                console.error('Socket connect error:', err.message);
            });
        };
    }, [isAuthenticated]);

    const joinTicket = (ticketId) => {
        if (socket && isConnected) {
            socket.emit('join-ticket', ticketId);
        }
    };

    const leaveTicket = (ticketId) => {
        if (socket && isConnected) {
            socket.emit('leave-ticket', ticketId);
        }
    };

    const value = {
        socket,
        isConnected,
        joinTicket,
        leaveTicket
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};