import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Hotel, Star, MapPin, Phone, Mail, Globe, Users, DollarSign, Edit, Trash, Eye, AlertCircle } from 'lucide-react';
import { hotelAPI, HotelResponse } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency } from '../../utils/format';
import { getImageProps } from '../../utils/imageUtils';

const HostHotels: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [hotels, setHotels] = useState<HotelResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchHotels();
  }, [currentPage]);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await hotelAPI.getMyHotels(currentPage, 10);
      setHotels(response.data.result.content);
      setTotalPages(response.data.result.totalPages);
      setTotalElements(response.data.result.totalElements);
    } catch (error: any) {
      console.error('Error fetching hotels:', error);
              showToast('error', 'Error', 'Cannot load hotel list');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHotels();
  };

  const handleAddHotel = () => {
    navigate('/host/hotels/add');
  };

  const handleViewHotel = (id: string) => {
    navigate(`/host/hotels/${id}`);
  };

  const handleEditHotel = (id: string) => {
    navigate(`/host/hotels/edit/${id}`);
  };

  const handleDeleteHotel = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this hotel?')) {
      return;
    }

    try {
      await hotelAPI.deleteMyHotel(id);
      showToast('success', 'Success', 'Hotel deleted successfully');
      fetchHotels();
    } catch (error: any) {
      console.error('Error deleting hotel:', error);
      showToast('error', 'Error', 'Cannot delete hotel when it has bookings');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Manage hotels</h1>
          <button
            onClick={handleAddHotel}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <Plus size={20} className="mr-2" />
            Add hotel
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search hotels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Hotels List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading hotel list...</p>
          </div>
        ) : hotels.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">You don't have any hotel</p>
            <button
              onClick={handleAddHotel}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Add your first hotel
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map(hotel => (
              <div key={hotel.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Hotel Image */}
                <div className="relative h-48">
                  <img
                    {...getImageProps(hotel.imageUrl, 'hotel', hotel.name)}
                    className="w-full h-full object-cover"
                  />
                  {hotel.featured && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-sm font-medium">
                      Featured
                    </div>
                  )}
                </div>

                {/* Hotel Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{hotel.name}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin size={16} className="mr-2" />
                      <span className="text-sm truncate">{hotel.address}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Star size={16} className="mr-2 text-yellow-500" />
                      <span className="text-sm">{hotel.starRating} stars</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign size={16} className="mr-2" />
                      <span className="text-sm">From {formatCurrency(hotel.pricePerNight || 0)}/night</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      hotel.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {hotel.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleViewHotel(hotel.id)}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                      title="View details"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() => handleEditHotel(hotel.id)}
                      className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                      title="Edit"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteHotel(hotel.id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage === totalPages - 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                  Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostHotels; 