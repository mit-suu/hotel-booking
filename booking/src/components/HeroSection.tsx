import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Users } from 'lucide-react';
import DatePicker from './DatePicker';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [guests, setGuests] = useState(2);
  const [dates, setDates] = useState<{checkIn?: Date, checkOut?: Date}>({});

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    
    if (destination.trim()) {
      searchParams.append('city', destination.trim());
    }
    
    if (dates.checkIn) {
      searchParams.append('checkIn', dates.checkIn.toISOString().split('T')[0]);
    }
    
    if (dates.checkOut) {
      searchParams.append('checkOut', dates.checkOut.toISOString().split('T')[0]);
    }
    
    searchParams.append('guests', guests.toString());
    
    navigate(`/hotels${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDateRange = () => {
    if (dates.checkIn && dates.checkOut) {
      const checkInStr = dates.checkIn.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' });
      const checkOutStr = dates.checkOut.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' });
      return `${checkInStr} - ${checkOutStr}`;
    } else if (dates.checkIn) {
      return dates.checkIn.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' });
    }
    return 'Select dates';
  };

  return (
    <section className="relative w-full h-[700px]">
      {/* Background Image - True Full Width */}
      <div className="absolute inset-0 w-full h-full">
        <img 
          src="https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg" 
          alt="Hotel panorama" 
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Content - Centered with proper container */}
      <div className="relative w-full h-full flex flex-col justify-center">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
              Find the perfect hotel room
              <br />
              for your vacation
            </h1>
            <p className="text-base md:text-lg text-white/90 mb-6 max-w-xl mx-auto">
              Explore thousands of hotels and resorts at the best prices
            </p>

            {/* Search Box - Smaller and more compact */}
            <div className="bg-white rounded-lg shadow-xl p-4 max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                {/* Destination */}
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-700 mb-1 text-left">
                    Destination
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Where do you want to go?"
                      className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-sm"
                    />
                    <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Date Picker */}
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-700 mb-1 text-left">
                    Dates
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      className="w-full flex items-center pl-8 pr-3 py-2.5 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left hover:border-gray-400 transition-colors text-sm"
                    >
                      <span className={`${dates.checkIn ? 'text-gray-700' : 'text-gray-500'}`}>
                        {formatDateRange()}
                      </span>
                    </button>
                    <Calendar size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                  {showDatePicker && (
                    <div className="absolute z-50 mt-1 left-0 right-0 md:left-0 md:right-auto">
                      <DatePicker 
                        onClose={() => setShowDatePicker(false)}
                        checkIn={dates.checkIn}
                        checkOut={dates.checkOut}
                        onDatesChange={(newDates) => setDates(newDates)}
                      />
                    </div>
                  )}
                </div>

                {/* Guests */}
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-700 mb-1 text-left">
                    Guests
                  </label>
                  <div className="relative">
                    <select
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value))}
                      className="w-full pl-8 pr-6 py-2.5 border border-gray-300 rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-white hover:border-gray-400 transition-colors text-sm"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <option key={num} value={num}>
                          {num} guest{num > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                    <Users size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                      <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <button 
                onClick={handleSearch}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md transition-colors font-semibold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <Search size={16} className="inline mr-2" />
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
