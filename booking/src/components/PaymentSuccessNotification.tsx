import React, { useEffect, useState } from 'react';
import { CheckCircle, X, Receipt, AlertCircle } from 'lucide-react';

interface PaymentSuccessNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  bookingId?: string;
  amount?: number;
  autoHide?: boolean;
  autoHideDelay?: number;
}

const PaymentSuccessNotification: React.FC<PaymentSuccessNotificationProps> = ({
  isVisible,
  onClose,
  bookingId,
  amount,
  autoHide = true,
  autoHideDelay = 5000
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      
      if (autoHide) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoHideDelay);

        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, autoHide, autoHideDelay]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className={`fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity ${
            show ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={handleClose}
        />

        {/* Center the modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal */}
        <div className={`inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6 ${
          show ? 'opacity-100 translate-y-0 sm:scale-100' : 'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
        }`}>
          {/* Close button */}
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={handleClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="text-center">
            {/* Success icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            {/* Title */}
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
              Thanh toán thành công!
            </h3>

            {/* Description */}
            <div className="text-sm text-gray-600 mb-4">
              <p>Đặt phòng của bạn đã được xác nhận và thanh toán thành công.</p>
            </div>

            {/* Booking details */}
            {(bookingId || amount) && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4 text-left">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Chi tiết đặt phòng</h4>
                <div className="space-y-1 text-xs text-gray-600">
                  {bookingId && (
                    <div className="flex justify-between">
                      <span>Mã đặt phòng:</span>
                      <span className="font-mono font-medium">{bookingId}</span>
                    </div>
                  )}
                  {amount && (
                    <div className="flex justify-between">
                      <span>Số tiền:</span>
                      <span className="font-medium">{formatCurrency(amount)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800 text-left">
                  <p className="font-medium">Email xác nhận đã được gửi</p>
                  <p className="mt-1">
                    Vui lòng kiểm tra email để xem chi tiết đặt phòng và hướng dẫn check-in.
                  </p>
                </div>
              </div>
            </div>

            {/* Action button */}
            <button
              type="button"
              className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
              onClick={handleClose}
            >
              <Receipt className="h-4 w-4 mr-2" />
              Xem đặt phòng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessNotification; 