import React from 'react';
import { Calendar, CreditCard, MapPin, Star, Users, Clock } from 'lucide-react';
import { HotelResponse, RoomTypeResponse } from '../../../services/api';

interface BookingReviewStepProps {
  hotel: HotelResponse;
  roomType: RoomTypeResponse;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  numberOfNights: number;
  totalAmount: number;
}

const BookingReviewStep: React.FC<BookingReviewStepProps> = ({
  hotel,
  roomType,
  checkInDate,
  checkOutDate,
  guests,
  numberOfNights,
  totalAmount
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const checkInTime = hotel.checkInTime || '14:00';
  const checkOutTime = hotel.checkOutTime || '12:00';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Booking</h2>
        <p className="text-gray-600">Please review your selection before proceeding.</p>
      </div>
      
      {/* Hotel & Room Summary */}
      <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-start space-x-6">
          <div className="relative">
            <img
              src={roomType.imageUrl || hotel.imageUrl || '/default-hotel.jpg'}
              alt={roomType.name}
              className="w-32 h-32 object-cover rounded-lg shadow-md"
            />
            <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {hotel.starRating}★
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{hotel.name}</h3>
            <div className="flex items-center text-gray-600 text-sm mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              {hotel.address}
            </div>
            <div className="flex items-center text-gray-600 text-sm mb-3">
              <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
              {hotel.starRating} Star Hotel
              {hotel.averageRating && (
                <span className="ml-2 text-xs">
                  ({hotel.averageRating}/5 from {hotel.totalReviews} reviews)
                </span>
              )}
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-200">
              <div className="text-blue-800 font-semibold text-lg">{roomType.name}</div>
              <div className="text-blue-600 text-sm mt-1">
                <Users className="h-4 w-4 inline mr-1" />
                Max {roomType.maxOccupancy} guests • {roomType.bedType}
                {roomType.roomSize && <span> • {roomType.roomSize}m²</span>}
              </div>
              {roomType.amenities && (
                                 <div className="text-xs text-gray-600 mt-2">
                   {roomType.amenities.split(',').slice(0, 3).map((amenity: string) => amenity.trim()).join(' • ')}
                   {roomType.amenities.split(',').length > 3 && '...'}
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Check-in/out Details */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Booking Details
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div>
                <div className="text-sm text-gray-600">Check-in</div>
                <div className="font-semibold text-gray-900">{formatDate(checkInDate)}</div>
                <div className="text-xs text-gray-500 flex items-center mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  From {checkInTime}
                </div>
              </div>
              <div className="text-green-600">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
              <div>
                <div className="text-sm text-gray-600">Check-out</div>
                <div className="font-semibold text-gray-900">{formatDate(checkOutDate)}</div>
                <div className="text-xs text-gray-500 flex items-center mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  Before {checkOutTime}
                </div>
              </div>
              <div className="text-red-600">
                <Calendar className="h-6 w-6" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{numberOfNights}</div>
                <div className="text-sm text-gray-600">Night{numberOfNights !== 1 ? 's' : ''}</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{guests}</div>
                <div className="text-sm text-gray-600">Guest{guests !== 1 ? 's' : ''}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-green-600" />
            Price Breakdown
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">
                {formatCurrency(roomType.pricePerNight)} × {numberOfNights} night{numberOfNights !== 1 ? 's' : ''}
              </span>
              <span className="font-medium">{formatCurrency(totalAmount)}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Taxes & fees:</span>
              <span className="font-medium text-green-600">Included</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Service charge:</span>
              <span className="font-medium text-green-600">Free</span>
            </div>
            
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1 text-right">
                Average: {formatCurrency(totalAmount / numberOfNights)}/night
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-xs text-yellow-800">
              <strong>Payment:</strong> You will be charged at the time of booking confirmation.
              Free cancellation available until 24 hours before check-in.
            </div>
          </div>
        </div>
      </div>

      {/* Hotel Amenities & Policies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hotel Amenities */}
        {hotel.amenities && (
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-3">Hotel Amenities</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
                             {hotel.amenities.split(',').slice(0, 8).map((amenity: string, index: number) => (
                 <div key={index} className="flex items-center text-gray-600">
                   <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                   {amenity.trim()}
                 </div>
               ))}
            </div>
            {hotel.amenities.split(',').length > 8 && (
              <div className="text-xs text-blue-600 mt-2">
                +{hotel.amenities.split(',').length - 8} more amenities
              </div>
            )}
          </div>
        )}

        {/* Policies */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-3">Important Policies</h4>
          <div className="space-y-3 text-sm">
            <div>
              <div className="font-medium text-gray-700">Check-in/out:</div>
              <div className="text-gray-600">
                Check-in: {checkInTime} | Check-out: {checkOutTime}
              </div>
            </div>
            
            {hotel.cancellationPolicy && (
              <div>
                <div className="font-medium text-gray-700">Cancellation:</div>
                <div className="text-gray-600">{hotel.cancellationPolicy}</div>
              </div>
            )}
            
            {hotel.petPolicy && (
              <div>
                <div className="font-medium text-gray-700">Pet Policy:</div>
                <div className="text-gray-600">{hotel.petPolicy}</div>
              </div>
            )}
            
            <div>
              <div className="font-medium text-gray-700">Age Restriction:</div>
              <div className="text-gray-600">Guests must be 18+ to check-in</div>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">Ready to proceed?</h4>
            <p className="text-sm text-blue-700 mt-1">
              Click "Continue" to proceed with guest information. Your booking details look great!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingReviewStep; 