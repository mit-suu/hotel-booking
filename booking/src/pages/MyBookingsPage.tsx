import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, MapPin, Users, CreditCard, AlertCircle, 
  ExternalLink, Filter, Search, Clock, CheckCircle 
} from 'lucide-react';
import { bookingAPI, BookingResponse } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import BookingCancelModal from '../components/booking/BookingCancelModal';
import { useToast } from '../contexts/ToastContext';

const MyBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  
  // Modal state
  const [cancelModal, setCancelModal] = useState<{
    isOpen: boolean;
    booking?: BookingResponse;
  }>({ isOpen: false });

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, paymentFilter]);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const params: any = {};
      
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      if (paymentFilter !== 'ALL') {
        params.paymentStatus = paymentFilter;
      }

      const response = await bookingAPI.getMyBookings(params);
      if (response.data.success) {
        setBookings(response.data.result.content || []);
      } else {
        setError('Unable to load bookings');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.hotelName.toLowerCase().includes(searchLower) ||
      booking.bookingReference.toLowerCase().includes(searchLower) ||
      booking.guestName.toLowerCase().includes(searchLower)
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      CONFIRMED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Confirmed' },
      CANCELLED: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Cancelled' },
      CANCELLED_BY_GUEST: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Cancelled by Guest' },
      CANCELLED_BY_HOST: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Cancelled by Host' },
      COMPLETED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Completed' },
      NO_SHOW: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, label: 'No Show' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      PAID: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      FAILED: { color: 'bg-red-100 text-red-800', label: 'Failed' },
      REFUNDED: { color: 'bg-blue-100 text-blue-800', label: 'Refunded' },
      PARTIALLY_REFUNDED: { color: 'bg-orange-100 text-orange-800', label: 'Partial Refund' },
      REFUND_PENDING: { color: 'bg-orange-100 text-orange-800', label: 'Refund Pending' },
      NO_PAYMENT: { color: 'bg-gray-100 text-gray-800', label: 'No Payment' },
      CANCELLED: { color: 'bg-gray-100 text-gray-800', label: 'Payment Cancelled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentMethodDisplay = (method?: string) => {
    switch (method) {
      case 'VNPAY': return 'VNPay';
      case 'CASH_ON_CHECKIN': return 'Cash on Check-in';
      default: return 'Cash on Check-in';
    }
  };

  const handleCancelBooking = (booking: BookingResponse) => {
    setCancelModal({ isOpen: true, booking });
  };

  const handleCancelBookingAction = async (reason?: string) => {
    if (!cancelModal.booking) return;
    
    setCancellingBookingId(cancelModal.booking.id);
    try {
      const response = await bookingAPI.cancelMyBooking(cancelModal.booking.id, reason);
      
      if (response.data.success) {
        // Refresh bookings list
        await fetchBookings();
        setCancelModal({ isOpen: false });
        showToast('success', 'Booking Cancelled', 'Your booking has been cancelled successfully');
      } else {
        throw new Error(response.data.message || 'Failed to cancel booking');
      }
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      showToast('error', 'Cancellation Failed', error.response?.data?.message || error.message || 'Failed to cancel booking');
    } finally {
      setCancellingBookingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading your bookings...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <div className="text-red-500 text-xl font-semibold mb-2">{error}</div>
            <button
              onClick={fetchBookings}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage and track all your hotel reservations</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="CANCELLED_BY_GUEST">Cancelled by Guest</option>
                <option value="CANCELLED_BY_HOST">Cancelled by Host</option>
                <option value="COMPLETED">Completed</option>
                <option value="NO_SHOW">No Show</option>
              </select>
            </div>

            {/* Payment Filter */}
            <div>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Payments</option>
                <option value="PENDING">Payment Pending</option>
                <option value="PAID">Payment Completed</option>
                <option value="FAILED">Payment Failed</option>
                <option value="REFUNDED">Refunded</option>
                <option value="PARTIALLY_REFUNDED">Partial Refund</option>
                <option value="REFUND_PENDING">Refund Pending</option>
                <option value="NO_PAYMENT">No Payment</option>
                <option value="CANCELLED">Payment Cancelled</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center text-gray-600">
              <Filter className="h-4 w-4 mr-2" />
              {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'ALL' || paymentFilter !== 'ALL'
                ? 'Try adjusting your search or filters'
                : "You haven't made any bookings yet"}
            </p>
            <Link
              to="/hotels"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Explore Hotels
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {booking.hotelName}
                      </h3>
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        {booking.hotelAddress}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {formatCurrency(booking.totalAmount)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Reference: {booking.bookingReference}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Room</div>
                      <div className="font-medium">{booking.roomTypeName}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Check-in</div>
                      <div className="font-medium">{formatDate(booking.checkInDate)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Check-out</div>
                      <div className="font-medium">{formatDate(booking.checkOutDate)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Guests</div>
                      <div className="font-medium flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {booking.guests}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusBadge(booking.status)}
                      {getPaymentStatusBadge(booking.paymentStatus)}
                      <div className="flex items-center text-sm text-gray-600">
                        <CreditCard className="h-4 w-4 mr-1" />
                        {getPaymentMethodDisplay(booking.paymentMethod)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/bookings/confirmation/${booking.id}`}
                        className="inline-flex items-center px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        View Details
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                      {booking.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancelBooking(booking)}
                          disabled={cancellingBookingId === booking.id}
                          className="inline-flex items-center px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cancellingBookingId === booking.id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                              Cancelling...
                            </>
                          ) : (
                            'Cancel'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Booking Dates Progress Bar */}
                <div className="bg-gray-50 px-6 py-3 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Booked on {formatDate(booking.createdAt)}
                    </span>
                    <span className="text-gray-600">
                      {booking.numberOfNights} night{booking.numberOfNights !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}



        {/* Cancel Modal */}
        <BookingCancelModal
          isOpen={cancelModal.isOpen}
          onClose={() => setCancelModal({ isOpen: false })}
          onConfirm={handleCancelBookingAction}
          bookingReference={cancelModal.booking?.bookingReference}
          loading={cancellingBookingId === cancelModal.booking?.id}
        />
      </div>
    </div>
  );
};

export default MyBookingsPage; 