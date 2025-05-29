import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, DollarSign, Clock } from 'lucide-react';

// Mock data for bookings
const bookings = [
  {
    id: '1',
    hotelName: 'Grand Hotel',
    location: 'London',
    checkIn: '2024-03-15',
    checkOut: '2024-03-18',
    status: 'completed',
    totalAmount: 897,
    roomType: 'Deluxe Room',
    guests: 2,
    image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg'
  },
  {
    id: '2',
    hotelName: 'Seaside Resort',
    location: 'Miami',
    checkIn: '2024-04-01',
    checkOut: '2024-04-05',
    status: 'upcoming',
    totalAmount: 1299,
    roomType: 'Ocean View Suite',
    guests: 3,
    image: 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg'
  },
  {
    id: '3',
    hotelName: 'Mountain Lodge',
    location: 'Swiss Alps',
    checkIn: '2024-02-10',
    checkOut: '2024-02-15',
    status: 'cancelled',
    totalAmount: 1599,
    roomType: 'Premium Suite',
    guests: 2,
    image: 'https://images.pexels.com/photos/261395/pexels-photo-261395.jpeg'
  },
];

const BookingHistoryPage: React.FC = () => {
  const navigate = useNavigate();

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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Booking History</h1>

        <div className="space-y-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/bookings/${booking.id}`)}
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/4">
                  <img
                    src={booking.image}
                    alt={booking.hotelName}
                    className="h-48 w-full object-cover"
                  />
                </div>
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">{booking.hotelName}</h2>
                      <div className="flex items-center text-gray-600 mb-4">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{booking.location}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm text-gray-600">Check-in</div>
                        <div className="font-medium">{booking.checkIn}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm text-gray-600">Check-out</div>
                        <div className="font-medium">{booking.checkOut}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm text-gray-600">Total Amount</div>
                        <div className="font-medium">${booking.totalAmount}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-4">{booking.roomType}</span>
                    <span>{booking.guests} Guests</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookingHistoryPage;
