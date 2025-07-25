import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Trash, BedDouble, Users, DollarSign, 
  Image, Hotel as HotelIcon, Calendar, User
} from 'lucide-react';
import { roomTypeAPI, RoomTypeResponse } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const AdminRoomTypeDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [roomType, setRoomType] = useState<RoomTypeResponse | null>(null);

  useEffect(() => {
    if (id) {
      fetchRoomType();
    }
  }, [id]);

  const fetchRoomType = async () => {
    try {
      setLoading(true);
      const response = await roomTypeAPI.getRoomTypeById(id!);
      const data = response.data;
      if (data.success) {
        setRoomType(data.result);
      } else {
        showToast('error', 'Error', data.message || 'Cannot load room type information');
        navigate('/admin/room-types');
      }
    } catch (error: any) {
      console.error('Error fetching room type:', error);
      showToast('error', 'Error', 'Cannot load room type information');
      navigate('/admin/room-types');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRoomType = () => {
    navigate(`/admin/room-types/edit/${id}`);
  };

  const handleDeleteRoomType = async () => {
    if (!roomType) return;
    
          if (window.confirm(`Are you sure you want to delete room type "${roomType.name}"?`)) {
      try {
        setActionLoading('delete');
        await roomTypeAPI.deleteRoomType(roomType.id);
                    showToast('success', 'Success', 'Room type deleted successfully');
        navigate('/admin/room-types');
      } catch (error: any) {
        console.error('Error deleting room type:', error);
                  showToast('error', 'Error', 'Unable to delete room type');
      } finally {
        setActionLoading(null);
      }
    }
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getBedTypeText = (bedType: string) => {
    const bedTypes: Record<string, string> = {
      'Single': 'Single Bed',
      'Double': 'Double Bed',
      'Queen': 'Queen Bed',
      'King': 'King Bed',
      'Twin': 'Twin Beds',
      'Sofa Bed': 'Sofa Bed'
    };
    return bedTypes[bedType] || bedType;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!roomType) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Room type not found</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/admin/room-types')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{roomType.name}</h1>
            <p className="text-gray-600">{roomType.hotelName}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleEditRoomType}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Edit size={20} className="mr-2" />
                          Edit
          </button>
          <button
            onClick={handleDeleteRoomType}
            disabled={actionLoading === 'delete'}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
          >
            <Trash size={20} className="mr-2" />
                          {actionLoading === 'delete' ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <BedDouble size={20} className="mr-2 text-blue-500" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Type Name</label>
                <p className="text-gray-900 font-medium">{roomType.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bed Type</label>
                <p className="text-gray-900">{roomType.bedType ? getBedTypeText(roomType.bedType) : 'Unspecified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Occupancy</label>
                <div className="flex items-center">
                  <Users size={16} className="text-gray-400 mr-2" />
                  <span className="text-gray-900">{roomType.maxOccupancy} people</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Size</label>
                <p className="text-gray-900">{roomType.roomSize ? `${roomType.roomSize} m²` : 'Unspecified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price per Night</label>
                <div className="flex items-center">
                  <DollarSign size={16} className="text-gray-400 mr-2" />
                  <span className="text-gray-900 font-semibold">{formatCurrency(roomType.pricePerNight)}</span>
                </div>
              </div>
            </div>
            {roomType.description && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <p className="text-gray-900 leading-relaxed">{roomType.description}</p>
              </div>
            )}
          </div>

          {/* Room Availability */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <BedDouble size={20} className="mr-2 text-green-500" />
              Room Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{roomType.totalRooms}</div>
                <div className="text-sm text-blue-700">Total Rooms</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{roomType.availableRooms}</div>
                <div className="text-sm text-green-700">Available Rooms</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{roomType.totalRooms - roomType.availableRooms}</div>
                <div className="text-sm text-orange-700">Occupied Rooms</div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          {roomType.amenities && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Image size={20} className="mr-2 text-purple-500" />
                Room Amenities
              </h2>
              <div className="flex flex-wrap gap-2">
                {roomType.amenities.split(',').map((amenity, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {amenity.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Image */}
          {roomType.imageUrl && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <img
                src={roomType.imageUrl}
                alt={roomType.name}
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Hotel Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <HotelIcon size={20} className="mr-2 text-indigo-500" />
              Hotel Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name</label>
                <p className="text-gray-900">{roomType.hotelName}</p>
              </div>
              <button
                onClick={() => navigate(`/admin/hotels/${roomType.hotelId}`)}
                className="w-full bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors text-sm"
              >
                View Hotel Information
              </button>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar size={20} className="mr-2 text-gray-500" />
              System Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
                <p className="text-gray-900 text-sm">{formatDate(roomType.createdAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                <p className="text-gray-900 text-sm">{formatDate(roomType.updatedAt)}</p>
              </div>
              {roomType.createdBy && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                  <div className="flex items-center">
                    <User size={16} className="text-gray-400 mr-2" />
                    <span className="text-gray-900 text-sm">{roomType.createdBy}</span>
                  </div>
                </div>
              )}
              {roomType.updatedBy && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Updated By</label>
                  <div className="flex items-center">
                    <User size={16} className="text-gray-400 mr-2" />
                    <span className="text-gray-900 text-sm">{roomType.updatedBy}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/admin/room-types/add?hotelId=${roomType.hotelId}`)}
                className="w-full bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm"
              >
                Add New Room Type for This Hotel
              </button>
              <button
                onClick={() => navigate('/admin/room-types')}
                className="w-full bg-gray-50 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                Return to Room Type List
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRoomTypeDetail; 