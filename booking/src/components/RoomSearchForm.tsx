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
   <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 ${className}`}>
  <form onSubmit={handleSubmit} className="space-y-6">
    {/* Basic Search */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Location */}
      <div className="lg:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Điểm đến</label>
        <div className="relative">
          <MapPin size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="City, district, hotel..."
            value={filters.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Check-in */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ngày nhận phòng</label>
        <div className="relative">
          <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="date"
            value={filters.checkIn}
            min={getTodayDate()}
            onChange={(e) => handleInputChange('checkIn', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Check-out */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ngày trả phòng</label>
        <div className="relative">
          <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="date"
            value={filters.checkOut}
            min={filters.checkIn || getTomorrowDate()}
            onChange={(e) => handleInputChange('checkOut', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Guests & Rooms */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Khách & Phòng</label>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <Users size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filters.guests}
              onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
              className="w-full pl-8 pr-2 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>{num} khách</option>
              ))}
            </select>
          </div>
          <select
            value={filters.rooms}
            onChange={(e) => handleInputChange('rooms', parseInt(e.target.value))}
            className="w-full px-2 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
          className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
    {/* Các block bên dưới (price, type, rating, amenities, sort) cũng cần thêm dark tương ứng nếu muốn tiếp tục */}
  </form>
</div>
  );
};

export default RoomSearchForm; 