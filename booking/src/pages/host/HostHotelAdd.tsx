import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hotel, MapPin, Phone, Mail, Globe, Star, Clock, DollarSign, Image as ImageIcon, Save, ArrowLeft } from 'lucide-react';
import { hotelAPI, HotelCreateRequest } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const HostHotelAdd: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<HotelCreateRequest>({
    name: '',
    description: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    starRating: 1,
    checkInTime: '',
    checkOutTime: '',
    imageUrl: '',
    pricePerNight: 0,
    amenities: '',
    cancellationPolicy: '',
    petPolicy: ''
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Tên khách sạn là bắt buộc';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Tên khách sạn phải có ít nhất 2 ký tự';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ là bắt buộc';
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Phone validation
    if (formData.phone && !/^[+]?[0-9\s\-\(\)]{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    // Website validation
    if (formData.website && !/^(https?:\/\/)?(www\.)?[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(\/.*)?$/.test(formData.website)) {
      newErrors.website = 'Website không hợp lệ';
    }

    // Price validation
    if (formData.pricePerNight && formData.pricePerNight <= 0) {
      newErrors.pricePerNight = 'Giá phòng phải lớn hơn 0';
    }

    // Time validation
    if (formData.checkInTime && formData.checkOutTime) {
      if (formData.checkInTime >= formData.checkOutTime) {
        newErrors.checkOutTime = 'Giờ trả phòng phải sau giờ nhận phòng';
      }
    }

    // Image URL validation
    if (formData.imageUrl && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(formData.imageUrl)) {
      newErrors.imageUrl = 'URL hình ảnh không hợp lệ (chỉ chấp nhận jpg, jpeg, png, gif, webp)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('error', 'Lỗi', 'Vui lòng kiểm tra lại thông tin đã nhập');
      return;
    }

    try {
      setLoading(true);
      
      // Ensure featured is not set by host - backend will handle this
      const submitData = { ...formData, isFeatured: false };
      
      const response = await hotelAPI.createMyHotel(submitData);
      
      if (response.data.success) {
        showToast('success', 'Thành công', 'Đã thêm khách sạn mới');
        navigate('/host/hotels');
      } else {
        throw new Error(response.data.message || 'Không thể thêm khách sạn');
      }
    } catch (error: any) {
      console.error('Error creating hotel:', error);
      showToast('error', 'Lỗi', error.response?.data?.message || error.message || 'Không thể thêm khách sạn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/host/hotels')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Thêm khách sạn mới</h1>
                <p className="text-gray-600 mt-1">Điền thông tin chi tiết để tạo khách sạn mới</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-900">
                <Hotel className="mr-3 text-blue-600" size={24} />
                Thông tin cơ bản
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên khách sạn *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thành phố
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quốc gia
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Mô tả chi tiết về khách sạn của bạn..."
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-900">
                <Phone className="mr-3 text-green-600" size={24} />
                Thông tin liên hệ
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.website ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.website && <p className="mt-1 text-sm text-red-600">{errors.website}</p>}
                </div>
              </div>
            </div>

            {/* Hotel Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-900">
                <Star className="mr-3 text-yellow-600" size={24} />
                Chi tiết khách sạn
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hạng sao
                  </label>
                  <select
                    name="starRating"
                    value={formData.starRating}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5].map(rating => (
                      <option key={rating} value={rating}>{rating} sao</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá mỗi đêm (VND)
                  </label>
                  <input
                    type="number"
                    name="pricePerNight"
                    min="0"
                    step="1000"
                    value={formData.pricePerNight}
                    onChange={handleInputChange}
                    placeholder="VD: 500000"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.pricePerNight ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.pricePerNight && <p className="mt-1 text-sm text-red-600">{errors.pricePerNight}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giờ nhận phòng
                  </label>
                  <input
                    type="time"
                    name="checkInTime"
                    value={formData.checkInTime}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.checkInTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.checkInTime && <p className="mt-1 text-sm text-red-600">{errors.checkInTime}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giờ trả phòng
                  </label>
                  <input
                    type="time"
                    name="checkOutTime"
                    value={formData.checkOutTime}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.checkOutTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.checkOutTime && <p className="mt-1 text-sm text-red-600">{errors.checkOutTime}</p>}
                </div>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tiện nghi khách sạn</h3>
                <textarea
                  name="amenities"
                  rows={3}
                  value={formData.amenities}
                  onChange={handleInputChange}
                  placeholder="VD: WiFi miễn phí, Bể bơi, Gym, Spa, Nhà hàng, Bar..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                {/* Predefined Amenity Tags */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Chọn tiện nghi có sẵn (click để thêm/bỏ)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Wifi miễn phí', 'Hồ bơi', 'Spa & Massage', 'Nhà hàng', 'Phòng gym', 
                      'Bãi đỗ xe', 'Dịch vụ phòng 24/7', 'Lễ tân 24/7', 'Thang máy',
                      'Điều hòa', 'Tivi', 'Tủ lạnh mini', 'Két an toàn', 'Máy sấy tóc',
                      'Bồn tắm', 'Vòi sen', 'Dép đi trong phòng', 'Áo choàng tắm',
                      'Bàn làm việc', 'Ghế sofa', 'Ban công', 'Tầm nhìn ra biển',
                      'Tầm nhìn ra thành phố', 'Tầm nhìn ra núi', 'Quầy bar', 'Karaoke',
                      'Sân tennis', 'Sân golf', 'Bãi biển riêng', 'Dịch vụ giặt ủi',
                      'Dịch vụ đưa đón sân bay', 'Cho thuê xe đạp', 'Khu vui chơi trẻ em',
                      'Phòng họp', 'Trung tâm thương mại', 'ATM', 'Cửa hàng lưu niệm'
                    ].map((amenity) => {
                      const isSelected = (formData.amenities || '').split(',').map(a => a.trim()).includes(amenity);
                      return (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => {
                            const currentAmenities = (formData.amenities || '').split(',').map(a => a.trim()).filter(a => a);
                            if (isSelected) {
                              // Remove amenity
                              const updatedAmenities = currentAmenities.filter(a => a !== amenity);
                              setFormData(prev => ({
                                ...prev,
                                amenities: updatedAmenities.join(', ')
                              }));
                            } else {
                              // Add amenity
                              const updatedAmenities = [...currentAmenities, amenity];
                              setFormData(prev => ({
                                ...prev,
                                amenities: updatedAmenities.join(', ')
                              }));
                            }
                          }}
                          className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-200 hover:shadow-md ${
                            isSelected
                              ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                              : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                          }`}
                        >
                          {isSelected && <span className="mr-1">✓</span>}
                          {amenity}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Tip: Click vào các thẻ để thêm/bỏ tiện nghi. Bạn cũng có thể nhập trực tiếp vào ô text phía trên.
                  </p>
                </div>
              </div>
            </div>

            {/* Policies */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-900">
                <Clock className="mr-3 text-purple-600" size={24} />
                Chính sách khách sạn
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chính sách hủy phòng
                  </label>
                  <textarea
                    name="cancellationPolicy"
                    rows={3}
                    value={formData.cancellationPolicy}
                    onChange={handleInputChange}
                    placeholder="VD: Miễn phí hủy phòng trước 24 giờ..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chính sách thú cưng
                  </label>
                  <textarea
                    name="petPolicy"
                    rows={3}
                    value={formData.petPolicy}
                    onChange={handleInputChange}
                    placeholder="VD: Cho phép thú cưng với phí phụ thu..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-900">
                <ImageIcon className="mr-3 text-indigo-600" size={24} />
                Hình ảnh khách sạn
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL hình ảnh
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/hotel-image.jpg"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.imageUrl ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.imageUrl && <p className="mt-1 text-sm text-red-600">{errors.imageUrl}</p>}
                {formData.imageUrl && !errors.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-32 h-20 object-cover rounded-lg border border-gray-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 sm:justify-end pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/host/hotels')}
                className="w-full sm:w-auto px-8 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Save size={20} className="mr-2" />
                    Tạo khách sạn
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default HostHotelAdd; 