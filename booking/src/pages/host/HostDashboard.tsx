import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hotel, BookOpen, DollarSign, Star } from 'lucide-react';

const HostDashboard: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Properties', value: '3', icon: Hotel },
    { label: 'Active Bookings', value: '12', icon: BookOpen },
    { label: 'Monthly Revenue', value: '$8,901', icon: DollarSign },
    { label: 'Average Rating', value: '4.8', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Host Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">{stat.label}</p>
                    <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                  </div>
                  <Icon className="h-8 w-8 text-blue-500" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ManagementCard
            title="Property Management"
            description="Manage your properties and listings"
            icon={<Hotel className="h-6 w-6" />}
            onClick={() => navigate('/host/properties')}
          />
          <ManagementCard
            title="Booking Management"
            description="View and manage guest bookings"
            icon={<BookOpen className="h-6 w-6" />}
            onClick={() => navigate('/host/bookings')}
          />
          <ManagementCard
            title="Revenue Analytics"
            description="Track your earnings and performance"
            icon={<DollarSign className="h-6 w-6" />}
            onClick={() => navigate('/host/analytics')}
          />
        </div>
      </div>
    </div>
  );
};

interface ManagementCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const ManagementCard: React.FC<ManagementCardProps> = ({
  title,
  description,
  icon,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 text-left transition-all hover:shadow-lg hover:scale-105"
    >
      <div className="flex items-center mb-4">
        <div className="bg-blue-100 p-3 rounded-full mr-4">
          {icon}
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </button>
  );
};

export default HostDashboard;
