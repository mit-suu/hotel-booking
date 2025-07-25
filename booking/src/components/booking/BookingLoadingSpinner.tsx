import React from 'react';
import { Loader2, Calendar, Users, CreditCard } from 'lucide-react';

interface BookingLoadingSpinnerProps {
  message?: string;
  type?: 'default' | 'booking' | 'payment' | 'confirmation';
}

const BookingLoadingSpinner: React.FC<BookingLoadingSpinnerProps> = ({
  message,
  type = 'default'
}) => {
  const getLoadingContent = () => {
    switch (type) {
      case 'booking':
        return {
          icon: <Calendar className="h-8 w-8 text-blue-600" />,
          title: 'Processing Your Booking...',
          description: 'We\'re checking availability and preparing your reservation'
        };
      case 'payment':
        return {
          icon: <CreditCard className="h-8 w-8 text-green-600" />,
          title: 'Processing Payment...',
          description: 'Please wait while we securely process your payment'
        };
      case 'confirmation':
        return {
          icon: <Users className="h-8 w-8 text-purple-600" />,
          title: 'Confirming Booking...',
          description: 'Almost done! We\'re finalizing your reservation details'
        };
      default:
        return {
          icon: <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />,
          title: 'Loading...',
          description: message || 'Please wait a moment'
        };
    }
  };

  const content = getLoadingContent();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {/* Animated Icon */}
          <div className="mb-6 relative">
            <div className="animate-pulse bg-blue-50 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
              {content.icon}
            </div>
            {type !== 'default' && (
              <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-blue-600 w-20 h-20 mx-auto"></div>
            )}
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {content.title}
          </h2>

          {/* Description */}
          <p className="text-gray-600 mb-6">
            {content.description}
          </p>

          {/* Progress Dots */}
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>

          {/* Loading Bar */}
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>

          {/* Additional Message */}
          {type === 'payment' && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                <strong>Important:</strong> Please do not close this window or navigate away while payment is processing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingLoadingSpinner; 