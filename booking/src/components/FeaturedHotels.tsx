import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';
import { hotelAPI, HotelResponse } from '../services/api';

const FeaturedHotels: React.FC = () => {
  const [hotels, setHotels] = useState<HotelResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedHotels = async () => {
      try {
        setLoading(true);
        const response = await hotelAPI.getFeaturedHotels(0, 6, 'name');
        if (response.data.result?.content) {
          setHotels(response.data.result.content);
        }
      } catch (err) {
        console.error('Error fetching featured hotels:', err);
        setError('Unable to load featured hotels list');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedHotels();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  const renderRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${
              index < fullStars
                ? 'text-yellow-400 fill-current'
                : index === fullStars && hasHalfStar
                ? 'text-yellow-400 fill-current opacity-50'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating?.toFixed(1) || 'N/A'}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Featured Hotels
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Explore the best hotels
            </p>
          </div>
          <div className="mt-12 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gray-300"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-300 rounded w-20"></div>
                    <div className="h-4 bg-gray-300 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Featured Hotels
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-red-500 sm:mt-4">
              {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
                      <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Featured Hotels
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Explore the best hotels with excellent service quality
            </p>
        </div>

        <div className="mt-12 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {hotels.map((hotel) => (
            <div
              key={hotel.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <Link to={`/hotels/${hotel.id}`}>
                <div className="relative h-48">
                  <img
                    src={hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full">
                    {renderRatingStars(hotel.averageRating || 0)}
                  </div>
                  {hotel.featured && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Featured
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                    {hotel.name}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="line-clamp-1">
                      {hotel.address}
                      {hotel.city && `, ${hotel.city}`}
                      {hotel.country && `, ${hotel.country}`}
                    </span>
                  </div>
                  {hotel.description && (
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {hotel.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    <div>
                      {hotel.pricePerNight ? (
                        <span className="text-2xl font-bold text-blue-600">
                          {formatCurrency(hotel.pricePerNight)}
                        </span>
                      ) : (
                        <span className="text-lg font-semibold text-gray-600">
                          Contact
                        </span>
                      )}
                      <span className="text-sm text-gray-500 ml-1">/night</span>
                    </div>
                    <div className="text-right">
                      {/* Customer Reviews Count - Always show */}
                      <div className="text-xs text-gray-500">
                        {hotel.totalReviews && hotel.totalReviews > 0 
                          ? `${hotel.totalReviews} reviews`
                          : 'No reviews yet'
                        }
                      </div>
                      {hotel.starRating && (
                        <div className="flex items-center justify-end mt-1">
                          {[...Array(hotel.starRating)].map((_, index) => (
                            <span key={index} className="text-yellow-400 text-xs">★</span>
                          ))}
                          <span className="text-xs text-gray-500 ml-1">
                            {hotel.starRating} stars
                          </span>
                        </div>
                      )}
                      {/* City Badge */}
                      {hotel.city && (
                        <div className="flex justify-end mt-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 border">
                            📍 {hotel.city}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/hotels"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            View All Hotels
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedHotels;
