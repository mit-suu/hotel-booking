import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash, Eye, MapPin, Star, Filter, Check, X, Calendar, BedDouble, Users, Hotel as HotelIcon, RefreshCw, ToggleLeft, ToggleRight, Award } from 'lucide-react';
import { hotelAPI, HotelResponse } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface ApiResponse {
  code: number;
  success: boolean;
  message: string;
  result: {
    content: HotelResponse[];
    totalElements: number;
    totalPages: number;
    pageSize: number;
    pageNumber: number;
    isLastPage: boolean;
  };
}

const AdminHotels: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [hotels, setHotels] = useState<HotelResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [starRatingFilter, setStarRatingFilter] = useState<number | undefined>();
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>();
  const [featuredFilter, setFeaturedFilter] = useState<boolean | undefined>();
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedHotels, setSelectedHotels] = useState<string[]>([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [inactiveHotels, setInactiveHotels] = useState<HotelResponse[]>([]);
  const [inactiveLoading, setInactiveLoading] = useState(true);

  const itemsPerPage = 10;

  // Fetch inactive hotels for approval
  const fetchInactiveHotels = async () => {
    try {
      setInactiveLoading(true);
      const response = await hotelAPI.getAdminHotelsWithFilters({
        pageNumber: 0,
        pageSize: 50,
        sortBy: 'createdAt',
        isActive: false
      });
      
      const data = response.data as ApiResponse;
      if (data.success) {
        setInactiveHotels(data.result.content);
      }
    } catch (error: any) {
      console.error('Error fetching inactive hotels:', error);
    } finally {
      setInactiveLoading(false);
    }
  };

  // Fetch hotels from API
  const fetchHotels = async (page = 0, size = itemsPerPage, sortBy = 'createdAt') => {
    try {
      setLoading(true);
      
      // Build filter params
      const filterParams: any = {
        pageNumber: page,
        pageSize: size,
        sortBy
      };

      if (cityFilter) filterParams.city = cityFilter;
      if (countryFilter) filterParams.country = countryFilter;
      if (starRatingFilter !== undefined) filterParams.starRating = starRatingFilter;
      if (statusFilter !== undefined) filterParams.isActive = statusFilter;
      if (featuredFilter !== undefined) filterParams.isFeatured = featuredFilter;
      if (minPrice !== undefined) filterParams.minPrice = minPrice;
      if (maxPrice !== undefined) filterParams.maxPrice = maxPrice;

      console.log('🔍 Filter params:', filterParams);

      let response;
      if (searchTerm) {
        console.log('🔍 Using search API with term:', searchTerm);
        response = await hotelAPI.searchHotels(searchTerm, page, size, sortBy);
      } else if (Object.keys(filterParams).length > 3) { // More than just pagination params
        console.log('🔍 Using admin filter API');
        response = await hotelAPI.getAdminHotelsWithFilters(filterParams);
      } else {
        console.log('🔍 Using admin get all API');
        response = await hotelAPI.getAdminHotels(page, size, sortBy);
      }

      console.log('📡 API Response:', response.data);
      const data = response.data as ApiResponse;
      
      if (data.success) {
        console.log('✅ Hotels loaded:', data.result.content.length);
        setHotels(data.result.content);
        setTotalPages(data.result.totalPages);
        setTotalElements(data.result.totalElements);
        setCurrentPage(data.result.pageNumber);
      } else {
        console.error('❌ API Error:', data.message);
        showToast('error', 'Error', data.message || 'Unable to load hotel list');
      }
    } catch (error: any) {
      console.error('💥 Error fetching hotels:', error);
              showToast('error', 'Error', 'Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
    fetchInactiveHotels();
  }, [searchTerm, cityFilter, countryFilter, starRatingFilter, statusFilter, featuredFilter, minPrice, maxPrice]);

  const handleRefresh = () => {
    fetchHotels(currentPage);
    fetchInactiveHotels();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchHotels(page);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedHotels([]);
    } else {
      setSelectedHotels(hotels.map(hotel => hotel.id));
    }
    setIsSelectAll(!isSelectAll);
  };

  const handleSelectHotel = (hotelId: string) => {
    if (selectedHotels.includes(hotelId)) {
      setSelectedHotels(selectedHotels.filter(id => id !== hotelId));
    } else {
      setSelectedHotels([...selectedHotels, hotelId]);
    }
  };

  const handleAddHotel = () => {
    navigate('/admin/hotels/add');
  };

  const handleEditHotel = (hotelId: string) => {
    console.log('🔧 Navigating to edit hotel:', hotelId);
    navigate(`/admin/hotels/edit/${hotelId}`);
  };

  const handleViewHotel = (hotelId: string) => {
    console.log('👁️ Navigating to view hotel:', hotelId);
    navigate(`/admin/hotels/${hotelId}`);
  };

  const handleDeleteHotel = async (hotelId: string) => {
          if (window.confirm('Are you sure you want to delete this hotel?')) {
      try {
        setActionLoading(hotelId);
        await hotelAPI.deleteHotelByAdmin(hotelId);
                  showToast('success', 'Success', 'Hotel deleted successfully');
        fetchHotels(currentPage);
      } catch (error: any) {
        console.error('Error deleting hotel:', error);
                  showToast('error', 'Error', 'Unable to delete hotel');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedHotels.length === 0) return;
    
          if (window.confirm(`Are you sure you want to delete ${selectedHotels.length} selected hotels?`)) {
      try {
        setActionLoading('bulk-delete');
        await Promise.all(selectedHotels.map(id => hotelAPI.deleteHotelByAdmin(id)));
                  showToast('success', 'Success', `${selectedHotels.length} hotels deleted successfully`);
        setSelectedHotels([]);
        setIsSelectAll(false);
        fetchHotels(currentPage);
      } catch (error: any) {
        console.error('Error deleting hotels:', error);
                  showToast('error', 'Error', 'Unable to delete some hotels');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleToggleStatus = async (hotelId: string) => {
    try {
      setActionLoading(hotelId);
      console.log('🔄 Toggling status for hotel:', hotelId);
      
      const response = await hotelAPI.toggleHotelStatus(hotelId);
      console.log('✅ Toggle status response:', response.data);
      
      showToast('success', 'Success', 'Hotel status updated successfully');
      
      // Reset any status filter to ensure updated hotel appears
      if (statusFilter !== undefined) {
        console.log('🔄 Clearing status filter to show updated hotel');
        setStatusFilter(undefined);
      }
      
      fetchHotels(currentPage);
    } catch (error: any) {
      console.error('💥 Error toggling hotel status:', error);
              showToast('error', 'Error', 'Unable to update hotel status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async (hotelId: string) => {
    try {
      setActionLoading(hotelId);
      console.log('🔄 Toggling featured for hotel:', hotelId);
      
      const response = await hotelAPI.toggleHotelFeatured(hotelId);
      console.log('✅ Toggle featured response:', response.data);
      
      showToast('success', 'Success', 'Featured status updated successfully');
      
      // Reset any featured filter to ensure updated hotel appears
      if (featuredFilter !== undefined) {
        console.log('🔄 Clearing featured filter to show updated hotel');
        setFeaturedFilter(undefined);
      }
      
      fetchHotels(currentPage);
    } catch (error: any) {
      console.error('💥 Error toggling featured status:', error);
              showToast('error', 'Error', 'Unable to update featured status');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (active: boolean) => {
    if (active) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Check size={12} className="mr-1" />
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <X size={12} className="mr-1" />
          Inactive
        </span>
      );
    }
  };

  const getFeaturedBadge = (featured: boolean) => {
    if (featured) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Award size={12} className="mr-1" /> 
        </span>
      );
    }
    return null;
  };

  const clearFilters = () => {
    setCityFilter('');
    setCountryFilter('');
    setStarRatingFilter(undefined);
    setStatusFilter(undefined);
    setFeaturedFilter(undefined);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSearchTerm('');
  };

  const handleApproveHotel = async (hotelId: string) => {
    try {
      setActionLoading(hotelId);
      await hotelAPI.toggleHotelStatus(hotelId);
      showToast('success', 'Success', 'Hotel approved and activated successfully');
      fetchInactiveHotels();
      fetchHotels(currentPage);
    } catch (error: any) {
      console.error('Error approving hotel:', error);
      showToast('error', 'Error', 'Unable to approve hotel');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteInactiveHotel = async (hotelId: string) => {
    if (window.confirm('Are you sure you want to delete this pending hotel?')) {
      try {
        setActionLoading(hotelId);
        await hotelAPI.deleteHotelByAdmin(hotelId);
        showToast('success', 'Success', 'Hotel deleted successfully');
        fetchInactiveHotels();
      } catch (error: any) {
        console.error('Error deleting hotel:', error);
        showToast('error', 'Error', 'Unable to delete hotel');
      } finally {
        setActionLoading(null);
      }
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Hotel Management</h1>
          <p className="text-gray-600 mt-1">Total {totalElements} hotels</p>
        </div>
        {/* <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center disabled:opacity-50"
          >
            <RefreshCw size={20} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                          Refresh
          </button> 
          <button
            onClick={handleAddHotel}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus size={20} className="mr-2" />
                          Add Hotel
          </button>
        </div> */}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by hotel name, address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
          >
            <Filter size={20} className="mr-2" />
                          Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thành phố</label>
                <input
                  type="text"
                  placeholder="Nhập thành phố"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quốc gia</label>
                <input
                  type="text"
                  placeholder="Nhập quốc gia"
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Star Rating</label>
                <select
                  value={starRatingFilter || ''}
                  onChange={(e) => setStarRatingFilter(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  <option value="1">1 star</option>
                  <option value="2">2 stars</option>
                  <option value="3">3 stars</option>
                  <option value="4">4 stars</option>
                  <option value="5">5 stars</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter === undefined ? '' : statusFilter.toString()}
                  onChange={(e) => setStatusFilter(e.target.value === '' ? undefined : e.target.value === 'true')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              
              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Featured</label>
                <select
                  value={featuredFilter === undefined ? '' : featuredFilter.toString()}
                  onChange={(e) => setFeaturedFilter(e.target.value === '' ? undefined : e.target.value === 'true')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  <option value="true">Featured</option>
                  <option value="false">Not Featured</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                <input
                  type="number"
                  placeholder="VND"
                  value={minPrice || ''}
                  onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                <input
                  type="number"
                  placeholder="VND"
                  value={maxPrice || ''}
                  onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pending Hotels Approval Table */}
      {inactiveHotels.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-orange-200 mb-6 overflow-hidden">
          <div className="bg-orange-50 px-6 py-4 border-b border-orange-200">
            <h3 className="text-lg font-semibold text-orange-800 flex items-center">
              <HotelIcon size={20} className="mr-2" />
              Pending Hotel Approvals ({inactiveHotels.length})
            </h3>
            <p className="text-sm text-orange-600 mt-1">Hotels waiting for approval to be activated</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hotel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inactiveLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <div className="flex justify-center items-center">
                        <RefreshCw className="animate-spin mr-2" size={20} />
                        Loading pending hotels...
                      </div>
                    </td>
                  </tr>
                ) : (
                  inactiveHotels.map((hotel) => (
                    <tr key={hotel.id} className="hover:bg-orange-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={hotel.imageUrl || 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg'}
                              alt={hotel.name}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg';
                              }}
                            />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{hotel.name}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              {hotel.starRating && (
                                <div className="flex items-center">
                                  {[...Array(hotel.starRating)].map((_, i) => (
                                    <Star key={i} size={12} className="text-yellow-400 fill-current" />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <MapPin size={14} className="mr-1 text-gray-400" />
                          {hotel.city && hotel.country ? `${hotel.city}, ${hotel.country}` : hotel.address}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{hotel.ownerName || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{hotel.ownerEmail || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Calendar size={14} className="mr-1 text-gray-400" />
                          {hotel.createdAt ? formatDate(hotel.createdAt) : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewHotel(hotel.id)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors flex items-center"
                            title="View Details"
                          >
                            <Eye size={14} className="mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => handleApproveHotel(hotel.id)}
                            disabled={actionLoading === hotel.id}
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                          >
                            <Check size={14} className="mr-1" />
                            {actionLoading === hotel.id ? 'Approving...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleDeleteInactiveHotel(hotel.id)}
                            disabled={actionLoading === hotel.id}
                            className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
                          >
                            <Trash size={14} className="mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedHotels.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              Selected {selectedHotels.length} hotels
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handleDeleteSelected}
                disabled={actionLoading === 'bulk-delete'}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
              >
                <Trash size={16} className="mr-2" />
                {actionLoading === 'bulk-delete' ? 'Deleting...' : 'Delete Selected'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hotels Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <HotelIcon size={20} className="mr-2" />
            Active Hotels ({totalElements})
          </h3>
          <p className="text-sm text-gray-600 mt-1">Approved and active hotels in the system</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={isSelectAll}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hotel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price/night
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th> 
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
                      <RefreshCw className="animate-spin mr-2" size={20} />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : hotels.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    No hotels found
                  </td>
                </tr>
              ) : (
                hotels.map((hotel) => (
                  <tr key={hotel.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedHotels.includes(hotel.id)}
                        onChange={() => handleSelectHotel(hotel.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={hotel.imageUrl || 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg'}
                            alt={hotel.name}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg';
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{hotel.name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            {hotel.starRating && (
                              <div className="flex items-center mr-2">
                                {[...Array(hotel.starRating)].map((_, i) => (
                                  <Star key={i} size={12} className="text-yellow-400 fill-current" />
                                ))}
                              </div>
                            )}
                            {getFeaturedBadge(hotel.featured)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <MapPin size={14} className="mr-1 text-gray-400" />
                        {hotel.city && hotel.country ? `${hotel.city}, ${hotel.country}` : hotel.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{hotel.ownerName || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{hotel.ownerEmail || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(hotel.pricePerNight)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star size={14} className="text-yellow-400 fill-current mr-1" />
                        <span className="text-sm text-gray-900">
                          {hotel.averageRating ? hotel.averageRating.toFixed(1) : 'N/A'}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          ({hotel.totalReviews || 0})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {getStatusBadge(hotel.active)}
                      </div>
                    </td> 
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewHotel(hotel.id)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditHotel(hotel.id)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(hotel.id)}
                          disabled={actionLoading === hotel.id}
                          className={`p-1 rounded ${hotel.active ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                          title={hotel.active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        >
                          {hotel.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(hotel.id)}
                          disabled={actionLoading === hotel.id}
                          className={`p-1 rounded ${hotel.featured ? 'text-yellow-600 hover:text-yellow-900' : 'text-gray-600 hover:text-gray-900'}`}
                          title={hotel.featured ? 'Bỏ nổi bật' : 'Đặt nổi bật'}
                        >
                          <Award size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteHotel(hotel.id)}
                          disabled={actionLoading === hotel.id}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Xóa"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === 0
                    ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
                    : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Trước
              </button>
              <button
                onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === totalPages - 1
                    ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
                    : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Sau
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{currentPage * itemsPerPage + 1}</span> đến{' '}
                  <span className="font-medium">
                    {Math.min((currentPage + 1) * itemsPerPage, totalElements)}
                  </span>{' '}
                  trong tổng số <span className="font-medium">{totalElements}</span> khách sạn
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === 0
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Trang trước</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (currentPage < 3) {
                      pageNum = i;
                    } else if (currentPage > totalPages - 4) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === totalPages - 1
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
      </div>
    </div>
  );
};

export default AdminHotels;

