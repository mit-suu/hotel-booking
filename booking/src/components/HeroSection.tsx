import React, { useState } from 'react';
import { Search, Calendar, Users } from 'lucide-react';
import DatePicker from './DatePicker';

const HeroSection: React.FC = () => {
  const [destination, setDestination] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [guests, setGuests] = useState(2);

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
              Tìm phòng khách sạn hoàn hảo
              <br />
              cho kỳ nghỉ của bạn
            </h1>
            <p className="text-base md:text-lg text-white/90 mb-6 max-w-xl mx-auto">
              Khám phá hàng ngàn khách sạn và khu nghỉ dưỡng với giá tốt nhất
            </p>

            {/* Search Box - Smaller and more compact */}
            <div className="bg-white rounded-lg shadow-xl p-4 max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                {/* Destination */}
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-700 mb-1 text-left">
                    Điểm đến
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Bạn muốn đi đâu?"
                      className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-sm"
                    />
                    <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Date Picker */}
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-700 mb-1 text-left">
                    Ngày
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      className="w-full flex items-center pl-8 pr-3 py-2.5 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left hover:border-gray-400 transition-colors text-sm"
                    >
                      <span className="text-gray-600">Chọn ngày</span>
                    </button>
                    <Calendar size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                  {showDatePicker && (
                    <div className="absolute z-10 mt-1 w-full">
                      <DatePicker onClose={() => setShowDatePicker(false)} />
                    </div>
                  )}
                </div>

                {/* Guests */}
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-700 mb-1 text-left">
                    Khách
                  </label>
                  <div className="relative">
                    <select
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value))}
                      className="w-full pl-8 pr-6 py-2.5 border border-gray-300 rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-white hover:border-gray-400 transition-colors text-sm"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <option key={num} value={num}>
                          {num} khách
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
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md transition-colors font-semibold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                <Search size={16} className="inline mr-2" />
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
