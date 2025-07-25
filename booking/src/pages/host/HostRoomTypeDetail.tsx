import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Users, DollarSign, Bed, Home, Building, Calendar, Tag } from 'lucide-react';
import { hostRoomTypeAPI, RoomTypeResponse } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const HostRoomTypeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [roomType, setRoomType] = useState<RoomTypeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRoomType();
    }
  }, [id]);

  const fetchRoomType = async () => {
    try {
      setLoading(true);
      const response = await hostRoomTypeAPI.getMyRoomTypeById(id!);
      setRoomType(response.data.result);
    } catch (error) {
      console.error('Error fetching room type:', error);
      showToast('error', 'Failed to load room type information');
      navigate('/host/room-types');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/host/room-types/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!roomType) return;

    if (!confirm(`Are you sure you want to delete room type "${roomType.name}"?`)) {
      return;
    }

    try {
      setDeleteLoading(true);
      await hostRoomTypeAPI.deleteMyRoomType(id!);
      showToast('success', 'Room type deleted successfully');
      navigate('/host/room-types');
    } catch (error) {
      console.error('Error deleting room type:', error);
      showToast('error', 'Failed to delete room type');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!roomType) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Room type not found</h2>
            <p className="mt-2 text-gray-600">The room type does not exist or you do not have access permission.</p>
            <button
              onClick={() => navigate('/host/room-types')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/host/room-types')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{roomType.name}</h1>
                <p className="mt-2 text-gray-600">Room type details</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleEdit}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            {roomType.imageUrl && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <img
                  src={roomType.imageUrl}
                  alt={roomType.name}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <Bed className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room type name</label>
                  <p className="text-gray-900">{roomType.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bed type</label>
                  <p className="text-gray-900">{roomType.bedType ? getBedTypeText(roomType.bedType) : 'Not updated'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max occupancy</label>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">{roomType.maxOccupancy} people</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room size</label>
                  <div className="flex items-center">
                    <Home className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">{roomType.roomSize ? `${roomType.roomSize} m²` : 'Not updated'}</p>
                  </div>
                </div>
              </div>

              {roomType.description && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{roomType.description}</p>
                </div>
              )}
            </div>

            {/* Amenities */}
            {roomType.amenities && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <Tag className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Amenities</h2>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {roomType.amenities.split(',').map((amenity, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
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
            {/* Hotel Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                  <Building className="h-5 w-5 text-yellow-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Hotel</h2>
              </div>
              <p className="text-gray-900 font-medium">{roomType.hotelName}</p>
            </div>

            {/* Pricing & Availability */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Price & Availability</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price per night</label>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(roomType.pricePerNight)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total rooms</label>
                  <div className="flex justify-between">
                    <span className="text-gray-900">Total:</span>
                    <span className="font-medium">{roomType.totalRooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-900">Available:</span>
                    <span className="font-medium text-green-600">{roomType.availableRooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-900">Booked:</span>
                    <span className="font-medium text-orange-600">{roomType.totalRooms - roomType.availableRooms}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Audit Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-gray-100 rounded-lg mr-3">
                  <Calendar className="h-5 w-5 text-gray-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Audit Information</h2>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created date:</span>
                  <span className="text-gray-900">{formatDate(roomType.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last updated:</span>
                  <span className="text-gray-900">{formatDate(roomType.updatedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ID:</span>
                  <span className="text-gray-900 text-xs font-mono">{roomType.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostRoomTypeDetail; 