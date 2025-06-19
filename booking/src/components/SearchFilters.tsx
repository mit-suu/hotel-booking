import React from 'react';
import { Filter, X } from 'lucide-react';

interface SearchFiltersProps {
  filters: {
    minPrice: number;
    maxPrice: number;
    rating: number;
    amenities: string[];
  };
  onChange: (filters: any) => void;
  onClose: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ filters, onChange, onClose }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      // Handle amenities checkbox
      const amenityValue = value;
      const newAmenities = checked
        ? [...filters.amenities, amenityValue]
        : filters.amenities.filter(a => a !== amenityValue);
      
      onChange({
        ...filters,
        amenities: newAmenities
      });
    } else {
      // Handle number inputs
      onChange({
        ...filters,
        [name]: type === 'number' ? Number(value) : value
      });
    }
  };

  const amenitiesList = [
    'Wifi', 'Hồ bơi', 'Spa', 'Phòng gym', 
    'Nhà hàng', 'Bãi đỗ xe', 'Điều hòa', 'Minibar'
  ];

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium flex items-center">
          <Filter size={18} className="mr-2" />
          Bộ lọc nâng cao
        </h3>
        <button 
          onClick={onClose}
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
              value={filters.minPrice}
              onChange={handleInputChange}
              placeholder="Tối thiểu"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <span>-</span>
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
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
              value={filters.rating}
              onChange={handleInputChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="ml-2 min-w-[40px] text-center">{filters.rating}</span>
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
            {amenitiesList.map((amenity) => (
              <label key={amenity} className="flex items-center">
                <input
                  type="checkbox"
                  name="amenities"
                  value={amenity}
                  checked={filters.amenities.includes(amenity)}
                  onChange={handleInputChange}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm">{amenity}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button 
          onClick={() => onChange({
            minPrice: 0,
            maxPrice: 5000000,
            rating: 0,
            amenities: []
          })}
          className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Đặt lại
        </button>
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
};

export default SearchFilters;
