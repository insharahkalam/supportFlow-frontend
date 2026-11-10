import { useEffect, useState } from 'react';
import socketService from '../services/socket';

export const useSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Connect to socket
        const socketInstance = socketService.connect();
        setSocket(socketInstance);
        setIsConnected(socketService.isConnected);

        // Listen for connection events
        const onConnect = () => {
            setIsConnected(true);
            console.log('Socket connected via hook');
        };

        const onDisconnect = () => {
            setIsConnected(false);
            console.log('Socket disconnected via hook');
        };

        socketInstance.on('connect', onConnect);
        socketInstance.on('disconnect', onDisconnect);

        // Cleanup
        return () => {
            socketInstance.off('connect', onConnect);
            socketInstance.off('disconnect', onDisconnect);
            // Don't disconnect globally, let other components use it
        };
    }, []);

    const joinTicket = (ticketId) => {
        if (socket && isConnected) {
            socketService.joinTicket(ticketId);
        }
    };

    const leaveTicket = (ticketId) => {
        if (socket && isConnected) {
            socketService.leaveTicket(ticketId);
        }
    };

    const emit = (event, data) => {
        if (socket && isConnected) {
            socketService.emit(event, data);
        }
    };

    const on = (event, callback) => {
        if (socket) {
            socketService.on(event, callback);
        }
    };

    const off = (event, callback) => {
        if (socket) {
            socketService.off(event, callback);
        }
    };

    return {
        socket,
        isConnected,
        joinTicket,
        leaveTicket,
        emit,
        on,
        off
    };
};