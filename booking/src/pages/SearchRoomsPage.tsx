import React, { useState } from 'react';
import { Search, Calendar, DollarSign, Star, MapPin, Filter, X } from 'lucide-react';
import DatePicker from '../components/DatePicker';

interface RoomType {
  id: string;
  name: string;
  hotelName: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  description: string;
  amenities: string[];
  capacity: number;
}

const SearchRoomsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    minPrice: 0,
    maxPrice: 5000000,
    rating: 0
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Sample data for rooms
  const rooms: RoomType[] = [
    {
      id: '1',
      name: 'Deluxe Ocean View',
      hotelName: 'Vinpearl Resort & Spa',
      location: 'Nha Trang',
      price: 2500000,
      rating: 4.8,
      image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
      description: 'Luxurious room with stunning ocean view, fully equipped with premium amenities',
      amenities: ['Wifi', 'Minibar', 'TV', 'Điều hòa', 'Bồn tắm'],
      capacity: 2
    },
    {
      id: '2',
      name: 'Premium Suite',
      hotelName: 'Metropole Hanoi',
      location: 'Hà Nội',
      price: 3200000,
      rating: 4.9,
      image: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
      description: 'Phòng suite rộng rãi với thiết kế cổ điển sang trọng',
      amenities: ['Wifi', 'Minibar', 'TV', 'Điều hòa', 'Phòng khách riêng'],
      capacity: 3
    },
    {
      id: '3',
      name: 'Family Room',
      hotelName: 'InterContinental Danang',
      location: 'Đà Nẵng',
      price: 2800000,
      rating: 4.7,
      image: 'https://images.pexels.com/photos/237371/pexels-photo-237371.jpeg',
      description: 'Phòng gia đình rộng rãi với đầy đủ tiện nghi cho cả gia đình',
      amenities: ['Wifi', 'Minibar', 'TV', 'Điều hòa', '2 phòng ngủ'],
      capacity: 4
    },
    {
      id: '4',
      name: 'Standard Room',
      hotelName: 'Mường Thanh Hotel',
      location: 'Đà Lạt',
      price: 1200000,
      rating: 4.3,
      image: 'https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg',
      description: 'Phòng tiêu chuẩn thoải mái với đầy đủ tiện nghi cơ bản',
      amenities: ['Wifi', 'TV', 'Điều hòa'],
      capacity: 2
    },
    {
      id: '5',
      name: 'Honeymoon Suite',
      hotelName: 'Fusion Maia Resort',
      location: 'Phú Quốc',
      price: 4500000,
      rating: 5.0,
      image: 'https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg',
      description: 'Phòng suite lãng mạn dành cho cặp đôi với hồ bơi riêng',
      amenities: ['Wifi', 'Minibar', 'TV', 'Điều hòa', 'Hồ bơi riêng', 'Bồn tắm'],
      capacity: 2
    },
  ];

  // Filter rooms based on search parameters
  const filteredRooms = rooms.filter(room => {
    return (
      (searchParams.location === '' || room.location.toLowerCase().includes(searchParams.location.toLowerCase())) &&
      room.price >= searchParams.minPrice &&
      room.price <= searchParams.maxPrice &&
      room.rating >= searchParams.rating
    );
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: name === 'minPrice' || name === 'maxPrice' || name === 'rating' || name === 'guests' 
        ? Number(value) 
        : value
    }));
  };

  const handleDateSelection = (checkIn: string, checkOut: string) => {
    setSearchParams(prev => ({
      ...prev,
      checkIn,
      checkOut
    }));
    setShowDatePicker(false);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const renderRatingStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      {/* Search Bar */}
      <div className="bg-white shadow-md py-6 sticky top-16 z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  name="location"
                  value={searchParams.location}
                  onChange={handleInputChange}
                  placeholder="Search by location..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {searchParams.checkIn && searchParams.checkOut 
                    ? `${searchParams.checkIn} - ${searchParams.checkOut}`
                    : "Chọn ngày nhận - trả phòng"}
                </button>
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                
                {showDatePicker && (
                  <div className="absolute top-full left-0 mt-2 z-20">
                    <DatePicker onClose={() => setShowDatePicker(false)} />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 md:flex-initial">
              <div className="relative">
                <select
                  name="guests"
                  value={searchParams.guests}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} guest{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter size={20} className="mr-2" />
              Filters
            </button>
            
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                              Search
            </button>
          </div>
          
          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Advanced Filters</h3>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Khoảng giá (VNĐ)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="minPrice"
                      value={searchParams.minPrice}
                      onChange={handleInputChange}
                      placeholder="Tối thiểu"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      name="maxPrice"
                      value={searchParams.maxPrice}
                      onChange={handleInputChange}
                      placeholder="Tối đa"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      name="rating"
                      min="0"
                      max="5"
                      step="0.5"
                      value={searchParams.rating}
                      onChange={handleInputChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="ml-2 min-w-[40px] text-center">{searchParams.rating}</span>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>0</span>
                    <span>5</span>
                  </div>
                </div>
                
                {/* Amenities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiện nghi
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Wifi', 'Hồ bơi', 'Spa', 'Phòng gym', 'Nhà hàng', 'Bãi đỗ xe'].map((amenity) => (
                      <label key={amenity} className="flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-sm">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
              <p className="text-gray-600">Found {filteredRooms.length} matching rooms</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div key={room.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full flex items-center">
                  <div className="flex">
                    {renderRatingStars(room.rating)}
                  </div>
                  <span className="ml-1 text-sm font-medium">{room.rating}</span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900">{room.name}</h3>
                <p className="text-blue-600 font-medium">{room.hotelName}</p>
                
                <div className="flex items-center text-gray-600 mt-2 mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{room.location}</span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{room.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {room.amenities.slice(0, 3).map((amenity, index) => (
                    <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                      {amenity}
                    </span>
                  ))}
                  {room.amenities.length > 3 && (
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                      +{room.amenities.length - 3}
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatPrice(room.price)}
                    </span>
                    <span className="text-sm text-gray-500">/đêm</span>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Book Room
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchRoomsPage;
