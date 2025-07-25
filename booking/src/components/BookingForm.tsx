import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import type { BookingCreateRequest } from '../services/api';
// import { useAuth } from '../hooks/useAuth'; // Comment out for now - will be implemented

interface BookingFormProps {
  roomType: any;
  hotel: any;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  totalAmount: number;
  onSuccess?: (bookingId: string) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ 
  roomType, 
  hotel, 
  checkInDate, 
  checkOutDate, 
  guests,
  totalAmount,
  onSuccess 
}) => {
  const navigate = useNavigate();
  // const { user, isAuthenticated, loginRequired } = useAuth(); // Comment out for now
  
  // Temporary mock auth state - replace with real auth later
  const user = { name: 'John Doe', email: 'john@example.com', tel: '+1234567890' };
  const isAuthenticated = true;
  const loginRequired = (message: string) => console.log(message);
  
  const [formData, setFormData] = useState<BookingCreateRequest>({
    hotelId: hotel.id,
    roomTypeId: roomType.id,
    // Guest info removed - using authenticated user
    checkInDate,
    checkOutDate,
    guests,
    totalAmount,
    paymentMethod: 'VNPAY',
    specialRequests: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      // Store current booking data to resume after login
      const bookingData = { 
        ...formData, 
        roomType, 
        hotel, 
        checkInDate, 
        checkOutDate, 
        guests, 
        totalAmount 
      };
      sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));
      
      // Redirect to login
      loginRequired('You need to login to make a booking');
      return;
    }
  }, [isAuthenticated, formData, roomType, hotel, checkInDate, checkOutDate, guests, totalAmount, loginRequired]);

  // Check availability
  useEffect(() => {
    checkAvailability();
  }, [roomType.id, checkInDate, checkOutDate]);

  const checkAvailability = async () => {
    try {
      const response = await bookingAPI.checkRoomAvailability(roomType.id, checkInDate, checkOutDate);
      setIsAvailable(response.data.result);
    } catch (error) {
      console.error('Error checking availability:', error);
      setIsAvailable(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!user?.name) {
      newErrors.user = 'Please complete your profile with name information';
    }
    
    if (!user?.email) {
      newErrors.user = 'Please complete your profile with email information';
    }

    if (guests > roomType.maxOccupancy) {
      newErrors.guests = `Maximum occupancy is ${roomType.maxOccupancy} guests`;
    }

    if (guests <= 0) {
      newErrors.guests = 'Number of guests must be at least 1';
    }

    const today = new Date();
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
    if (checkIn < today) {
      newErrors.dates = 'Check-in date cannot be in the past';
    }
    
    if (checkOut <= checkIn) {
      newErrors.dates = 'Check-out date must be after check-in date';
    }

    const daysDiff = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 30) {
      newErrors.dates = 'Stay duration cannot exceed 30 days';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      loginRequired('Please login to complete your booking');
      return;
    }
    
    if (!validateForm()) return;
    
    if (!isAvailable) {
      alert('Room is not available for the selected dates');
      return;
    }

    setLoading(true);
    try {
      const response = await bookingAPI.createBooking(formData);
      const bookingId = response.data.result.id;
      
      sessionStorage.removeItem('pendingBooking');
      
      alert('Booking created successfully!');
      
      if (onSuccess) {
        onSuccess(bookingId);
      } else {
        navigate(`/bookings/confirmation/${bookingId}`);
      }
    } catch (error: any) {
      console.error('Error creating booking:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create booking';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Login Required</h3>
        <p className="text-yellow-700 mb-4">You need to login to make a booking</p>
        <button 
          onClick={() => loginRequired('Please login to make a booking')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Login to Continue
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Complete Your Booking</h2>
      
      {errors.user && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {errors.user}
        </div>
      )}

      {!isAvailable && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          Room is not available for the selected dates
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-semibold text-gray-700 mb-3">Guest Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Guest Name</label>
              <input 
                type="text" 
                value={user?.name || ''} 
                disabled 
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input 
                type="email" 
                value={user?.email || ''} 
                disabled 
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone (Optional)</label>
              <input 
                type="tel" 
                value={user?.tel || 'Not provided'} 
                disabled 
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500"
              />
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Booking Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>Check-in: <span className="font-medium">{checkInDate}</span></div>
            <div>Check-out: <span className="font-medium">{checkOutDate}</span></div>
            <div>Guests: <span className="font-medium">{guests}</span></div>
            <div>Total: <span className="font-medium">${totalAmount}</span></div>
          </div>
          {errors.guests && <p className="text-red-500 text-sm mt-2">{errors.guests}</p>}
          {errors.dates && <p className="text-red-500 text-sm mt-2">{errors.dates}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <div className="border-2 border-blue-500 bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="font-semibold text-blue-800">VNPay Digital Wallet</div>
                <div className="text-blue-700 text-sm mt-1">
                  Secure payment through VNPay - Fast, safe and reliable
                </div>
              </div>
              <div className="text-blue-600">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          <input 
            type="hidden" 
            value="VNPAY" 
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Requests (Optional)
          </label>
          <textarea
            value={formData.specialRequests}
            onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={3}
            placeholder="Any special requests or notes..."
            maxLength={1000}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !isAvailable}
          className={`w-full py-3 px-4 rounded-md font-medium text-white ${
            loading || !isAvailable
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Creating Booking...' : 'Confirm Booking'}
        </button>
      </form>
    </div>
  );
};

export default BookingForm; 