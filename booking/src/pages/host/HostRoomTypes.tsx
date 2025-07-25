import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, Users, DollarSign, Bed, Building } from 'lucide-react';
import { hostRoomTypeAPI, hotelAPI, RoomTypeResponse } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface Hotel {
  id: string;
  name: string;
}

const HostRoomTypes: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedHotel, setSelectedHotel] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const itemsPerPage = 10;

  const fetchRoomTypes = async (page = 0) => {
    try {
      setLoading(true);
      let response;
      
      if (selectedHotel) {
        response = await hostRoomTypeAPI.getMyHotelRoomTypes(selectedHotel, page, itemsPerPage);
      } else {
        response = await hostRoomTypeAPI.getMyRoomTypes(page, itemsPerPage);
      }
      
      setRoomTypes(response.data.result.content);
      setTotalPages(response.data.result.totalPages);
      setTotalElements(response.data.result.totalElements);
    } catch (error) {
      console.error('Error fetching room types:', error);
      showToast('error', 'Error', 'Failed to load room types');
    } finally {
      setLoading(false);
    }
  };

  const fetchHotels = async () => {
    try {
      const response = await hotelAPI.getMyHotels(0, 100); // Get all hotels
      setHotels(response.data.result.content);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    if (hotels.length > 0) {
      fetchRoomTypes();
    }
  }, [selectedHotel, hotels]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchRoomTypes(page);
  };

  const handleAddRoomType = () => {
    navigate('/host/room-types/add');
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
      setActionLoading(roomTypeId);
      await hostRoomTypeAPI.deleteMyRoomType(roomTypeId);
      showToast('success', 'Success', 'Room type deleted successfully');
      fetchRoomTypes(currentPage);
    } catch (error) {
      console.error('Error deleting room type:', error);
      showToast('error', 'Error', 'Failed to delete room type');
    } finally {
      setActionLoading(null);
    }
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

  if (loading && roomTypes.length === 0) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Room Type Management</h1>
              <p className="mt-2 text-gray-600">
                Total {totalElements} room types
              </p>
            </div>
            <button
              onClick={handleAddRoomType}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Room Type
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Hotel
              </label>
              <select
                value={selectedHotel}
                onChange={(e) => setSelectedHotel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Hotels</option>
                {hotels.map(hotel => (
                  <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Room Types List */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {roomTypes.length === 0 ? (
            <div className="text-center py-12">
              <Bed className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No room types yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first room type.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleAddRoomType}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Room Type
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Room Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hotel
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Capacity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price/Night
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rooms
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {roomTypes.map((roomType) => (
                      <tr key={roomType.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img
                              src={roomType.imageUrl || 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg'}
                              alt={roomType.name}
                              className="h-10 w-10 rounded-lg object-cover mr-3"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg';
                              }}
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {roomType.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {roomType.bedType ? roomType.bedType : 'Not updated'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">{roomType.hotelName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">{roomType.maxOccupancy} guests</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              {formatCurrency(roomType.pricePerNight)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {roomType.availableRooms}/{roomType.totalRooms}
                          </div>
                          <div className="text-xs text-gray-500">Available/Total</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewRoomType(roomType.id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditRoomType(roomType.id)}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRoomType(roomType.id, roomType.name)}
                              disabled={actionLoading === roomType.id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Delete"
                            >
                              {actionLoading === roomType.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages - 1}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">{currentPage * itemsPerPage + 1}</span>
                        {' '}to{' '}
                        <span className="font-medium">
                          {Math.min((currentPage + 1) * itemsPerPage, totalElements)}
                        </span>
                        {' '}of{' '}
                        <span className="font-medium">{totalElements}</span>
                        {' '}results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 0}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                          <button
                            key={i}
                            onClick={() => handlePageChange(i)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              i === currentPage
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages - 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostRoomTypes; 