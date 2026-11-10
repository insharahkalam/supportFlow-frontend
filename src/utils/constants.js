export const TICKET_STATUS = {
    NEW: 'New',
    ASSIGNED: 'Assigned',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved'
};

export const TICKET_PRIORITY = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High'
};

export const TICKET_CATEGORY = {
    TECHNICAL: 'Technical',
    BILLING: 'Billing',
    ACCOUNT: 'Account',
    PRODUCT: 'Product',
    OTHER: 'Other'
};

export const USER_ROLES = {
    CUSTOMER: 'customer',
    AGENT: 'agent',
    ADMIN: 'admin'
};

export const STATUS_COLORS = {
    [TICKET_STATUS.NEW]: 'bg-blue-100 text-blue-800',
    [TICKET_STATUS.ASSIGNED]: 'bg-yellow-100 text-yellow-800',
    [TICKET_STATUS.IN_PROGRESS]: 'bg-purple-100 text-purple-800',
    [TICKET_STATUS.RESOLVED]: 'bg-green-100 text-green-800'
};

export const PRIORITY_COLORS = {
    [TICKET_PRIORITY.LOW]: 'bg-green-100 text-green-800',
    [TICKET_PRIORITY.MEDIUM]: 'bg-yellow-100 text-yellow-800',
    [TICKET_PRIORITY.HIGH]: 'bg-red-100 text-red-800'
};

export const API_ENDPOINTS = {
    AUTH: {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        ME: '/auth/me'
    },
    TICKETS: {
        BASE: '/tickets',
        STATISTICS: '/tickets/statistics',
        AGENTS: '/tickets/agents',
        ASSIGN: (id) => `/tickets/${id}/assign`,
        STATUS: (id) => `/tickets/${id}/status`,
        REOPEN: (id) => `/tickets/${id}/reopen`,
        DETAIL: (id) => `/tickets/${id}`
    },
    MESSAGES: {
        BASE: '/messages',
        GET: (ticketId) => `/messages/${ticketId}`
    }
};

export const SOCKET_EVENTS = {
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    JOIN_TICKET: 'join-ticket',
    LEAVE_TICKET: 'leave-ticket',
    NEW_MESSAGE: 'new-message',
    NEW_TICKET: 'new-ticket',
    TICKET_UPDATED: 'ticket-updated',
    TICKET_STATUS_CHANGED: 'ticket-status-changed'
};

export const DEFAULT_PAGINATION = {
    PAGE: 1,
    LIMIT: 10
};

export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'Please login to continue.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'Resource not found.',
    SERVER_ERROR: 'Something went wrong. Please try again later.',
    VALIDATION_ERROR: 'Please check your input and try again.'
};

export const SUCCESS_MESSAGES = {
    TICKET_CREATED: 'Ticket created successfully!',
    TICKET_UPDATED: 'Ticket updated successfully!',
    TICKET_RESOLVED: 'Ticket resolved successfully!',
    MESSAGE_SENT: 'Message sent successfully!',
    LOGIN_SUCCESS: 'Login successful!',
    REGISTER_SUCCESS: 'Registration successful!'
};