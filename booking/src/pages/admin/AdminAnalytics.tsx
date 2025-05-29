import React, { useState } from 'react';
import { Calendar, TrendingUp, Users, Hotel, BookOpen, DollarSign, ArrowUp, ArrowDown, Filter } from 'lucide-react';

const AdminAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [compareWithPrevious, setCompareWithPrevious] = useState(true);

  // Sample analytics data
  const analyticsData = {
    revenue: {
      current: 1250000000,
      previous: 980000000,
      percentChange: 27.55
    },
    bookings: {
      current: 1876,
      previous: 1543,
      percentChange: 21.58
    },
    users: {
      current: 3254,
      previous: 2890,
      percentChange: 12.60
    },
    hotels: {
      current: 245,
      previous: 210,
      percentChange: 16.67
    },
    avgBookingValue: {
      current: 2800000,
      previous: 2500000,
      percentChange: 12.00
    },
    occupancyRate: {
      current: 78,
      previous: 72,
      percentChange: 8.33
    }
  };

  // Sample monthly data for charts
  const monthlyData = {
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    revenue: [
      820000000, 750000000, 900000000, 950000000, 880000000, 1050000000,
      1150000000, 1200000000, 1100000000, 1250000000, 1300000000, 1400000000
    ],
    bookings: [
      1200, 1150, 1300, 1350, 1280, 1450,
      1550, 1600, 1500, 1650, 1700, 1800
    ],
    newUsers: [
      250, 220, 280, 300, 270, 320,
      350, 370, 340, 380, 400, 420
    ],
    newHotels: [
      15, 12, 18, 20, 16, 22,
      25, 28, 24, 30, 32, 35
    ]
  };

  // Sample top performing data
  const topHotels = [
    { id: '1', name: 'Vinpearl Resort & Spa', location: 'Nha Trang', bookings: 245, revenue: 612500000 },
    { id: '2', name: 'Metropole Hanoi', location: 'Hà Nội', bookings: 210, revenue: 588000000 },
    { id: '3', name: 'Fusion Maia Resort', location: 'Đà Nẵng', bookings: 180, revenue: 504000000 },
    { id: '4', name: 'Pullman Saigon', location: 'Hồ Chí Minh', bookings: 165, revenue: 462000000 },
    { id: '5', name: 'Amanoi Resort', location: 'Ninh Thuận', bookings: 120, revenue: 420000000 }
  ];

  const topLocations = [
    { name: 'Hồ Chí Minh', bookings: 520, revenue: 1456000000 },
    { name: 'Hà Nội', bookings: 480, revenue: 1344000000 },
    { name: 'Đà Nẵng', bookings: 350, revenue: 980000000 },
    { name: 'Nha Trang', bookings: 320, revenue: 896000000 },
    { name: 'Phú Quốc', bookings: 280, revenue: 784000000 }
  ];

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const getPercentChangeClass = (percentChange: number) => {
    return percentChange >= 0 
      ? 'text-green-600 bg-green-100' 
      : 'text-red-600 bg-red-100';
  };

  const getPercentChangeIcon = (percentChange: number) => {
    return percentChange >= 0 
      ? <ArrowUp size={14} className="mr-1" /> 
      : <ArrowDown size={14} className="mr-1" />;
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'week':
        return 'tuần này';
      case 'month':
        return 'tháng này';
      case 'quarter':
        return 'quý này';
      case 'year':
        return 'năm nay';
      default:
        return 'tháng này';
    }
  };

  const getPreviousTimeRangeLabel = () => {
    switch (timeRange) {
      case 'week':
        return 'tuần trước';
      case 'month':
        return 'tháng trước';
      case 'quarter':
        return 'quý trước';
      case 'year':
        return 'năm trước';
      default:
        return 'tháng trước';
    }
  };

  // This is a simplified chart component for demonstration
  // In a real application, you would use a library like Chart.js or Recharts
  const SimpleBarChart = ({ data, labels, color }: { data: number[], labels: string[], color: string }) => {
    const maxValue = Math.max(...data);
    
    return (
      <div className="flex h-40 items-end space-x-2">
        {data.map((value, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className={`w-full ${color} rounded-t`} 
              style={{ height: `${(value / maxValue) * 100}%` }}
            ></div>
            <div className="text-xs mt-1 text-gray-600">{labels[index]}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 space-y-4 lg:space-y-0">
        <h1 className="text-xl sm:text-2xl font-bold">Thống kê & Phân tích</h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base w-full sm:w-auto"
            >
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="quarter">Quý này</option>
              <option value="year">Năm nay</option>
            </select>
          </div>
          <div className="flex items-center">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={compareWithPrevious}
                onChange={(e) => setCompareWithPrevious(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700 text-sm sm:text-base">So sánh với {getPreviousTimeRangeLabel()}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Revenue */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 col-span-1 sm:col-span-2 lg:col-span-1 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700">Doanh thu</h3>
            <div className="p-2 bg-blue-100 rounded-full">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{formatCurrency(analyticsData.revenue.current)}</p>
              {compareWithPrevious && (
                <div className="flex items-center mt-2">
                  <span className={`text-xs sm:text-sm px-2 py-0.5 rounded-full flex items-center ${getPercentChangeClass(analyticsData.revenue.percentChange)}`}>
                    {getPercentChangeIcon(analyticsData.revenue.percentChange)}
                    {Math.abs(analyticsData.revenue.percentChange).toFixed(1)}%
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500 ml-2">so với {getPreviousTimeRangeLabel()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bookings */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700">Đặt phòng</h3>
            <div className="p-2 bg-green-100 rounded-full">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{analyticsData.bookings.current.toLocaleString()}</p>
              {compareWithPrevious && (
                <div className="flex items-center mt-2">
                  <span className={`text-xs sm:text-sm px-2 py-0.5 rounded-full flex items-center ${getPercentChangeClass(analyticsData.bookings.percentChange)}`}>
                    {getPercentChangeIcon(analyticsData.bookings.percentChange)}
                    {Math.abs(analyticsData.bookings.percentChange).toFixed(1)}%
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500 ml-2">so với {getPreviousTimeRangeLabel()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Users */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700">Người dùng mới</h3>
            <div className="p-2 bg-purple-100 rounded-full">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{analyticsData.users.current.toLocaleString()}</p>
              {compareWithPrevious && (
                <div className="flex items-center mt-2">
                  <span className={`text-xs sm:text-sm px-2 py-0.5 rounded-full flex items-center ${getPercentChangeClass(analyticsData.users.percentChange)}`}>
                    {getPercentChangeIcon(analyticsData.users.percentChange)}
                    {Math.abs(analyticsData.users.percentChange).toFixed(1)}%
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500 ml-2">so với {getPreviousTimeRangeLabel()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hotels */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700">Khách sạn mới</h3>
            <div className="p-2 bg-orange-100 rounded-full">
              <Hotel className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{analyticsData.hotels.current}</p>
              {compareWithPrevious && (
                <div className="flex items-center mt-2">
                  <span className={`text-xs sm:text-sm px-2 py-0.5 rounded-full flex items-center ${getPercentChangeClass(analyticsData.hotels.percentChange)}`}>
                    {getPercentChangeIcon(analyticsData.hotels.percentChange)}
                    {Math.abs(analyticsData.hotels.percentChange).toFixed(1)}%
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500 ml-2">so với {getPreviousTimeRangeLabel()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Average Booking Value */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700">Giá trị đặt phòng TB</h3>
            <div className="p-2 bg-indigo-100 rounded-full">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{formatCurrency(analyticsData.avgBookingValue.current)}</p>
              {compareWithPrevious && (
                <div className="flex items-center mt-2">
                  <span className={`text-xs sm:text-sm px-2 py-0.5 rounded-full flex items-center ${getPercentChangeClass(analyticsData.avgBookingValue.percentChange)}`}>
                    {getPercentChangeIcon(analyticsData.avgBookingValue.percentChange)}
                    {Math.abs(analyticsData.avgBookingValue.percentChange).toFixed(1)}%
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500 ml-2">so với {getPreviousTimeRangeLabel()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700">Tỷ lệ lấp đầy</h3>
            <div className="p-2 bg-teal-100 rounded-full">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-teal-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{analyticsData.occupancyRate.current}%</p>
              {compareWithPrevious && (
                <div className="flex items-center mt-2">
                  <span className={`text-xs sm:text-sm px-2 py-0.5 rounded-full flex items-center ${getPercentChangeClass(analyticsData.occupancyRate.percentChange)}`}>
                    {getPercentChangeIcon(analyticsData.occupancyRate.percentChange)}
                    {Math.abs(analyticsData.occupancyRate.percentChange).toFixed(1)}%
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500 ml-2">so với {getPreviousTimeRangeLabel()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Doanh thu theo tháng</h3>
          <SimpleBarChart 
            data={monthlyData.revenue} 
            labels={monthlyData.labels} 
            color="bg-blue-500" 
          />
        </div>

        {/* Bookings Chart */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Đặt phòng theo tháng</h3>
          <SimpleBarChart 
            data={monthlyData.bookings} 
            labels={monthlyData.labels} 
            color="bg-green-500" 
          />
        </div>

        {/* New Users Chart */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Người dùng mới theo tháng</h3>
          <SimpleBarChart 
            data={monthlyData.newUsers} 
            labels={monthlyData.labels} 
            color="bg-purple-500" 
          />
        </div>

        {/* New Hotels Chart */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Khách sạn mới theo tháng</h3>
          <SimpleBarChart 
            data={monthlyData.newHotels} 
            labels={monthlyData.labels} 
            color="bg-orange-500" 
          />
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Hotels */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Top khách sạn</h3>
          <div className="space-y-3 sm:space-y-4">
            {topHotels.map((hotel, index) => (
              <div key={hotel.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center min-w-0 flex-1">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base truncate">{hotel.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">{hotel.location}</p>
                  </div>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <p className="font-semibold text-sm sm:text-base">{formatCurrency(hotel.revenue)}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{hotel.bookings} đặt phòng</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Locations */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Top địa điểm</h3>
          <div className="space-y-3 sm:space-y-4">
            {topLocations.map((location, index) => (
              <div key={location.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center min-w-0 flex-1">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-sm font-semibold text-green-600">#{index + 1}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base truncate">{location.name}</p>
                  </div>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <p className="font-semibold text-sm sm:text-base">{formatCurrency(location.revenue)}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{location.bookings} đặt phòng</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;

