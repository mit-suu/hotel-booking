import React from 'react';
import { Users, Award, Clock, Shield } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <div className="relative bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About FBooking
            </h1>
            <p className="text-xl opacity-90">
              We are the leading hotel booking platform in Vietnam, 
              providing excellent booking experiences at the best prices.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">1M+</div>
              <div className="text-gray-600">Customers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600">Partner Hotels</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">63</div>
              <div className="text-gray-600">Provinces</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">4.8/5</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Us?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              FBooking is committed to providing the best booking experience for customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="24/7 Customer Service"
              description="Professional support team, ready to serve at all times"
            />
            <FeatureCard
              icon={<Award className="h-8 w-8" />}
              title="Best Prices"
              description="Guaranteed most competitive prices in the market"
            />
            <FeatureCard
              icon={<Clock className="h-8 w-8" />}
              title="Quick Booking"
              description="Simple booking process, saving time"
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Safe & Secure"
              description="Protecting customer information and transactions"
            />
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              People who always strive to bring the best experience to customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TeamMember
              name="John Smith"
              position="Chief Executive Officer"
              image="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg"
            />
            <TeamMember
              name="Sarah Johnson"
              position="Marketing Director"
              image="https://images.pexels.com/photos/3796217/pexels-photo-3796217.jpeg"
            />
            <TeamMember
              name="Michael Brown"
              position="Head of Technology"
              image="https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="text-center p-6">
      <div className="text-blue-600 mb-4 flex justify-center">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

interface TeamMemberProps {
  name: string;
  position: string;
  image: string;
}

const TeamMember: React.FC<TeamMemberProps> = ({ name, position, image }) => {
  return (
    <div className="text-center">
      <div className="mb-4">
        <img
          src={image}
          alt={name}
          className="w-32 h-32 rounded-full mx-auto object-cover"
        />
      </div>
      <h3 className="text-xl font-semibold mb-1">{name}</h3>
      <p className="text-gray-600">{position}</p>
    </div>
  );
};

export default AboutPage;
