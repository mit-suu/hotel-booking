import React from 'react';
import { Star, MapPin, Users, Wifi, Coffee, Tv } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RoomCardProps {
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

const RoomCard: React.FC<RoomCardProps> = ({
  id,
  name,
  hotelName,
  location,
  price,
  rating,
  image,
  description,
  amenities,
  capacity
}) => {
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

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <Wifi size={16} />;
      case 'minibar':
      case 'nhà hàng':
        return <Coffee size={16} />;
      case 'tv':
        return <Tv size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/rooms/${id}`}>
        <div className="relative">
          <img
            src={image}
            alt={name}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full flex items-center">
            <div className="flex">
              {renderRatingStars(rating)}
            </div>
            <span className="ml-1 text-sm font-medium">{rating}</span>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
          <p className="text-blue-600 font-medium">{hotelName}</p>
          
          <div className="flex items-center text-gray-600 mt-2 mb-3">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{location}</span>
          </div>
          
          <div className="flex items-center text-gray-600 mb-3">
            <Users className="h-4 w-4 mr-1" />
            <span>Tối đa {capacity} khách</span>
          </div>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {amenities.slice(0, 3).map((amenity, index) => (
              <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded flex items-center">
                {getAmenityIcon(amenity)}
                <span className="ml-1">{amenity}</span>
              </span>
            ))}
            {amenities.length > 3 && (
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                +{amenities.length - 3}
              </span>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <span className="text-2xl font-bold text-blue-600">
                {formatPrice(price)}
              </span>
              <span className="text-sm text-gray-500">/đêm</span>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Đặt phòng
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default RoomCard;
