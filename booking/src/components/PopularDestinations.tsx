import React from 'react';

interface DestinationProps {
  name: string;
  hotelCount: number;
  image: string;
}

const destinations: DestinationProps[] = [
  {
    name: 'Đà Nẵng',
    hotelCount: 245,
    image: 'https://images.pexels.com/photos/18013514/pexels-photo-18013514/free-photo-of-sea-city-landmark-architecture.jpeg'
  },
  {
    name: 'Hà Nội',
    hotelCount: 312,
    image: 'https://images.pexels.com/photos/12072262/pexels-photo-12072262.jpeg'
  },
  {
    name: 'TP. Hồ Chí Minh',
    hotelCount: 378,
    image: 'https://images.pexels.com/photos/9482133/pexels-photo-9482133.jpeg'
  },
  {
    name: 'Nha Trang',
    hotelCount: 186,
    image: 'https://images.pexels.com/photos/9970590/pexels-photo-9970590.jpeg'
  },
  {
    name: 'Phú Quốc',
    hotelCount: 134,
    image: 'https://images.pexels.com/photos/12048257/pexels-photo-12048257.jpeg'
  },
  {
    name: 'Đà Lạt',
    hotelCount: 167,
    image: 'https://images.pexels.com/photos/8961574/pexels-photo-8961574.jpeg'
  }
];

const PopularDestinations: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Popular Locations</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover popular travel destinations with high-quality hotels
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination, index) => (
            <DestinationCard key={index} destination={destination} />
          ))}
        </div>
      </div>
    </section>
  );
};

const DestinationCard: React.FC<{ destination: DestinationProps }> = ({ destination }) => {
  return (
    <div className="relative rounded-xl overflow-hidden h-64 group cursor-pointer">
      <img 
        src={destination.image} 
        alt={destination.name} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70"></div>
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="text-xl font-bold mb-1">{destination.name}</h3>
        <p className="text-white/80">{destination.hotelCount} hotels</p>
      </div>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-blue-900/20 backdrop-blur-sm">
        <button className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium transition-colors">
            View now
        </button>
      </div>
    </div>
  );
};

export default PopularDestinations;
