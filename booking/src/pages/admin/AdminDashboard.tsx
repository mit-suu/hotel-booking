import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Hotel, BookOpen, Settings, Star, BarChart2, Tag,
  TrendingUp, Award, CheckCircle, BedDouble, DollarSign, 
  Filter, Calendar, MapPin, Trophy, Percent
} from 'lucide-react';
import { adminAPI, AdminDashboardResponse, AdminAnalyticsResponse, revenueAPI, RevenueStatsResponse } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  // Dashboard stats state
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
  
  // Commission stats state
  const [commissionStats, setCommissionStats] = useState<RevenueStatsResponse | null>(null);
  
  // Analytics state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AdminAnalyticsResponse | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Initialize date range on component mount
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);

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

  // Fetch commission statistics with date range
  const fetchCommissionStats = async () => {
    try {
      const response = await revenueAPI.getRevenueStats(startDate, endDate);
      if (response.success) {
        setCommissionStats(response.result);
      } else {
        throw new Error('Failed to fetch commission stats');
      }
    } catch (error: any) {
      console.error('Error fetching commission stats:', error);
      showToast('error', 'Error', 'Unable to load commission statistics');
    }
  };

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      setAnalyticsLoading(true);
      
      const response = await adminAPI.getAnalytics(startDate, endDate);
      if (response.data.success) {
        setAnalyticsData(response.data.result);
      } else {
        throw new Error('Failed to fetch analytics data');
      }
    } catch (error: any) {
      console.error('Error fetching analytics data:', error);
      showToast('error', 'Error', 'Unable to load analytics data');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchAnalyticsData();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchCommissionStats();
      fetchAnalyticsData();
    }
  }, [startDate, endDate]);

  const handleRefresh = () => {
    fetchDashboardStats();
    if (startDate && endDate) {
      fetchCommissionStats();
    }
    fetchAnalyticsData();
  };

  const handleDateFilter = () => {
    if (!startDate || !endDate) {
      showToast('warning', 'Warning', 'Please select both start date and end date');
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      showToast('error', 'Error', 'Start date cannot be greater than end date');
      return;
    }
    
    fetchCommissionStats();
    fetchAnalyticsData();
    showToast('success', 'Success', `Applied filter from ${startDate} to ${endDate}`);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  // Basic stats from API
  const basicStats = [
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
      label: 'Total Room', 
      value: stats.totalRoomTypes.toLocaleString(), 
      icon: BedDouble,
      color: 'indigo',
      description: 'Total room in the system'
    },
    { 
      label: 'Total Reviews', 
      value: stats.totalReviews.toLocaleString(), 
      icon: Star,
      color: 'orange',
      description: 'Total reviews from customers'
    }
  ];

  // Advanced analytics stats
  const advancedStats = [
    {
      label: 'Revenue',
      value: analyticsData ? formatCurrency(analyticsData.totalRevenue) : '0đ',
      icon: DollarSign,
      color: 'blue',
      description: `Total revenue from bookings`,
      span: 'col-span-1 sm:col-span-2'
    },
    {
      label: 'Bookings',
      value: analyticsData ? analyticsData.totalBookings.toLocaleString() : '0',
      icon: BookOpen,
      color: 'green',
      description: `Total number of bookings`
    }, 
    {
      label: 'Avg Booking Value',
      value: analyticsData ? formatCurrency(analyticsData.averageBookingValue) : '0đ',
      icon: TrendingUp,
      color: 'indigo',
      description: `Average value per booking`,
      span: 'col-span-1 sm:col-span-2'
    },
    {
      label: 'Commission',
      value: commissionStats ? formatCurrency(commissionStats.totalCommissionRevenue) : '0đ',
      icon: Percent,
      color: 'purple',
      description: `Total commission earned by the system`
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
      teal: { bg: 'bg-teal-50', text: 'text-teal-600', icon: 'text-teal-500' },
      red: { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-500' }
    };
    return colorMap[color] || colorMap.blue;
  };

  // Enhanced chart component with tooltips and better styling
  const EnhancedBarChart = ({ data, labels, color, title, formatValue }: { 
    data: number[], 
    labels: string[], 
    color: string,
    title: string,
    formatValue?: (value: number) => string
  }) => {
    const maxValue = Math.max(...data, 1); // Avoid division by zero
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    
    return (
      <div className="relative">
        <div className="flex h-48 items-end space-x-1 px-2">
          {data.map((value, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center flex-1 relative group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip */}
              {hoveredIndex === index && (
                <div className="absolute bottom-full mb-2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap z-10 shadow-lg">
                  <div className="font-semibold">{labels[index]}</div>
                  <div>{formatValue ? formatValue(value) : value.toLocaleString()}</div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
              )}
              
              {/* Bar */}
              <div 
                className={`w-full ${color} rounded-t-lg transition-all duration-300 hover:opacity-90 cursor-pointer shadow-sm`} 
                style={{ 
                  height: `${Math.max((value / maxValue) * 100, 2)}%`,
                  minHeight: value > 0 ? '4px' : '0px'
                }}
              >
                {/* Value label on top of bar */}
                {value > 0 && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatValue ? formatValue(value) : value}
                  </div>
                )}
              </div>
              
              {/* Month label */}
              <div className="text-xs mt-2 text-gray-600 font-medium">{labels[index]}</div>
            </div>
          ))}
        </div>
        
                {/* Chart title and stats */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Total:</span>
            <span className="font-semibold text-gray-900">
              {formatValue ? formatValue(data.reduce((a, b) => a + b, 0)) : data.reduce((a, b) => a + b, 0).toLocaleString()}
            </span>
          </div>
        </div>

        
    </div>
  );
};

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Hotel management system overview</p>
        </div>
      </div>

      {/* Basic Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
        {basicStats.map((stat, index) => {
          const Icon = stat.icon;
          const colors = getColorClasses(stat.color);
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${colors.bg}`}>
                  <Icon className={`h-6 w-6 ${colors.icon}`} />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
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

                {/* Advanced Analytics */}
          <div className="space-y-6">
          {/* Analytics Overview */}
      

          {/* Date Range Filter */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Filter className="h-5 w-5 mr-2 text-blue-500" />
                Analytics Filter
              </h2>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">From:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">To:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                
                <button
                  onClick={handleDateFilter}
                  disabled={analyticsLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {analyticsLoading ? 'Loading...' : 'Apply'}
                </button>
              </div>
            </div>
            
            {/* Quick Date Filters */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700 mr-2">Quick filters:</span>
              <button
                onClick={() => {
                  const today = new Date();
                  const weekAgo = new Date();
                  weekAgo.setDate(today.getDate() - 7);
                  const startDateStr = weekAgo.toISOString().split('T')[0];
                  const endDateStr = today.toISOString().split('T')[0];
                  setStartDate(startDateStr);
                  setEndDate(endDateStr);
                }}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
              >
                Last 7 days
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  const monthAgo = new Date();
                  monthAgo.setDate(today.getDate() - 30);
                  const startDateStr = monthAgo.toISOString().split('T')[0];
                  const endDateStr = today.toISOString().split('T')[0];
                  setStartDate(startDateStr);
                  setEndDate(endDateStr);
                }}
                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
              >
                Last 30 days
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  const quarterAgo = new Date();
                  quarterAgo.setDate(today.getDate() - 90);
                  const startDateStr = quarterAgo.toISOString().split('T')[0];
                  const endDateStr = today.toISOString().split('T')[0];
                  setStartDate(startDateStr);
                  setEndDate(endDateStr);
                }}
                className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
              >
                Last 3 months
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  const yearAgo = new Date();
                  yearAgo.setFullYear(today.getFullYear() - 1);
                  const startDateStr = yearAgo.toISOString().split('T')[0];
                  const endDateStr = today.toISOString().split('T')[0];
                  setStartDate(startDateStr);
                  setEndDate(endDateStr);
                }}
                className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors"
              >
                Last 1 year
              </button>
            </div>
          </div>

          {/* Advanced Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
            {advancedStats.map((stat, index) => {
              const Icon = stat.icon;
              const colors = getColorClasses(stat.color);
              return (
                <div key={index} className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 ${stat.span || ''}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${colors.bg}`}>
                      <Icon className={`h-6 w-6 ${colors.icon}`} />
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                      <h3 className={`text-2xl font-bold ${colors.text}`}>{stat.value}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{stat.description}</p>
                </div>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                  Monthly Revenue
                </h3>
                {analyticsLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                )}
              </div>
              {analyticsLoading ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="animate-pulse space-y-2 w-full">
                    <div className="flex space-x-2 h-32 items-end">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-gray-200 rounded flex-1" style={{height: `${Math.random() * 80 + 20}%`}}></div>
                      ))}
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  </div>
                </div>
              ) : (
                <EnhancedBarChart 
                  data={analyticsData?.monthlyRevenue.map(item => Number(item.value)) || []} 
                  labels={analyticsData?.monthlyRevenue.map(item => item.month) || []} 
                  color="bg-gradient-to-t from-blue-400 to-blue-600"
                  title="Monthly Revenue"
                  formatValue={formatCurrency}
                />
              )}
            </div>

            {/* Bookings Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-green-500" />
                  Monthly Bookings
                </h3>
                {analyticsLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent"></div>
                )}
              </div>
              {analyticsLoading ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="animate-pulse space-y-2 w-full">
                    <div className="flex space-x-2 h-32 items-end">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-gray-200 rounded flex-1" style={{height: `${Math.random() * 80 + 20}%`}}></div>
                      ))}
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  </div>
                </div>
              ) : (
                <EnhancedBarChart 
                  data={analyticsData?.monthlyBookings.map(item => Number(item.value)) || []} 
                  labels={analyticsData?.monthlyBookings.map(item => item.month) || []} 
                  color="bg-gradient-to-t from-green-400 to-green-600"
                  title="Monthly Bookings"
                  formatValue={(value) => value.toLocaleString() + ' bookings'}
                />
              )}
            </div>

            {/* New Users Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-500" />
                  New Users Monthly
                </h3>
                {analyticsLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
                )}
              </div>
              {analyticsLoading ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="animate-pulse space-y-2 w-full">
                    <div className="flex space-x-2 h-32 items-end">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-gray-200 rounded flex-1" style={{height: `${Math.random() * 80 + 20}%`}}></div>
                      ))}
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  </div>
                </div>
              ) : (
                <EnhancedBarChart 
                  data={analyticsData?.monthlyNewUsers.map(item => Number(item.value)) || []} 
                  labels={analyticsData?.monthlyNewUsers.map(item => item.month) || []} 
                  color="bg-gradient-to-t from-purple-400 to-purple-600"
                  title="New Users Monthly"
                  formatValue={(value) => value.toLocaleString() + ' users'}
                />
              )}
            </div>
          </div>

          {/* Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Hotels */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                  Top Hotels
                </h3>
                {analyticsLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-500 border-t-transparent"></div>
                )}
              </div>
              {analyticsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {(analyticsData?.topHotels || []).length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No hotel data available for the selected period</p>
                    </div>
                  ) : (
                    (analyticsData?.topHotels || []).map((hotel, index) => (
                      <div key={hotel.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-blue-50 hover:to-blue-100 transition-all duration-200 cursor-pointer group">
                        <div className="flex items-center min-w-0 flex-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 transition-transform group-hover:scale-110 ${
                            index === 0 ? 'bg-yellow-100 text-yellow-600' :
                            index === 1 ? 'bg-gray-100 text-gray-600' :
                            index === 2 ? 'bg-orange-100 text-orange-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            <span className="text-sm font-bold">#{index + 1}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{hotel.name}</p>
                            <p className="text-sm text-gray-500 truncate flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {hotel.location}
                            </p>
                          </div>
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                          <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{formatCurrency(hotel.revenue)}</p>
                          <p className="text-sm text-gray-500">{hotel.bookings} bookings</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Top Cities by Hotel Count */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-green-500" />
                  Top Cities by Hotel Count
                </h3>
                {analyticsLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent"></div>
                )}
              </div>
              {analyticsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="h-4 bg-gray-200 rounded flex-1"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {(analyticsData?.topLocations || []).length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No city data available</p>
                    </div>
                  ) : (
                    (analyticsData?.topLocations || []).map((location, index) => (
                    <div key={location.name} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-green-50 hover:to-green-100 transition-all duration-200 cursor-pointer group">
                      <div className="flex items-center min-w-0 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 transition-transform group-hover:scale-110 ${
                          index === 0 ? 'bg-yellow-100 text-yellow-600' :
                          index === 1 ? 'bg-gray-100 text-gray-600' :
                          index === 2 ? 'bg-orange-100 text-orange-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          <span className="text-sm font-bold">#{index + 1}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 truncate group-hover:text-green-600 transition-colors">{location.name}</p>
                          <p className="text-sm text-gray-500 truncate">City with most hotels</p>
                        </div>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <p className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">{location.hotelCount} hotels</p>
                        <p className="text-sm text-gray-500">Total properties</p>
                      </div>
                    </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 border-t border-gray-200 pt-6">
          <p>
            Dashboard last updated: {new Date().toLocaleString()} | 
            <span className="ml-1">
              {analyticsData ? 'Data loaded successfully' : 'Loading data...'}
            </span>
          </p>
          <p className="mt-1">
            Hotel Booking Management System - Admin Dashboard v1.0
          </p>
        </div>
    </div>
  );
};

export default AdminDashboard;

