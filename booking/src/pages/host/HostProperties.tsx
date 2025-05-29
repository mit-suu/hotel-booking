import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash, Eye, Star, MapPin, Home, BedDouble, Bath, Wifi, Coffee } from 'lucide-react';

interface Property {
  id: string;
  name: string;
  type: string;
  location: string;
  address: string;
  description: string;
  price: number;
  rating: number;
  reviewCount: number;
  rooms: number;
  bathrooms: number;
  amenities: string[];
  status: 'active' | 'pending' | 'inactive';
  image: string;
}

const HostProperties: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([
    {
      id: '1',
      name: 'Vinpearl Resort & Spa',
      type: 'Resort',
      location: 'Nha Trang',
      address: '78 Trần Phú, Lộc Thọ, Nha Trang, Khánh Hòa',
      description: 'Khu nghỉ dưỡng sang trọng với view biển tuyệt đẹp, đầy đủ tiện nghi cao cấp',
      price: 2500000,
      rating: 4.8,
      reviewCount: 124,
      rooms: 15,
      bathrooms: 12,
      amenities: ['Wifi', 'Hồ bơi', 'Spa', 'Nhà hàng', 'Phòng gym'],
      status: 'active',
      image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg'
    },
    {
      id: '2',
      name: 'Metropole Hanoi',
      type: 'Hotel',
      location: 'Hà Nội',
      address: '15 Ngô Quyền, Hoàn Kiếm, Hà Nội',
      description: 'Khách sạn lịch sử với kiến trúc cổ điển sang trọng tại trung tâm Hà Nội',
      price: 3200000,
      rating: 4.9,
      reviewCount: 215,
      rooms: 22,
      bathrooms: 18,
      amenities: ['Wifi', 'Nhà hàng', 'Phòng họp', 'Dịch vụ phòng 24/7'],
      status: 'active',
      image: 'https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg'
    },
    {
      id: '3',
      name: 'Mường Thanh Luxury',
      type: 'Hotel',
      location: 'Đà Nẵng',
      address: '270 Võ Nguyên Giáp, Mỹ An, Ngũ Hành Sơn, Đà Nẵng',
      description: 'Khách sạn hiện đại với view biển Mỹ Khê tuyệt đẹp',
      price: 1800000,
      rating: 4.5,
      reviewCount: 98,
      rooms: 10,
      bathrooms: 8,
      amenities: ['Wifi', 'Hồ bơi', 'Nhà hàng', 'Bãi đỗ xe'],
      status: 'pending',
      image: 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg'
    }
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleAddProperty = () => {
    navigate('/host/properties/add');
  };

  const handleEditProperty = (id: string) => {
    navigate(`/host/properties/edit/${id}`);
  };

  const handleViewProperty = (id: string) => {
    navigate(`/host/properties/${id}`);
  };

  const handleDeleteProperty = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khách sạn này không?')) {
      setProperties(properties.filter(property => property.id !== id));
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesStatus = filterStatus === 'all' || property.status === filterStatus;
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          property.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Đang hoạt động</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Đang xét duyệt</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Ngừng hoạt động</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản lý khách sạn</h1>
          <button
            onClick={handleAddProperty}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Thêm khách sạn mới
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, địa điểm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-gray-700">Trạng thái:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="active">Đang hoạt động</option>
                <option value="pending">Đang xét duyệt</option>
                <option value="inactive">Ngừng hoạt động</option>
              </select>
            </div>
          </div>
        </div>

        {/* Properties List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                <img
                  src={property.image}
                  alt={property.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4">
                  {getStatusBadge(property.status)}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{property.name}</h3>
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{property.location}</span>
                </div>
                
                <div className="flex items-center mb-3">
                  <div className="flex mr-2">
                    {Array(5).fill(0).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < Math.floor(property.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-gray-700">{property.rating} ({property.reviewCount} đánh giá)</span>
                </div>
                
                <div className="flex flex-wrap gap-4 mb-4 text-gray-600 text-sm">
                  <div className="flex items-center">
                    <Home className="h-4 w-4 mr-1" />
                    <span>{property.type}</span>
                  </div>
                  <div className="flex items-center">
                    <BedDouble className="h-4 w-4 mr-1" />
                    <span>{property.rooms} phòng</span>
                  </div>
                  <div className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    <span>{property.bathrooms} phòng tắm</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {property.amenities.slice(0, 3).map((amenity, index) => (
                    <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded flex items-center">
                      {amenity === 'Wifi' && <Wifi className="h-3 w-3 mr-1" />}
                      {amenity === 'Nhà hàng' && <Coffee className="h-3 w-3 mr-1" />}
                      <span>{amenity}</span>
                    </span>
                  ))}
                  {property.amenities.length > 3 && (
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                      +{property.amenities.length - 3}
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-blue-600">
                    {property.price.toLocaleString('vi-VN')}đ
                    <span className="text-sm text-gray-500 font-normal">/đêm</span>
                  </span>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleViewProperty(property.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                      title="Xem chi tiết"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => handleEditProperty(property.id)}
                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full"
                      title="Chỉnh sửa"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteProperty(property.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      title="Xóa"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-xl font-medium text-gray-900 mb-2">Không tìm thấy khách sạn nào</h3>
            <p className="text-gray-600 mb-6">Không có khách sạn nào phù hợp với tiêu chí tìm kiếm của bạn.</p>
            <button
              onClick={handleAddProperty}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Thêm khách sạn mới
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostProperties;
