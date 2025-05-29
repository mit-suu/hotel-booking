import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, MapPin, Users, Coffee, Wifi, School as Pool, ParkingMeter as Parking, ListRestart as Restaurant, Calendar } from 'lucide-react';
import DatePicker from '../components/DatePicker';

const HotelDetailPage: React.FC = () => {
  const { id } = useParams();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [guests, setGuests] = useState(2);

  // Mock data - replace with API call
  const hotel = {
    id: '1',
    name: 'Grand Hotel',
    location: 'London',
    rating: 4.8,
    price: 299,
    description: 'Experience luxury and comfort in the heart of the city. Our hotel offers premium amenities and exceptional service.',
    images: [
      'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg',
      'https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg',
      'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg',
      'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg'
    ],
    amenities: [
      { name: 'Free Breakfast', icon: Coffee },
      { name: 'Free WiFi', icon: Wifi },
      { name: 'Swimming Pool', icon: Pool },
      { name: 'Parking', icon: Parking },
      { name: 'Restaurant', icon: Restaurant }
    ],
    rooms: [
      {
        id: '1',
        type: 'Deluxe Room',
        price: 299,
        capacity: 2,
        description: 'Spacious room with city view',
        amenities: ['King bed', 'En-suite bathroom', 'Mini bar']
      },
      {
        id: '2',
        type: 'Executive Suite',
        price: 499,
        capacity: 3,
        description: 'Luxury suite with separate living area',
        amenities: ['King bed', 'Living room', 'Jacuzzi', 'Mini bar']
      }
    ]
  };

  const handleBooking = (roomId: string) => {
    // Implement booking logic
    console.log('Booking room:', roomId);
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Image Gallery */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
        {hotel.images.map((image, index) => (
          <div key={index} className={index === 0 ? "col-span-2 row-span-2" : ""}>
            <img
              src={image}
              alt={`${hotel.name} - ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Hotel Details */}
          <div className="lg:w-2/3">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{hotel.name}</h1>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-1" />
                  <span>{hotel.location}</span>
                </div>
              </div>
              <div className="flex items-center bg-blue-100 px-3 py-1 rounded-full">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="ml-1 font-semibold">{hotel.rating}</span>
              </div>
            </div>

            <p className="text-gray-600 mb-6">{hotel.description}</p>

            {/* Amenities */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {hotel.amenities.map((amenity, index) => {
                  const Icon = amenity.icon;
                  return (
                    <div key={index} className="flex items-center">
                      <Icon className="h-5 w-5 text-blue-500 mr-2" />
                      <span>{amenity.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Available Rooms */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Available Rooms</h2>
              <div className="space-y-4">
                {hotel.rooms.map((room) => (
                  <div key={room.id} className="border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{room.type}</h3>
                        <p className="text-gray-600">{room.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          ${room.price}
                        </div>
                        <div className="text-sm text-gray-500">per night</div>
                      </div>
                    </div>

                    <div className="flex items-center mb-4">
                      <Users className="h-5 w-5 text-gray-400 mr-2" />
                      <span>Up to {room.capacity} guests</span>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Room Amenities:</h4>
                      <ul className="grid grid-cols-2 gap-2">
                        {room.amenities.map((amenity, index) => (
                          <li key={index} className="flex items-center text-gray-600">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            {amenity}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleBooking(room.id)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Book Your Stay</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in / Check-out
                  </label>
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="w-full flex items-center justify-between px-4 py-2 border rounded-lg"
                  >
                    <span className="text-gray-500">Select dates</span>
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </button>
                  {showDatePicker && (
                    <div className="absolute z-10 mt-1">
                      <DatePicker onClose={() => setShowDatePicker(false)} />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    {[1, 2, 3, 4].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'guest' : 'guests'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between mb-2">
                    <span>$299 x 3 nights</span>
                    <span>$897</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Service fee</span>
                    <span>$50</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>$947</span>
                  </div>
                </div>

                <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  Reserve Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetailPage;
