import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, MapPin, Calendar, DollarSign, Clock, Check, X, 
  FileText, Printer, Download, Mail, Phone, MessageSquare, Edit, 
  Percent, Building, CreditCard, AlertTriangle, ChevronDown, ChevronUp,
  RefreshCw, ExternalLink, Star, Copy, Eye
} from 'lucide-react';
import { bookingAPI, BookingResponse } from '../../services/api';
import BookingStatusBadge, { PaymentStatusBadge } from '../../components/booking/BookingStatusBadge';

interface DetailState {
  booking: BookingResponse | null;
  loading: boolean;
  error: string | null;
  updating: boolean;
}

const AdminBookingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [state, setState] = useState<DetailState>({
    booking: null,
    loading: false,
    error: null,
    updating: false
  });

  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showGuestDetails, setShowGuestDetails] = useState(true);
  const [showHotelDetails, setShowHotelDetails] = useState(true);
  const [notes, setNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // Load booking details
  const loadBookingDetail = async () => {
    if (!id) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await bookingAPI.getBookingById(id);
      if (response.data.success) {
        setState(prev => ({
          ...prev,
          booking: response.data.result,
          loading: false
        }));
        setNotes(response.data.result.specialRequests || '');
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.response?.data?.message || 'Error occurred while loading booking details',
        loading: false
      }));
    }
  };

  useEffect(() => {
    loadBookingDetail();
  }, [id]);

  // Action handlers
  const handleGoBack = () => {
    navigate('/admin/bookings');
  };

  const handleRefresh = () => {
    loadBookingDetail();
  };

  const handleConfirmBooking = async () => {
    if (!state.booking) return;
    
    setState(prev => ({ ...prev, updating: true }));
    try {
      await bookingAPI.confirmBooking(state.booking.id);
      await loadBookingDetail();
      alert('Booking confirmed successfully');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error occurred while confirming booking');
    } finally {
      setState(prev => ({ ...prev, updating: false }));
    }
  };

  const handleCancelBooking = async () => {
    if (!state.booking) return;
    
    const reason = prompt('Enter reason for canceling booking:');
    if (!reason) return;

    setState(prev => ({ ...prev, updating: true }));
    try {
      await bookingAPI.cancelBooking(state.booking.id, reason);
      await loadBookingDetail();
      alert('Booking cancelled successfully');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error occurred while canceling booking');
    } finally {
      setState(prev => ({ ...prev, updating: false }));
    }
  };

  const handleCompleteBooking = async () => {
    if (!state.booking) return;
    
    setState(prev => ({ ...prev, updating: true }));
    try {
      await bookingAPI.completeBooking(state.booking.id);
      await loadBookingDetail();
      alert('Booking marked as completed');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error occurred while completing booking');
    } finally {
      setState(prev => ({ ...prev, updating: false }));
    }
  };

  const handleDeleteBooking = async () => {
    if (!state.booking) return;
    
    if (!window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }

    setState(prev => ({ ...prev, updating: true }));
    try {
      await bookingAPI.deleteBooking(state.booking.id);
      alert('Booking deleted successfully');
      navigate('/admin/bookings');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error occurred while deleting booking');
      setState(prev => ({ ...prev, updating: false }));
    }
  };

  const handleSendEmail = () => {
    if (state.booking) {
      window.location.href = `mailto:${state.booking.guestEmail}?subject=Booking information ${state.booking.bookingReference}`;
    }
  };

  const handleCallGuest = () => {
    if (state.booking) {
      window.location.href = `tel:${state.booking.guestPhone}`;
    }
  };

  const handleConfirmPayment = async () => {
    if (!state.booking) return;
    
    if (!window.confirm('Are you sure you want to confirm this payment? This action cannot be undone.')) {
      return;
    }

    setState(prev => ({ ...prev, updating: true }));
    try {
      await bookingAPI.adminConfirmPayment(state.booking.id);
      await loadBookingDetail();
      alert('Payment confirmed successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error occurred while confirming payment');
    } finally {
      setState(prev => ({ ...prev, updating: false }));
    }
  };

  const handlePrintBooking = () => {
    window.print();
  };

  const handleCopyBookingId = () => {
    if (state.booking) {
      navigator.clipboard.writeText(state.booking.bookingReference);
      alert('Booking code copied');
    }
  };

  const handleViewHotel = () => {
    if (state.booking) {
      navigate(`/admin/hotels/${state.booking.hotelId}`);
    }
  };

  const handleViewGuest = () => {
    if (state.booking) {
      // Navigate to guest profile or user management
      navigate(`/admin/users?search=${state.booking.guestEmail}`);
    }
  };

  // Utility functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (status: string) => {
    return <BookingStatusBadge status={status as any} size="md" />;
  };

  const getPaymentStatusBadge = (status: string) => {
    return <PaymentStatusBadge status={status as any} size="md" />;
  };

  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading booking details...</span>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="w-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-400 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-800">An error occurred</h3>
              <p className="text-red-700 mt-1">{state.error}</p>
            </div>
          </div>
          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleGoBack}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={loadBookingDetail}
              className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!state.booking) {
    return (
      <div className="w-full">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Booking not found</h3>
          <p className="text-gray-600 mb-4">The booking with this ID does not exist or has been deleted.</p>
          <button
            onClick={handleGoBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  const booking = state.booking;
  const nights = calculateNights(booking.checkInDate, booking.checkOutDate);

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={handleGoBack}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
            <div className="flex items-center mt-1 space-x-4">
              <p className="text-sm text-gray-600">#{booking.bookingReference}</p>
              <button
                onClick={handleCopyBookingId}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={state.loading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${state.loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handlePrintBooking}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
        </div>
      </div>

      {/* Status & Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Booking Status</p>
              {getStatusBadge(booking.status)}
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Payment Status</p>
              {getPaymentStatusBadge(booking.paymentStatus)}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {booking.status === 'PENDING' && (
              <>
                <button
                  onClick={handleConfirmBooking}
                  disabled={state.updating}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Confirm
                </button>
                <button
                  onClick={handleCancelBooking}
                  disabled={state.updating}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              </>
            )}
            
            {booking.status === 'CONFIRMED' && (
              <button
                onClick={handleCompleteBooking}
                disabled={state.updating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
              >
                <Check className="h-4 w-4 mr-2" />
                Complete
              </button>
            )}
            
            <button
              onClick={handleSendEmail}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </button>
            
            <button
              onClick={handleCallGuest}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Guest
            </button>
            
            <button
              onClick={handleDeleteBooking}
              disabled={state.updating}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
            >
              <X className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Guest Information */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <button
                onClick={() => setShowGuestDetails(!showGuestDetails)}
                className="w-full flex items-center justify-between text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Guest Information
                </h3>
                {showGuestDetails ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>
            
            {showGuestDetails && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{booking.guestName}</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        <a href={`mailto:${booking.guestEmail}`} className="hover:text-blue-600">
                          {booking.guestEmail}
                        </a>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        <a href={`tel:${booking.guestPhone}`} className="hover:text-blue-600">
                          {booking.guestPhone}
                        </a>
                      </div>
                      {booking.userName && (
                        <div className="flex items-center text-gray-600">
                          <User className="h-4 w-4 mr-2" />
                          <span>Account: {booking.userName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={handleViewGuest}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Hotel Information */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <button
                onClick={() => setShowHotelDetails(!showHotelDetails)}
                className="w-full flex items-center justify-between text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Hotel & Room Information
                </h3>
                {showHotelDetails ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>
            
            {showHotelDetails && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{booking.hotelName}</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{booking.hotelAddress}</span>
                      </div>
                      {booking.hotelPhone && (
                        <div className="flex items-center text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          <span>{booking.hotelPhone}</span>
                        </div>
                      )}
                      {booking.hotelEmail && (
                        <div className="flex items-center text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          <span>{booking.hotelEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Room Type</h4>
                    <div className="space-y-2">
                      <p className="text-gray-900">{booking.roomTypeName}</p>
                      {booking.roomDescription && (
                        <p className="text-gray-600 text-sm">{booking.roomDescription}</p>
                      )}
                      {booking.bedType && (
                        <p className="text-gray-600 text-sm">Bed Type: {booking.bedType}</p>
                      )}
                      <p className="text-gray-600 text-sm">Max Occupancy: {booking.maxOccupancy}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleViewHotel}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Hotel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Booking Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Booking Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Check-in Date</p>
                <p className="font-medium text-gray-900">{formatDateOnly(booking.checkInDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Check-out Date</p>
                <p className="font-medium text-gray-900">{formatDateOnly(booking.checkOutDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Nights</p>
                <p className="font-medium text-gray-900">{nights} nights</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Guests</p>
                <p className="font-medium text-gray-900">{booking.guests} guests</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Booking Date</p>
                <p className="font-medium text-gray-900">{formatDate(booking.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                <p className="font-medium text-gray-900">{formatDate(booking.updatedAt)}</p>
              </div>
            </div>

            {booking.specialRequests && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Special Requests</p>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{booking.specialRequests}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <button
                onClick={() => setShowPaymentDetails(!showPaymentDetails)}
                className="w-full flex items-center justify-between text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Payment Details
                </h3>
                {showPaymentDetails ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Room Rate ({nights} nights)</span>
                  <span className="font-medium">{formatCurrency(booking.pricePerNight * nights)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Rate per Night</span>
                  <span className="text-gray-900">{formatCurrency(booking.pricePerNight)}</span>
                </div>
                
                {showPaymentDetails && (
                  <>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                        <span className="text-xl font-bold text-gray-900">{formatCurrency(booking.totalAmount)}</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Payment Method</span>
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">{booking.paymentMethod || 'Not specified'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Payment Status</span>
                        {getPaymentStatusBadge(booking.paymentStatus)}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleSendEmail}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Guest
              </button>
              
              <button
                onClick={handleCallGuest}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Guest
              </button>
              
              <button
                onClick={handleViewHotel}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <Building className="h-4 w-4 mr-2" />
                View Hotel Details
              </button>
              
              {booking.paymentStatus === 'PENDING' && (
                <button
                  onClick={handleConfirmPayment}
                  disabled={state.updating}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  {state.updating ? 'Confirming...' : 'Confirm Payment'}
                </button>
              )}
            </div>
          </div>

          {/* Booking Timeline */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Booking Created</p>
                  <p className="text-xs text-gray-500">{formatDate(booking.createdAt)}</p>
                  {booking.createdBy && (
                    <p className="text-xs text-gray-500">By: {booking.createdBy}</p>
                  )}
                </div>
              </div>
              
              {booking.updatedAt !== booking.createdAt && (
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-xs text-gray-500">{formatDate(booking.updatedAt)}</p>
                    {booking.updatedBy && (
                      <p className="text-xs text-gray-500">By: {booking.updatedBy}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBookingDetail;

