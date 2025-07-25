import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash, Plus, Star, MapPin, Users, BedDouble, Calendar, DollarSign, Settings, Eye, Check, X, RefreshCw, ToggleLeft, ToggleRight, Award, Phone, Mail, Globe, Clock, Shield, Heart } from 'lucide-react';
import { hotelAPI, HotelResponse, roomTypeAPI, RoomTypeResponse } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface ApiResponse {
  code: number;
  success: boolean;
  message: string;
  result: HotelResponse;
}

const AdminHotelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [hotel, setHotel] = useState<HotelResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [roomTypesLoading, setRoomTypesLoading] = useState(false);

  // Read tab from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, []);

  // Fetch hotel details from API
  const fetchHotelDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await hotelAPI.getAdminHotelById(id);
      const data = response.data as ApiResponse;
      
      if (data.success) {
        setHotel(data.result);
      } else {
        showToast('error', 'Error', data.message || 'Unable to load hotel information');
        navigate('/admin/hotels');
      }
    } catch (error: any) {
      console.error('Error fetching hotel details:', error);
      showToast('error', 'Error', 'Cannot connect to server');
      navigate('/admin/hotels');
    } finally {
      setLoading(false);
    }
  };

  // Fetch room types for this hotel
  const fetchRoomTypes = async () => {
    if (!id) return;
    
    try {
      setRoomTypesLoading(true);
      const response = await roomTypeAPI.getRoomTypesByHotel(id, 0, 50, 'name');
      const data = response.data;
      
      if (data.success) {
        setRoomTypes(data.result.content || []);
      } else {
        showToast('error', 'Error', 'Cannot load room type list');
      }
    } catch (error: any) {
      console.error('Error fetching room types:', error);
      showToast('error', 'Error', 'Cannot connect to server');
    } finally {
      setRoomTypesLoading(false);
    }
  };

  useEffect(() => {
    fetchHotelDetails();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'room-types') {
      fetchRoomTypes();
    }
  }, [activeTab, id]);

  const handleToggleStatus = async () => {
    if (!hotel || !id) return;
    
    try {
      setActionLoading('status');
      await hotelAPI.toggleHotelStatus(id);
              showToast('success', 'Success', 'Hotel status updated successfully');
      fetchHotelDetails();
    } catch (error: any) {
      console.error('Error toggling hotel status:', error);
              showToast('error', 'Error', 'Unable to update hotel status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async () => {
    if (!hotel || !id) return;
    
    try {
      setActionLoading('featured');
      await hotelAPI.toggleHotelFeatured(id);
      showToast('success', 'Success', 'Featured status updated');
      fetchHotelDetails();
    } catch (error: any) {
      console.error('Error toggling featured status:', error);
      showToast('error', 'Error', 'Cannot update featured status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteHotel = async () => {
    if (!hotel || !id) return;
    
          if (window.confirm('Are you sure you want to delete this hotel? This action cannot be undone.')) {
      try {
        setActionLoading('delete');
        await hotelAPI.deleteHotelByAdmin(id);
                  showToast('success', 'Success', 'Hotel deleted successfully');
        navigate('/admin/hotels');
      } catch (error: any) {
        console.error('Error deleting hotel:', error);
                  showToast('error', 'Error', 'Unable to delete hotel');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleToggleRoomTypeStatus = async (roomTypeId: string) => {
    try {
      setActionLoading(`roomtype-${roomTypeId}`);
      await roomTypeAPI.toggleRoomTypeStatus(roomTypeId);
      showToast('success', 'Success', 'Room type status updated');
      fetchRoomTypes();
    } catch (error: any) {
      console.error('Error toggling room type status:', error);
      showToast('error', 'Error', 'Cannot update room type status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteRoomType = async (roomTypeId: string, roomTypeName: string) => {
    if (window.confirm(`Are you  sure you want to delete room type "${roomTypeName}"? This action cannot be undone.`)) {
      try {
        setActionLoading(`delete-roomtype-${roomTypeId}`);
        await roomTypeAPI.deleteRoomType(roomTypeId);
        showToast('success', 'Success', 'Room type deleted');
        fetchRoomTypes();
      } catch (error: any) {
        console.error('Error deleting room type:', error);
        showToast('error', 'Error', 'Cannot delete room type');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <Check size={14} className="mr-1" />
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <X size={14} className="mr-1" />
          Inactive
        </span>
      );
    }
  };

  const getFeaturedBadge = (isFeatured: boolean) => {
    if (isFeatured) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          <Award size={14} className="mr-1" />
          Featured
        </span>
      );
    }
    return null;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Hotel Basic Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{hotel?.name}</h2>
            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <MapPin size={16} className="mr-2" />
                <span>{hotel?.address}</span>
              </div>
              {hotel?.city && hotel?.country && (
                <div className="flex items-center text-gray-600">
                  <span className="ml-6">{hotel.city}, {hotel.country}</span>
                </div>
              )}
              {hotel?.phone && (
                <div className="flex items-center text-gray-600">
                  <Phone size={16} className="mr-2" />
                  <span>{hotel.phone}</span>
                </div>
              )}
              {hotel?.email && (
                <div className="flex items-center text-gray-600">
                  <Mail size={16} className="mr-2" />
                  <span>{hotel.email}</span>
                </div>
              )}
              {hotel?.website && (
                <div className="flex items-center text-gray-600">
                  <Globe size={16} className="mr-2" />
                  <a href={hotel.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {hotel.website}
                  </a>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-2">
              {getStatusBadge(hotel?.active || false)}
              {getFeaturedBadge(hotel?.featured || false)}
            </div>
            {hotel?.starRating && (
              <div className="flex items-center">
                {[...Array(hotel.starRating)].map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400 fill-current" />
                ))}
                <span className="ml-2 text-sm text-gray-600">{hotel.starRating} sao</span>
              </div>
            )}
            {hotel?.averageRating && (
              <div className="flex items-center">
                <Star size={16} className="text-yellow-400 fill-current mr-1" />
                <span className="font-medium">{hotel.averageRating.toFixed(1)}</span>
                <span className="text-gray-500 ml-1">({hotel.totalReviews || 0} đánh giá)</span>
              </div>
            )}
          </div>
        </div>

        {/* Hotel Image */}
        {hotel?.imageUrl && (
          <div className="mb-6">
            <img
              src={hotel.imageUrl}
              alt={hotel.name}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Description */}
        {hotel?.description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{hotel.description}</p>
          </div>
        )}

        {/* Pricing */}
        {hotel?.pricePerNight && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Basic price</h3>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(hotel.pricePerNight)}/đêm
            </div>
          </div>
        )}

        {/* Check-in/Check-out Times */}
        {(hotel?.checkInTime || hotel?.checkOutTime) && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Check-in/Check-out time</h3>
            <div className="grid grid-cols-2 gap-4">
              {hotel.checkInTime && (
                <div className="flex items-center">
                  <Clock size={16} className="mr-2 text-gray-400" />
                  <span className="text-gray-600">Check-in: {hotel.checkInTime}</span>
                </div>
              )}
              {hotel.checkOutTime && (
                <div className="flex items-center">
                  <Clock size={16} className="mr-2 text-gray-400" />
                  <span className="text-gray-600">Check-out: {hotel.checkOutTime}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Amenities */}
        {hotel?.amenities && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {hotel.amenities.split(',').map((amenity, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {amenity.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Policies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hotel?.cancellationPolicy && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <Shield size={16} className="mr-2" />
                Cancellation policy
              </h3>
              <p className="text-gray-600">{hotel.cancellationPolicy}</p>
            </div>
          )}
          {hotel?.petPolicy && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <Heart size={16} className="mr-2" />
                Pet policy
              </h3>
              <p className="text-gray-600">{hotel.petPolicy}</p>
            </div>
          )}
        </div>
      </div>

      {/* Owner Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Owner information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Owner name</label>
            <p className="mt-1 text-gray-900">{hotel?.ownerName || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-gray-900">{hotel?.ownerEmail || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
        
        {/* Room Statistics */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Room statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{hotel?.totalRoomTypes || 0}</div>
              <div className="text-sm text-gray-600">Room type</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{hotel?.totalRooms || 0}</div>
              <div className="text-sm text-gray-600">Total rooms</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{hotel?.availableRooms || 0}</div>
              <div className="text-sm text-gray-600">Empty rooms</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {(hotel?.totalRooms || 0) - (hotel?.availableRooms || 0)}
              </div>
              <div className="text-sm text-gray-600">Booked rooms</div>
            </div>
          </div>
        </div>
 

        
      </div>

      {/* System Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Created date</label>
            <p className="mt-1 text-gray-900">{formatDate(hotel?.createdAt || '')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Updated date</label>
            <p className="mt-1 text-gray-900">{formatDate(hotel?.updatedAt || '')}</p>
          </div>
          {hotel?.createdBy && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Created by</label>
              <p className="mt-1 text-gray-900">{hotel.createdBy}</p>
            </div>
          )}
          {hotel?.updatedBy && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Updated by</label>
              <p className="mt-1 text-gray-900">{hotel.updatedBy}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderRoomTypes = () => (
    <div className="space-y-4">
      {/* Add Room Type Button */}
      

      {roomTypesLoading ? (
        <div className="text-center py-8">
          <RefreshCw className="animate-spin h-8 w-8 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Loading room type list...</p>
        </div>
      ) : roomTypes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No room type found</p>
          <button
            onClick={() => navigate(`/admin/room-types/add?hotelId=${hotel?.id}`)}
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <Plus size={16} className="mr-1" />
            Add room type
          </button>
        </div>
      ) : (
        roomTypes.map((roomType) => (
          <div key={roomType.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Room Type Image */}
            {roomType.imageUrl && (
              <div className="h-48 overflow-hidden">
                <img
                  src={roomType.imageUrl}
                  alt={roomType.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-4">
              {/* Room Type Name */}
              <div className="mb-2">
                <h4 className="text-lg font-semibold text-gray-900">{roomType.name}</h4>
              </div>

              {/* Description */}
              {roomType.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{roomType.description}</p>
              )}

              {/* Room Details */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-gray-600">
                  <Users size={16} className="mr-2" />
                  <span className="text-sm">{roomType.maxOccupancy} people</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <BedDouble size={16} className="mr-2" />
                  <span className="text-sm">{roomType.bedType || 'N/A'}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Calendar size={16} className="mr-2" />
                  <span className="text-sm">{roomType.totalRooms} phòng</span>
                </div>

                <div className="flex items-center text-green-600">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  <span className="text-sm">{roomType.availableRooms} empty</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">Price per night:</span>
                <span className="text-lg font-semibold text-blue-600">
                  {formatCurrency(roomType.pricePerNight)}
                </span>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => navigate(`/admin/room-types/${roomType.id}`)}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <Eye size={16} className="mr-1" />
                  View
                </button>
                <button
                  onClick={() => navigate(`/admin/room-types/edit/${roomType.id}`)}
                  className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-200 transition-colors flex items-center justify-center"
                >
                  <Edit size={16} className="mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteRoomType(roomType.id, roomType.name)}
                  disabled={actionLoading === `delete-roomtype-${roomType.id}`}
                  className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="animate-spin mr-2" size={24} />
          <span>Loading hotel details...</span>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="w-full">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Hotel not found</h2>
          <p className="text-gray-600 mb-4">The hotel may have been deleted or does not exist.</p>
          <button
            onClick={() => navigate('/admin/hotels')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to list
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/admin/hotels')}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Hotel Detail</h1>
            <p className="text-gray-600 mt-1">{hotel.name}</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleToggleStatus}
            disabled={actionLoading === 'status'}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50 ${
              hotel.active 
                ? 'bg-orange-600 text-white hover:bg-orange-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {hotel.active ? <ToggleRight size={20} className="mr-2" /> : <ToggleLeft size={20} className="mr-2" />}
            {actionLoading === 'status' ? 'Updating...' : (hotel.active ? 'Disable' : 'Enable')}
          </button>
          
          <button
            onClick={handleToggleFeatured}
            disabled={actionLoading === 'featured'}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50 ${
              hotel.featured 
                ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            <Award size={20} className="mr-2" />  
            {actionLoading === 'featured' ? 'Updating...' : (hotel.featured ? 'Unfeatured' : 'Featured')}
          </button>
          
          <button
            onClick={() => navigate(`/admin/hotels/edit/${hotel.id}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Edit size={20} className="mr-2" />
                          Edit
          </button>
          
          <button
            onClick={handleDeleteHotel}
            disabled={actionLoading === 'delete'}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
          >
            <Trash size={20} className="mr-2" />
                          {actionLoading === 'delete' ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('room-types')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'room-types'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
                Room types
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'room-types' && renderRoomTypes()}
    </div>
  );
};

export default AdminHotelDetail; 