import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Hotel, MapPin, Phone, Mail, Globe, Star, Clock, DollarSign, Users, Edit, ArrowLeft, Plus, Bed, Eye, Trash2 } from 'lucide-react';
import { hotelAPI, hostRoomTypeAPI, HotelResponse, RoomTypeResponse } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency } from '../../utils/format';

const HostHotelDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();
  const [hotel, setHotel] = useState<HotelResponse | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomTypesLoading, setRoomTypesLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchHotel();
      fetchRoomTypes();
    }
  }, [id]);

  const fetchHotel = async () => {
    try {
      setLoading(true);
      const response = await hotelAPI.getMyHotelById(id!);
      setHotel(response.data.result);
    } catch (error: any) {
      console.error('Error fetching hotel:', error);
      showToast('error', 'Error', 'Unable to load hotel information');
      navigate('/host/hotels');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomTypes = async () => {
    try {
      setRoomTypesLoading(true);
      const response = await hostRoomTypeAPI.getMyHotelRoomTypes(id!);
      setRoomTypes(response.data.result.content || []);
    } catch (error: any) {
      console.error('Error fetching room types:', error);
      // Don't show error toast for room types as it's not critical
    } finally {
      setRoomTypesLoading(false);
    }
  };

  const handleEditHotel = () => {
    navigate(`/host/hotels/edit/${id}`);
  };

  const handleAddRoomType = () => {
    navigate(`/host/room-types/add?hotelId=${id}`);
  };

  const handleViewRoomType = (roomTypeId: string) => {
    navigate(`/host/room-types/${roomTypeId}`);
  };

  const handleEditRoomType = (roomTypeId: string) => {
    navigate(`/host/room-types/edit/${roomTypeId}`);
  };

  const handleDeleteRoomType = async (roomTypeId: string, roomTypeName: string) => {
    if (!confirm(`Are you sure you want to delete room type "${roomTypeName}"?`)) {
      return;
    }

    try {
      setDeleteLoading(roomTypeId);
      await hostRoomTypeAPI.deleteMyRoomType(roomTypeId);
      showToast('success', 'Success', 'Room type deleted successfully');
      fetchRoomTypes(); // Refresh room types list
    } catch (error) {
      console.error('Error deleting room type:', error);
      showToast('error', 'Error', 'Error deleting room type');
    } finally {
      setDeleteLoading(null);
    }
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
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading hotel information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">Hotel information not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/host/hotels')}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">{hotel.name}</h1>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleAddRoomType}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Add Room Type
          </button>
          <button
            onClick={handleEditHotel}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Edit size={20} className="mr-2" />
            Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Hotel className="mr-2" />
              Basic Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-gray-600">{hotel.address}</p>
                  {(hotel.city || hotel.country) && (
                    <p className="text-gray-600">{[hotel.city, hotel.country].filter(Boolean).join(', ')}</p>
                  )}
                </div>
              </div>
              {hotel.description && (
                <div>
                  <p className="font-medium">Description</p>
                  <p className="text-gray-600 mt-1">{hotel.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Phone className="mr-2" />
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hotel.phone && (
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium">Phone Number</p>
                    <p className="text-gray-600">{hotel.phone}</p>
                  </div>
                </div>
              )}
              {hotel.email && (
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">{hotel.email}</p>
                  </div>
                </div>
              )}
              {hotel.website && (
                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium">Website</p>
                    <p className="text-gray-600">{hotel.website}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Policies */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Policies</h2>
            <div className="space-y-4">
              {hotel.cancellationPolicy && (
                <div>
                  <p className="font-medium">Cancellation Policy</p>
                  <p className="text-gray-600 mt-1">{hotel.cancellationPolicy}</p>
                </div>
              )}
              {hotel.petPolicy && (
                <div>
                  <p className="font-medium">Pet Policy</p>
                  <p className="text-gray-600 mt-1">{hotel.petPolicy}</p>
                </div>
              )}
            </div>
          </div>

          {/* Room Types */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Bed className="mr-2" />
                Room Types ({roomTypes.length})
              </h2>
              <button
                onClick={handleAddRoomType}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
              >
                <Plus size={16} className="mr-1" />
                Add Room Type
              </button>
            </div>
            
            {roomTypesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading room types...</p>
              </div>
            ) : roomTypes.length === 0 ? (
              <div className="text-center py-8">
                <Bed className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No room types yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating the first room type for this hotel.
                </p>
                <div className="mt-4">
                  <button
                    onClick={handleAddRoomType}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Room Type
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {roomTypes.map((roomType) => (
                  <div key={roomType.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start space-x-4">
                        <img
                          src={roomType.imageUrl || 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg'}
                          alt={roomType.name}
                          className="w-16 h-16 rounded-lg object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg';
                          }}
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{roomType.name}</h3>
                          <div className="mt-1 space-y-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="h-4 w-4 mr-1" />
                              <span>{roomType.maxOccupancy} guests</span>
                              {roomType.bedType && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>{getBedTypeText(roomType.bedType)}</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <DollarSign className="h-4 w-4 mr-1" />
                              <span className="font-medium">{formatCurrency(roomType.pricePerNight)}/night</span>
                              <span className="mx-2">•</span>
                              <span>{roomType.totalRooms} rooms</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewRoomType(roomType.id)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditRoomType(roomType.id)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRoomType(roomType.id, roomType.name)}
                          disabled={deleteLoading === roomType.id}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete"
                        >
                          {deleteLoading === roomType.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-2" />
                  <span>Star Rating</span>
                </div>
                <span className="font-medium">{hotel.starRating} star{(hotel.starRating || 0) > 1 ? 's' : ''}</span>
              </div> 
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-green-500 mr-2" />
                  <span>Price from</span>
                </div>
                <span className="font-medium">{formatCurrency(hotel.pricePerNight || 0)}/night</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-purple-500 mr-2" />
                  <span>Check-in</span>
                </div>
                <span className="font-medium">{hotel.checkInTime || '--:--'}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-purple-500 mr-2" />
                  <span>Check-out</span>
                </div>
                <span className="font-medium">{hotel.checkOutTime || '--:--'}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-orange-500 mr-2" />
                  <span>Commission Rate</span>
                </div>
                <span className="font-medium">{hotel.commissionRate || 15}%</span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Active</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  hotel.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {hotel.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Featured</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  hotel.featured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {hotel.featured ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default HostHotelDetail; 