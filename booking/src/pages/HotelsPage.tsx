import React, { useState } from 'react';
import { Search, MapPin, Star, Filter } from 'lucide-react';

const HotelsPage: React.FC = () => {
  const [filters, setFilters] = useState({
    priceRange: 'all',
    rating: 'all',
    amenities: [] as string[]
  });

  // Dữ liệu mẫu
  const hotels = [
    {
      id: '1',
      name: 'Vinpearl Resort & Spa',
      location: 'Nha Trang',
      rating: 5,
      price: 2500000,
      image: 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg',
      description: 'Khu nghỉ dưỡng 5 sao với view biển tuyệt đẹp'
    },
    {
      id: '2',
      name: 'Metropole Hanoi',
      location: 'Hà Nội',
      rating: 5,
      price: 3500000,
      image: 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg',
      description: 'Khách sạn lịch sử với kiến trúc Pháp cổ điển'
    },
    {
      id: '3',
      name: 'InterContinental Danang',
      location: 'Đà Nẵng',
      rating: 5,
      price: 4000000,
      image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg',
      description: 'Resort sang trọng trên bán đảo Sơn Trà'
    },
    {
      id: '4',
      name: 'JW Marriott Phu Quoc',
      location: 'Phú Quốc',
      rating: 5,
      price: 3200000,
      image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg',
      description: 'Resort biển với thiết kế hiện đại'
    },
    {
      id: '5',
      name: 'Park Hyatt Saigon',
      location: 'Hồ Chí Minh',
      rating: 5,
      price: 4500000,
      image: 'https://images.pexels.com/photos/2115367/pexels-photo-2115367.jpeg',
      description: 'Khách sạn sang trọng trung tâm thành phố'
    },
    {
      id: '6',
      name: 'Anantara Hoi An',
      location: 'Hội An',
      rating: 4,
      price: 2800000,
      image: 'https://images.pexels.com/photos/1486577/pexels-photo-1486577.jpeg',
      description: 'Resort ven sông với kiến trúc truyền thống'
    }
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Khách sạn & Resort</h1>
          <p className="text-xl text-blue-100">
            Khám phá hàng ngàn khách sạn tuyệt vời trên khắp Việt Nam
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white shadow-md py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm khách sạn..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Địa điểm"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Bộ lọc</h3>
                <Filter size={20} className="text-gray-500" />
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-gray-700">Khoảng giá</h4>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.priceRange}
                  onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                >
                  <option value="all">Tất cả</option>
                  <option value="0-1000000">Dưới 1 triệu</option>
                  <option value="1000000-2000000">1 - 2 triệu</option>
                  <option value="2000000-5000000">2 - 5 triệu</option>
                  <option value="5000000+">Trên 5 triệu</option>
                </select>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-gray-700">Đánh giá</h4>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.rating}
                  onChange={(e) => setFilters({...filters, rating: e.target.value})}
                >
                  <option value="all">Tất cả</option>
                  <option value="5">5 sao</option>
                  <option value="4">4 sao trở lên</option>
                  <option value="3">3 sao trở lên</option>
                </select>
              </div>

              {/* Amenities */}
              <div>
                <h4 className="font-medium mb-3 text-gray-700">Tiện nghi</h4>
                <div className="space-y-3">
                  {['Hồ bơi', 'Spa', 'Phòng gym', 'Nhà hàng', 'Bar', 'WiFi miễn phí'].map((amenity) => (
                    <label key={amenity} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        checked={filters.amenities.includes(amenity)}
                        onChange={(e) => {
                          const newAmenities = e.target.checked
                            ? [...filters.amenities, amenity]
                            : filters.amenities.filter(a => a !== amenity);
                          setFilters({...filters, amenities: newAmenities});
                        }}
                      />
                      <span className="ml-3 text-gray-700">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Hotel List */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Tìm thấy {hotels.length} khách sạn
              </h2>
              <select className="p-2 border border-gray-300 rounded-lg">
                <option>Sắp xếp theo</option>
                <option>Giá thấp đến cao</option>
                <option>Giá cao đến thấp</option>
                <option>Đánh giá cao nhất</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hotels.map((hotel) => (
                <div key={hotel.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full shadow-md">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm font-medium">{hotel.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{hotel.name}</h3>
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{hotel.location}</span>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">{hotel.description}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-2xl font-bold text-blue-600">
                          {hotel.price.toLocaleString('vi-VN')}đ
                        </span>
                        <span className="text-gray-500 text-sm ml-1">/đêm</span>
                      </div>
                      <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Trước
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  1
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  2
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  3
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Sau
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelsPage;
