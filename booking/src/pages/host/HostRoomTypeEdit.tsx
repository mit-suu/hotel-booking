import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, BedDouble, Users, DollarSign, Image, FileText, Hotel, Home, Tag } from 'lucide-react';
import { hostRoomTypeAPI, hotelAPI, RoomTypeResponse, RoomTypeUpdateRequest } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface Hotel {
  id: string;
  name: string;
}

const HostRoomTypeEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [roomType, setRoomType] = useState<RoomTypeResponse | null>(null);
  
  const [formData, setFormData] = useState<RoomTypeUpdateRequest>({
    name: '',
    description: '',
    maxOccupancy: 1,
    bedType: '',
    roomSize: 0,
    pricePerNight: 0,
    totalRooms: 1,
    imageUrl: '',
    amenities: '',
    hotelId: ''
  });

  const predefinedAmenities = [
    'WiFi miễn phí', 'Điều hòa không khí', 'TV màn hình phẳng', 'Minibar', 'Két an toàn',
    'Máy sấy tóc', 'Bàn làm việc', 'Ghế sofa', 'Ban công', 'Tầm nhìn ra biển',
    'Tầm nhìn ra thành phố', 'Tầm nhìn ra núi', 'Phòng tắm riêng', 'Bồn tắm', 'Vòi sen',
    'Đồ vệ sinh cá nhân', 'Khăn tắm', 'Dép đi trong phòng', 'Áo choàng tắm', 'Máy pha cà phê',
    'Ấm đun nước', 'Tủ lạnh mini', 'Máy lạnh', 'Quạt trần', 'Cửa sổ mở được',
    'Rèm che', 'Giường đôi', 'Giường đơn', 'Ga trải giường', 'Gối bông',
    'Chăn ấm', 'Đèn đọc sách', 'Ổ cắm điện', 'Máy hút bụi', 'Điện thoại',
    'Radio', 'Loa Bluetooth', 'Sạc điện thoại', 'Internet tốc độ cao'
  ];

  useEffect(() => {
    if (id) {
      fetchRoomType();
      fetchHotels();
    }
  }, [id]);

  const fetchRoomType = async () => {
    try {
      setLoading(true);
      const response = await hostRoomTypeAPI.getMyRoomTypeById(id!);
      const roomTypeData = response.data.result;
      setRoomType(roomTypeData);
      
      // Populate form data
      setFormData({
        name: roomTypeData.name,
        description: roomTypeData.description || '',
        maxOccupancy: roomTypeData.maxOccupancy,
        bedType: roomTypeData.bedType || '',
        roomSize: roomTypeData.roomSize || 0,
        pricePerNight: roomTypeData.pricePerNight,
        totalRooms: roomTypeData.totalRooms,
        imageUrl: roomTypeData.imageUrl || '',
        amenities: roomTypeData.amenities || '',
        hotelId: roomTypeData.hotelId
      });

      // Set selected amenities
      if (roomTypeData.amenities) {
        setSelectedAmenities(roomTypeData.amenities.split(',').map(item => item.trim()));
      }
    } catch (error) {
      console.error('Error fetching room type:', error);
      showToast('error', 'Lỗi khi tải thông tin loại phòng');
      navigate('/host/room-types');
    } finally {
      setLoading(false);
    }
  };

  const fetchHotels = async () => {
    try {
              const response = await hotelAPI.getMyHotels(0, 100);
      setHotels(response.data.result.content);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => {
      const newSelection = prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity];
      
      // Update formData.amenities
      setFormData(prevFormData => ({
        ...prevFormData,
        amenities: newSelection.join(', ')
      }));
      
      return newSelection;
    });
  };

  const handleAmenitiesTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, amenities: value }));
    setSelectedAmenities(value.split(',').map(item => item.trim()).filter(item => item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showToast('error', 'Vui lòng nhập tên loại phòng');
      return;
    }

    if (formData.pricePerNight <= 0) {
      showToast('error', 'Vui lòng nhập giá phòng hợp lệ');
      return;
    }

    if (formData.totalRooms <= 0) {
      showToast('error', 'Vui lòng nhập số lượng phòng hợp lệ');
      return;
    }

    try {
      setSaving(true);
      await hostRoomTypeAPI.updateMyRoomType(id!, formData);
      showToast('success', 'Cập nhật loại phòng thành công');
      navigate(`/host/room-types/${id}`);
    } catch (error) {
      console.error('Error updating room type:', error);
      showToast('error', 'Lỗi khi cập nhật loại phòng');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!roomType) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Không tìm thấy loại phòng</h2>
            <p className="mt-2 text-gray-600">Loại phòng không tồn tại hoặc bạn không có quyền truy cập.</p>
            <button
              onClick={() => navigate('/host/room-types')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate(`/host/room-types/${id}`)}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa loại phòng</h1>
                <p className="mt-2 text-gray-600">Cập nhật thông tin loại phòng: {roomType.name}</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hotel Information (Read-only) */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Hotel className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Khách sạn</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Khách sạn
              </label>
              <input
                type="text"
                value={roomType.hotelName}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="mt-1 text-sm text-gray-500">Không thể thay đổi khách sạn cho loại phòng đã tồn tại</p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <BedDouble className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Thông tin cơ bản</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên loại phòng *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="VD: Phòng Deluxe"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại giường
                </label>
                <select
                  name="bedType"
                  value={formData.bedType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Chọn loại giường</option>
                  <option value="Single">Giường đơn</option>
                  <option value="Double">Giường đôi</option>
                  <option value="Queen">Giường Queen</option>
                  <option value="King">Giường King</option>
                  <option value="Twin">Giường đôi riêng biệt</option>
                  <option value="Sofa Bed">Giường sofa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sức chứa tối đa *
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="maxOccupancy"
                    value={formData.maxOccupancy}
                    onChange={handleNumberInputChange}
                    min="1"
                    max="10"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diện tích (m²)
                </label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="roomSize"
                    value={formData.roomSize}
                    onChange={handleNumberInputChange}
                    min="1"
                    step="0.1"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Mô tả chi tiết về loại phòng..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Pricing & Availability */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                <DollarSign className="h-5 w-5 text-yellow-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Giá & Số lượng</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá mỗi đêm (VNĐ) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="pricePerNight"
                    value={formData.pricePerNight}
                    onChange={handleNumberInputChange}
                    min="0"
                    step="1000"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tổng số phòng *
                </label>
                <input
                  type="number"
                  name="totalRooms"
                  value={formData.totalRooms}
                  onChange={handleNumberInputChange}
                  min="1"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Hiện có {roomType.availableRooms} phòng trống / {roomType.totalRooms} tổng số phòng
                </p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <Image className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Hình ảnh</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL hình ảnh
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/room-image.jpg"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {formData.imageUrl && (
                <div className="mt-3">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-32 h-24 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                <Tag className="h-5 w-5 text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Tiện nghi</h2>
            </div>

            {/* Predefined Amenity Tags */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Chọn tiện nghi có sẵn:
              </label>
              <div className="flex flex-wrap gap-2">
                {predefinedAmenities.map((amenity, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      selectedAmenities.includes(amenity)
                        ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                        : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                    }`}
                  >
                    {selectedAmenities.includes(amenity) && '✓ '}
                    {amenity}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hoặc nhập tiện nghi (phân cách bằng dấu phẩy):
              </label>
              <textarea
                name="amenities"
                value={formData.amenities}
                onChange={handleAmenitiesTextChange}
                rows={3}
                placeholder="WiFi miễn phí, Điều hòa không khí, TV màn hình phẳng..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(`/host/room-types/${id}`)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HostRoomTypeEdit; 