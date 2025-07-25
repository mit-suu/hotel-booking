import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Percent, Building, User, Check, X, Edit, Save } from 'lucide-react';
import { getHotelsForCommissionManagement, updateHotelCommissionRate } from '../../services/api';

interface Hotel {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  commissionRate: number;
  active: boolean;
  featured: boolean;
  pricePerNight: number;
  createdAt: string;
  updatedAt: string;
}

const AdminCommissions: React.FC = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCommissionHotelId, setEditingCommissionHotelId] = useState<string | null>(null);
  const [newCommissionRate, setNewCommissionRate] = useState<number>(15);

  // Fetch hotels data
  useEffect(() => {
    fetchHotels();
  }, [currentPage]);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await getHotelsForCommissionManagement({
        pageNumber: currentPage - 1,
        pageSize: 10,
        sortBy: 'name'
      });
      
      if (response.success) {
        setHotels(response.result.content);
      }
    } catch (error) {
      console.error('Failed to fetch hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter hotels based on search term and status
  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = 
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.country.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && hotel.active) ||
      (statusFilter === 'inactive' && !hotel.active) ||
      (statusFilter === 'featured' && hotel.featured);
    
    return matchesSearch && matchesStatus;
  });

  const handleEditCommissionRate = (hotelId: string) => {
    const hotel = hotels.find(h => h.id === hotelId);
    if (hotel) {
      setEditingCommissionHotelId(hotelId);
      setNewCommissionRate(hotel.commissionRate);
    }
  };

  const handleSaveCommissionRate = async () => {
    if (editingCommissionHotelId) {
      try {
        const response = await updateHotelCommissionRate(editingCommissionHotelId, newCommissionRate);
        
        if (response.success) {
          // Update local state
          setHotels(prev => prev.map(hotel => 
            hotel.id === editingCommissionHotelId 
              ? { ...hotel, commissionRate: newCommissionRate }
              : hotel
          ));
          
          setEditingCommissionHotelId(null);
          setNewCommissionRate(15);
          
          // Show success message
          alert(`Commission rate updated to ${newCommissionRate}%`);
        }
      } catch (error) {
        console.error('Failed to update commission rate:', error);
        alert('An error occurred while updating the commission rate');
      }
    }
  };

  const handleCancelCommissionEdit = () => {
    setEditingCommissionHotelId(null);
    setNewCommissionRate(15);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Hotel Commission Rate Management</h1>
          <p className="text-gray-600 mt-1">Update commission rates for each hotel (default: 15%)</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by hotel name, owner, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="featured">Featured</option>
            </select>
          </div>
        </div>
      </div>

      {/* Hotels Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hotel
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission Rate
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHotels.map((hotel) => (
                <tr key={hotel.id} className={`hover:bg-gray-50 ${hotel.featured ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building className="h-5 w-5 text-blue-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{hotel.name}</div>
                        {hotel.featured && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User size={14} className="mr-1" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{hotel.ownerName}</div>
                        <div className="text-sm text-gray-500">{hotel.ownerEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{hotel.city}, {hotel.country}</div>
                    <div className="text-sm text-gray-500">{hotel.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingCommissionHotelId === hotel.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={newCommissionRate}
                          onChange={(e) => setNewCommissionRate(parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                        <span className="text-sm text-gray-500">%</span>
                        <button
                          onClick={handleSaveCommissionRate}
                          className="text-green-600 hover:text-green-900"
                          title="Save"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={handleCancelCommissionEdit}
                          className="text-red-600 hover:text-red-900"
                          title="Cancel"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Percent size={16} className="text-gray-500 mr-1" />
                        <span className="text-sm font-medium text-gray-900">{hotel.commissionRate}%</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      hotel.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {hotel.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {editingCommissionHotelId !== hotel.id && (
                        <button
                          onClick={() => handleEditCommissionRate(hotel.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit commission rate"
                        >
                          <Edit size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredHotels.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No hotels found
          </h3>
          <p className="text-gray-600">
            No hotels match your search criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminCommissions;

