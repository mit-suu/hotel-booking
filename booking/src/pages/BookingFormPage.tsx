import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import EnhancedBookingForm from '../components/EnhancedBookingForm';
import { hotelAPI, roomTypeAPI, HotelResponse, RoomTypeResponse } from '../services/api';

const BookingFormPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [hotel, setHotel] = useState<HotelResponse | null>(null);
  const [roomType, setRoomType] = useState<RoomTypeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get search params from URL
  const searchParams = new URLSearchParams(location.search);
  const hotelId = searchParams.get('hotelId');
  const roomTypeId = searchParams.get('roomTypeId');
  const checkInDate = searchParams.get('checkIn') || '';
  const checkOutDate = searchParams.get('checkOut') || '';
  const guests = parseInt(searchParams.get('guests') || '1');

  useEffect(() => {
    if (hotelId && roomTypeId) {
      fetchData();
    }
  }, [hotelId, roomTypeId]);

  const fetchData = async () => {
    if (!hotelId || !roomTypeId) return;
    
    setLoading(true);
    try {
      const [hotelResponse, roomTypeResponse] = await Promise.all([
        hotelAPI.getHotelDetails(hotelId),
        roomTypeAPI.getRoomTypeById(roomTypeId)
      ]);

      setHotel(hotelResponse.data.result);
      setRoomType(roomTypeResponse.data.result);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError('Failed to load booking information');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSuccess = (bookingId: string) => {
    navigate(`/bookings/confirmation/${bookingId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading booking form...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !hotel || !roomType) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back
          </button>
          <div className="text-center py-12">
            <div className="text-red-500 text-lg font-semibold mb-2">
              {error || 'Hotel or room type not found'}
            </div>
            <button
              onClick={() => navigate('/hotels')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Hotels
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!hotelId || !roomTypeId) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back
          </button>
          <div className="text-center py-12">
            <div className="text-orange-500 text-lg font-semibold mb-2">
              Missing Booking Information
            </div>
            <p className="text-gray-600 mb-4">
              Hotel and room information are required to proceed with booking.
            </p>
            <button
              onClick={() => navigate('/hotels')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Hotels
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!checkInDate || !checkOutDate) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back
          </button>
          <div className="text-center py-12">
            <div className="text-orange-500 text-lg font-semibold mb-2">
              Missing Booking Information
            </div>
            <p className="text-gray-600 mb-4">
              Please select check-in and check-out dates to proceed with booking.
            </p>
            <button
              onClick={() => navigate(`/hotels/${hotelId}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Hotel Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Hotel
        </button>

        <EnhancedBookingForm
          hotel={hotel}
          roomType={roomType}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          guests={guests}
          onSuccess={handleBookingSuccess}
        />
      </div>
    </div>
  );
};

export default BookingFormPage; 