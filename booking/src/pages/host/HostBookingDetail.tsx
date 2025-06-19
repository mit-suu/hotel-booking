import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, DollarSign, Clock, ArrowLeft, Phone, Mail, Download, Check, X, AlertCircle, Star } from 'lucide-react';
import { bookingAPI, BookingResponse } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import BookingStatusBadge, { PaymentStatusBadge } from '../../components/booking/BookingStatusBadge';

const HostBookingDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCancellationModal, setShowCancellationModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBookingDetail(id);
    }
  }, [id]);

  const fetchBookingDetail = async (bookingId: string) => {
    try {
      setLoading(true);
      const response = await bookingAPI.getHostBookingById(bookingId);
      
      if (response.data.success) {
        setBooking(response.data.result);
      } else {
        throw new Error(response.data.message || 'Không thể tải thông tin đặt phòng');
      }
    } catch (error: any) {
      console.error('Error fetching booking detail:', error);
      showToast('error', 'Lỗi', error.message || 'Không thể tải thông tin đặt phòng');
      navigate('/host/bookings');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
      case 'CANCELLED_BY_GUEST':
      case 'CANCELLED_BY_HOST':
        return 'bg-red-100 text-red-800';
      case 'NO_SHOW':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REFUNDED':
      case 'PARTIALLY_REFUNDED':
        return 'bg-blue-100 text-blue-800';
      case 'REFUND_PENDING':
        return 'bg-orange-100 text-orange-800';
      case 'REFUND_REJECTED':
      case 'NO_REFUND':
        return 'bg-red-100 text-red-800';
      case 'FAILED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Đã hoàn thành';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'PENDING':
        return 'Chờ xác nhận';
      case 'CANCELLED':
        return 'Đã hủy';
      case 'CANCELLED_BY_GUEST':
        return 'Khách hủy';
      case 'CANCELLED_BY_HOST':
        return 'Host hủy';
      case 'NO_SHOW':
        return 'Không đến';
      default:
        return status;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Đã thanh toán';
      case 'PENDING':
        return 'Chờ thanh toán';
      case 'REFUNDED':
        return 'Đã hoàn tiền';
      case 'PARTIALLY_REFUNDED':
        return 'Hoàn một phần';
      case 'REFUND_PENDING':
        return 'Chờ hoàn tiền';
      case 'REFUND_REJECTED':
        return 'Từ chối hoàn tiền';
      case 'NO_REFUND':
        return 'Không hoàn tiền';
      case 'FAILED':
        return 'Thanh toán thất bại';
      default:
        return status;
    }
  };

  const handleConfirmBooking = async () => {
    if (!booking || !id) return;
    
    try {
      setActionLoading('confirm');
      const response = await bookingAPI.confirmBooking(id);
      
      if (response.data.success) {
        showToast('success', 'Thành công', 'Đặt phòng đã được xác nhận');
        await fetchBookingDetail(id);
      } else {
        throw new Error(response.data.message || 'Không thể xác nhận đặt phòng');
      }
    } catch (error: any) {
      console.error('Error confirming booking:', error);
      showToast('error', 'Lỗi', error.message || 'Không thể xác nhận đặt phòng');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking || !id) return;
    
    if (window.confirm('Bạn có chắc chắn muốn hủy đặt phòng này không?')) {
      try {
        setActionLoading('cancel');
        const response = await bookingAPI.cancelBooking(id, 'Hủy bởi chủ khách sạn');
        
        if (response.data.success) {
          showToast('success', 'Thành công', 'Đặt phòng đã được hủy');
          await fetchBookingDetail(id);
        } else {
          throw new Error(response.data.message || 'Không thể hủy đặt phòng');
        }
      } catch (error: any) {
        console.error('Error cancelling booking:', error);
        showToast('error', 'Lỗi', error.message || 'Không thể hủy đặt phòng');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleCompleteBooking = async () => {
    if (!booking || !id) return;
    
    try {
      setActionLoading('complete');
      const response = await bookingAPI.completeBooking(id);
      
      if (response.data.success) {
        showToast('success', 'Thành công', 'Đặt phòng đã được đánh dấu hoàn thành');
        await fetchBookingDetail(id);
      } else {
        throw new Error(response.data.message || 'Không thể hoàn thành đặt phòng');
      }
    } catch (error: any) {
      console.error('Error completing booking:', error);
      showToast('error', 'Lỗi', error.message || 'Không thể hoàn thành đặt phòng');
    } finally {
      setActionLoading(null);
    }
  };

  // Cancellation Modal Component
  const CancellationModal = () => {
    const [refundType, setRefundType] = useState<'FULL' | 'PARTIAL' | 'NO_REFUND'>('FULL');
    const [refundAmount, setRefundAmount] = useState(booking?.totalAmount || 0);
    const [refundReason, setRefundReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRefundTypeChange = (type: 'FULL' | 'PARTIAL' | 'NO_REFUND') => {
      setRefundType(type);
      if (!booking) return;
      
      switch (type) {
        case 'FULL':
          setRefundAmount(booking.totalAmount);
          break;
        case 'PARTIAL':
          setRefundAmount(booking.totalAmount * 0.5);
          break;
        case 'NO_REFUND':
          setRefundAmount(0);
          break;
      }
    };

    const handleProcessCancellation = async () => {
      if (!booking || !id) return;
      
      if (!refundReason.trim()) {
        showToast('error', 'Lỗi', 'Vui lòng nhập lý do xử lý');
        return;
      }

      setLoading(true);
      try {
        await bookingAPI.processCancellation(id, {
          refundAmount,
          reason: refundReason,
          refundPercentage: refundType === 'FULL' ? 100 : refundType === 'PARTIAL' ? 50 : 0
        });
        
        showToast('success', 'Thành công', 'Đã xử lý yêu cầu hủy booking');
        setShowCancellationModal(false);
        await fetchBookingDetail(id);
      } catch (error: any) {
        console.error('Error processing cancellation:', error);
        showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể xử lý yêu cầu hủy');
      } finally {
        setLoading(false);
      }
    };

    if (!showCancellationModal || !booking) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Xử lý yêu cầu hủy booking
              </h2>
              <button
                onClick={() => setShowCancellationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Booking Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Thông tin booking</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Mã booking:</span>
                  <span className="ml-2 font-medium">{booking.bookingReference}</span>
                </div>
                <div>
                  <span className="text-gray-600">Khách hàng:</span>
                  <span className="ml-2 font-medium">{booking.guestName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Tổng tiền:</span>
                  <span className="ml-2 font-medium text-blue-600">{formatCurrency(booking.totalAmount)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Ngày nhận phòng:</span>
                  <span className="ml-2 font-medium">{formatDate(booking.checkInDate)}</span>
                </div>
              </div>
            </div>

            {/* Refund Options */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Chính sách hoàn tiền</h3>
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="refundType"
                    value="FULL"
                    checked={refundType === 'FULL'}
                    onChange={() => handleRefundTypeChange('FULL')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">Hoàn tiền đầy đủ</span>
                      <span className="text-green-600 font-medium">{formatCurrency(booking.totalAmount)}</span>
                    </div>
                    <p className="text-sm text-gray-600">Hoàn lại 100% số tiền đã thanh toán</p>
                  </div>
                </label>

                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="refundType"
                    value="PARTIAL"
                    checked={refundType === 'PARTIAL'}
                    onChange={() => handleRefundTypeChange('PARTIAL')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">Hoàn tiền một phần</span>
                      <span className="text-orange-600 font-medium">{formatCurrency(booking.totalAmount * 0.5)}</span>
                    </div>
                    <p className="text-sm text-gray-600">Hoàn lại 50% số tiền (giữ lại phí hủy)</p>
                  </div>
                </label>

                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="refundType"
                    value="NO_REFUND"
                    checked={refundType === 'NO_REFUND'}
                    onChange={() => handleRefundTypeChange('NO_REFUND')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">Không hoàn tiền</span>
                      <span className="text-red-600 font-medium">{formatCurrency(0)}</span>
                    </div>
                    <p className="text-sm text-gray-600">Không hoàn lại số tiền (vi phạm chính sách)</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Custom Refund Amount */}
            {refundType === 'PARTIAL' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tiền hoàn lại tùy chỉnh
                </label>
                <input
                  type="number"
                  min="0"
                  max={booking.totalAmount}
                  step="1000"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            {/* Refund Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do xử lý *
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={3}
                placeholder="Nhập lý do xử lý yêu cầu hủy (ví dụ: khách hủy sớm, vi phạm chính sách, etc.)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Summary */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Tóm tắt xử lý</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Trạng thái booking:</span>
                  <span className="font-medium text-blue-900">Đã hủy bởi khách</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Số tiền hoàn lại:</span>
                  <span className="font-medium text-blue-900">{formatCurrency(refundAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Trạng thái thanh toán:</span>
                  <span className="font-medium text-blue-900">
                    {refundType === 'FULL' ? 'Đã hoàn tiền' : 
                     refundType === 'PARTIAL' ? 'Hoàn một phần' : 'Không hoàn tiền'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowCancellationModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleProcessCancellation}
                disabled={loading || !refundReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  'Xác nhận xử lý'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy đặt phòng</h3>
            <p className="text-gray-600 mb-6">Đặt phòng này có thể đã bị xóa hoặc không tồn tại</p>
            <button
              onClick={() => navigate('/host/bookings')}
              className="text-blue-600 hover:text-blue-800"
            >
              Quay lại danh sách đặt phòng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/host/bookings')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Quay lại danh sách đặt phòng
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Chi tiết đặt phòng</h1>
                <p className="text-gray-600">Mã đặt phòng: {booking.bookingReference || booking.id}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Đặt ngày: {formatDate(booking.createdAt)}
                </p>
              </div>
              <div className="flex flex-col space-y-2 mt-4 md:mt-0">
                <BookingStatusBadge status={booking.status as any} size="md" />
                <PaymentStatusBadge status={booking.paymentStatus as any} size="md" />
              </div>
            </div>

            {/* Main Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Guest Information */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Thông tin khách hàng</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-600">Tên khách hàng</p>
                    <p className="font-medium">{booking.guestName}</p>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-5 w-5 mr-2" />
                    <span>{booking.guestEmail}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-5 w-5 mr-2" />
                    <span>{booking.guestPhone}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-2" />
                    <span>{booking.guests} khách</span>
                  </div>
                </div>
              </div>

              {/* Hotel Information */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Thông tin khách sạn</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-600">Tên khách sạn</p>
                    <p className="font-medium">{booking.hotelName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Loại phòng</p>
                    <p className="font-medium">{booking.roomTypeName}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stay Details */}
            <div className="border-t pt-6 mb-8">
              <h3 className="text-xl font-semibold mb-4">Chi tiết lưu trú</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span className="font-medium">Ngày nhận phòng</span>
                  </div>
                  <p className="text-lg">{formatDate(booking.checkInDate)}</p>
                </div>
                <div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span className="font-medium">Ngày trả phòng</span>
                  </div>
                  <p className="text-lg">{formatDate(booking.checkOutDate)}</p>
                </div>
                <div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Clock className="h-5 w-5 mr-2" />
                    <span className="font-medium">Số đêm</span>
                  </div>
                  <p className="text-lg">
                    {Math.ceil((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24))} đêm
                  </p>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            {booking.specialRequests && (
              <div className="border-t pt-6 mb-8">
                <h3 className="text-xl font-semibold mb-4">Yêu cầu đặc biệt</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{booking.specialRequests}</p>
                </div>
              </div>
            )}

            {/* Payment Information */}
            <div className="border-t pt-6 mb-8">
              <h3 className="text-xl font-semibold mb-4">Thông tin thanh toán</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {booking.paymentMethod && (
                  <div>
                    <p className="text-gray-600">Phương thức thanh toán</p>
                    <p className="font-medium">{booking.paymentMethod}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600">Tổng số tiền</p>
                  <p className="font-bold text-2xl text-blue-600">{formatCurrency(booking.totalAmount)}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t pt-6">
              <div className="flex flex-wrap gap-3">
                {booking.status === 'PENDING' && (
                  <>
                    <button
                      onClick={handleConfirmBooking}
                      disabled={actionLoading === 'confirm'}
                      className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === 'confirm' ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Xác nhận đặt phòng
                    </button>
                    <button
                      onClick={handleCancelBooking}
                      disabled={actionLoading === 'cancel'}
                      className="flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === 'cancel' ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <X className="h-4 w-4 mr-2" />
                      )}
                      Hủy đặt phòng
                    </button>
                  </>
                )}
                
                {booking.status === 'CONFIRMED' && (
                  <button
                    onClick={handleCompleteBooking}
                    disabled={actionLoading === 'complete'}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === 'complete' ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Clock className="h-4 w-4 mr-2" />
                    )}
                    Hoàn thành đặt phòng
                  </button>
                )}

                {booking.status === 'CONFIRMED' && (
                  <button
                    onClick={() => setShowCancellationModal(true)}
                    className="flex items-center px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Xử lý yêu cầu hủy
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cancellation Modal */}
        <CancellationModal />
      </div>
    </div>
  );
};

export default HostBookingDetail; 