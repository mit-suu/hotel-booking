import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, DollarSign, Clock, ArrowLeft, Phone, Mail, Download, Edit, X } from 'lucide-react';
import { bookingAPI, BookingResponse } from '../services/api';
import BookingStatusBadge, { PaymentStatusBadge } from '../components/booking/BookingStatusBadge';

const BookingDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBooking();
    }
  }, [id]);

  const fetchBooking = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await bookingAPI.getMyBookingById(id);
      setBooking(response.data.result);
    } catch (error: any) {
      console.error('Error fetching booking:', error);
      setError(error.response?.data?.message || 'Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking || !id) return;
    
    const reason = prompt('Please provide a reason for cancellation (optional):');
    if (reason === null) return; // User clicked cancel
    
    setCancelling(true);
    try {
      await bookingAPI.cancelMyBooking(id, reason);
      await fetchBooking(); // Refresh booking data
      alert('Booking cancelled successfully');
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      alert(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no_show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading booking details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate('/bookings')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Bookings
          </button>
          <div className="text-center py-12">
            <div className="text-red-500 text-lg font-semibold mb-2">
              {error || 'Booking not found'}
            </div>
            <button
              onClick={() => navigate('/bookings')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  const canCancel = booking.status === 'PENDING' || booking.status === 'CONFIRMED';

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/bookings')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Bookings
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Details</h1>
                <p className="text-gray-600">Booking #{booking.bookingReference}</p>
              </div>
              <div className="text-right">
                <BookingStatusBadge status={booking.status as any} />
                <div className="mt-2">
                  <PaymentStatusBadge status={booking.paymentStatus as any} />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <img
                src="https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg"
                alt={booking.hotelName}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">{booking.hotelName}</h2>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{booking.hotelAddress}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-2" />
                    <span>{booking.guests} Guests</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>{formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>{booking.numberOfNights} Night{booking.numberOfNights > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Hotel Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-5 w-5 mr-2" />
                    <span>{booking.hotelPhone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-5 w-5 mr-2" />
                    <span>{booking.hotelEmail || 'N/A'}</span>
                  </div>
                </div>

                <h3 className="font-semibold mb-3 mt-6">Guest Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-2" />
                    <span>{booking.guestName}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-5 w-5 mr-2" />
                    <span>{booking.guestEmail}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-5 w-5 mr-2" />
                    <span>{booking.guestPhone}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Room Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-600">Room Type</p>
                  <p className="font-medium">{booking.roomTypeName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Room Description</p>
                  <p className="text-sm text-gray-600">{booking.roomDescription}</p>
                </div>
                <div>
                  <p className="text-gray-600">Max Occupancy</p>
                  <p className="font-medium">{booking.maxOccupancy} guests</p>
                </div>
                <div>
                  <p className="text-gray-600">Bed Type</p>
                  <p className="font-medium">{booking.bedType}</p>
                </div>
              </div>

              {booking.specialRequests && (
                <div className="mb-6">
                  <p className="text-gray-600 mb-2">Special Requests</p>
                  <p className="text-sm bg-gray-100 p-3 rounded-lg">{booking.specialRequests}</p>
                </div>
              )}

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Payment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Payment Method</p>
                    <p className="font-medium">{booking.paymentMethod || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Status</p>
                    <p className="font-medium">{booking.paymentStatus}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Price per Night</p>
                    <p className="font-medium">${booking.pricePerNight}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Amount</p>
                    <p className="font-medium text-xl text-blue-600">${booking.totalAmount}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <p>Created: {formatDate(booking.createdAt)}</p>
                  <p>Last Updated: {formatDate(booking.updatedAt)}</p>
                </div>
                <div className="flex space-x-4">
                  {canCancel && (
                    <button
                      onClick={handleCancelBooking}
                      disabled={cancelling}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {cancelling ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          Cancel Booking
                        </>
                      )}
                    </button>
                  )}
                  <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Download className="h-5 w-5 mr-2" />
                    Download Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;
