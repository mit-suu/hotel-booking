import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import AboutPage from './pages/AboutPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import OAuth2SuccessPage from './pages/OAuth2SuccessPage';
import OAuth2TestPage from './pages/OAuth2TestPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import BookingConfirmationPage from './pages/BookingConfirmationPage';
import BookingDetailPage from './pages/BookingDetailPage';
import BookingFormPage from './pages/BookingFormPage';
import BookingHistoryPage from './pages/BookingHistoryPage';
import HotelDetailPage from './pages/HotelDetailPage';
import HotelsPage from './pages/HotelsPage';
import MyBookingsPage from './pages/MyBookingsPage';
import MyReviews from './pages/MyReviews';
import PaymentReturnPage from './pages/PaymentReturnPage';
import HostCheckinPage from './pages/host/HostCheckinPage';

// Admin pages
import AdminCommissions from './pages/admin/AdminCommissions';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPromotions from './pages/admin/AdminPromotions';
import AdminRevenue from './pages/admin/AdminRevenue';
 

import AdminBookingDetail from './pages/admin/AdminBookingDetail';
import AdminBookings from './pages/admin/AdminBookings';
import AdminHotelAdd from './pages/admin/AdminHotelAdd';
import AdminHotelDetail from './pages/admin/AdminHotelDetail';
import AdminHotelEdit from './pages/admin/AdminHotelEdit';
import AdminHotels from './pages/admin/AdminHotels';
import AdminReviews from './pages/admin/AdminReviews';
import AdminRoomTypeAdd from './pages/admin/AdminRoomTypeAdd';
import AdminRoomTypeDetail from './pages/admin/AdminRoomTypeDetail';
import AdminRoomTypeEdit from './pages/admin/AdminRoomTypeEdit';
import AdminRoomTypes from './pages/admin/AdminRoomTypes';
import AdminUserAdd from './pages/admin/AdminUserAdd';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminUserEdit from './pages/admin/AdminUserEdit';
import AdminUsers from './pages/admin/AdminUsers';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';


// Host pages
import HostBookingDetail from './pages/host/HostBookingDetail';
import HostBookings from './pages/host/HostBookings';
import HostDashboard from './pages/host/HostDashboard';
import HostProperties from './pages/host/HostProperties';

import AddProperty from './pages/host/AddProperty';
import HostHotelAdd from './pages/host/HostHotelAdd';
import HostHotelDetail from './pages/host/HostHotelDetail';
import HostHotelEdit from './pages/host/HostHotelEdit';
import HostHotels from './pages/host/HostHotels';
import HostReviews from './pages/host/HostReviews';
import HostRoomTypeAdd from './pages/host/HostRoomTypeAdd';
import HostRoomTypeDetail from './pages/host/HostRoomTypeDetail';
import HostRoomTypeEdit from './pages/host/HostRoomTypeEdit';
import HostRoomTypes from './pages/host/HostRoomTypes';
import HostVouchers from './pages/host/HostVouchers';
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

// Host routes
const hostRoutes = [
  { path: '/host', element: <HostDashboard /> },
  { path: '/host/hotels', element: <HostHotels /> },
  { path: '/host/hotels/add', element: <HostHotelAdd /> },
  { path: '/host/hotels/:id', element: <HostHotelDetail /> },
  { path: '/host/hotels/edit/:id', element: <HostHotelEdit /> },
  { path: '/host/bookings', element: <HostBookings /> },
  { path: '/host/bookings/:id', element: <HostBookingDetail /> },
  { path: '/host/vouchers', element: <HostVouchers /> },
  { path: '/host/reviews', element: <HostReviews /> },
  { path: '/host/checkin/:bookingId', element: <HostCheckinPage /> },

];

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
            <Route path="/auth/oauth2/success" element={<OAuth2SuccessPage />} />
            <Route path="/oauth2-test" element={<PublicLayout><OAuth2TestPage /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />

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
            <Route path="/bookings/my" element={
              <ProtectedRoute requireAuth={true}>
                <PublicLayout><MyBookingsPage /></PublicLayout>
              </ProtectedRoute>
            } />
            <Route path="/bookings/:id" element={
              <ProtectedRoute requireAuth={true}>
                <PublicLayout><BookingDetailPage /></PublicLayout>
              </ProtectedRoute>
            } />
            <Route path="/bookings/confirmation/:bookingId" element={
              <ProtectedRoute requireAuth={true}>
                <PublicLayout><BookingConfirmationPage /></PublicLayout>
              </ProtectedRoute>
            } />
            <Route path="/booking" element={
              <ProtectedRoute requireAuth={true}>
                <PublicLayout><BookingFormPage /></PublicLayout>
              </ProtectedRoute>
            } />
            <Route path="/my-reviews" element={
              <ProtectedRoute requireAuth={true}>
                <PublicLayout><MyReviews /></PublicLayout>
              </ProtectedRoute>
            } />

            {/* Payment routes - public access for VNPay callbacks */}
            <Route path="/payment/return" element={
              <PublicLayout><PaymentReturnPage /></PublicLayout>
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
            <Route path="/admin/revenue" element={
              <ProtectedRoute requiredRole="ADMIN">
                <DashboardLayout type="admin"><AdminRevenue /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/promotions" element={
              <ProtectedRoute requiredRole="ADMIN">
                <DashboardLayout type="admin"><AdminPromotions /></DashboardLayout>
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
            <Route path="/admin/withdrawals" element={
              <ProtectedRoute requiredRole="ADMIN">
                <DashboardLayout type="admin"><AdminWithdrawals /></DashboardLayout>
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
            <Route path="/admin/hotels/edit/:id" element={
              <ProtectedRoute requiredRole="ADMIN">
                <DashboardLayout type="admin"><AdminHotelEdit /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/room-types" element={
              <ProtectedRoute requiredRole="ADMIN">
                <DashboardLayout type="admin"><AdminRoomTypes /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/room-types/:id" element={
              <ProtectedRoute requiredRole="ADMIN">
                <DashboardLayout type="admin"><AdminRoomTypeDetail /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/room-types/edit/:id" element={
              <ProtectedRoute requiredRole="ADMIN">
                <DashboardLayout type="admin"><AdminRoomTypeEdit /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/room-types/add" element={
              <ProtectedRoute requiredRole="ADMIN">
                <DashboardLayout type="admin"><AdminRoomTypeAdd /></DashboardLayout>
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
            <Route path="/host/hotels" element={
              <ProtectedRoute requiredRole="HOST">
                <DashboardLayout type="host"><HostHotels /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/host/hotels/add" element={
              <ProtectedRoute requiredRole="HOST">
                <DashboardLayout type="host"><HostHotelAdd /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/host/hotels/:id" element={
              <ProtectedRoute requiredRole="HOST">
                <DashboardLayout type="host"><HostHotelDetail /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/host/hotels/edit/:id" element={
              <ProtectedRoute requiredRole="HOST">
                <DashboardLayout type="host"><HostHotelEdit /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/host/room-types" element={
              <ProtectedRoute requiredRole="HOST">
                <DashboardLayout type="host"><HostRoomTypes /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/host/room-types/add" element={
              <ProtectedRoute requiredRole="HOST">
                <DashboardLayout type="host"><HostRoomTypeAdd /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/host/room-types/:id" element={
              <ProtectedRoute requiredRole="HOST">
                <DashboardLayout type="host"><HostRoomTypeDetail /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/host/room-types/edit/:id" element={
              <ProtectedRoute requiredRole="HOST">
                <DashboardLayout type="host"><HostRoomTypeEdit /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/host/bookings" element={
              <ProtectedRoute requiredRole="HOST">
                <DashboardLayout type="host"><HostBookings /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/host/bookings/:id" element={
              <ProtectedRoute requiredRole="HOST">
                <DashboardLayout type="host"><HostBookingDetail /></DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/host/vouchers" element={
              <ProtectedRoute requiredRole="HOST">
                <DashboardLayout type="host"><HostVouchers /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/host/reviews" element={
              <ProtectedRoute requiredRole="HOST">
                <DashboardLayout type="host"><HostReviews /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/host/checkin/:bookingId" element={<HostCheckinPage />} />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
