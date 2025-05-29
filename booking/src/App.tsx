import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import HotelsPage from './pages/HotelsPage';
import HotelDetailPage from './pages/HotelDetailPage';
import BookingHistoryPage from './pages/BookingHistoryPage';
import BookingDetailPage from './pages/BookingDetailPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCommissions from './pages/admin/AdminCommissions';
import AdminInvoices from './pages/admin/AdminInvoices';
import AdminInvoiceDetail from './pages/admin/AdminInvoiceDetail';
import AdminPromotions from './pages/admin/AdminPromotions';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminCommissionPayments from './pages/admin/AdminCommissionPayments';
import AdminCommissionPaymentDetail from './pages/admin/AdminCommissionPaymentDetail';
import AdminCommissionPaymentCreate from './pages/admin/AdminCommissionPaymentCreate';
import AdminBookings from './pages/admin/AdminBookings';
import AdminBookingDetail from './pages/admin/AdminBookingDetail';
import AdminHotels from './pages/admin/AdminHotels';
import AdminHotelDetail from './pages/admin/AdminHotelDetail';
import AdminHotelAdd from './pages/admin/AdminHotelAdd';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminUserEdit from './pages/admin/AdminUserEdit';
import AdminUserAdd from './pages/admin/AdminUserAdd';
import AdminReviews from './pages/admin/AdminReviews';
import AdminSettings from './pages/admin/AdminSettings';

// Host pages
import HostDashboard from './pages/host/HostDashboard';
import HostProperties from './pages/host/HostProperties';
import HostBookings from './pages/host/HostBookings';
import HostAnalytics from './pages/host/HostAnalytics';
import AddProperty from './pages/host/AddProperty';
import PropertyDetail from './pages/host/PropertyDetail';

// Layout component for public pages
const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </main>
    <Footer />
  </div>
);

// Special layout for homepage to allow full-width hero section
const HomeLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-grow pt-16">
      {children}
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomeLayout><HomePage /></HomeLayout>} />
            <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
            <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
            <Route path="/forgot-password" element={<PublicLayout><ForgotPasswordPage /></PublicLayout>} />
            <Route path="/reset-password" element={<PublicLayout><ResetPasswordPage /></PublicLayout>} />
            <Route path="/email-verification" element={<PublicLayout><EmailVerificationPage /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
            <Route path="/hotels" element={<PublicLayout><HotelsPage /></PublicLayout>} />
            <Route path="/hotels/:id" element={<PublicLayout><HotelDetailPage /></PublicLayout>} />

            {/* User routes - require authentication */}
            <Route path="/profile" element={
              <ProtectedRoute requireAuth={true}>
                <PublicLayout><ProfilePage /></PublicLayout>
              </ProtectedRoute>
            } />
            <Route path="/bookings" element={
              <ProtectedRoute requireAuth={true}>
                <PublicLayout><BookingHistoryPage /></PublicLayout>
              </ProtectedRoute>
            } />
            <Route path="/bookings/:id" element={
              <ProtectedRoute requireAuth={true}>
                <PublicLayout><BookingDetailPage /></PublicLayout>
              </ProtectedRoute>
            } />

            {/* Admin routes - require ADMIN role */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="ADMIN">
                <DashboardLayout type="admin"><AdminDashboard /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/commissions" element={
              <ProtectedRoute requiredRole="ADMIN">
                <DashboardLayout type="admin"><AdminCommissions /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/invoices" element={
              <ProtectedRoute requiredRole="ADMIN">
                <DashboardLayout type="admin"><AdminInvoices /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/invoices/:id" element={
              <ProtectedRoute requiredRole="ADMIN">
                <DashboardLayout type="admin"><AdminInvoiceDetail /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/promotions" element={
              <ProtectedRoute requiredRole="ADMIN">
                <DashboardLayout type="admin"><AdminPromotions /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute requiredRole="ADMIN">
                <DashboardLayout type="admin"><AdminAnalytics /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/commission-payments" element={
              <ProtectedRoute requiredRole="ADMIN">
                <DashboardLayout type="admin"><AdminCommissionPayments /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/commission-payments/:id" element={
              <ProtectedRoute requiredRole="ADMIN">
                <DashboardLayout type="admin"><AdminCommissionPaymentDetail /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/commission-payments/create" element={
              <ProtectedRoute requiredRole="ADMIN">
                <DashboardLayout type="admin"><AdminCommissionPaymentCreate /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/bookings" element={
              <ProtectedRoute requiredRole="ADMIN">
                <DashboardLayout type="admin"><AdminBookings /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/bookings/:id" element={
              <ProtectedRoute requiredRole="ADMIN">
                <DashboardLayout type="admin"><AdminBookingDetail /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/hotels" element={
              <ProtectedRoute requiredRole="ADMIN">
                <DashboardLayout type="admin"><AdminHotels /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/hotels/add" element={
              <ProtectedRoute requiredRole="ADMIN">
                <DashboardLayout type="admin"><AdminHotelAdd /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/hotels/:id" element={
              <ProtectedRoute requiredRole="ADMIN">
                <DashboardLayout type="admin"><AdminHotelDetail /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requiredRole="ADMIN">
                <DashboardLayout type="admin"><AdminUsers /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/users/add" element={
              <ProtectedRoute requiredRole="ADMIN">
                <DashboardLayout type="admin"><AdminUserAdd /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/users/:id" element={
              <ProtectedRoute requiredRole="ADMIN">
                <DashboardLayout type="admin"><AdminUserDetail /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/users/edit/:id" element={
              <ProtectedRoute requiredRole="ADMIN">
                <DashboardLayout type="admin"><AdminUserEdit /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/reviews" element={
              <ProtectedRoute requiredRole="ADMIN">
                <DashboardLayout type="admin"><AdminReviews /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute requiredRole="ADMIN">
                <DashboardLayout type="admin"><AdminSettings /></DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Host routes - require HOST role */}
            <Route path="/host" element={
              <ProtectedRoute requiredRole="HOST">
                <DashboardLayout type="host"><HostDashboard /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/host/properties" element={
              <ProtectedRoute requiredRole="HOST">
                <DashboardLayout type="host"><HostProperties /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/host/properties/add" element={
              <ProtectedRoute requiredRole="HOST">
                <DashboardLayout type="host"><AddProperty /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/host/properties/:id" element={
              <ProtectedRoute requiredRole="HOST">
                <DashboardLayout type="host"><PropertyDetail /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/host/bookings" element={
              <ProtectedRoute requiredRole="HOST">
                <DashboardLayout type="host"><HostBookings /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/host/analytics" element={
              <ProtectedRoute requiredRole="HOST">
                <DashboardLayout type="host"><HostAnalytics /></DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
