import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, MapPin, DollarSign, Check, X, Clock, Eye, Phone, Mail, RefreshCw, BookOpen, Search, Filter, AlertTriangle } from 'lucide-react';
import BookingStatusBadge, { PaymentStatusBadge } from '../../components/booking/BookingStatusBadge';
import { bookingAPI, BookingResponse, BookingFilterParams } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import BookingConfirmModal from '../../components/booking/BookingConfirmModal';
import BookingCancelModal from '../../components/booking/BookingCancelModal';

const HostBookings: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // Modal states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    booking?: BookingResponse;
  }>({ isOpen: false });
  
  const [cancelModal, setCancelModal] = useState<{
    isOpen: boolean;
    booking?: BookingResponse;
  }>({ isOpen: false });

  // Fetch bookings from API
  const fetchBookings = async (pageNumber = 0) => {
    try {
      setLoading(pageNumber === 0);
      
      const filterParams: BookingFilterParams = {
        pageNumber,
        pageSize,
        sortBy: 'createdAt'
      };

      // Add status filter if not 'all'
      if (activeTab !== 'all') {
        const statusMapping: { [key: string]: string } = {
          'pending': 'PENDING',
          'confirmed': 'CONFIRMED',
          'cancelled': 'CANCELLED', // Will include all cancelled types in frontend filtering
          'completed': 'COMPLETED'
        };
        filterParams.status = statusMapping[activeTab] as 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
      }

      const response = await bookingAPI.getHostBookings(filterParams);
      
      if (response.data.success) {
        const { content, totalElements: total, totalPages: pages, number } = response.data.result;
        setBookings(content || []);
        setTotalElements(total || 0);
        setTotalPages(pages || 0);
        setCurrentPage(number || 0);
      } else {
        throw new Error(response.data.message || 'Cannot load booking list');
      }
      
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      
      // Fallback: show empty state
      setBookings([]);
      setTotalPages(0);
      setTotalElements(0);
      setCurrentPage(0);
      
      showToast('info', 'Notice', 'No bookings available or service temporarily unavailable');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBookings(currentPage);
  };

  useEffect(() => {
    fetchBookings(0);
  }, [activeTab]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    return <BookingStatusBadge status={status as any} size="sm" />;
  };

  const getPaymentStatusBadge = (status: string) => {
    return <PaymentStatusBadge status={status as any} size="sm" />;
  };

  // Client-side filtering for search and status
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          booking.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (booking.bookingReference && booking.bookingReference.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Additional filtering for cancelled tab to include all cancelled types
    if (activeTab === 'cancelled') {
      const matchesStatus = booking.status === 'CANCELLED' || 
                           booking.status === 'CANCELLED_BY_GUEST' || 
                           booking.status === 'CANCELLED_BY_HOST';
      return matchesSearch && matchesStatus;
    }
    
    // Additional filtering for refund pending tab
    if (activeTab === 'refund_pending') {
      return matchesSearch && booking.paymentStatus === 'REFUND_PENDING';
    }
    
    return matchesSearch;
  });

  const handleViewBooking = (id: string) => {
    navigate(`/host/bookings/${id}`);
  };

  const handleConfirmBooking = (booking: BookingResponse) => {
    setConfirmModal({ isOpen: true, booking });
  };

  const handleConfirmBookingAction = async () => {
    if (!confirmModal.booking) return;
    
    try {
      setActionLoading(confirmModal.booking.id);
      const response = await bookingAPI.confirmBooking(confirmModal.booking.id);
      
      if (response.data.success) {
        showToast('success', 'Booking Confirmed', 'The booking has been confirmed successfully');
        await fetchBookings(currentPage);
        setConfirmModal({ isOpen: false });
      } else {
        throw new Error(response.data.message || 'Cannot confirm booking');
      }
    } catch (error: any) {
      console.error('Error confirming booking:', error);
      showToast('error', 'Confirmation Failed', error.message || 'Cannot confirm booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelBooking = (booking: BookingResponse) => {
    setCancelModal({ isOpen: true, booking });
  };

  const handleCancelBookingAction = async (reason?: string) => {
    if (!cancelModal.booking) return;
    
    try {
      setActionLoading(cancelModal.booking.id);
      const response = await bookingAPI.cancelBooking(cancelModal.booking.id, reason || 'Cancelled by hotel owner');
      
      if (response.data.success) {
        showToast('success', 'Booking Cancelled', 'The booking has been cancelled successfully');
        await fetchBookings(currentPage);
        setCancelModal({ isOpen: false });
      } else {
        throw new Error(response.data.message || 'Cannot cancel booking');
      }
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      showToast('error', 'Cancellation Failed', error.message || 'Cannot cancel booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteBooking = async (id: string) => {
    try {
      setActionLoading(id);
      const response = await bookingAPI.completeBooking(id);
      
      if (response.data.success) {
        showToast('success', 'Booking Completed', 'The booking has been marked as completed');
        await fetchBookings(currentPage);
      } else {
        throw new Error(response.data.message || 'Cannot complete booking');
      }
    } catch (error: any) {
      console.error('Error completing booking:', error);
      showToast('error', 'Completion Failed', error.message || 'Cannot complete booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmPayment = async (id: string) => {
    try {
      setActionLoading(id);
      const response = await bookingAPI.confirmPayment(id);
      
      if (response.data.success) {
        showToast('success', 'Payment Confirmed', 'The payment has been confirmed successfully');
        await fetchBookings(currentPage);
      } else {
        throw new Error(response.data.message || 'Cannot confirm payment');
      }
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      showToast('error', 'Payment Confirmation Failed', error.message || 'Cannot confirm payment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleProcessCancellation = (bookingId: string) => {
    navigate(`/host/bookings/${bookingId}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchBookings(newPage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
            <p className="text-gray-600 mt-1">Total {totalElements} bookings</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setActiveTab('confirmed')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'confirmed'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Confirmed
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'completed'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setActiveTab('cancelled')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'cancelled'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Cancelled
              </button>
              <button
                onClick={() => setActiveTab('refund_pending')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'refund_pending'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Refund Pending
              </button>
            </nav>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by guest name, booking code, hotel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {bookings.length === 0 ? 'No bookings yet' : 'No bookings found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {bookings.length === 0 
                ? 'Customer bookings will appear here' 
                : 'Try changing filters or search keywords'}
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Booking Info
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stay Dates
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-blue-600">
                              {booking.bookingReference || booking.id}
                            </div>
                            <div className="text-sm text-gray-900">{booking.hotelName}</div>
                            <div className="text-sm text-gray-500">{booking.roomTypeName}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {booking.guests} guests
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{booking.guestName}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {booking.guestEmail}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {booking.guestPhone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">Check-in: {formatDate(booking.checkInDate)}</div>
                            <div className="text-sm text-gray-900">Check-out: {formatDate(booking.checkOutDate)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{formatCurrency(booking.totalAmount)}</div>
                            <div className="mt-1">{getPaymentStatusBadge(booking.paymentStatus)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(booking.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewBooking(booking.id)}
                              className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-full"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {booking.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleConfirmBooking(booking)}
                                  disabled={actionLoading === booking.id}
                                  className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-full disabled:opacity-50"
                                  title="Confirm"
                                >
                                  {actionLoading === booking.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                  ) : (
                                    <Check className="h-4 w-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleCancelBooking(booking)}
                                  disabled={actionLoading === booking.id}
                                  className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full disabled:opacity-50"
                                  title="Cancel"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            {booking.status === 'CONFIRMED' && (
                              <button
                                onClick={() => handleCompleteBooking(booking.id)}
                                disabled={actionLoading === booking.id}
                                className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-full disabled:opacity-50"
                                title="Complete"
                              >
                                {actionLoading === booking.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                ) : (
                                  <Clock className="h-4 w-4" />
                                )}
                              </button>
                            )}
                            {booking.status === 'CONFIRMED' && (
                              <button
                                onClick={() => handleProcessCancellation(booking.id)}
                                className="text-orange-600 hover:text-orange-900 p-2 hover:bg-orange-50 rounded-full"
                                title="Process Cancellation Request"
                              >
                                <AlertTriangle className="h-4 w-4" />
                              </button>
                            )}
                            {booking.paymentStatus === 'REFUND_PENDING' && (
                              <button
                                onClick={() => handleProcessCancellation(booking.id)}
                                className="text-purple-600 hover:text-purple-900 p-2 hover:bg-purple-50 rounded-full"
                                title="Process Refund"
                              >
                                <AlertTriangle className="h-4 w-4" />
                              </button>
                            )}
                            {booking.paymentStatus === 'PENDING' && (
                              <button
                                onClick={() => handleConfirmPayment(booking.id)}
                                disabled={actionLoading === booking.id}
                                className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-full disabled:opacity-50"
                                title="Confirm Payment"
                              >
                                {actionLoading === booking.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                ) : (
                                  <DollarSign className="h-4 w-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-4 py-2 border rounded-lg ${
                      currentPage === i
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <BookingConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false })}
        onConfirm={handleConfirmBookingAction}
        booking={confirmModal.booking}
        loading={actionLoading === confirmModal.booking?.id}
      />

      <BookingCancelModal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false })}
        onConfirm={handleCancelBookingAction}
        bookingReference={cancelModal.booking?.bookingReference}
        loading={actionLoading === cancelModal.booking?.id}
      />
    </div>
  );
};

export default HostBookings;
