import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import FeaturedHotels from '../components/FeaturedHotels';
import { hotelAPI, CityStatsResponse } from '../services/api';

interface CityStats {
  name: string;
  image: string;
  count: number;
}

// Default images for cities
const defaultCityImages: Record<string, string> = {
  'Da Nang': 'https://images.pexels.com/photos/2132180/pexels-photo-2132180.jpeg',
  'Hanoi': 'https://images.pexels.com/photos/1486577/pexels-photo-1486577.jpeg',
  'Ho Chi Minh': 'https://images.pexels.com/photos/2115367/pexels-photo-2115367.jpeg',
  'Phu Quoc': 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg',
  'Hoi An': 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg',
  'Nha Trang': 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg',
  'Dalat': 'https://images.pexels.com/photos/2161449/pexels-photo-2161449.jpeg',
  'Vung Tau': 'https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg'
};

const defaultCityImage = 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg';

const HomePage: React.FC = () => {
  const [cityStats, setCityStats] = useState<CityStats[]>([]);
  const [totalHotels, setTotalHotels] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCityStats = async () => {
      try {
        setLoading(true);
        
        // Fetch top cities from API
        const topCitiesResponse = await hotelAPI.getTopCities(4);
        if (topCitiesResponse.data.success) {
          const topCities: CityStatsResponse[] = topCitiesResponse.data.result;
          
          // Transform API data to CityStats format with images
          const cityStatsData: CityStats[] = topCities.map(city => ({
            name: city.cityName,
            count: city.hotelCount,
            image: defaultCityImages[city.cityName] || defaultCityImage
          }));
          
          setCityStats(cityStatsData);
        }

        // Fetch total hotels count using public API
        try {
          const totalResponse = await hotelAPI.getActiveHotels(0, 1, 'name');
          if (totalResponse.data.success && totalResponse.data.result) {
            setTotalHotels(totalResponse.data.result.totalElements || 0);
          }
        } catch (error) {
          console.error('Error fetching total hotels count:', error);
        }
      } catch (error) {
        console.error('Error fetching city statistics:', error);
        // Fallback to hardcoded cities if API fails
        setCityStats([
          { name: 'Da Nang', image: defaultCityImages['Da Nang'], count: 0 },
          { name: 'Hanoi', image: defaultCityImages['Hanoi'], count: 0 },
          { name: 'Ho Chi Minh', image: defaultCityImages['Ho Chi Minh'], count: 0 },
          { name: 'Phu Quoc', image: defaultCityImages['Phu Quoc'], count: 0 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCityStats();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Hotels Section */}
      <FeaturedHotels />

      {/* Popular Destinations */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Popular Destinations
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Explore top tourist destinations in Vietnam with {totalHotels.toLocaleString()} hotels
            </p>
          </div>

          <div className="mt-12 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="group">
                  <div className="relative rounded-lg overflow-hidden h-64 shadow-md animate-pulse">
                    <div className="w-full h-full bg-gray-300"></div>
                    <div className="absolute bottom-0 left-0 p-6">
                      <div className="h-6 bg-gray-400 rounded mb-2 w-24"></div>
                      <div className="h-4 bg-gray-400 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              cityStats.map((destination, index) => (
                <Link 
                  key={index} 
                  to={`/hotels?city=${encodeURIComponent(destination.name)}`}
                  className="group"
                >
                  <div className="relative rounded-lg overflow-hidden h-64 shadow-md group-hover:shadow-xl transition-shadow">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6 text-white">
                      <h3 className="text-xl font-bold">{destination.name}</h3>
                      <p>
                        {destination.count > 0 
                          ? `${destination.count.toLocaleString()} hotels`
                          : 'No hotels available'
                        }
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>


      {/* Why Choose Us */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why Choose Us?
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              We are committed to providing you with the best booking experience
            </p>
          </div>

          <div className="mt-12 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Best Prices',
                description: 'We guarantee you will get the best prices for all your bookings.',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              {
                title: 'Diverse Options',
                description: 'Thousands of hotels and resorts across Vietnam and around the world.',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              {
                title: '24/7 Support',
                description: 'Our customer support team is always ready to help you anytime, anywhere.',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                  </svg>
                )
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-center">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready for your next vacation?
          </h2>
          <p className="mt-4 text-xl text-blue-100">
            Sign up today to receive special offers for your first booking.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-colors"
            >
              Sign Up Now
            </Link>
            <Link
              to="/hotels"
              className="ml-4 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-800 hover:bg-blue-700 transition-colors"
            >
              Find Hotels
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
