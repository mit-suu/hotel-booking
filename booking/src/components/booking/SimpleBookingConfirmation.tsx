import React from 'react';
import { 
  CheckCircle, Calendar, MapPin, Users, CreditCard, Download, Share2, 
  Phone, Mail, Clock, ArrowLeft
} from 'lucide-react';
import { BookingResponse } from '../../services/api';

interface SimpleBookingConfirmationProps {
  booking: BookingResponse;
  onBack?: () => void;
}

const SimpleBookingConfirmation: React.FC<SimpleBookingConfirmationProps> = ({
  booking,
  onBack
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <CheckCircle className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-xl text-green-100">
            Your reservation at {booking.hotelName} is confirmed
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
          )}
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </button>
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Download className="h-4 w-4 mr-2" />
            Download
          </button>
        </div>

        {/* Main Booking Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Hotel Header */}
          <div className="bg-blue-600 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-2">{booking.hotelName}</h2>
                <div className="flex items-center text-blue-100">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{booking.hotelAddress}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-blue-100 text-sm">Booking Reference</div>
                <div className="text-xl font-bold">{booking.bookingReference}</div>
              </div>
            </div>
          </div>

          {/* Check-in/out Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600 mb-1">Check-in</div>
                <div className="font-semibold">{formatDate(booking.checkInDate)}</div>
                <div className="text-xs text-gray-500 flex items-center justify-center mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  From 14:00
                </div>
              </div>
              <div>
                <Calendar className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600 mb-1">Check-out</div>
                <div className="font-semibold">{formatDate(booking.checkOutDate)}</div>
                <div className="text-xs text-gray-500 flex items-center justify-center mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  Before 12:00
                </div>
              </div>
              <div>
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600 mb-1">Guests</div>
                <div className="font-semibold">{booking.guests} Guest{booking.guests > 1 ? 's' : ''}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {booking.numberOfNights} night{booking.numberOfNights > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Room Details */}
              <div>
                <h3 className="font-semibold mb-4">Room Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room Type:</span>
                    <span className="font-medium">{booking.roomTypeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bed Type:</span>
                    <span className="font-medium">{booking.bedType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Occupancy:</span>
                    <span className="font-medium">{booking.maxOccupancy} guests</span>
                  </div>
                </div>
              </div>

              {/* Guest Information */}
              <div>
                <h3 className="font-semibold mb-4">Guest Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{booking.guestName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{booking.guestEmail}</span>
                  </div>
                  {booking.guestPhone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{booking.guestPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Special Requests */}
            {booking.specialRequests && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold mb-2">Special Requests</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{booking.specialRequests}</p>
              </div>
            )}

            {/* Payment Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-sm text-gray-600">Total Amount</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(booking.totalAmount)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatCurrency(booking.pricePerNight)} × {booking.numberOfNights} night{booking.numberOfNights > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-2">Status</div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.paymentStatus)}`}>
                    {booking.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 text-center">
          <h3 className="font-semibold text-blue-800 mb-4">Need Help?</h3>
          <div className="flex justify-center gap-4">
            <a
              href="tel:+84123456789"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Support
            </a>
            <a
              href="mailto:support@vietbooking.com"
              className="flex items-center px-4 py-2 bg-white border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleBookingConfirmation; 