import React, { useState } from 'react';
import { Search, Calendar, Users, MapPin, Filter, X } from 'lucide-react';
import { HotelSearchFilters } from '../types/hotel';

interface RoomSearchFormProps {
  onSearch: (filters: HotelSearchFilters) => void;
  initialFilters?: Partial<HotelSearchFilters>;
  className?: string;
}

const RoomSearchForm: React.FC<RoomSearchFormProps> = ({ 
  onSearch, 
  initialFilters = {},
  className = '' 
}) => {
  const [filters, setFilters] = useState<HotelSearchFilters>({
    location: initialFilters.location || '',
    checkIn: initialFilters.checkIn || '',
    checkOut: initialFilters.checkOut || '',
    guests: initialFilters.guests || 1,
    rooms: initialFilters.rooms || 1,
    priceRange: initialFilters.priceRange || { min: 0, max: 10000000 },
    hotelType: initialFilters.hotelType || [],
    amenities: initialFilters.amenities || [],
    rating: initialFilters.rating || 0,
    sortBy: initialFilters.sortBy || 'popularity',
    sortOrder: initialFilters.sortOrder || 'desc'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const hotelTypes = [
    { value: 'Hotel', label: 'Hotel' },
    { value: 'Resort', label: 'Resort' },
    { value: 'Homestay', label: 'Homestay' },
    { value: 'Villa', label: 'Villa' },
    { value: 'Apartment', label: 'Căn hộ' }
  ];

  const amenitiesList = [
    'Wifi miễn phí',
    'Hồ bơi',
    'Spa',
    'Phòng gym',
    'Nhà hàng',
    'Bãi đỗ xe',
    'Điều hòa',
    'Minibar',
    'Dịch vụ phòng 24/7',
    'Bồn tắm',
    'Ban công',
    'Tầm nhìn ra biển'
  ];

  const sortOptions = [
    { value: 'price', label: 'Giá' },
    { value: 'rating', label: 'Rating' },
    { value: 'distance', label: 'Khoảng cách' },
    { value: 'popularity', label: 'Phổ biến' }
  ];

  const handleInputChange = (field: keyof HotelSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePriceRangeChange = (type: 'min' | 'max', value: number) => {
    setFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange!,
        [type]: value
      }
    }));
  };

  const handleHotelTypeToggle = (type: string) => {
    setFilters(prev => ({
      ...prev,
      hotelType: prev.hotelType?.includes(type)
        ? prev.hotelType.filter(t => t !== type)
        : [...(prev.hotelType || []), type]
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities?.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...(prev.amenities || []), amenity]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    const resetFilters: HotelSearchFilters = {
      location: '',
      checkIn: '',
      checkOut: '',
      guests: 1,
      rooms: 1,
      priceRange: { min: 0, max: 10000000 },
      hotelType: [],
      amenities: [],
      rating: 0,
      sortBy: 'popularity',
      sortOrder: 'desc'
    };
    setFilters(resetFilters);
    onSearch(resetFilters);
  };

  const formatCurrency = (amount: number) => {
    return (amount / 1000000).toFixed(1) + 'M';
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Search */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Location */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Điểm đến
            </label>
            <div className="relative">
              <MapPin size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="City, district, hotel..."
                value={filters.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Check-in */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày nhận phòng
            </label>
            <div className="relative">
              <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={filters.checkIn}
                min={getTodayDate()}
                onChange={(e) => handleInputChange('checkIn', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Check-out */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày trả phòng
            </label>
            <div className="relative">
              <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={filters.checkOut}
                min={filters.checkIn || getTomorrowDate()}
                onChange={(e) => handleInputChange('checkOut', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Guests & Rooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khách & Phòng
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Users size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={filters.guests}
                  onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
                  className="w-full pl-8 pr-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>{num} khách</option>
                  ))}
                </select>
              </div>
              <select
                value={filters.rooms}
                onChange={(e) => handleInputChange('rooms', parseInt(e.target.value))}
                className="w-full px-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num} phòng</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <Filter size={16} className="mr-1" />
            {showAdvanced ? 'Ẩn bộ lọc nâng cao' : 'Hiện bộ lọc nâng cao'}
          </button>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Đặt lại
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Search size={16} className="mr-2" />
              Search
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="border-t pt-6 space-y-6">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Khoảng giá (VNĐ/đêm)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="range"
                    min="0"
                    max="10000000"
                    step="100000"
                    value={filters.priceRange?.min || 0}
                    onChange={(e) => handlePriceRangeChange('min', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-600 mt-1">
                    Từ: {formatCurrency(filters.priceRange?.min || 0)}đ
                  </div>
                </div>
                <div>
                  <input
                    type="range"
                    min="0"
                    max="10000000"
                    step="100000"
                    value={filters.priceRange?.max || 10000000}
                    onChange={(e) => handlePriceRangeChange('max', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-600 mt-1">
                    Đến: {formatCurrency(filters.priceRange?.max || 10000000)}đ
                  </div>
                </div>
              </div>
            </div>

            {/* Hotel Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Loại hình lưu trú
              </label>
              <div className="flex flex-wrap gap-2">
                {hotelTypes.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleHotelTypeToggle(type.value)}
                    className={`px-3 py-2 rounded-lg border transition-colors ${
                      filters.hotelType?.includes(type.value)
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Minimum Rating
              </label>
              <div className="flex space-x-2">
                {[0, 3, 4, 4.5].map(rating => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleInputChange('rating', rating)}
                    className={`px-3 py-2 rounded-lg border transition-colors ${
                      filters.rating === rating
                        ? 'bg-yellow-100 border-yellow-500 text-yellow-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {rating === 0 ? 'Tất cả' : `${rating}+ ⭐`}
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tiện nghi
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {amenitiesList.map(amenity => (
                  <label key={amenity} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.amenities?.includes(amenity) || false}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Sắp xếp theo
              </label>
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleInputChange('sortBy', e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleInputChange('sortOrder', e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="asc">Tăng dần</option>
                  <option value="desc">Giảm dần</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default RoomSearchForm; 