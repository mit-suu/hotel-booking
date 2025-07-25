import React, { useState } from 'react';
import { CheckCircle, X, Calendar, Users, MapPin, DollarSign } from 'lucide-react';
import { BookingResponse } from '../../services/api';

interface BookingConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  booking?: BookingResponse;
  loading?: boolean;
}

const BookingConfirmModal: React.FC<BookingConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  booking,
  loading = false
}) => {
  const handleConfirm = async () => {
    await onConfirm();
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Confirm Booking</h3>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Are you sure you want to confirm this booking?
          </p>

          {booking && (
            <div className="space-y-4 mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Booking Reference</span>
                <span className="text-sm font-semibold text-gray-900">{booking.bookingReference}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Guest Name</span>
                <span className="text-sm text-gray-900">{booking.guestName}</span>
              </div>

              <div className="flex items-start justify-between">
                <span className="text-sm font-medium text-gray-600 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Check-in
                </span>
                <span className="text-sm text-gray-900 text-right">
                  {formatDate(booking.checkInDate)}
                </span>
              </div>

              <div className="flex items-start justify-between">
                <span className="text-sm font-medium text-gray-600 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Check-out
                </span>
                <span className="text-sm text-gray-900 text-right">
                  {formatDate(booking.checkOutDate)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Guests
                </span>
                <span className="text-sm text-gray-900">{booking.guests}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Total Amount
                </span>
                <span className="text-sm font-semibold text-gray-900">{formatCurrency(booking.totalAmount)}</span>
              </div>

              {booking.specialRequests && (
                <div className="border-t pt-3">
                  <span className="text-sm font-medium text-gray-600 block mb-1">Special Requests</span>
                  <p className="text-sm text-gray-700 italic">{booking.specialRequests}</p>
                </div>
              )}
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-700">
                <p className="font-medium mb-1">Confirmation Action</p>
                <p>By confirming this booking, you commit to providing the reserved accommodation and services as agreed.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Booking
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmModal; 