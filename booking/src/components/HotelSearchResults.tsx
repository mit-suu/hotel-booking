import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Wifi, Car, Coffee, Waves, Users, BedDouble, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { HotelSearchResult, RoomSearchResult } from '../types/hotel';

interface HotelSearchResultsProps {
  results: HotelSearchResult[];
  loading?: boolean;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  rooms?: number;
}

const HotelSearchResults: React.FC<HotelSearchResultsProps> = ({
  results,
  loading = false,
  checkIn,
  checkOut,
  guests = 1,
  rooms = 1
}) => {
  const navigate = useNavigate();
  const [expandedHotels, setExpandedHotels] = useState<Set<string>>(new Set());

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const toggleHotelExpansion = (hotelId: string) => {
    const newExpanded = new Set(expandedHotels);
    if (newExpanded.has(hotelId)) {
      newExpanded.delete(hotelId);
    } else {
      newExpanded.add(hotelId);
    }
    setExpandedHotels(newExpanded);
  };

  const handleBookRoom = (hotelId: string, roomTypeId: string) => {
    const bookingParams = new URLSearchParams({
      hotelId,
      roomTypeId,
      checkIn: checkIn || '',
      checkOut: checkOut || '',
      guests: guests.toString(),
      rooms: rooms.toString()
    });
    
    navigate(`/booking?${bookingParams.toString()}`);
  };

  const handleViewHotel = (hotelId: string) => {
    navigate(`/hotels/${hotelId}`);
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
      case 'free wifi':
        return <Wifi size={16} />;
      case 'parking':
        return <Car size={16} />;
      case 'restaurant':
        return <Coffee size={16} />;
      case 'swimming pool':
        return <Waves size={16} />;
      default:
        return null;
    }
  };

  const renderRoomCard = (roomResult: RoomSearchResult, hotelId: string) => {
    const { roomType, availableRooms, pricePerNight, totalPrice, isAvailable } = roomResult;
    const nights = calculateNights();

    return (
      <div key={roomType.id} className="border rounded-lg p-4 bg-gray-50">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{roomType.name}</h4>
            <p className="text-sm text-gray-600 mt-1">{roomType.description}</p>
            
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center">
                <Users size={14} className="mr-1" />
                {roomType.capacity} guests
              </div>
              <div className="flex items-center">
                <BedDouble size={14} className="mr-1" />
                {roomType.bedType}
              </div>
              <span>{roomType.size}</span>
            </div>

            <div className="mt-2">
              <div className="text-xs text-gray-600 mb-1">Room amenities:</div>
              <div className="flex flex-wrap gap-1">
                {roomType.amenities.map((amenity, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-200">
                    {getAmenityIcon(amenity)}
                    <span className="ml-1">{amenity}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="text-right ml-4">
            <div className="text-lg font-bold text-blue-600">
              {formatCurrency(pricePerNight)}
            </div>
            <div className="text-sm text-gray-500">
              /night
            </div>
            {nights > 1 && (
              <div className="text-sm text-gray-600 mt-1">
                Total {nights} nights: <span className="font-semibold">{formatCurrency(totalPrice)}</span>
              </div>
            )}
            
            <div className="mt-2">
              {isAvailable ? (
                <div>
                  <div className="text-sm text-green-600 mb-2">
                    {availableRooms} rooms available
                  </div>
                  <button
                    onClick={() => handleBookRoom(hotelId, roomType.id)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Book now
                  </button>
                </div>
              ) : (
                <div className="text-sm text-red-600">
                  No rooms available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="flex space-x-4">
              <div className="w-48 h-32 bg-gray-300 rounded-lg"></div>
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-400 mb-4">
          <BedDouble size={48} className="mx-auto" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          No hotels found
        </h3>
        <p className="text-gray-600">
          Try changing the date or search criteria
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Summary */}
      {(checkIn || checkOut) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              {checkIn && checkOut && (
                <div className="flex items-center">
                  <Calendar size={16} className="mr-1 text-blue-600" />
                  <span>{formatDate(checkIn)} - {formatDate(checkOut)}</span>
                  <span className="ml-1 text-gray-600">({calculateNights()} nights)</span>
                </div>
              )}
              <div className="flex items-center">
                <Users size={16} className="mr-1 text-blue-600" />
                <span>{guests} guests, {rooms} rooms</span>
              </div>
            </div>
            <div className="text-blue-700 font-medium">
              {results.length} hotels found
            </div>
          </div>
        </div>
      )}

      {/* Hotel Results */}
      {results.map((result) => {
        const { hotel, availableRoomTypes, minPrice, maxPrice } = result;
        const isExpanded = expandedHotels.has(hotel.id);
        const hasAvailableRooms = availableRoomTypes.some(rt => rt.isAvailable);

        return (
          <div key={hotel.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex space-x-6">
                {/* Hotel Image */}
                <div className="flex-shrink-0">
                  <img
                    src={hotel.images[0]}
                    alt={hotel.name}
                    className="w-48 h-32 object-cover rounded-lg"
                  />
                </div>

                {/* Hotel Info */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {hotel.name}
                      </h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin size={16} className="mr-1" />
                        <span className="text-sm">{hotel.address}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Star size={16} className="text-yellow-400 fill-current mr-1" />
                          <span className="font-medium">{hotel.rating}</span>
                          <span className="text-gray-500 ml-1">({hotel.reviewCount} reviews)</span>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {hotel.type}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">
                        From
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(minPrice)}
                      </div>
                      <div className="text-sm text-gray-500">
                        /night
                      </div>
                      {maxPrice > minPrice && (
                        <div className="text-xs text-gray-400 mt-1">
                          To {formatCurrency(maxPrice)}
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {hotel.description}
                  </p>

                  {/* Hotel Amenities */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-600 mb-1">Hotel amenities:</div>
                    <div className="flex flex-wrap gap-2">
                      {hotel.amenities.map((amenity, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200">
                          {getAmenityIcon(amenity)}
                          <span className="ml-1">{amenity}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleViewHotel(hotel.id)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        View details
                      </button>
                      
                      {availableRoomTypes.length > 1 && (
                        <button
                          onClick={() => toggleHotelExpansion(hotel.id)}
                          className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          {isExpanded ? (
                            <>
                              Hide rooms <ChevronUp size={16} className="ml-1" />
                            </>
                          ) : (
                            <>
                              View {availableRoomTypes.length} room types <ChevronDown size={16} className="ml-1" />
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {hasAvailableRooms && availableRoomTypes.length === 1 && (
                      <button
                        onClick={() => handleBookRoom(hotel.id, availableRoomTypes[0].roomType.id)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Book now
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Room Types - Always show first room, expand to show others */}
              {availableRoomTypes.length > 0 && (
                <div className="mt-6 border-t pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Available room types
                  </h4>
                  
                  <div className="space-y-4">
                    {/* Always show first room */}
                    {renderRoomCard(availableRoomTypes[0], hotel.id)}
                    
                    {/* Show additional rooms when expanded */}
                    {isExpanded && availableRoomTypes.slice(1).map(roomResult => 
                      renderRoomCard(roomResult, hotel.id)
                    )}
                  </div>
                </div>
              )}

              {/* No available rooms message */}
              {!hasAvailableRooms && (
                <div className="mt-6 border-t pt-6">
                  <div className="text-center py-4 text-gray-500">
                    <BedDouble size={24} className="mx-auto mb-2 text-gray-400" />
                    <p>No rooms available for the selected date</p>
                    <button
                      onClick={() => handleViewHotel(hotel.id)}
                      className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      View hotel details
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HotelSearchResults; 