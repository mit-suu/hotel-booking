import { AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { bookingAPI, BookingResponse } from '../../services/api';

const HostCheckinPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinSuccess, setCheckinSuccess] = useState(false);
  const [checkinError, setCheckinError] = useState<string | null>(null);

  useEffect(() => {
    if (bookingId) {
      fetchBooking(bookingId);
    }
  }, [bookingId]);

  const fetchBooking = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await bookingAPI.getHostBookingById(id);
      if (res.data.success) {
        setBooking(res.data.result);
      } else {
        setError(res.data.message || 'Failed to load booking information.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load booking information.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async () => {
    if (!bookingId) return;
    setCheckinLoading(true);
    setCheckinError(null);
    try {
      const res = await bookingAPI.checkInBookingByHost(bookingId);
      if (res.data.success) {
        setBooking(res.data.result);
        setCheckinSuccess(true);
      } else {
        setCheckinError(res.data.message || 'Check-in failed.');
      }
    } catch (err: any) {
      setCheckinError(err.response?.data?.message || 'Check-in failed.');
    } finally {
      setCheckinLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <div className="text-red-500 text-xl font-semibold mb-4">{error || 'Booking not found.'}</div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Host Check-in Confirmation</h1>
          <p className="text-gray-600">Booking Reference: <span className="font-semibold">{booking.bookingReference}</span></p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="mb-4">
            <div className="font-medium text-gray-900">Hotel: {booking.hotelName}</div>
            <div className="text-gray-600">Room: {booking.roomTypeName}</div>
            <div className="text-gray-600">Guest: {booking.guestName} ({booking.guestEmail})</div>
            <div className="text-gray-600">Check-in: {new Date(booking.checkInDate).toLocaleDateString('en-US')}</div>
            <div className="text-gray-600">Check-out: {new Date(booking.checkOutDate).toLocaleDateString('en-US')}</div>
            <div className="text-gray-600">Status: <span className="font-semibold">{booking.status}</span></div>
          </div>
          {booking.qrCodeUsed || checkinSuccess ? (
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-green-700 font-semibold">Guest has already checked in for this booking.</div>
            </div>
          ) : (
            <div className="text-center">
              <button
                onClick={handleCheckin}
                disabled={checkinLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-60"
              >
                {checkinLoading ? 'Confirming...' : 'Confirm Check-in'}
              </button>
              {checkinError && (
                <div className="mt-4 text-red-600 font-medium">{checkinError}</div>
              )}
            </div>
          )}
        </div>
        <div className="text-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default HostCheckinPage; 