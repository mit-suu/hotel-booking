import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface BookingCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void>;
  bookingReference?: string;
  loading?: boolean;
}

const BookingCancelModal: React.FC<BookingCancelModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  bookingReference,
  loading = false
}) => {
  const [reason, setReason] = useState('');
  const [showReason, setShowReason] = useState(false);

  const handleConfirm = async () => {
    await onConfirm(reason || undefined);
    setReason('');
    setShowReason(false);
  };

  const handleClose = () => {
    if (!loading) {
      setReason('');
      setShowReason(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Cancel Booking</h3>
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
            Are you sure you want to cancel this booking?
            {bookingReference && (
              <span className="block font-medium text-gray-900 mt-1">
                Booking: {bookingReference}
              </span>
            )}
          </p>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showReason}
                onChange={(e) => setShowReason(e.target.checked)}
                disabled={loading}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Provide cancellation reason (optional)</span>
            </label>
          </div>

          {showReason && (
            <div className="mb-4">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please explain why you're cancelling this booking..."
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
                rows={3}
              />
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-700">
                <p className="font-medium mb-1">Cancellation Policy</p>
                <p>Please review the cancellation terms for your booking. Depending on the timing and hotel policy, cancellation fees may apply.</p>
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
            Keep Booking
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Cancelling...
              </>
            ) : (
              'Cancel Booking'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingCancelModal; 