import React, { useState } from 'react';
import { Calendar, Users, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BookingQuickStartProps {
  hotelId: string;
  roomTypeId: string;
  hotelName: string;
  roomTypeName: string;
  onClose: () => void;
  isOpen: boolean;
}

const BookingQuickStart: React.FC<BookingQuickStartProps> = ({
  hotelId,
  roomTypeId,
  hotelName,
  roomTypeName,
  onClose,
  isOpen
}) => {
  const navigate = useNavigate();
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(2);

  // Get tomorrow and day after tomorrow as default dates
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  React.useEffect(() => {
    if (isOpen) {
      setCheckInDate(tomorrow.toISOString().split('T')[0]);
      setCheckOutDate(dayAfterTomorrow.toISOString().split('T')[0]);
    }
  }, [isOpen]);

  const handleContinue = () => {
    if (!checkInDate || !checkOutDate) {
      alert('Please select both check-in and check-out dates');
      return;
    }

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      alert('Check-out date must be after check-in date');
      return;
    }

    const bookingParams = new URLSearchParams({
      hotelId,
      roomTypeId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: guests.toString()
    });

    navigate(`/booking?${bookingParams.toString()}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Quick Booking</h3>
              <p className="text-sm text-gray-600 mt-1">
                {hotelName} - {roomTypeName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Date Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Check-in Date
              </label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                min={tomorrow.toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Check-out Date
              </label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                min={checkInDate || tomorrow.toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="h-4 w-4 inline mr-1" />
                Number of Guests
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>
                    {num} Guest{num !== 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleContinue}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>

          {/* Quick Info */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Tip:</strong> You can modify these details on the next page if needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingQuickStart; 