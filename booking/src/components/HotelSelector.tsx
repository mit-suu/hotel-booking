import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, MapPin, Star, Building } from 'lucide-react';
import { HotelResponse, hotelAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';

interface HotelSelectorProps {
  selectedHotelIds: string[];
  onHotelSelectionChange: (hotelIds: string[]) => void;
  error?: string;
}

const HotelSelector: React.FC<HotelSelectorProps> = ({
  selectedHotelIds,
  onHotelSelectionChange,
  error
}) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<HotelResponse[]>([]);
  const [selectedHotels, setSelectedHotels] = useState<HotelResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<number | null>(null);

  // Load selected hotels when component mounts or selectedHotelIds change
  useEffect(() => {
    if (selectedHotelIds.length > 0) {
      loadSelectedHotels();
    }
  }, [selectedHotelIds]);

  const loadSelectedHotels = async () => {
    try {
      const promises = selectedHotelIds.map(id => hotelAPI.getHotelDetails(id));
      const responses = await Promise.all(promises);
      const hotels = responses
        .filter(response => response.data.success)
        .map(response => response.data.result);
      setSelectedHotels(hotels);
    } catch (error) {
      console.error('Error loading selected hotels:', error);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback((term: string) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    const timeout = setTimeout(() => {
      if (term.trim().length >= 2) {
        searchHotels(term.trim());
      } else {
        setSearchResults([]);
      }
    }, 300);
    
    setDebounceTimeout(timeout);
  }, [debounceTimeout]);

  const searchHotels = async (keyword: string) => {
    try {
      setLoading(true);
      const response = await hotelAPI.searchHotels(keyword, 0, 20, 'name');
      
             if (response.data.success) {
         const hotels = response.data.result.content.filter((hotel: HotelResponse) => 
           !selectedHotelIds.includes(hotel.id)
         );
         setSearchResults(hotels);
       }
    } catch (error) {
      console.error('Error searching hotels:', error);
      showToast('error', 'Error', 'Cannot search hotels');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
    
    if (value.length >= 2) {
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  };

  const handleSelectHotel = (hotel: HotelResponse) => {
    const newSelectedIds = [...selectedHotelIds, hotel.id];
    const newSelectedHotels = [...selectedHotels, hotel];
    
    setSelectedHotels(newSelectedHotels);
    onHotelSelectionChange(newSelectedIds);
    
    // Remove from search results
    setSearchResults(searchResults.filter(h => h.id !== hotel.id));
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const handleRemoveHotel = (hotelId: string) => {
    const newSelectedIds = selectedHotelIds.filter(id => id !== hotelId);
    const newSelectedHotels = selectedHotels.filter(hotel => hotel.id !== hotelId);
    
    setSelectedHotels(newSelectedHotels);
    onHotelSelectionChange(newSelectedIds);
  };

  const formatHotelInfo = (hotel: HotelResponse) => {
    const parts = [];
    if (hotel.city) parts.push(hotel.city);
    if (hotel.country) parts.push(hotel.country);
    return parts.join(', ');
  };

  return (
    <div className="space-y-4">
      {/* Selected Hotels */}
      {selectedHotels.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Selected hotels ({selectedHotels.length})
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedHotels.map(hotel => (
              <div key={hotel.id} className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <Building size={16} className="text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">{hotel.name}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      {hotel.starRating && (
                        <div className="flex items-center">
                          <Star size={12} className="text-yellow-400 fill-current mr-1" />
                          <span>{hotel.starRating}</span>
                        </div>
                      )}
                      {formatHotelInfo(hotel) && (
                        <div className="flex items-center">
                          <MapPin size={12} className="mr-1" />
                          <span>{formatHotelInfo(hotel)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveHotel(hotel.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Remove from list"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search and add hotels
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => searchTerm.length >= 2 && setIsDropdownOpen(true)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter hotel name to search (minimum 2 characters)..."
          />
          {loading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isDropdownOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="py-1">
                {searchResults.map(hotel => (
                  <button
                    key={hotel.id}
                    onClick={() => handleSelectHotel(hotel)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                  >
                    <div className="flex items-center space-x-3">
                      <Building size={16} className="text-gray-400" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{hotel.name}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          {hotel.starRating && (
                            <div className="flex items-center">
                              <Star size={12} className="text-yellow-400 fill-current mr-1" />
                              <span>{hotel.starRating}</span>
                            </div>
                          )}
                          {formatHotelInfo(hotel) && (
                            <div className="flex items-center">
                              <MapPin size={12} className="mr-1" />
                              <span>{formatHotelInfo(hotel)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchTerm.length >= 2 && !loading ? (
              <div className="px-4 py-6 text-center text-gray-500">
                <Building size={24} className="mx-auto text-gray-400 mb-2" />
                <p>No hotels found</p>
                <p className="text-sm">Try searching with a different keyword</p>
              </div>
            ) : searchTerm.length < 2 ? (
              <div className="px-4 py-4 text-center text-gray-500 text-sm">
                Enter at least 2 characters to search
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 flex items-center mt-1">
          <X size={16} className="mr-1" />
          {error}
        </p>
      )}

      {/* Help Text */}
      <p className="text-sm text-gray-500">
          💡 Enter hotel name to search and select multiple hotels at once
      </p>
    </div>
  );
};

export default HotelSelector; 