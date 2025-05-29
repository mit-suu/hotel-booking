import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Calendar, User, MapPin, DollarSign, Check, X, Clock, Filter, Download } from 'lucide-react';

interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  propertyName: string;
  roomName: string;
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  createdAt: string;
}

const AdminBookings: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Sample bookings data
  const bookings: Booking[] = [
    {
      id: 'BK-001',
      guestName: 'Nguyễn Văn An',
      guestEmail: 'nguyenvanan@example.com',
      guestPhone: '0901234567',
      propertyName: 'Vinpearl Resort & Spa',
      roomName: 'Deluxe Ocean View',
      location: 'Nha Trang',
      checkIn: '2023-10-15',
      checkOut: '2023-10-18',
      guests: 2,
      totalAmount: 7500000,
      status: 'confirmed',
      paymentStatus: 'paid',
      createdAt: '2023-09-20'
    },
    {
      id: 'BK-002',
      guestName: 'Trần Thị Bình',
      guestEmail: 'tranthibinh@example.com',
      guestPhone: '0912345678',
      propertyName: 'Metropole Hanoi',
      roomName: 'Premium Suite',
      location: 'Hà Nội',
      checkIn: '2023-10-20',
      checkOut: '2023-10-22',
      guests: 3,
      totalAmount: 6400000,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: '2023-10-01'
    },
    {
      id: 'BK-003',
      guestName: 'Lê Văn Cường',
      guestEmail: 'levancuong@example.com',
      guestPhone: '0923456789',
      propertyName: 'Mường Thanh Luxury',
      roomName: 'Family Room',
      location: 'Đà Nẵng',
      checkIn: '2023-09-25',
      checkOut: '2023-09-30',
      guests: 4,
      totalAmount: 8400000,
      status: 'completed',
      paymentStatus: 'paid',
      createdAt: '2023-08-15'
    },
    {
      id: 'BK-004',
      guestName: 'Phạm Thị Dung',
      guestEmail: 'phamthidung@example.com',
      guestPhone: '0934567890',
      propertyName: 'Vinpearl Resort & Spa',
      roomName: 'Standard Room',
      location: 'Nha Trang',
      checkIn: '2023-11-05',
      checkOut: '2023-11-07',
      guests: 2,
      totalAmount: 3600000,
      status: 'cancelled',
      paymentStatus: 'refunded',
      createdAt: '2023-10-10'
    },
    {
      id: 'BK-005',
      guestName: 'Hoàng Văn Em',
      guestEmail: 'hoangvanem@example.com',
      guestPhone: '0945678901',
      propertyName: 'Metropole Hanoi',
      roomName: 'Deluxe Room',
      location: 'Hà Nội',
      checkIn: '2023-10-25',
      checkOut: '2023-10-28',
      guests: 2,
      totalAmount: 9600000,
      status: 'confirmed',
      paymentStatus: 'paid',
      createdAt: '2023-10-05'
    },
    {
      id: 'BK-006',
      guestName: 'Ngô Thị Phương',
      guestEmail: 'ngothiphuong@example.com',
      guestPhone: '0956789012',
      propertyName: 'Fusion Maia Resort',
      roomName: 'Pool Villa',
      location: 'Đà Nẵng',
      checkIn: '2023-11-10',
      checkOut: '2023-11-15',
      guests: 2,
      totalAmount: 12500000,
      status: 'confirmed',
      paymentStatus: 'paid',
      createdAt: '2023-10-12'
    },
    {
      id: 'BK-007',
      guestName: 'Đỗ Văn Giang',
      guestEmail: 'dovangiang@example.com',
      guestPhone: '0967890123',
      propertyName: 'Pullman Saigon',
      roomName: 'Executive Suite',
      location: 'Hồ Chí Minh',
      checkIn: '2023-10-30',
      checkOut: '2023-11-02',
      guests: 1,
      totalAmount: 8400000,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: '2023-10-15'
    },
    {
      id: 'BK-008',
      guestName: 'Vũ Thị Hương',
      guestEmail: 'vuthihuong@example.com',
      guestPhone: '0978901234',
      propertyName: 'Sapa Homestay',
      roomName: 'Mountain View Room',
      location: 'Sapa',
      checkIn: '2023-11-20',
      checkOut: '2023-11-23',
      guests: 2,
      totalAmount: 2400000,
      status: 'confirmed',
      paymentStatus: 'paid',
      createdAt: '2023-10-18'
    }
  ];

  const itemsPerPage = 5;

  // Filter bookings based on search term, status, payment status, and date
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || booking.paymentStatus === paymentFilter;
    
    // Date filtering logic
    let matchesDate = true;
    const today = new Date();
    const checkInDate = new Date(booking.checkIn);
    
    if (dateFilter === 'upcoming') {
      matchesDate = checkInDate > today;
    } else if (dateFilter === 'past') {
      matchesDate = checkInDate < today;
    } else if (dateFilter === 'today') {
      matchesDate = checkInDate.toDateString() === today.toDateString();
    } else if (dateFilter === 'thisWeek') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(today);
      weekEnd.setDate(weekStart.getDate() + 6);
      matchesDate = checkInDate >= weekStart && checkInDate <= weekEnd;
    }
    
    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const handleViewBooking = (bookingId: string) => {
    navigate(`/admin/bookings/${bookingId}`);
  };

  const handleConfirmBooking = (bookingId: string) => {
    // Confirm booking logic would go here
    alert(`Đã xác nhận đặt phòng có ID: ${bookingId}`);
  };

  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đặt phòng này không?')) {
      // Cancel booking logic would go here
      alert(`Đã hủy đặt phòng có ID: ${bookingId}`);
    }
  };

  const handleExportBookings = () => {
    // Export bookings logic would go here
    alert('Đã xuất danh sách đặt phòng');
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

  return (<div className="w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
          <h1 className="text-xl sm:text-2xl font-bold">Quản lý đặt phòng</h1>
          <button
            onClick={handleExportBookings}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Download size={20} className="mr-2" />
            Xuất dữ liệu
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Tìm kiếm theo mã đặt phòng, tên khách, khách sạn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-gray-400 mr-2" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="pending">Chờ xác nhận</option>
                  <option value="cancelled">Đã hủy</option>
                  <option value="completed">Đã hoàn thành</option>
                </select>
              </div>
              <div className="flex items-center">
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tất cả thanh toán</option>
                  <option value="paid">Đã thanh toán</option>
                  <option value="pending">Chờ thanh toán</option>
                  <option value="refunded">Đã hoàn tiền</option>
                </select>
              </div>
              <div className="flex items-center">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tất cả thời gian</option>
                  <option value="upcoming">Sắp tới</option>
                  <option value="past">Đã qua</option>
                  <option value="today">Hôm nay</option>
                  <option value="thisWeek">Tuần này</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {paginatedBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <span className="mr-2">Đặt phòng #{booking.id}</span>
                      {getStatusBadge(booking.status)}
                    </h3>
                    <p className="text-gray-500 text-sm">Đặt ngày: {formatDate(booking.createdAt)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleConfirmBooking(booking.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                        >
                          <Check size={16} className="mr-1" />
                          Xác nhận
                        </button>
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                        >
                          <X size={16} className="mr-1" />
                          Từ chối
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleViewBooking(booking.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Eye size={16} className="mr-1" />
                      Chi tiết
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
                  {/* Guest Info */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700 flex items-center">
                      <User size={16} className="mr-2" />
                      Thông tin khách hàng
                    </h4>
                    <p className="text-gray-900 font-medium">{booking.guestName}</p>
                    <p className="text-gray-600">{booking.guestEmail}</p>
                    <p className="text-gray-600">{booking.guestPhone}</p>
                  </div>

                  {/* Hotel Info */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700 flex items-center">
                      <MapPin size={16} className="mr-2" />
                      Thông tin khách sạn
                    </h4>
                    <p className="text-gray-900">{booking.propertyName}</p>
                    <p className="text-gray-600">{booking.roomName}</p>
                    <p className="text-gray-600">{booking.location}</p>
                  </div>

                  {/* Booking Details */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700 flex items-center">
                      <Calendar size={16} className="mr-2" />
                      Chi tiết đặt phòng
                    </h4>
                    <p className="text-gray-600">
                      Nhận phòng: <span className="text-gray-900">{formatDate(booking.checkIn)}</span>
                    </p>
                    <p className="text-gray-600">
                      Trả phòng: <span className="text-gray-900">{formatDate(booking.checkOut)}</span>
                    </p>
                    <p className="text-gray-600">{booking.guests} khách</p>
                  </div>

                  {/* Payment Info */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700 flex items-center">
                      <DollarSign size={16} className="mr-2" />
                      Thông tin thanh toán
                    </h4>
                    <p className="text-gray-900 font-medium text-lg">
                      {formatCurrency(booking.totalAmount)}
                    </p>
                    <div className="flex items-center">
                      <Clock size={14} className="mr-2 text-gray-600" />
                      <span className="mr-2">Trạng thái:</span>
                      {getPaymentStatusBadge(booking.paymentStatus)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Trước
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Sau
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Hiển thị <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> đến{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, filteredBookings.length)}
                    </span>{' '}
                    trong tổng số <span className="font-medium">{filteredBookings.length}</span> đặt phòng
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Trang trước</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === index + 1
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Trang sau</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}

          {paginatedBookings.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h3 className="text-xl font-medium text-gray-900 mb-2">Không tìm thấy đặt phòng nào</h3>
              <p className="text-gray-600">Không có đặt phòng nào phù hợp với tiêu chí tìm kiếm của bạn.</p>
            </div>
          )}
        </div>
      </div>);
};

export default AdminBookings;

