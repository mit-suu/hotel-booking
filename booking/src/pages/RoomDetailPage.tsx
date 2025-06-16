import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, MapPin, Users, Calendar, Check, ArrowLeft, Heart, Share } from 'lucide-react';
import DatePicker from '../components/DatePicker';

const RoomDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Sample room data - in a real app, you would fetch this based on the ID
  const room = {
    id: '1',
    name: 'Deluxe Ocean View',
    hotelName: 'Vinpearl Resort & Spa',
    location: 'Nha Trang',
    price: 2500000,
    rating: 4.8,
    reviewCount: 124,
    description: 'Luxurious room with stunning ocean view, fully equipped with premium amenities. The room is designed in a modern, elegant style with spacious area and natural light. From the balcony, you can admire the beautiful panoramic view of Nha Trang bay.',
    longDescription: 'Phòng Deluxe Ocean View tại Vinpearl Resort & Spa Nha Trang là sự lựa chọn hoàn hảo cho kỳ nghỉ của bạn. Với diện tích 45m², phòng được thiết kế theo phong cách hiện đại, trang nhã với không gian rộng rãi và ánh sáng tự nhiên. Từ ban công phòng, bạn có thể ngắm nhìn toàn cảnh biển Nha Trang tuyệt đẹp.\n\nPhòng được trang bị đầy đủ tiện nghi cao cấp như giường King size hoặc 2 giường đơn với chăn ga gối đệm cao cấp, điều hòa nhiệt độ, TV màn hình phẳng với các kênh quốc tế, minibar, két an toàn, và bàn làm việc.\n\nPhòng tắm sang trọng với bồn tắm riêng, vòi sen, máy sấy tóc và bộ đồ dùng phòng tắm cao cấp. Dịch vụ dọn phòng hàng ngày, WiFi miễn phí tốc độ cao và dịch vụ phòng 24/7 sẽ đảm bảo kỳ nghỉ của bạn thật thoải mái và tiện nghi.',
    amenities: [
      'Wifi miễn phí',
      'Điều hòa',
      'TV màn hình phẳng',
      'Minibar',
      'Két an toàn',
              'Work Desk',
      'Bồn tắm',
      'Máy sấy tóc',
      'Ban công riêng',
              '24/7 Room Service'
    ],
    capacity: 2,
    bedType: 'King size hoặc 2 giường đơn',
    size: '45m²',
    images: [
      'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
      'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
      'https://images.pexels.com/photos/237371/pexels-photo-237371.jpeg',
      'https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg'
    ],
    policies: [
              'Check-in: 14:00',
        'Check-out: 12:00',
      'Hủy miễn phí trước 3 ngày',
      'Không hút thuốc',
      'Không mang vật nuôi'
    ]
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const renderRatingStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-5 w-5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <button 
          onClick={() => window.history.back()}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={20} className="mr-1" />
          Quay lại
        </button>

        {/* Room images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="md:col-span-1">
            <img 
              src={room.images[0]} 
              alt={room.name} 
              className="w-full h-80 object-cover rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 md:col-span-1">
            {room.images.slice(1, 5).map((image, index) => (
              <div key={index} className="relative">
                <img 
                  src={image} 
                  alt={`${room.name} ${index + 2}`} 
                  className="w-full h-[150px] object-cover rounded-lg"
                />
                {index === 2 && room.images.length > 4 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <span className="text-white text-lg font-medium">+{room.images.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Room details */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{room.name}</h1>
                  <p className="text-xl text-blue-600">{room.hotelName}</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <Heart 
                      size={24} 
                      className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"} 
                    />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <Share size={24} className="text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="flex items-center mt-2 mb-4">
                <div className="flex mr-2">
                  {renderRatingStars(room.rating)}
                </div>
                <span className="text-gray-700">{room.rating} ({room.reviewCount} đánh giá)</span>
              </div>

              <div className="flex items-center text-gray-700 mb-6">
                <MapPin className="h-5 w-5 mr-1" />
                <span>{room.location}</span>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold mb-4">Room Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Sức chứa</p>
                      <p className="font-medium">{room.capacity} người</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 4v16" />
                      <path d="M2 8h18a2 2 0 0 1 2 2v10" />
                      <path d="M2 17h20" />
                      <path d="M6 8v9" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Loại giường</p>
                      <p className="font-medium">{room.bedType}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 9h18" />
                      <path d="M9 21V9" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Diện tích</p>
                      <p className="font-medium">{room.size}</p>
                    </div>
                  </div>
                </div>

                <h2 className="text-xl font-semibold mb-4">Mô tả</h2>
                <p className="text-gray-700 mb-6 whitespace-pre-line">{room.longDescription}</p>

                <h2 className="text-xl font-semibold mb-4">Tiện nghi</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                  {room.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="h-5 w-5 mr-2 text-green-500" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>

                <h2 className="text-xl font-semibold mb-4">Chính sách</h2>
                <ul className="list-disc pl-5 mb-6">
                  {room.policies.map((policy, index) => (
                    <li key={index} className="text-gray-700 mb-1">{policy}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Reviews section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
              <div className="flex items-center mb-6">
                <div className="flex mr-2">
                  {renderRatingStars(room.rating)}
                </div>
                <span className="text-gray-700">{room.rating} ({room.reviewCount} đánh giá)</span>
              </div>

              {/* Sample reviews */}
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-center mb-2">
                    <img 
                      src="https://randomuser.me/api/portraits/women/44.jpg" 
                      alt="Reviewer" 
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <h4 className="font-medium">Nguyễn Thị Minh</h4>
                      <p className="text-gray-500 text-sm">Tháng 9, 2023</p>
                    </div>
                  </div>
                  <div className="flex mb-2">
                    {renderRatingStars(5)}
                  </div>
                  <p className="text-gray-700">
                    Phòng rất đẹp và sạch sẽ. View nhìn ra biển tuyệt vời, đặc biệt là lúc bình minh. Nhân viên phục vụ rất nhiệt tình và chu đáo. Sẽ quay lại lần sau!
                  </p>
                </div>

                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-center mb-2">
                    <img 
                      src="https://randomuser.me/api/portraits/men/32.jpg" 
                      alt="Reviewer" 
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <h4 className="font-medium">Trần Văn Hùng</h4>
                      <p className="text-gray-500 text-sm">Tháng 8, 2023</p>
                    </div>
                  </div>
                  <div className="flex mb-2">
                    {renderRatingStars(4.5)}
                  </div>
                  <p className="text-gray-700">
                    Phòng rộng rãi, thoáng mát và đầy đủ tiện nghi. Vị trí khách sạn rất thuận tiện để đi tham quan các điểm du lịch. Bữa sáng phong phú. Chỉ có một điểm trừ nhỏ là hơi ồn vào buổi tối.
                  </p>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <img 
                      src="https://randomuser.me/api/portraits/women/68.jpg" 
                      alt="Reviewer" 
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <h4 className="font-medium">Lê Thị Hương</h4>
                      <p className="text-gray-500 text-sm">Tháng 7, 2023</p>
                    </div>
                  </div>
                  <div className="flex mb-2">
                    {renderRatingStars(5)}
                  </div>
                  <p className="text-gray-700">
                    Tuyệt vời! Phòng đẹp, sạch sẽ, view biển tuyệt đẹp. Nhân viên thân thiện và chuyên nghiệp. Đồ ăn ngon. Chắc chắn sẽ quay lại và giới thiệu cho bạn bè.
                  </p>
                </div>
              </div>

              <button className="mt-6 w-full py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                View all {room.reviewCount} reviews
              </button>
            </div>
          </div>

          {/* Booking card */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <div className="mb-4">
                <span className="text-3xl font-bold text-blue-600">{formatPrice(room.price)}</span>
                <span className="text-gray-500">/đêm</span>
              </div>

              <div className="border border-gray-200 rounded-lg mb-4">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold mb-2">Your Booking</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div 
                      className="border border-gray-300 rounded-lg p-3 cursor-pointer hover:border-blue-500"
                      onClick={() => setShowDatePicker(true)}
                    >
                      <p className="text-xs text-gray-500">Nhận phòng</p>
                      <p className="font-medium">22/10/2023</p>
                    </div>
                    <div 
                      className="border border-gray-300 rounded-lg p-3 cursor-pointer hover:border-blue-500"
                      onClick={() => setShowDatePicker(true)}
                    >
                      <p className="text-xs text-gray-500">Trả phòng</p>
                      <p className="font-medium">25/10/2023</p>
                    </div>
                  </div>
                  
                  {showDatePicker && (
                    <div className="mt-2">
                      <DatePicker onClose={() => setShowDatePicker(false)} />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số lượng khách
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-lg">
                    {[1, 2].map(num => (
                      <option key={num} value={num}>{num} khách</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span>{formatPrice(room.price)} x 3 đêm</span>
                  <span>{formatPrice(room.price * 3)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Phí dịch vụ</span>
                  <span>{formatPrice(room.price * 0.1)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Thuế</span>
                  <span>{formatPrice(room.price * 0.08)}</span>
                </div>
                <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between font-bold">
                  <span>Tổng</span>
                  <span>{formatPrice(room.price * 3 + room.price * 0.1 + room.price * 0.08)}</span>
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors mb-4">
                                  Book Now
              </button>

              <p className="text-center text-sm text-gray-500">
                Bạn chưa bị trừ tiền
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailPage;
