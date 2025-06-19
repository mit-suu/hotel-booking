import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hotel, BookOpen, DollarSign, Star, RefreshCw, TrendingUp } from 'lucide-react';
import { hostAPI, hotelAPI, HostDashboardResponse } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const HostDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [dashboardData, setDashboardData] = useState<HostDashboardResponse>({
    totalHotels: 0,
    activeHotels: 0,
    totalRoomTypes: 0,
    totalBookings: 0,
    monthlyRevenue: 0,
    averageRating: 0,
    occupancyRate: 0,
    totalReviews: 0,
    pendingBookings: 0,
    confirmedBookings: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Try to get full dashboard data first, fallback to individual API calls
      try {
        const dashboardResponse = await hostAPI.getDashboard();
        if (dashboardResponse.data.success) {
          setDashboardData(dashboardResponse.data.result);
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

      setDashboardData(prev => ({
        ...prev,
        totalHotels: hotelStatsResponse.data.result || 0,
        activeHotels: myHotelsResponse.data.result || 0,
        // For now, use placeholder values for booking/revenue data
        // These will be replaced when booking APIs are implemented
        totalBookings: 0,
        monthlyRevenue: 0,
        averageRating: 0,
        occupancyRate: 0,
        totalReviews: 0,
        pendingBookings: 0,
        confirmedBookings: 0
      }));

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      showToast('error', 'Lỗi', 'Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const stats = [
    { 
      label: 'Tổng khách sạn', 
      value: dashboardData.totalHotels.toString(), 
      icon: Hotel,
      color: 'blue',
      trend: dashboardData.totalHotels > 0 ? '+100%' : '0%'
    },
    { 
      label: 'Đặt phòng tháng này', 
      value: dashboardData.totalBookings.toString(), 
      icon: BookOpen,
      color: 'green',
      trend: dashboardData.totalBookings > 0 ? '+8.2%' : '0%'
    },
    { 
      label: 'Doanh thu tháng này', 
      value: formatCurrency(dashboardData.monthlyRevenue), 
      icon: DollarSign,
      color: 'yellow',
      trend: dashboardData.monthlyRevenue > 0 ? '+12.5%' : '0%'
    },
    { 
      label: 'Đánh giá trung bình', 
      value: dashboardData.averageRating > 0 ? dashboardData.averageRating.toFixed(1) : '0.0', 
      icon: Star,
      color: 'purple',
      trend: dashboardData.averageRating > 0 ? '+0.2' : '0%'
    },
  ];

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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Quản lý</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">{stat.label}</p>
                    <h3 className="text-2xl font-bold mt-2 text-gray-900">{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-full ${
                    stat.color === 'blue' ? 'bg-blue-100' :
                    stat.color === 'green' ? 'bg-green-100' :
                    stat.color === 'yellow' ? 'bg-yellow-100' :
                    'bg-purple-100'
                  }`}>
                    <Icon className={`h-6 w-6 ${
                      stat.color === 'blue' ? 'text-blue-600' :
                      stat.color === 'green' ? 'text-green-600' :
                      stat.color === 'yellow' ? 'text-yellow-600' :
                      'text-purple-600'
                    }`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">{stat.trend}</span>
                  <span className="text-gray-500 ml-1">so với tháng trước</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Trạng thái khách sạn</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Đang hoạt động</span>
                <span className="text-green-600 font-medium">{dashboardData.activeHotels}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tạm ngừng</span>
                <span className="text-red-600 font-medium">{dashboardData.totalHotels - dashboardData.activeHotels}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tổng loại phòng</span>
                <span className="text-blue-600 font-medium">{dashboardData.totalRoomTypes}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Đặt phòng</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Chờ xác nhận</span>
                <span className="text-yellow-600 font-medium">{dashboardData.pendingBookings}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Đã xác nhận</span>
                <span className="text-green-600 font-medium">{dashboardData.confirmedBookings}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tỷ lệ lấp đầy</span>
                <span className="text-blue-600 font-medium">{dashboardData.occupancyRate}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Đánh giá</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tổng đánh giá</span>
                <span className="text-gray-900 font-medium">{dashboardData.totalReviews}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Điểm trung bình</span>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-gray-900 font-medium">
                    {dashboardData.averageRating > 0 ? dashboardData.averageRating.toFixed(1) : '0.0'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ManagementCard
            title="Quản lý khách sạn"
            description="Quản lý danh sách và thông tin khách sạn"
            icon={<Hotel className="h-6 w-6" />}
            onClick={() => navigate('/host/hotels')}
            stats={`${dashboardData.totalHotels} khách sạn`}
          />
          <ManagementCard
            title="Quản lý đặt phòng"
            description="Xem và quản lý đơn đặt phòng từ khách"
            icon={<BookOpen className="h-6 w-6" />}
            onClick={() => navigate('/host/bookings')}
            stats={`${dashboardData.totalBookings} đặt phòng`}
          />
          <ManagementCard
            title="Thống kê doanh thu"
            description="Theo dõi thu nhập và hiệu suất kinh doanh"
            icon={<DollarSign className="h-6 w-6" />}
            onClick={() => navigate('/host/analytics')}
            stats={formatCurrency(dashboardData.monthlyRevenue)}
          />
        </div>
      </div>
    </div>
  );
};

interface ManagementCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  stats?: string;
}

const ManagementCard: React.FC<ManagementCardProps> = ({
  title,
  description,
  icon,
  onClick,
  stats
}) => {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 text-left transition-all hover:shadow-lg hover:scale-105 group"
    >
      <div className="flex items-center mb-4">
        <div className="bg-blue-100 p-3 rounded-full mr-4 group-hover:bg-blue-200 transition-colors">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {stats && <p className="text-sm text-blue-600 font-medium">{stats}</p>}
        </div>
      </div>
      <p className="text-gray-600">{description}</p>
    </button>
  );
};

export default HostDashboard;
