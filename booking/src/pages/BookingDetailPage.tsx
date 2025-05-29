import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, DollarSign, Clock, ArrowLeft, Phone, Mail, Download } from 'lucide-react';

const BookingDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data for the booking
  const booking = {
    id: '1',
    hotelName: 'Grand Hotel',
    location: 'London',
    checkIn: '2024-03-15',
    checkOut: '2024-03-18',
    status: 'completed',
    totalAmount: 897,
    roomType: 'Deluxe Room',
    guests: 2,
    image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg',
    bookingNumber: 'BK123456789',
    contactInfo: {
      phone: '+1 234 567 890',
      email: 'info@grandhotel.com',
      address: '123 Hotel Street, London, UK'
    },
    paymentInfo: {
      method: 'Credit Card',
      cardNumber: '**** **** **** 1234',
      paidAt: '2024-02-15'
    },
    amenities: ['Free WiFi', 'Breakfast Included', 'Swimming Pool', 'Gym Access']
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
                <p className="text-gray-600">Booking #{booking.bookingNumber}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(booking.status)}`}>
                {booking.status}
              </span>
            </div>

            <div className="mb-8">
              <img
                src={booking.image}
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
                    <span>{booking.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-2" />
                    <span>{booking.guests} Guests</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>{booking.checkIn} - {booking.checkOut}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-5 w-5 mr-2" />
                    <span>{booking.contactInfo.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-5 w-5 mr-2" />
                    <span>{booking.contactInfo.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{booking.contactInfo.address}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Room Details</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-600">Room Type</p>
                  <p className="font-medium">{booking.roomType}</p>
                </div>
                <div>
                  <p className="text-gray-600">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {booking.amenities.map((amenity, index) => (
                      <span key={index} className="bg-gray-100 px-2 py-1 rounded-full text-sm">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Payment Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Payment Method</p>
                    <p className="font-medium">{booking.paymentInfo.method}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Card Number</p>
                    <p className="font-medium">{booking.paymentInfo.cardNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Date</p>
                    <p className="font-medium">{booking.paymentInfo.paidAt}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Amount</p>
                    <p className="font-medium text-xl text-blue-600">${booking.totalAmount}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Download className="h-5 w-5 mr-2" />
                Download Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;
