import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, MapPin, Calendar, DollarSign, Clock, Check, X, 
  FileText, Printer, Download, Mail, Phone, MessageSquare, Edit, 
  Percent, Building, CreditCard, AlertTriangle, ChevronDown, ChevronUp
} from 'lucide-react';

interface BookingDetail {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  propertyName: string;
  propertyId: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  roomName: string;
  roomType: string;
  location: string;
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
  };
  nights: number;
  basePrice: number;
  taxesAndFees: number;
  totalAmount: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  paymentMethod: string;
  paymentDate?: string;
  createdAt: string;
  specialRequests?: string;
  commission: {
    rate: number;
    amount: number;
    ownerAmount: number;
    platformAmount: number;
    status: 'pending' | 'paid' | 'processing';
    paidDate?: string;
  };
  cancellationPolicy: string;
  invoiceId?: string;
  notes?: string;
}

const AdminBookingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showCommissionDetails, setShowCommissionDetails] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [notes, setNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // Sample booking data - in a real app, you would fetch this from an API
  const booking: BookingDetail = {
    id: 'BK-001',
    guestName: 'Nguyễn Văn An',
    guestEmail: 'nguyenvanan@example.com',
    guestPhone: '0901234567',
    propertyName: 'Vinpearl Resort & Spa',
    propertyId: 'PROP-001',
    ownerId: 'OWN-001',
    ownerName: 'Công ty CP Vinpearl',
    ownerEmail: 'contact@vinpearl.com',
    ownerPhone: '1900 2345',
    roomName: 'Deluxe Ocean View',
    roomType: 'Deluxe',
    location: 'Nha Trang',
    checkIn: '2023-10-15',
    checkOut: '2023-10-18',
    guests: {
      adults: 2,
      children: 0
    },
    nights: 3,
    basePrice: 2300000,
    taxesAndFees: 600000,
    totalAmount: 7500000,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card',
    paymentDate: '2023-09-20',
    createdAt: '2023-09-20',
    specialRequests: 'Phòng ở tầng cao, xa thang máy.',
    commission: {
      rate: 15,
      amount: 1125000,
      ownerAmount: 6375000,
      platformAmount: 1125000,
      status: 'paid',
      paidDate: '2023-09-25'
    },
    cancellationPolicy: 'Miễn phí hủy trước 3 ngày. Sau đó, phí hủy là 50% tổng giá trị đặt phòng.',
    invoiceId: 'INV-001',
    notes: 'Khách hàng VIP, đã ở nhiều lần tại khách sạn.'
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const handleGoBack = () => {
    navigate('/admin/bookings');
  };

  const handleConfirmBooking = () => {
    // Confirm booking logic would go here
    alert(`Đã xác nhận đặt phòng có ID: ${id}`);
  };

  const handleCancelBooking = () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đặt phòng này không?')) {
      // Cancel booking logic would go here
      alert(`Đã hủy đặt phòng có ID: ${id}`);
    }
  };

  const handleSendEmail = () => {
    // Send email logic would go here
    alert(`Đã gửi email đến khách hàng: ${booking.guestEmail}`);
  };

  const handlePrintBooking = () => {
    window.print();
  };

  const handleDownloadInvoice = () => {
    // Download invoice logic would go here
    alert(`Đã tải xuống hóa đơn có ID: ${booking.invoiceId}`);
  };

  const handleViewInvoice = () => {
    navigate(`/admin/invoices/${booking.invoiceId}`);
  };

  const handleViewProperty = () => {
    navigate(`/admin/hotels/${booking.propertyId}`);
  };

  const handleViewOwner = () => {
    navigate(`/admin/users/${booking.ownerId}`);
  };

  const handleViewGuest = () => {
    // Navigate to guest profile
    navigate(`/admin/users/${booking.guestName.replace(/\s+/g, '-').toLowerCase()}`);
  };

  const handleSaveNotes = () => {
    // Save notes logic would go here
    alert('Đã lưu ghi chú');
    setIsEditingNotes(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Đã xác nhận</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Chờ xác nhận</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Đã hủy</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Đã hoàn thành</span>;
      default:
        return null;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Đã thanh toán</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Chờ thanh toán</span>;
      case 'refunded':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Đã hoàn tiền</span>;
      default:
        return null;
    }
  };

  const getCommissionStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Đã thanh toán</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Chờ thanh toán</span>;
      case 'processing':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Đang xử lý</span>;
      default:
        return null;
    }
  };

  return (<div className="w-full">
        <div className="flex items-center mb-6">
          <button
            onClick={handleGoBack}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">Chi tiết đặt phòng #{booking.id}</h1>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {booking.status === 'pending' && (
            <>
              <button
                onClick={handleConfirmBooking}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Check size={18} className="mr-2" />
                Xác nhận đặt phòng
              </button>
              <button
                onClick={handleCancelBooking}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <X size={18} className="mr-2" />
                Hủy đặt phòng
              </button>
            </>
          )}
          <button
            onClick={handleSendEmail}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Mail size={18} className="mr-2" />
            Gửi email
          </button>
          <button
            onClick={handlePrintBooking}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
          >
            <Printer size={18} className="mr-2" />
            In
          </button>
          {booking.invoiceId && (
            <>
              <button
                onClick={handleViewInvoice}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <FileText size={18} className="mr-2" />
                Xem hóa đơn
              </button>
              <button
                onClick={handleDownloadInvoice}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Download size={18} className="mr-2" />
                Tải hóa đơn
              </button>
            </>
          )}
        </div>

        {/* Status Overview */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Tổng quan đặt phòng</h2>
              <div className="flex flex-wrap gap-2 mb-2">
                {getStatusBadge(booking.status)}
                {getPaymentStatusBadge(booking.paymentStatus)}
              </div>
              <p className="text-gray-600">Ngày đặt: {formatDate(booking.createdAt)}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-600">Tổng thanh toán</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(booking.totalAmount)}</p>
              {booking.paymentStatus === 'paid' && booking.paymentDate && (
                <p className="text-sm text-gray-500">Thanh toán ngày {formatDate(booking.paymentDate)}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Guest Information */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <User size={20} className="mr-2 text-blue-600" />
                Thông tin khách hàng
              </h2>
              <button
                onClick={handleViewGuest}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Xem hồ sơ
              </button>
            </div>
            <div className="space-y-3">
              <p className="font-medium text-gray-900">{booking.guestName}</p>
              <p className="text-gray-600 flex items-center">
                <Mail size={16} className="mr-2 text-gray-400" />
                {booking.guestEmail}
              </p>
              <p className="text-gray-600 flex items-center">
                <Phone size={16} className="mr-2 text-gray-400" />
                {booking.guestPhone}
              </p>
            </div>
          </div>

          {/* Property Information */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <MapPin size={20} className="mr-2 text-blue-600" />
                Thông tin khách sạn
              </h2>
              <button
                onClick={handleViewProperty}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Xem khách sạn
              </button>
            </div>
            <div className="space-y-3">
              <p className="font-medium text-gray-900">{booking.propertyName}</p>
              <p className="text-gray-600">{booking.location}</p>
              <p className="text-gray-600">Phòng: {booking.roomName}</p>
              <p className="text-gray-600">Loại: {booking.roomType}</p>
            </div>
          </div>

          {/* Owner Information */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Building size={20} className="mr-2 text-blue-600" />
                Thông tin chủ khách sạn
              </h2>
              <button
                onClick={handleViewOwner}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Xem hồ sơ
              </button>
            </div>
            <div className="space-y-3">
              <p className="font-medium text-gray-900">{booking.ownerName}</p>
              <p className="text-gray-600 flex items-center">
                <Mail size={16} className="mr-2 text-gray-400" />
                {booking.ownerEmail}
              </p>
              <p className="text-gray-600 flex items-center">
                <Phone size={16} className="mr-2 text-gray-400" />
                {booking.ownerPhone}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Booking Details */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar size={20} className="mr-2 text-blue-600" />
              Chi tiết đặt phòng
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Ngày nhận phòng:</span>
                <span className="font-medium">{formatDate(booking.checkIn)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Ngày trả phòng:</span>
                <span className="font-medium">{formatDate(booking.checkOut)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Số đêm:</span>
                <span className="font-medium">{booking.nights} đêm</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Số khách:</span>
                <span className="font-medium">{booking.guests.adults} người lớn, {booking.guests.children} trẻ em</span>
              </div>
              {booking.specialRequests && (
                <div className="pt-2">
                  <p className="text-gray-600 mb-1">Yêu cầu đặc biệt:</p>
                  <p className="bg-gray-50 p-3 rounded text-gray-700">{booking.specialRequests}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <button 
              className="w-full flex justify-between items-center text-lg font-semibold mb-4"
              onClick={() => setShowPaymentDetails(!showPaymentDetails)}
            >
              <div className="flex items-center">
                <DollarSign size={20} className="mr-2 text-blue-600" />
                Chi tiết thanh toán
              </div>
              {showPaymentDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {showPaymentDetails && (
              <div className="space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Giá phòng ({booking.nights} đêm):</span>
                  <span className="font-medium">{formatCurrency(booking.basePrice * booking.nights)}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Thuế và phí:</span>
                  <span className="font-medium">{formatCurrency(booking.taxesAndFees)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng cộng:</span>
                  <span>{formatCurrency(booking.totalAmount)}</span>
                </div>
                <div className="pt-2 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Phương thức thanh toán:</span>
                    <span className="flex items-center">
                      <CreditCard size={16} className="mr-1" />
                      {booking.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Trạng thái thanh toán:</span>
                    <span>{getPaymentStatusBadge(booking.paymentStatus)}</span>
                  </div>
                  {booking.paymentDate && (
                    <div className="flex justify-between text-gray-600">
                      <span>Ngày thanh toán:</span>
                      <span>{formatDate(booking.paymentDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Commission Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <button 
            className="w-full flex justify-between items-center text-lg font-semibold mb-4"
            onClick={() => setShowCommissionDetails(!showCommissionDetails)}
          >
            <div className="flex items-center">
              <Percent size={20} className="mr-2 text-blue-600" />
              Chi tiết hoa hồng
            </div>
            {showCommissionDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          {showCommissionDetails && (
            <div className="space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Tỷ lệ hoa hồng:</span>
                <span className="font-medium">{booking.commission.rate}%</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Số tiền hoa hồng:</span>
                <span className="font-medium">{formatCurrency(booking.commission.amount)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Số tiền chủ khách sạn nhận:</span>
                <span className="font-medium">{formatCurrency(booking.commission.ownerAmount)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Số tiền nền tảng nhận:</span>
                <span className="font-medium">{formatCurrency(booking.commission.platformAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Trạng thái thanh toán hoa hồng:</span>
                <span>{getCommissionStatusBadge(booking.commission.status)}</span>
              </div>
              {booking.commission.paidDate && (
                <div className="flex justify-between text-gray-600">
                  <span>Ngày thanh toán hoa hồng:</span>
                  <span>{formatDate(booking.commission.paidDate)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cancellation Policy */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <AlertTriangle size={20} className="mr-2 text-orange-600" />
            Chính sách hủy phòng
          </h2>
          <p className="text-gray-700">{booking.cancellationPolicy}</p>
        </div>

        {/* Admin Notes */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <MessageSquare size={20} className="mr-2 text-blue-600" />
              Ghi chú nội bộ
            </h2>
            {!isEditingNotes && (
              <button
                onClick={() => setIsEditingNotes(true)}
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <Edit size={16} className="mr-1" />
                Chỉnh sửa
              </button>
            )}
          </div>
          
          {isEditingNotes ? (
            <div>
              <textarea
                value={notes || booking.notes || ''}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                placeholder="Thêm ghi chú về đặt phòng này..."
              />
              <div className="flex justify-end mt-3 space-x-2">
                <button
                  onClick={() => setIsEditingNotes(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveNotes}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Lưu
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg min-h-[60px]">
              {booking.notes || 'Chưa có ghi chú nào.'}
            </p>
          )}
        </div>
      </div>);
};

export default AdminBookingDetail;

