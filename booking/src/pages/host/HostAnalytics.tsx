import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, TrendingUp, Users, Star, BarChart2, PieChart, Activity, RefreshCw } from 'lucide-react';
import { hostAPI, hotelAPI, HostDashboardResponse, HotelResponse } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const HostAnalytics: React.FC = () => {
  const { showToast } = useToast();
  const [timeRange, setTimeRange] = useState<string>('month');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Analytics data state
  const [analyticsData, setAnalyticsData] = useState({
    totalRevenue: 0,
    bookingsCount: 0,
    occupancyRate: 0,
    averageRating: 0,
    totalHotels: 0,
    activeHotels: 0,
    revenueByMonth: [] as Array<{ month: string; revenue: number }>,
    bookingsBySource: [] as Array<{ source: string; count: number }>,
    recentBookings: [] as Array<{
      id: string;
      guestName: string;
      date: string;
      amount: number;
      property: string;
    }>,
    properties: [] as Array<{ id: string; name: string }>
  });

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Try to get dashboard data first
      try {
        const dashboardResponse = await hostAPI.getDashboard();
        if (dashboardResponse.data.success) {
          const data = dashboardResponse.data.result;
          
          // Transform recentBookings data to match our component interface
          const transformedBookings = data.recentBookings?.map(booking => ({
            id: booking.id,
            guestName: booking.guestName,
            date: booking.checkInDate,
            amount: booking.totalAmount,
            property: booking.hotelName
          })) || [];
          
          setAnalyticsData(prev => ({
            ...prev,
            totalRevenue: data.monthlyRevenue || 0,
            bookingsCount: data.totalBookings || 0,
            occupancyRate: data.occupancyRate || 0,
            averageRating: data.averageRating || 0,
            totalHotels: data.totalHotels || 0,
            activeHotels: data.activeHotels || 0,
            revenueByMonth: data.monthlyRevenueData || [],
            recentBookings: transformedBookings
          }));
          return;
        }
      } catch (error) {
        console.log('Full dashboard API not available, fetching individual stats...');
      }

      // Fallback: Fetch individual statistics
      const [hotelStatsResponse, myHotelsResponse] = await Promise.all([
        hotelAPI.getMyHotelsCount().catch(() => ({ data: { result: 0 } })),
        hotelAPI.getMyActiveHotelsCount().catch(() => ({ data: { result: 0 } }))
      ]);

      // Get my hotels for property filter
      try {
        const hotelsResponse = await hotelAPI.getMyHotels(0, 100, 'name');
        if (hotelsResponse.data.success) {
          const hotels = hotelsResponse.data.result.content;
          setAnalyticsData(prev => ({
            ...prev,
            properties: hotels.map((hotel: HotelResponse) => ({ id: hotel.id, name: hotel.name }))
          }));
        }
      } catch (error) {
        console.log('Error fetching hotels list:', error);
      }

      setAnalyticsData(prev => ({
        ...prev,
        totalHotels: hotelStatsResponse.data.result || 0,
        activeHotels: myHotelsResponse.data.result || 0,
        // Placeholder data for booking/revenue until booking APIs are implemented
        revenueByMonth: [
          { month: 'Tháng 1', revenue: 0 },
          { month: 'Tháng 2', revenue: 0 },
          { month: 'Tháng 3', revenue: 0 },
          { month: 'Tháng 4', revenue: 0 },
          { month: 'Tháng 5', revenue: 0 },
          { month: 'Tháng 6', revenue: 0 },
          { month: 'Tháng 7', revenue: 0 },
          { month: 'Tháng 8', revenue: 0 },
          { month: 'Tháng 9', revenue: 0 },
          { month: 'Tháng 10', revenue: 0 },
          { month: 'Tháng 11', revenue: 0 },
          { month: 'Tháng 12', revenue: 0 }
        ],
        bookingsBySource: [
          { source: 'Website', count: 0 },
          { source: 'Mobile App', count: 0 },
          { source: 'Booking.com', count: 0 },
          { source: 'Agoda', count: 0 }
        ],
        recentBookings: []
      }));

    } catch (error: any) {
      console.error('Error fetching analytics data:', error);
      showToast('error', 'Lỗi', 'Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const maxRevenue = Math.max(...analyticsData.revenueByMonth.map(item => item.revenue), 1);

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

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Thống kê & Phân tích</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="quarter">Quý này</option>
              <option value="year">Năm này</option>
            </select>
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả khách sạn</option>
              {analyticsData.properties.map((property) => (
                <option key={property.id} value={property.id}>{property.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <h3 className="text-2xl font-bold mt-2">{analyticsData.averageRating > 0 ? analyticsData.averageRating.toFixed(1) : '0.0'}</h3>
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
            
            {analyticsData.revenueByMonth.every(item => item.revenue === 0) ? (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Chưa có dữ liệu doanh thu</p>
                  <p className="text-sm">Dữ liệu sẽ hiển thị khi có đặt phòng</p>
                </div>
              </div>
            ) : (
              <div className="h-64">
                <div className="flex h-full items-end">
                  {analyticsData.revenueByMonth.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-colors"
                        style={{ 
                          height: `${(item.revenue / maxRevenue) * 100}%`,
                          maxWidth: '30px',
                          margin: '0 auto',
                          minHeight: item.revenue > 0 ? '4px' : '0px'
                        }}
                        title={`${item.month}: ${formatCurrency(item.revenue)}`}
                      ></div>
                      <div className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-top-left">
                        {item.month}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Sources */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-purple-600" />
                Nguồn đặt phòng
              </h3>
            </div>
            
            {analyticsData.bookingsBySource.every(item => item.count === 0) ? (
              <div className="flex items-center justify-center text-gray-500 h-48">
                <div className="text-center">
                  <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Chưa có dữ liệu đặt phòng</p>
                </div>
              </div>
            ) : (
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
                          width: `${analyticsData.bookingsCount > 0 ? (item.count / analyticsData.bookingsCount) * 100 : 0}%`,
                          backgroundColor: index === 0 ? '#3B82F6' : 
                                          index === 1 ? '#8B5CF6' : 
                                          index === 2 ? '#EC4899' : '#F59E0B'
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
          
          {analyticsData.recentBookings.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có đặt phòng nào</h3>
              <p className="text-gray-600">Đặt phòng gần đây sẽ hiển thị ở đây</p>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default HostAnalytics;
