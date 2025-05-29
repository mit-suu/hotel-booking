import React, { useState } from 'react';
import { Calendar, DollarSign, TrendingUp, Users, Star, BarChart2, PieChart, Activity } from 'lucide-react';

const HostAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<string>('month');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');

  // Sample data for analytics
  const analyticsData = {
    totalRevenue: 45600000,
    bookingsCount: 24,
    occupancyRate: 78,
    averageRating: 4.7,
    revenueByMonth: [
      { month: 'Tháng 1', revenue: 3200000 },
      { month: 'Tháng 2', revenue: 2800000 },
      { month: 'Tháng 3', revenue: 3500000 },
      { month: 'Tháng 4', revenue: 4200000 },
      { month: 'Tháng 5', revenue: 3800000 },
      { month: 'Tháng 6', revenue: 4500000 },
      { month: 'Tháng 7', revenue: 5100000 },
      { month: 'Tháng 8', revenue: 4800000 },
      { month: 'Tháng 9', revenue: 5200000 },
      { month: 'Tháng 10', revenue: 4900000 },
      { month: 'Tháng 11', revenue: 0 },
      { month: 'Tháng 12', revenue: 0 }
    ],
    bookingsBySource: [
      { source: 'Website', count: 12 },
      { source: 'Mobile App', count: 8 },
      { source: 'Booking.com', count: 3 },
      { source: 'Agoda', count: 1 }
    ],
    recentBookings: [
      { id: 'BK-001', guestName: 'Nguyễn Văn An', date: '2023-10-15', amount: 2500000, property: 'Vinpearl Resort & Spa' },
      { id: 'BK-002', guestName: 'Trần Thị Bình', date: '2023-10-20', amount: 3200000, property: 'Metropole Hanoi' },
      { id: 'BK-003', guestName: 'Lê Văn Cường', date: '2023-09-25', amount: 1800000, property: 'Mường Thanh Luxury' }
    ],
    properties: [
      { id: '1', name: 'Vinpearl Resort & Spa' },
      { id: '2', name: 'Metropole Hanoi' },
      { id: '3', name: 'Mường Thanh Luxury' }
    ]
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Calculate max revenue for chart scaling
  const maxRevenue = Math.max(...analyticsData.revenueByMonth.map(item => item.revenue));

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Phân tích doanh thu</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <label className="text-gray-700">Thời gian:</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="week">7 ngày qua</option>
                <option value="month">30 ngày qua</option>
                <option value="quarter">Quý này</option>
                <option value="year">Năm nay</option>
              </select>
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-gray-700">Khách sạn:</label>
              <select
                value={propertyFilter}
                onChange={(e) => setPropertyFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả khách sạn</option>
                {analyticsData.properties.map(property => (
                  <option key={property.id} value={property.id}>{property.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Tổng doanh thu</p>
                <h3 className="text-2xl font-bold mt-2">{formatCurrency(analyticsData.totalRevenue)}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+12.5%</span>
              <span className="text-gray-500 ml-1">so với tháng trước</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Số lượng đặt phòng</p>
                <h3 className="text-2xl font-bold mt-2">{analyticsData.bookingsCount}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+8.2%</span>
              <span className="text-gray-500 ml-1">so với tháng trước</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Tỷ lệ lấp đầy</p>
                <h3 className="text-2xl font-bold mt-2">{analyticsData.occupancyRate}%</h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+5.3%</span>
              <span className="text-gray-500 ml-1">so với tháng trước</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Đánh giá trung bình</p>
                <h3 className="text-2xl font-bold mt-2">{analyticsData.averageRating}/5</h3>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+0.2</span>
              <span className="text-gray-500 ml-1">so với tháng trước</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold flex items-center">
                <BarChart2 className="h-5 w-5 mr-2 text-blue-600" />
                Doanh thu theo tháng
              </h3>
            </div>
            <div className="h-64">
              <div className="flex h-full items-end">
                {analyticsData.revenueByMonth.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-colors"
                      style={{ 
                        height: `${(item.revenue / maxRevenue) * 100}%`,
                        maxWidth: '30px',
                        margin: '0 auto'
                      }}
                    ></div>
                    <div className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-top-left">
                      {item.month}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Sources */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-purple-600" />
                Nguồn đặt phòng
              </h3>
            </div>
            <div className="space-y-4">
              {analyticsData.bookingsBySource.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-700">{item.source}</span>
                    <span className="text-gray-900 font-medium">{item.count} đặt phòng</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="h-2.5 rounded-full" 
                      style={{ 
                        width: `${(item.count / analyticsData.bookingsCount) * 100}%`,
                        backgroundColor: index === 0 ? '#3B82F6' : 
                                        index === 1 ? '#8B5CF6' : 
                                        index === 2 ? '#EC4899' : '#F59E0B'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold flex items-center">
              <Activity className="h-5 w-5 mr-2 text-green-600" />
              Đặt phòng gần đây
            </h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Xem tất cả
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã đặt phòng
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách sạn
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số tiền
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData.recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {booking.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.guestName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.property}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(booking.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(booking.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostAnalytics;
