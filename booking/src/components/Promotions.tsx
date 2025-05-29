import React from 'react';
import { Calendar, Clock, Percent } from 'lucide-react';

const Promotions: React.FC = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Special Offers</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover special offers and great discounts just for you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <PromotionCard 
            title="Weekend Getaway"
            description="Save up to 25% on room bookings at high-end hotels on weekends"
            icon={<Calendar size={24} />}
            bgColor="bg-blue-500"
            imageUrl="https://images.pexels.com/photos/237272/pexels-photo-237272.jpeg"
          />
          
          <PromotionCard 
            title="Early Bird Discount"
            description="Book your room 30 days in advance and get a 30% discount"
            icon={<Clock size={24} />}
            bgColor="bg-green-500"
            imageUrl="https://images.pexels.com/photos/2029719/pexels-photo-2029719.jpeg"
          />
          
          <PromotionCard 
            title="Member Discount"
            description="Register as a member to get an additional 10% discount on all bookings"
            icon={<Percent size={24} />}
            bgColor="bg-purple-500"
            imageUrl="https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg"
          />
        </div>
      </div>
    </section>
  );
};

interface PromotionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  imageUrl: string;
}

const PromotionCard: React.FC<PromotionCardProps> = ({ 
  title, 
  description, 
  icon, 
  bgColor,
  imageUrl
}) => {
  return (
    <div className="rounded-xl overflow-hidden shadow-lg group">
      <div className="relative h-48">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute top-4 left-4">
          <div className={`${bgColor} p-3 rounded-lg text-white`}>
            {icon}
          </div>
        </div>
      </div>
      
      <div className="p-6 bg-white">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <button className="text-blue-600 font-medium hover:text-blue-800 transition-colors flex items-center">
            View details
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Promotions;
