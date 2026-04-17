import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import FacilitiesPage from './pages/FacilitiesPage';
import BookingsPage from './pages/BookingsPage';
import TicketsPage from './pages/TicketsPage';

// Simple Unauthorized Page
const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
    <div className="text-center max-w-sm">
      <div className="h-20 w-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg size={40} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
      <p className="text-slate-500 mb-8">You don't have the required permissions to view this page.</p>
      <button onClick={() => window.history.back()} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all">Go Back</button>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes inside MainLayout */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/facilities" element={<FacilitiesPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/tickets" element={<TicketsPage />} />
            
            {/* Admin only routes (placeholders) */}
            <Route path="/admin/roles" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <div className="p-8"><h1 className="text-2xl font-bold">Role Management Under Construction</h1></div>
              </ProtectedRoute>
            } />
            <Route path="/admin/assets" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <div className="p-8"><h1 className="text-2xl font-bold">Asset Health Under Construction</h1></div>
              </ProtectedRoute>
            } />
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
