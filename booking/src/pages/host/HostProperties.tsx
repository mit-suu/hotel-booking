import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash, Eye, Star, MapPin, RefreshCw, ToggleLeft, ToggleRight, Hotel, BedDouble, Users } from 'lucide-react';
import { hotelAPI, HotelResponse } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { getImageProps } from '../../utils/imageUtils';

const HostProperties: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [hotels, setHotels] = useState<HotelResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 12;
  
  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch hotels
  const fetchHotels = async (pageNumber = 0) => {
    try {
      setLoading(pageNumber === 0);
      
      const params = {
        pageNumber,
        pageSize,
        sortBy: 'updatedAt',
        ...(filterStatus !== 'all' && { isActive: filterStatus === 'active' })
      };

      const response = await hotelAPI.getMyHotelsWithFilters(params);
      
      if (response.data.success) {
        const data = response.data.result;
        setHotels(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
        setCurrentPage(data.number);
      }
    } catch (error: any) {
      console.error('Error fetching hotels:', error);
      showToast('error', 'Error', 'Cannot load hotel list');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchHotels(currentPage);
  };

  const handleAddProperty = () => {
    navigate('/host/hotels/add');
  };

  const handleEditProperty = (id: string) => {
    navigate(`/host/hotels/edit/${id}`);
  };

  const handleViewProperty = (id: string) => {
    navigate(`/host/hotels/${id}`);
  };

  const handleDeleteProperty = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa khách sạn "${name}" không?`)) {
      try {
        setActionLoading(id);
        await hotelAPI.deleteMyHotel(id);
        showToast('success', 'Success', 'Hotel deleted successfully');
        await fetchHotels(currentPage);
      } catch (error: any) {
        console.error('Error deleting hotel:', error);
        const errorMessage = error.response?.data?.message || 'Error deleting hotel';
        showToast('error', 'Error', errorMessage);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleToggleStatus = async (id: string, name: string, currentStatus: boolean) => {
    try {
      setActionLoading(id);
      await hotelAPI.toggleMyHotelStatus(id);
      showToast('success', 'Success', 
        `Hotel "${name}" has been ${currentStatus ? 'paused' : 'activated'}`);
      await fetchHotels(currentPage);
    } catch (error: any) {
      console.error('Error toggling hotel status:', error);
      const errorMessage = error.response?.data?.message || 'Error toggling hotel status';
      showToast('error', 'Error', errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchHotels(newPage);
  };

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    setCurrentPage(0);
  };

  useEffect(() => {
    fetchHotels(0);
  }, [filterStatus]);

  // Search filter (client-side for now)
  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = searchTerm === '' || 
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (hotel.city && hotel.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (hotel.address && hotel.address.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>
      : <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Inactive</span>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage hotels</h1>
            <p className="text-gray-600 mt-1">Total {totalElements} hotels</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleAddProperty}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Add hotel
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-gray-700 font-medium">Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Hotels List */}
        {filteredHotels.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Hotel className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hotels yet</h3>
            <p className="text-gray-600 mb-6">Start by adding your first hotel</p>
            <button
              onClick={handleAddProperty}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add hotel
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {filteredHotels.map((hotel) => (
                <div key={hotel.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      {...getImageProps(hotel.imageUrl, 'property', hotel.name)}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      {getStatusBadge(hotel.active)}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1 line-clamp-1">{hotel.name}</h3>
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="line-clamp-1">{hotel.city || hotel.address}</span>
                    </div>
                    
                    {hotel.averageRating && hotel.averageRating > 0 && (
                      <div className="flex items-center mb-3">
                        <div className="flex mr-2">
                          {Array(5).fill(0).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < Math.floor(hotel.averageRating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-gray-700">{hotel.averageRating.toFixed(1)} ({hotel.totalReviews} reviews)</span>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-4 mb-4 text-gray-600 text-sm">
                      <div className="flex items-center">
                        <BedDouble className="h-4 w-4 mr-1" />
                        <span>{hotel.totalRoomTypes || 0} room types</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{hotel.totalRooms || 0} rooms</span>
                      </div>
                    </div>
                    
                    {hotel.pricePerNight && (
                      <div className="mb-4">
                        <span className="text-2xl font-bold text-blue-600">{formatCurrency(hotel.pricePerNight)}</span>
                        <span className="text-gray-600">/night</span>
                      </div>
                    )}
                    
                    {hotel.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{hotel.description}</p>
                    )}
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewProperty(hotel.id)}
                        className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleEditProperty(hotel.id)}
                        className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(hotel.id, hotel.name, hotel.active)}
                        disabled={actionLoading === hotel.id}
                        className={`px-3 py-2 rounded-lg transition-colors flex items-center justify-center ${
                          hotel.active 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        } disabled:opacity-50`}
                      >
                        {actionLoading === hotel.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : hotel.active ? (
                          <ToggleLeft className="h-4 w-4" />
                        ) : (
                          <ToggleRight className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteProperty(hotel.id, hotel.name)}
                        disabled={actionLoading === hotel.id}
                        className="bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center disabled:opacity-50"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-4 py-2 border rounded-lg ${
                      currentPage === i
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HostProperties;
