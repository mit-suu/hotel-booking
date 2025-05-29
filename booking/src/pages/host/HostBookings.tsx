import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, MapPin, DollarSign, Check, X, Clock, Eye, Phone, Mail } from 'lucide-react';

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

const HostBookings: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

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
    }
  ];

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
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

  const filteredBookings = bookings.filter(booking => {
    const matchesTab = activeTab === 'all' || booking.status === activeTab;
    const matchesSearch = booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          booking.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          booking.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleViewBooking = (id: string) => {
    navigate(`/host/bookings/${id}`);
  };

  const handleConfirmBooking = (id: string) => {
    // Logic to confirm booking
    alert(`Xác nhận đặt phòng ${id}`);
  };

  const handleCancelBooking = (id: string) => {
    // Logic to cancel booking
    if (window.confirm('Bạn có chắc chắn muốn hủy đặt phòng này không?')) {
      alert(`Đã hủy đặt phòng ${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Quản lý đặt phòng</h1>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Chờ xác nhận
              </button>
              <button
                onClick={() => setActiveTab('confirmed')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'confirmed'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Đã xác nhận
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'completed'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Đã hoàn thành
              </button>
              <button
                onClick={() => setActiveTab('cancelled')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'cancelled'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Đã hủy
              </button>
            </nav>
          </div>

          {/* Search */}
          <div className="p-4">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên khách, tên khách sạn, mã đặt phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Guest Info */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700 flex items-center">
                      <User size={16} className="mr-2" />
                      Thông tin khách hàng
                    </h4>
                    <p className="text-gray-900 font-medium">{booking.guestName}</p>
                    <p className="text-gray-600 flex items-center">
                      <Phone size={14} className="mr-2" />
                      {booking.guestPhone}
                    </p>
                    <p className="text-gray-600 flex items-center">
                      <Mail size={14} className="mr-2" />
                      {booking.guestEmail}
                    </p>
                  </div>

                  {/* Booking Details */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700 flex items-center">
                      <Calendar size={16} className="mr-2" />
                      Chi tiết đặt phòng
                    </h4>
                    <p className="text-gray-900">{booking.propertyName}</p>
                    <p className="text-gray-600">{booking.roomName}</p>
                    <p className="text-gray-600 flex items-center">
                      <MapPin size={14} className="mr-2" />
                      {booking.location}
                    </p>
                    <p className="text-gray-600">
                      {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
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

          {filteredBookings.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h3 className="text-xl font-medium text-gray-900 mb-2">Không tìm thấy đặt phòng nào</h3>
              <p className="text-gray-600">Không có đặt phòng nào phù hợp với tiêu chí tìm kiếm của bạn.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostBookings;
