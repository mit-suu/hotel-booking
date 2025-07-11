import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DatePicker from './DatePicker';

interface SearchBarProps {
  className?: string;
  variant?: 'default' | 'compact';
}

const SearchBar: React.FC<SearchBarProps> = ({ className = '', variant = 'default' }) => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState('');
  const [guests, setGuests] = useState(1);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to search page with query params
    navigate(`/search-rooms?location=${encodeURIComponent(location)}&dates=${encodeURIComponent(dateRange)}&guests=${guests}`);
  };

  const isCompact = variant === 'compact';

  return (
    <div className={`bg-white rounded-lg shadow-lg p-4 ${className}`}>
      <form onSubmit={handleSearch}>
        <div className={`flex flex-col ${!isCompact ? 'md:flex-row' : ''} gap-4`}>
          {/* Location */}
          <div className={`relative ${!isCompact ? 'flex-1' : ''}`}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Điểm đến</label>
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Bạn muốn đi đâu?"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          {/* Date Range */}
          <div className={`relative ${!isCompact ? 'flex-1' : ''}`}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {dateRange || "Chọn ngày"}
              </button>
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              
              {showDatePicker && (
                <div className="absolute top-full left-0 mt-2 z-20">
                  <DatePicker onClose={() => setShowDatePicker(false)} />
                </div>
              )}
            </div>
          </div>

          {/* Guests */}
          <div className={`relative ${!isCompact ? 'md:w-1/4' : ''}`}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Khách</label>
            <div className="relative">
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>{num} khách</option>
                ))}
              </select>
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          {/* Search Button */}
          <div className={`${!isCompact ? 'md:self-end' : ''} ${isCompact ? 'mt-2' : 'mb-1'}`}>
            <button
              type="submit"
              className={`bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center transition-colors
                ${isCompact ? 'w-full py-2' : 'px-6 py-2'}`}
            >
              <Search size={20} className={isCompact ? 'mr-2' : ''} />
              {isCompact && <span>Search</span>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
