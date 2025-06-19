import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Hotel, BookOpen, Settings, Star, BarChart2, Tag, RefreshCw, TrendingUp, Award, CheckCircle, BedDouble } from 'lucide-react';
import { adminAPI, AdminDashboardResponse } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [stats, setStats] = useState<AdminDashboardResponse>({
    totalHotels: 0,
    activeHotels: 0,
    inactiveHotels: 0,
    featuredHotels: 0,
    totalRoomTypes: 0,
    totalReviews: 0,
    approvedReviews: 0,
    pendingReviews: 0,
    verifiedReviews: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      const response = await adminAPI.getDashboard();
      if (response.data.success) {
        setStats(response.data.result);
      } else {
        throw new Error('Failed to fetch dashboard stats');
      }
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      showToast('error', 'Error', 'Unable to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleRefresh = () => {
    fetchDashboardStats();
  };

  const dashboardStats = [
    { 
      label: 'Total Users', 
      value: stats.totalUsers.toLocaleString(), 
      icon: Users,
      color: 'blue',
      description: 'Total registered users'
    },
    { 
      label: 'Total Hotels', 
      value: stats.totalHotels.toLocaleString(), 
      icon: Hotel,
      color: 'green',
      description: 'Total hotels in the system'
    },
    { 
      label: 'Active Hotels', 
      value: stats.activeHotels.toLocaleString(), 
      icon: CheckCircle,
      color: 'emerald',
      description: 'Number of active hotels'
    },
    { 
      label: 'Featured Hotels', 
      value: stats.featuredHotels.toLocaleString(), 
      icon: Award,
      color: 'yellow',
      description: 'Number of featured hotels'
    },
    { 
      label: 'Total Room Types', 
      value: stats.totalRoomTypes.toLocaleString(), 
      icon: BedDouble,
      color: 'indigo',
      description: 'Total room types in the system'
    },
    { 
      label: 'Total Reviews', 
      value: stats.totalReviews.toLocaleString(), 
      icon: Star,
      color: 'orange',
      description: 'Total reviews from customers'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { bg: string; text: string; icon: string } } = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500' },
      green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-500' },
      emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'text-emerald-500' },
      yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', icon: 'text-yellow-500' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-500' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'text-orange-500' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: 'text-indigo-500' },
      teal: { bg: 'bg-teal-50', text: 'text-teal-600', icon: 'text-teal-500' }
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
                      <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Hotel management system overview</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
        >
          <RefreshCw size={20} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon;
          const colors = getColorClasses(stat.color);
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${colors.bg}`}>
                  <Icon className={`h-6 w-6 ${colors.icon}`} />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <h3 className={`text-2xl font-bold ${colors.text}`}>
                    {loading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : (
                      stat.value
                    )}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-gray-600">{stat.description}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Stats Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp size={20} className="mr-2 text-blue-500" />
          Quick Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats.totalHotels > 0 ? Math.round((stats.activeHotels / stats.totalHotels) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Active hotels rate</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.totalHotels > 0 ? Math.round((stats.featuredHotels / stats.totalHotels) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Featured hotels rate</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalReviews && stats.totalHotels > 0 ? Math.round(stats.totalReviews / stats.totalHotels) : 0}
            </div>
            <div className="text-sm text-gray-600">Average reviews/hotel</div>
          </div>
         
        </div>
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <ManagementCard
          title="User Management"
          description="Manage user accounts and permissions"
          icon={<Users className="h-5 w-5 sm:h-6 sm:w-6" />}
          onClick={() => navigate('/admin/users')}
          stats={`${stats.totalUsers.toLocaleString()} users`}
        />
        <ManagementCard
          title="Hotel Management"
          description="Manage hotel list and information"
          icon={<Hotel className="h-5 w-5 sm:h-6 sm:w-6" />}
          onClick={() => navigate('/admin/hotels')}
          stats={`${stats.totalHotels.toLocaleString()} hotels`}
        />
        <ManagementCard
          title="Room Type Management"
          description="Manage room types and configurations"
          icon={<BedDouble className="h-5 w-5 sm:h-6 sm:w-6" />}
          onClick={() => navigate('/admin/room-types')}
          stats={`${stats.totalRoomTypes.toLocaleString()} room types`}
        />
        <ManagementCard
          title="Booking Management"
          description="View and manage booking orders"
          icon={<BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />}
          onClick={() => navigate('/admin/bookings')}
          stats={`${stats.totalReviews.toLocaleString()} bookings`}
        />
        <ManagementCard
          title="Review Management"
          description="Approve and manage user reviews"
          icon={<Star className="h-5 w-5 sm:h-6 sm:w-6" />}
          onClick={() => navigate('/admin/reviews')}
          stats={`${stats.totalReviews.toLocaleString()} reviews`}
        />
        <ManagementCard
          title="Statistics & Analytics"
          description="View reports and system statistics"
          icon={<BarChart2 className="h-5 w-5 sm:h-6 sm:w-6" />}
          onClick={() => navigate('/admin/analytics')}
          stats="Detailed reports"
        /> 
        <ManagementCard
          title="Promotion Management"
          description="Create and manage promotion codes"
          icon={<Tag className="h-5 w-5 sm:h-6 sm:w-6" />}
          onClick={() => navigate('/admin/promotions')}
          stats="Promotion codes"
        />
        <ManagementCard
          title="System Settings"
          description="Configure system settings"
          icon={<Settings className="h-5 w-5 sm:h-6 sm:w-6" />}
          onClick={() => navigate('/admin/settings')}
          stats="Configuration"
        />
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
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 text-left transition-all hover:shadow-md hover:border-blue-200 group"
    >
      <div className="flex items-center mb-3 sm:mb-4">
        <div className="bg-blue-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 group-hover:bg-blue-200 transition-colors">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-semibold group-hover:text-blue-600 transition-colors">{title}</h3>
          {stats && (
            <p className="text-sm text-blue-600 font-medium">{stats}</p>
          )}
        </div>
      </div>
      <p className="text-sm sm:text-base text-gray-600">{description}</p>
    </button>
  );
};

export default AdminDashboard;

