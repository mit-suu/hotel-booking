import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash, Star, MapPin, Home, BedDouble, Bath, Users, Calendar, DollarSign, Clock, Plus } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  bedType: string;
  size: string;
  amenities: string[];
  image: string;
  status: 'available' | 'booked' | 'maintenance';
}

interface Booking {
  id: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomName: string;
  totalAmount: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  createdAt: string;
}

interface Review {
  id: string;
  guestName: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
}

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('rooms');

  // Sample property data - in a real app, you would fetch this based on the ID
  const property = {
    id: '1',
    name: 'Vinpearl Resort & Spa',
    type: 'Resort',
    location: 'Nha Trang',
    address: '78 Trần Phú, Lộc Thọ, Nha Trang, Khánh Hòa',
    description: 'Khu nghỉ dưỡng sang trọng với view biển tuyệt đẹp, đầy đủ tiện nghi cao cấp. Vinpearl Resort & Spa Nha Trang là một trong những khu nghỉ dưỡng hàng đầu tại Việt Nam, nằm trên bãi biển riêng với cát trắng mịn và nước biển trong xanh. Khu nghỉ dưỡng cung cấp các phòng nghỉ sang trọng với tầm nhìn ra biển hoặc vườn nhiệt đới, nhiều nhà hàng phục vụ ẩm thực đa dạng, hồ bơi ngoài trời, spa đẳng cấp và nhiều hoạt động giải trí.',
    price: 2500000,
    rating: 4.8,
    reviewCount: 124,
    rooms: 15,
    bathrooms: 12,
    amenities: ['Wifi', 'Hồ bơi', 'Spa', 'Nhà hàng', 'Phòng gym', 'Bãi đỗ xe', 'Dịch vụ phòng 24/7', 'Điều hòa'],
    status: 'active',
    images: [
      'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg',
      'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg',
      'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
      'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
      'https://images.pexels.com/photos/237371/pexels-photo-237371.jpeg'
    ]
  };

  // Sample rooms data
  const rooms: Room[] = [
    {
      id: 'r1',
      name: 'Deluxe Ocean View',
      description: 'Phòng sang trọng với view biển tuyệt đẹp, đầy đủ tiện nghi cao cấp',
      price: 2500000,
      capacity: 2,
      bedType: 'King size',
      size: '45m²',
      amenities: ['Wifi', 'Minibar', 'TV', 'Điều hòa', 'Bồn tắm'],
      image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
      status: 'available'
    },
    {
      id: 'r2',
      name: 'Premium Suite',
      description: 'Phòng suite rộng rãi với thiết kế cổ điển sang trọng',
      price: 3200000,
      capacity: 3,
      bedType: 'King size + Single',
      size: '65m²',
      amenities: ['Wifi', 'Minibar', 'TV', 'Điều hòa', 'Phòng khách riêng'],
      image: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
      status: 'booked'
    },
    {
      id: 'r3',
      name: 'Family Room',
      description: 'Phòng gia đình rộng rãi với đầy đủ tiện nghi cho cả gia đình',
      price: 2800000,
      capacity: 4,
      bedType: '2 Queen size',
      size: '55m²',
      amenities: ['Wifi', 'Minibar', 'TV', 'Điều hòa', '2 phòng ngủ'],
      image: 'https://images.pexels.com/photos/237371/pexels-photo-237371.jpeg',
      status: 'available'
    },
    {
      id: 'r4',
      name: 'Standard Room',
      description: 'Phòng tiêu chuẩn thoải mái với đầy đủ tiện nghi cơ bản',
      price: 1200000,
      capacity: 2,
      bedType: 'Queen size',
      size: '35m²',
      amenities: ['Wifi', 'TV', 'Điều hòa'],
      image: 'https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg',
      status: 'maintenance'
    }
  ];

  // Sample bookings data
  const bookings: Booking[] = [
    {
      id: 'BK-001',
      guestName: 'Nguyễn Văn An',
      checkIn: '2023-10-15',
      checkOut: '2023-10-18',
      guests: 2,
      roomName: 'Deluxe Ocean View',
      totalAmount: 7500000,
      status: 'confirmed',
      createdAt: '2023-09-20'
    },
    {
      id: 'BK-002',
      guestName: 'Trần Thị Bình',
      checkIn: '2023-10-20',
      checkOut: '2023-10-22',
      guests: 3,
      roomName: 'Premium Suite',
      totalAmount: 6400000,
      status: 'pending',
      createdAt: '2023-10-01'
    },
    {
      id: 'BK-003',
      guestName: 'Lê Văn Cường',
      checkIn: '2023-09-25',
      checkOut: '2023-09-30',
      guests: 4,
      roomName: 'Family Room',
      totalAmount: 8400000,
      status: 'completed',
      createdAt: '2023-08-15'
    }
  ];

  // Sample reviews data
  const reviews: Review[] = [
    {
      id: 'rev1',
      guestName: 'Nguyễn Thị Minh',
      rating: 5,
      comment: 'Phòng rất đẹp và sạch sẽ. View nhìn ra biển tuyệt vời, đặc biệt là lúc bình minh. Nhân viên phục vụ rất nhiệt tình và chu đáo. Sẽ quay lại lần sau!',
      date: '2023-09-15',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      id: 'rev2',
      guestName: 'Trần Văn Hùng',
      rating: 4.5,
      comment: 'Phòng rộng rãi, thoáng mát và đầy đủ tiện nghi. Vị trí khách sạn rất thuận tiện để đi tham quan các điểm du lịch. Bữa sáng phong phú. Chỉ có một điểm trừ nhỏ là hơi ồn vào buổi tối.',
      date: '2023-08-20',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 'rev3',
      guestName: 'Lê Thị Hương',
      rating: 5,
      comment: 'Tuyệt vời! Phòng đẹp, sạch sẽ, view biển tuyệt đẹp. Nhân viên thân thiện và chuyên nghiệp. Đồ ăn ngon. Chắc chắn sẽ quay lại và giới thiệu cho bạn bè.',
      date: '2023-07-10',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
    }
  ];

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const renderRatingStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-5 w-5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Available</span>;
      case 'booked':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Booked</span>;
      case 'maintenance':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Maintenance</span>;
      case 'confirmed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Confirmed</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Cancelled</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Completed</span>;
      default:
        return null;
    }
  };

  const handleEditProperty = () => {
    navigate(`/host/properties/edit/${id}`);
  };

  const handleDeleteProperty = () => {
    if (window.confirm('Are you sure you want to delete this hotel?')) {
      navigate('/host/properties');
    }
  };

  const handleAddRoom = () => {
    navigate(`/host/properties/${id}/add-room`);
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/host/properties')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={20} className="mr-1" />
          Back to Hotel List
        </button>

        {/* Property Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="relative">
            <div className="grid grid-cols-3 gap-2 h-64">
              <div className="col-span-2">
                <img
                  src={property.images[0]}
                  alt={property.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-rows-2 gap-2">
                <img
                  src={property.images[1]}
                  alt={property.name}
                  className="w-full h-full object-cover"
                />
                <div className="relative">
                  <img
                    src={property.images[2]}
                    alt={property.name}
                    className="w-full h-full object-cover"
                  />
                  {property.images.length > 3 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white text-lg font-medium">+{property.images.length - 3}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
                <div className="flex items-center text-gray-600 mt-2">
                  <MapPin className="h-5 w-5 mr-1" />
                  <span>{property.address}</span>
                </div>
                <div className="flex items-center mt-2">
                  <div className="flex mr-2">
                    {renderRatingStars(property.rating)}
                  </div>
                  <span className="text-gray-700">{property.rating} ({property.reviewCount} reviews)</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleEditProperty}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors flex items-center"
                >
                  <Edit size={18} className="mr-2" />
                  Edit
                </button>
                <button
                  onClick={handleDeleteProperty}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                >
                  <Trash size={18} className="mr-2" />
                  Delete
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Basic Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Home className="h-5 w-5 mr-2 text-blue-600" />
                                          <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="font-medium">{property.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <BedDouble className="h-5 w-5 mr-2 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Rooms</p>
                        <p className="font-medium">{property.rooms} rooms</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-5 w-5 mr-2 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Bathrooms</p>
                        <p className="font-medium">{property.bathrooms} bathrooms</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Base Price</p>
                        <p className="font-medium">{formatCurrency(property.price)}/night</p>
                      </div>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Amenities</h2>
                <div className="grid grid-cols-2 gap-2">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{property.description}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('rooms')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'rooms'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Room List
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'bookings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Bookings
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'reviews'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Reviews
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Rooms Tab */}
            {activeTab === 'rooms' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Room List</h2>
                  <button
                    onClick={handleAddRoom}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Plus size={18} className="mr-2" />
                    Add New Room
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rooms.map((room) => (
                    <div key={room.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="relative">
                        <img
                          src={room.image}
                          alt={room.name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-4 right-4">
                          {getStatusBadge(room.status)}
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                        <p className="text-gray-600 text-sm mb-3">{room.description}</p>
                        
                        <div className="flex flex-wrap gap-4 mb-3 text-gray-600 text-sm">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{room.capacity} guests</span>
                          </div>
                          <div className="flex items-center">
                            <BedDouble className="h-4 w-4 mr-1" />
                            <span>{room.bedType}</span>
                          </div>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <path d="M3 9h18" />
                              <path d="M9 21V9" />
                            </svg>
                            <span>{room.size}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {room.amenities.slice(0, 3).map((amenity, index) => (
                            <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                              {amenity}
                            </span>
                          ))}
                          {room.amenities.length > 3 && (
                            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                              +{room.amenities.length - 3}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-blue-600">
                            {formatCurrency(room.price)}
                            <span className="text-sm text-gray-500 font-normal">/night</span>
                          </span>
                          <div className="flex space-x-2">
                            <button 
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                              title="Delete"
                            >
                              <Trash size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Recent Bookings</h2>
                
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <span className="mr-2">Booking #{booking.id}</span>
                            {getStatusBadge(booking.status)}
                          </h3>
                          <p className="text-gray-500 text-sm">Booked on: {formatDate(booking.createdAt)}</p>
                        </div>
                                                  <button
                            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            View Details
                          </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Guest Info */}
                                                  <div className="space-y-1">
                            <h4 className="font-medium text-gray-700 flex items-center">
                              <Users size={16} className="mr-2" />
                              Guest Information
                            </h4>
                            <p className="text-gray-900">{booking.guestName}</p>
                            <p className="text-gray-600">{booking.guests} guests</p>
                          </div>

                          {/* Booking Details */}
                          <div className="space-y-1">
                            <h4 className="font-medium text-gray-700 flex items-center">
                              <Calendar size={16} className="mr-2" />
                              Booking Details
                            </h4>
                            <p className="text-gray-900">{booking.roomName}</p>
                            <p className="text-gray-600">
                              {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                            </p>
                          </div>

                          {/* Payment Info */}
                          <div className="space-y-1">
                            <h4 className="font-medium text-gray-700 flex items-center">
                              <DollarSign size={16} className="mr-2" />
                              Payment Information
                            </h4>
                            <p className="text-gray-900 font-medium">
                              {formatCurrency(booking.totalAmount)}
                            </p>
                          </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Customer Reviews</h2>
                  <div className="flex items-center">
                    <div className="flex mr-2">
                      {renderRatingStars(property.rating)}
                    </div>
                                          <span className="text-gray-700">{property.rating} ({property.reviewCount} reviews)</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6">
                      <div className="flex items-center mb-2">
                        <img 
                          src={review.avatar} 
                          alt={review.guestName} 
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <h4 className="font-medium">{review.guestName}</h4>
                          <p className="text-gray-500 text-sm">{formatDate(review.date)}</p>
                        </div>
                      </div>
                      <div className="flex mb-2">
                        {renderRatingStars(review.rating)}
                      </div>
                      <p className="text-gray-700">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
