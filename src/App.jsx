// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { Toaster } from 'react-hot-toast';
// import { AuthProvider } from './context/AuthContext';
// import { SocketProvider } from './context/SocketContext';
// import Login from './components/auth/Login';
// import Register from './components/auth/Register';
// import CreateTicket from './components/customer/CreateTicket';
// import MyTickets from './components/customer/MyTickets';
// import TicketDetail from './components/customer/TicketDetail';
// import AgentDashboard from './components/agent/AgentDashboard';
// import TicketView from './components/agent/TicketView';
// import AdminDashboard from './components/admin/AdminDashboard';
// import ProtectedRoute from './components/common/ProtectedRoute';

// function App() {
//     return (
//         <Router>
//             <AuthProvider>
//                 <SocketProvider>
//                     <div className="min-h-screen bg-gray-50">
//                         <Toaster position="top-right" />
//                         <Routes>
//                             <Route path="/login" element={<Login />} />
//                             <Route path="/register" element={<Register />} />

//                             {/* Customer Routes */}
//                             <Route path="/" element={<Navigate to="/tickets" />} />
//                             <Route path="/tickets" element={
//                                 <ProtectedRoute allowedRoles={['customer']}>
//                                     <MyTickets />
//                                 </ProtectedRoute>
//                             } />
//                             <Route path="/tickets/create" element={
//                                 <ProtectedRoute allowedRoles={['customer']}>
//                                     <CreateTicket />
//                                 </ProtectedRoute>
//                             } />
//                             <Route path="/tickets/:id" element={
//                                 <ProtectedRoute allowedRoles={['customer']}>
//                                     <TicketDetail />
//                                 </ProtectedRoute>
//                             } />

//                             {/* Agent Routes */}
//                             <Route path="/agent/dashboard" element={
//                                 <ProtectedRoute allowedRoles={['agent', 'admin']}>
//                                     <AgentDashboard />
//                                 </ProtectedRoute>
//                             } />
//                             <Route path="/agent/tickets/:id" element={
//                                 <ProtectedRoute allowedRoles={['agent', 'admin']}>
//                                     <TicketView />
//                                 </ProtectedRoute>
//                             } />

//                             {/* Admin Routes */}
//                             <Route path="/admin/dashboard" element={
//                                 <ProtectedRoute allowedRoles={['admin']}>
//                                     <AdminDashboard />
//                                 </ProtectedRoute>
//                             } />
//                         </Routes>
//                     </div>
//                 </SocketProvider>
//             </AuthProvider>
//         </Router>
//     );
// }

// export default App;


import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import CreateTicket from './components/customer/CreateTicket';
import MyTickets from './components/customer/MyTickets';
import TicketDetail from './components/customer/TicketDetail';
import AgentDashboard from './components/agent/AgentDashboard';
import TicketView from './components/agent/TicketView';
import AdminDashboard from './components/admin/AdminDashboard';
import ProtectedRoute from './components/common/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// This component handles role-based redirects
const RoleBasedRedirect = () => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" />;

    switch (user.role) {
        case 'admin':
            return <Navigate to="/admin/dashboard" />;
        case 'agent':
            return <Navigate to="/agent/dashboard" />;
        case 'customer':
        default:
            return <Navigate to="/tickets" />;
    }
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <SocketProvider>
                    <div className="min-h-screen bg-gray-50">
                        <Toaster position="top-right" />
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            {/* Root Route - Role based redirect */}
                            <Route path="/" element={<RoleBasedRedirect />} />

                            {/* Customer Routes */}
                            <Route path="/tickets" element={
                                <ProtectedRoute allowedRoles={['customer']}>
                                    <MyTickets />
                                </ProtectedRoute>
                            } />
                            <Route path="/tickets/create" element={
                                <ProtectedRoute allowedRoles={['customer']}>
                                    <CreateTicket />
                                </ProtectedRoute>
                            } />
                            <Route path="/tickets/:id" element={
                                <ProtectedRoute allowedRoles={['customer']}>
                                    <TicketDetail />
                                </ProtectedRoute>
                            } />

                            {/* Agent Routes */}
                            <Route path="/agent/dashboard" element={
                                <ProtectedRoute allowedRoles={['agent', 'admin']}>
                                    <AgentDashboard />
                                </ProtectedRoute>
                            } />
                            <Route path="/agent/tickets/:id" element={
                                <ProtectedRoute allowedRoles={['agent', 'admin']}>
                                    <TicketView />
                                </ProtectedRoute>
                            } />

                            {/* Admin Routes */}
                            <Route path="/admin/dashboard" element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            } />

                            {/* Catch all - redirect to appropriate dashboard */}
                            <Route path="*" element={<RoleBasedRedirect />} />
                        </Routes>
                    </div>
                </SocketProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;