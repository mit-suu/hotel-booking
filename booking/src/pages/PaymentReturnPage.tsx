import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, ArrowLeft, Home, Receipt, RefreshCcw } from 'lucide-react';
import { vnpayAPI } from '../services/api';
import { VNPAY_RESPONSE_CODES, VNPayCallbackRequest } from '../types/vnpay';

const PaymentReturnPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState<VNPayCallbackRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPaymentReturn = async () => {
      try {
        // Extract all VNPay parameters from URL
        const vnpParams: Record<string, string> = {};
        
        // Get all vnp_ parameters
        for (const [key, value] of searchParams.entries()) {
          if (key.startsWith('vnp_')) {
            vnpParams[key] = value;
          }
        }

        if (Object.keys(vnpParams).length === 0) {
          setError('Invalid payment return URL');
          setLoading(false);
          return;
        }

        // Process return with backend
        const response = await vnpayAPI.processReturn(vnpParams);
        setPaymentResult(response.data.result);
        
      } catch (error: any) {
        console.error('Error processing payment return:', error);
        setError(error.response?.data?.message || 'Failed to process payment result');
      } finally {
        setLoading(false);
      }
    };

    processPaymentReturn();
  }, [searchParams]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getPaymentStatus = () => {
    if (!paymentResult) return null;
    
    const responseCode = paymentResult.vnp_ResponseCode;
    const isSuccess = responseCode === '00';
    
    return {
      isSuccess,
      message: VNPAY_RESPONSE_CODES[responseCode] || 'Lỗi không xác định',
      code: responseCode
    };
  };

  const handleGoToBookings = () => {
    navigate('/bookings/my');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleViewBooking = () => {
    if (paymentResult?.vnp_TxnRef) {
      // Extract booking ID from transaction reference
      // Assuming txnRef format includes booking ID or can be used to find booking
      navigate('/bookings/my');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="text-xl font-semibold text-gray-900 mt-4">
              Đang xử lý kết quả thanh toán...
            </h2>
            <p className="text-gray-600 mt-2">
              Vui lòng đợi trong giây lát
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold text-gray-900 mt-4">
              Có lỗi xảy ra
            </h2>
            <p className="text-gray-600 mt-2">{error}</p>
            <div className="mt-6 space-y-3">
              <button
                onClick={handleGoHome}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const paymentStatus = getPaymentStatus();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Quay lại
        </button>

        {/* Payment Result Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className={`p-6 text-center ${
            paymentStatus?.isSuccess 
              ? 'bg-green-50 border-b border-green-200' 
              : 'bg-red-50 border-b border-red-200'
          }`}>
            {paymentStatus?.isSuccess ? (
              <>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <h1 className="text-2xl font-bold text-green-800 mt-4">
                  Thanh toán thành công!
                </h1>
                <p className="text-green-700 mt-2">
                  Đặt phòng của bạn đã được xác nhận
                </p>
              </>
            ) : (
              <>
                <XCircle className="h-16 w-16 text-red-500 mx-auto" />
                <h1 className="text-2xl font-bold text-red-800 mt-4">
                  Thanh toán thất bại
                </h1>
                <p className="text-red-700 mt-2">
                  {paymentStatus?.message}
                </p>
              </>
            )}
          </div>

          {/* Payment Details */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Chi tiết giao dịch
            </h2>
            
            <div className="space-y-3 text-sm">
              {paymentResult?.vnp_OrderInfo && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Nội dung:</span>
                  <span className="font-medium">{paymentResult.vnp_OrderInfo}</span>
                </div>
              )}
              
              {paymentResult?.vnp_Amount && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-medium text-lg">
                    {formatCurrency(paymentResult.vnp_Amount)}
                  </span>
                </div>
              )}
              
              {paymentResult?.vnp_TransactionNo && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã giao dịch VNPay:</span>
                  <span className="font-medium font-mono">
                    {paymentResult.vnp_TransactionNo}
                  </span>
                </div>
              )}
              
              {paymentResult?.vnp_TxnRef && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã tham chiếu:</span>
                  <span className="font-medium font-mono">
                    {paymentResult.vnp_TxnRef}
                  </span>
                </div>
              )}
              
              {paymentResult?.vnp_BankCode && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngân hàng:</span>
                  <span className="font-medium">{paymentResult.vnp_BankCode}</span>
                </div>
              )}
              
              {paymentResult?.vnp_PayDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Thời gian:</span>
                  <span className="font-medium">
                    {new Date(
                      paymentResult.vnp_PayDate.replace(
                        /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
                        '$1-$2-$3T$4:$5:$6'
                      )
                    ).toLocaleString('vi-VN')}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-600">Trạng thái:</span>
                <span className={`font-medium ${
                  paymentStatus?.isSuccess ? 'text-green-600' : 'text-red-600'
                }`}>
                  {paymentStatus?.message}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="space-y-3">
              {paymentStatus?.isSuccess ? (
                <>
                  <button
                    onClick={handleViewBooking}
                    className="w-full flex items-center justify-center bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Receipt className="h-5 w-5 mr-2" />
                    Xem đặt phòng của tôi
                  </button>
                  <button
                    onClick={handleGoHome}
                    className="w-full flex items-center justify-center bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <Home className="h-5 w-5 mr-2" />
                    Về trang chủ
                  </button>
                </>
              ) : (
                <>
                  {paymentResult?.vnp_ResponseCode === '11' ? (
                    // Timeout case - special handling
                    <>
                      <button
                        onClick={handleGoToBookings}
                        className="w-full flex items-center justify-center bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        <RefreshCcw className="h-5 w-5 mr-2" />
                        Thử lại thanh toán
                      </button>
                      <button
                        onClick={handleGoHome}
                        className="w-full flex items-center justify-center bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        <Home className="h-5 w-5 mr-2" />
                        Về trang chủ
                      </button>
                    </>
                  ) : (
                    // Other error cases
                    <>
                      <button
                        onClick={handleGoToBookings}
                        className="w-full flex items-center justify-center bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Thử lại đặt phòng
                      </button>
                      <button
                        onClick={handleGoHome}
                        className="w-full flex items-center justify-center bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        <Home className="h-5 w-5 mr-2" />
                        Về trang chủ
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Notice */}
          {paymentStatus?.isSuccess && (
            <div className="p-4 bg-blue-50 border-t border-blue-200">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Thông báo quan trọng:</p>
                  <p className="mt-1">
                    Email xác nhận đặt phòng đã được gửi đến địa chỉ email của bạn. 
                    Vui lòng kiểm tra hộp thư để biết thêm chi tiết về đặt phòng.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentReturnPage; 