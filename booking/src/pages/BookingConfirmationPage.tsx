import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, Calendar, Users, MapPin, Phone, Mail, 
  CreditCard, MessageSquare, Download, ArrowLeft 
} from 'lucide-react';
import { bookingAPI, BookingResponse } from '../services/api';

const BookingConfirmationPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setError('Booking ID not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await bookingAPI.getMyBookingById(bookingId);
        if (response.data.success) {
          setBooking(response.data.result);
        } else {
          setError('Unable to load booking details');
        }
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('Failed to load booking information');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'text-green-600 bg-green-100';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'CANCELLED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPaymentMethodDisplay = (method?: string) => {
    switch (method) {
      case 'VNPAY': return 'VNPay';
      case 'CASH_ON_CHECKIN': return 'Thanh toán khi đặt phòng';
      default: return 'Thanh toán khi đặt phòng';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl font-semibold mb-4">
            {error || 'Booking not found'}
          </div>
          <Link
            to="/hotels"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Hotels
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Đặt phòng thành công!
          </h1>
          <p className="text-lg text-gray-600">
            Cảm ơn bạn đã đặt phòng. Chi tiết booking của bạn như sau:
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          {/* Header */}
          <div className="bg-blue-50 px-6 py-4 border-b">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Booking Reference: {booking.bookingReference}
                </h2>
                <p className="text-sm text-gray-600">
                  Booked on {new Date(booking.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Hotel Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  Hotel Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="font-medium text-gray-900">{booking.hotelName}</div>
                    <div className="text-gray-600">{booking.hotelAddress}</div>
                  </div>
                  {booking.hotelPhone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {booking.hotelPhone}
                    </div>
                  )}
                  {booking.hotelEmail && (
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {booking.hotelEmail}
                    </div>
                  )}
                </div>
              </div>

              {/* Room Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Room Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="font-medium text-gray-900">{booking.roomTypeName}</div>
                    {booking.roomDescription && (
                      <div className="text-gray-600">{booking.roomDescription}</div>
                    )}
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">Bed Type:</span> {booking.bedType}
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">Max Occupancy:</span> {booking.maxOccupancy} guests
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  Booking Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Check-in:</span>
                    <div className="text-gray-900">{formatDate(booking.checkInDate)}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Check-out:</span>
                    <div className="text-gray-900">{formatDate(booking.checkOutDate)}</div>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-gray-600">{booking.guests} guests</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Duration:</span>
                    <span className="text-gray-900 ml-2">{booking.numberOfNights} nights</span>
                  </div>
                </div>
              </div>

              {/* Guest Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Guest Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Name:</span>
                    <div className="text-gray-900">{booking.guestName}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <div className="text-gray-900">{booking.guestEmail}</div>
                  </div>
                  {booking.guestPhone && (
                    <div>
                      <span className="font-medium text-gray-700">Phone:</span>
                      <div className="text-gray-900">{booking.guestPhone}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Special Requests */}
            {booking.specialRequests && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                  Special Requests
                </h3>
                <p className="text-gray-700">{booking.specialRequests}</p>
              </div>
            )}

            {/* Payment Summary */}
            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                Payment Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Room rate per night:</span>
                  <span className="font-medium">{formatCurrency(booking.pricePerNight)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Number of nights:</span>
                  <span className="font-medium">{booking.numberOfNights}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total Amount:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(booking.totalAmount)}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Payment Method:</span>
                    <span className="text-gray-900">{getPaymentMethodDisplay(booking.paymentMethod)}</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="font-medium text-gray-700">Payment Status:</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      booking.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                      booking.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Important Information:</h4>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• Please bring a valid ID for check-in</li>
                <li>• Check-in time is typically 3:00 PM, check-out at 11:00 AM</li>
                {booking.paymentMethod === 'CASH_ON_CHECKIN' && (
                  <li>• Please prepare exact cash amount for payment at the hotel</li>
                )}
                <li>• Contact the hotel directly for any special arrangements</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/bookings/my"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View My Bookings
          </Link>
          <Link
            to="/hotels"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Hotels
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Print Confirmation
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage; 