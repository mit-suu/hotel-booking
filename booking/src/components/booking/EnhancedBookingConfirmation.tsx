import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, Calendar, MapPin, Users, CreditCard, Download, Share2, 
  Phone, Mail, Star, Clock, Printer, MessageSquare, ArrowLeft, 
  QrCode, Shield, AlertCircle, Gift
} from 'lucide-react';
import { BookingResponse } from '../../services/api';

interface EnhancedBookingConfirmationProps {
  booking: BookingResponse;
  onDownloadReceipt?: () => void;
  onPrintReceipt?: () => void;
}

const EnhancedBookingConfirmation: React.FC<EnhancedBookingConfirmationProps> = ({
  booking,
  onDownloadReceipt,
  onPrintReceipt
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

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

  const checkInTime = '14:00';
  const checkOutTime = '12:00';

  const handleShare = async () => {
    const shareData = {
      title: 'Booking Confirmation - VietBooking',
      text: `I've booked ${booking.hotelName} for ${booking.numberOfNights} nights!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        alert('Unable to copy link');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'PAID':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDaysUntilCheckIn = () => {
    const checkInDate = new Date(booking.checkInDate);
    const today = new Date();
    const diffTime = checkInDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilCheckIn = getDaysUntilCheckIn();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header with Animation */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-500 to-blue-600 text-white py-16">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="animate-bounce mb-6">
            <CheckCircle className="h-20 w-20 mx-auto text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Booking Confirmed!</h1>
          <p className="text-xl text-green-100 mb-2">
            Your reservation at {booking.hotelName} is all set
          </p>
          {daysUntilCheckIn > 0 && (
            <div className="inline-flex items-center bg-white bg-opacity-20 rounded-full px-6 py-2 mt-4">
              <Calendar className="h-5 w-5 mr-2" />
              <span className="font-semibold">
                {daysUntilCheckIn} days until your trip
              </span>
            </div>
          )}
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-10 -left-10 w-20 h-20 bg-white bg-opacity-10 rounded-full"></div>
          <div className="absolute top-20 right-20 w-16 h-16 bg-white bg-opacity-10 rounded-full"></div>
          <div className="absolute bottom-10 left-1/3 w-12 h-12 bg-white bg-opacity-10 rounded-full"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 -mt-8 relative">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <button
            onClick={() => navigate('/bookings')}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            My Bookings
          </button>
          <button
            onClick={handleShare}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Share2 className="h-4 w-4 mr-2" />
            {copied ? 'Copied!' : 'Share'}
          </button>
          <button
            onClick={onDownloadReceipt}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </button>
          <button
            onClick={onPrintReceipt}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
        </div>

        {/* Main Booking Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Booking Reference Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="mb-4 md:mb-0">
                <h2 className="text-2xl font-bold mb-2">{booking.hotelName}</h2>
                <div className="flex items-center text-blue-100 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{booking.hotelAddress}</span>
                </div>
                <div className="flex items-center text-blue-100">
                  <Star className="h-4 w-4 mr-1 fill-current" />
                  <span>4.5 Star Hotel</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-blue-100 text-sm mb-1">Booking Reference</div>
                <div className="text-2xl font-bold mb-2">{booking.bookingReference}</div>
                <div className="flex items-center justify-end">
                  <QrCode className="h-6 w-6 mr-2" />
                  <span className="text-sm">Scan for quick access</span>
                </div>
              </div>
            </div>
          </div>

          {/* Check-in/out Timeline */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Your Stay Timeline
            </h3>
            <div className="relative">
              <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-gradient-to-b from-green-500 to-red-500"></div>
              
              <div className="flex items-start mb-8">
                <div className="bg-green-500 text-white p-2 rounded-full mr-4">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-green-700">Check-in</div>
                  <div className="text-lg font-medium">{formatDate(booking.checkInDate)}</div>
                  <div className="text-sm text-gray-600 flex items-center mt-1">
                    <Clock className="h-4 w-4 mr-1" />
                    From {checkInTime} onwards
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Arrival in</div>
                  <div className="text-lg font-bold text-green-600">
                    {daysUntilCheckIn > 0 ? `${daysUntilCheckIn} days` : 'Today!'}
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-red-500 text-white p-2 rounded-full mr-4">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-red-700">Check-out</div>
                  <div className="text-lg font-medium">{formatDate(booking.checkOutDate)}</div>
                  <div className="text-sm text-gray-600 flex items-center mt-1">
                    <Clock className="h-4 w-4 mr-1" />
                    Before {checkOutTime}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Duration</div>
                  <div className="text-lg font-bold text-blue-600">
                    {booking.numberOfNights} night{booking.numberOfNights !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Room & Stay Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-600" />
                  Room & Stay Details
                </h3>
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="font-semibold text-purple-800 mb-2">{booking.roomTypeName}</div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Bed Type:</span>
                        <div className="font-medium">{booking.bedType}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Max Guests:</span>
                        <div className="font-medium">{booking.maxOccupancy}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Your Guests:</span>
                        <div className="font-medium">{booking.guests}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Room Size:</span>
                        <div className="font-medium">25m²</div>
                      </div>
                    </div>
                  </div>

                  {booking.specialRequests && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-start">
                        <MessageSquare className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                        <div>
                          <div className="font-medium text-blue-800 mb-1">Special Requests</div>
                          <div className="text-sm text-blue-700">{booking.specialRequests}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Guest & Contact Info */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  Guest Information
                </h3>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-green-600 mr-3" />
                        <div>
                          <div className="text-sm text-gray-600">Primary Guest</div>
                          <div className="font-medium">{booking.guestName}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-green-600 mr-3" />
                        <div>
                          <div className="text-sm text-gray-600">Email</div>
                          <div className="font-medium">{booking.guestEmail}</div>
                        </div>
                      </div>
                      {booking.guestPhone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-green-600 mr-3" />
                          <div>
                            <div className="text-sm text-gray-600">Phone</div>
                            <div className="font-medium">{booking.guestPhone}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                      <Shield className="h-3 w-3 inline mr-1" />
                      {booking.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.paymentStatus)}`}>
                      <CreditCard className="h-3 w-3 inline mr-1" />
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-green-600" />
            Payment Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-gray-600">
              <span>{formatCurrency(booking.pricePerNight)} × {booking.numberOfNights} night{booking.numberOfNights !== 1 ? 's' : ''}</span>
              <span className="font-medium">{formatCurrency(booking.totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span>Taxes & fees</span>
              <span className="font-medium text-green-600">Included</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span>Service charge</span>
              <span className="font-medium text-green-600">Free</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold">Total Paid</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(booking.totalAmount)}
                </span>
              </div>
              <div className="text-sm text-gray-500 text-right mt-1">
                Payment method: {booking.paymentMethod?.replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Important Reminders
            </h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• Please bring a valid ID for check-in</li>
              <li>• Contact the hotel directly for early check-in requests</li>
              <li>• Free cancellation until 24 hours before arrival</li>
              <li>• Room service available 24/7</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="font-semibold text-green-800 mb-3 flex items-center">
              <Gift className="h-5 w-5 mr-2" />
              What's Included
            </h3>
            <ul className="space-y-2 text-sm text-green-700">
              <li>• Free WiFi throughout the property</li>
              <li>• Complimentary breakfast buffet</li>
              <li>• Access to fitness center and pool</li>
              <li>• 24/7 front desk assistance</li>
            </ul>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <h3 className="font-semibold text-gray-800 mb-4">Need Help?</h3>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <a
              href="tel:+84123456789"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Support
            </a>
            <a
              href="mailto:support@vietbooking.com"
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email Us
            </a>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            We're here to help 24/7. Have a wonderful stay!
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedBookingConfirmation; 