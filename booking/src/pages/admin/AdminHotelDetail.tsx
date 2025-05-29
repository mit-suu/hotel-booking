import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash, Plus, Star, MapPin, Users, BedDouble, Calendar, DollarSign, Settings, Eye, Check, X, RefreshCw, ToggleLeft, ToggleRight, Award, Phone, Mail, Globe, Clock, Shield, Heart } from 'lucide-react';
import { hotelAPI, HotelResponse, roomTypeAPI, RoomTypeResponse } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface ApiResponse {
  code: number;
  success: boolean;
  message: string;
  result: HotelResponse;
}

const AdminHotelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [hotel, setHotel] = useState<HotelResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [roomTypesLoading, setRoomTypesLoading] = useState(false);

  // Read tab from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, []);

  // Fetch hotel details from API
  const fetchHotelDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await hotelAPI.getHotelById(id);
      const data = response.data as ApiResponse;
      
      if (data.success) {
        setHotel(data.result);
      } else {
        showToast('error', 'Lỗi', data.message || 'Không thể tải thông tin khách sạn');
        navigate('/admin/hotels');
      }
    } catch (error: any) {
      console.error('Error fetching hotel details:', error);
      showToast('error', 'Lỗi', 'Không thể kết nối đến server');
      navigate('/admin/hotels');
    } finally {
      setLoading(false);
    }
  };

  // Fetch room types for this hotel
  const fetchRoomTypes = async () => {
    if (!id) return;
    
    try {
      setRoomTypesLoading(true);
      const response = await roomTypeAPI.getRoomTypesByHotel(id, 0, 50, 'name');
      const data = response.data;
      
      if (data.success) {
        setRoomTypes(data.result.content || []);
      } else {
        showToast('error', 'Lỗi', 'Không thể tải danh sách loại phòng');
      }
    } catch (error: any) {
      console.error('Error fetching room types:', error);
      showToast('error', 'Lỗi', 'Không thể kết nối đến server');
    } finally {
      setRoomTypesLoading(false);
    }
  };

  useEffect(() => {
    fetchHotelDetails();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'room-types') {
      fetchRoomTypes();
    }
  }, [activeTab, id]);

  const handleToggleStatus = async () => {
    if (!hotel || !id) return;
    
    try {
      setActionLoading('status');
      await hotelAPI.toggleHotelStatus(id);
      showToast('success', 'Thành công', 'Đã cập nhật trạng thái khách sạn');
      fetchHotelDetails();
    } catch (error: any) {
      console.error('Error toggling hotel status:', error);
      showToast('error', 'Lỗi', 'Không thể cập nhật trạng thái khách sạn');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async () => {
    if (!hotel || !id) return;
    
    try {
      setActionLoading('featured');
      await hotelAPI.toggleFeaturedStatus(id);
      showToast('success', 'Thành công', 'Đã cập nhật trạng thái nổi bật');
      fetchHotelDetails();
    } catch (error: any) {
      console.error('Error toggling featured status:', error);
      showToast('error', 'Lỗi', 'Không thể cập nhật trạng thái nổi bật');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteHotel = async () => {
    if (!hotel || !id) return;
    
    if (window.confirm('Bạn có chắc chắn muốn xóa khách sạn này? Hành động này không thể hoàn tác.')) {
      try {
        setActionLoading('delete');
        await hotelAPI.deleteHotel(id);
        showToast('success', 'Thành công', 'Đã xóa khách sạn');
        navigate('/admin/hotels');
      } catch (error: any) {
        console.error('Error deleting hotel:', error);
        showToast('error', 'Lỗi', 'Không thể xóa khách sạn');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleToggleRoomTypeStatus = async (roomTypeId: string) => {
    try {
      setActionLoading(`roomtype-${roomTypeId}`);
      await roomTypeAPI.toggleRoomTypeStatus(roomTypeId);
      showToast('success', 'Thành công', 'Đã cập nhật trạng thái loại phòng');
      fetchRoomTypes();
    } catch (error: any) {
      console.error('Error toggling room type status:', error);
      showToast('error', 'Lỗi', 'Không thể cập nhật trạng thái loại phòng');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteRoomType = async (roomTypeId: string, roomTypeName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa loại phòng "${roomTypeName}"? Hành động này không thể hoàn tác.`)) {
      try {
        setActionLoading(`delete-roomtype-${roomTypeId}`);
        await roomTypeAPI.deleteRoomType(roomTypeId);
        showToast('success', 'Thành công', 'Đã xóa loại phòng');
        fetchRoomTypes();
      } catch (error: any) {
        console.error('Error deleting room type:', error);
        showToast('error', 'Lỗi', 'Không thể xóa loại phòng');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <Check size={14} className="mr-1" />
          Hoạt động
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <X size={14} className="mr-1" />
          Không hoạt động
        </span>
      );
    }
  };

  const getFeaturedBadge = (isFeatured: boolean) => {
    if (isFeatured) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          <Award size={14} className="mr-1" />
          Nổi bật
        </span>
      );
    }
    return null;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Hotel Basic Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{hotel?.name}</h2>
            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <MapPin size={16} className="mr-2" />
                <span>{hotel?.address}</span>
              </div>
              {hotel?.city && hotel?.country && (
                <div className="flex items-center text-gray-600">
                  <span className="ml-6">{hotel.city}, {hotel.country}</span>
                </div>
              )}
              {hotel?.phone && (
                <div className="flex items-center text-gray-600">
                  <Phone size={16} className="mr-2" />
                  <span>{hotel.phone}</span>
                </div>
              )}
              {hotel?.email && (
                <div className="flex items-center text-gray-600">
                  <Mail size={16} className="mr-2" />
                  <span>{hotel.email}</span>
                </div>
              )}
              {hotel?.website && (
                <div className="flex items-center text-gray-600">
                  <Globe size={16} className="mr-2" />
                  <a href={hotel.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {hotel.website}
                  </a>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-2">
              {getStatusBadge(hotel?.isActive || false)}
              {getFeaturedBadge(hotel?.isFeatured || false)}
            </div>
            {hotel?.starRating && (
              <div className="flex items-center">
                {[...Array(hotel.starRating)].map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400 fill-current" />
                ))}
                <span className="ml-2 text-sm text-gray-600">{hotel.starRating} sao</span>
              </div>
            )}
            {hotel?.averageRating && (
              <div className="flex items-center">
                <Star size={16} className="text-yellow-400 fill-current mr-1" />
                <span className="font-medium">{hotel.averageRating.toFixed(1)}</span>
                <span className="text-gray-500 ml-1">({hotel.totalReviews || 0} đánh giá)</span>
              </div>
            )}
          </div>
        </div>

        {/* Hotel Image */}
        {hotel?.imageUrl && (
          <div className="mb-6">
            <img
              src={hotel.imageUrl}
              alt={hotel.name}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Description */}
        {hotel?.description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Mô tả</h3>
            <p className="text-gray-600 leading-relaxed">{hotel.description}</p>
          </div>
        )}

        {/* Pricing */}
        {hotel?.pricePerNight && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Giá cơ bản</h3>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(hotel.pricePerNight)}/đêm
            </div>
          </div>
        )}

        {/* Check-in/Check-out Times */}
        {(hotel?.checkInTime || hotel?.checkOutTime) && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Thời gian nhận/trả phòng</h3>
            <div className="grid grid-cols-2 gap-4">
              {hotel.checkInTime && (
                <div className="flex items-center">
                  <Clock size={16} className="mr-2 text-gray-400" />
                  <span className="text-gray-600">Nhận phòng: {hotel.checkInTime}</span>
                </div>
              )}
              {hotel.checkOutTime && (
                <div className="flex items-center">
                  <Clock size={16} className="mr-2 text-gray-400" />
                  <span className="text-gray-600">Trả phòng: {hotel.checkOutTime}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Amenities */}
        {hotel?.amenities && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tiện nghi</h3>
            <div className="flex flex-wrap gap-2">
              {hotel.amenities.split(',').map((amenity, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {amenity.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Policies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hotel?.cancellationPolicy && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <Shield size={16} className="mr-2" />
                Chính sách hủy
              </h3>
              <p className="text-gray-600">{hotel.cancellationPolicy}</p>
            </div>
          )}
          {hotel?.petPolicy && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <Heart size={16} className="mr-2" />
                Chính sách thú cưng
              </h3>
              <p className="text-gray-600">{hotel.petPolicy}</p>
            </div>
          )}
        </div>
      </div>

      {/* Owner Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin chủ sở hữu</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên chủ sở hữu</label>
            <p className="mt-1 text-gray-900">{hotel?.ownerName || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-gray-900">{hotel?.ownerEmail || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{hotel?.totalRoomTypes || 0}</div>
            <div className="text-sm text-gray-600">Loại phòng</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{hotel?.totalRooms || 0}</div>
            <div className="text-sm text-gray-600">Tổng phòng</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{hotel?.availableRooms || 0}</div>
            <div className="text-sm text-gray-600">Phòng trống</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{hotel?.totalReviews || 0}</div>
            <div className="text-sm text-gray-600">Đánh giá</div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin hệ thống</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Ngày tạo</label>
            <p className="mt-1 text-gray-900">{formatDate(hotel?.createdAt || '')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cập nhật lần cuối</label>
            <p className="mt-1 text-gray-900">{formatDate(hotel?.updatedAt || '')}</p>
          </div>
          {hotel?.createdBy && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Người tạo</label>
              <p className="mt-1 text-gray-900">{hotel.createdBy}</p>
            </div>
          )}
          {hotel?.updatedBy && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Người cập nhật</label>
              <p className="mt-1 text-gray-900">{hotel.updatedBy}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderRoomTypes = () => (
    <div className="space-y-6">
      {/* Header với nút thêm loại phòng */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Loại phòng ({roomTypes.length})</h3>
        <button
          onClick={() => navigate(`/admin/room-types/add?hotelId=${id}`)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Thêm loại phòng
        </button>
      </div>

      {roomTypesLoading ? (
        <div className="flex justify-center items-center h-32">
          <RefreshCw className="animate-spin mr-2" size={24} />
          <span>Đang tải danh sách loại phòng...</span>
        </div>
      ) : roomTypes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <BedDouble size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có loại phòng nào</h3>
          <p className="text-gray-600 mb-4">Hãy thêm loại phòng đầu tiên cho khách sạn này.</p>
          <button
            onClick={() => navigate(`/admin/room-types/add?hotelId=${id}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Thêm loại phòng
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roomTypes.map((roomType) => (
            <div key={roomType.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Room Type Image */}
              {roomType.imageUrl && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={roomType.imageUrl}
                    alt={roomType.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-4">
                {/* Room Type Name and Status */}
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{roomType.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    roomType.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {roomType.isActive ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </div>

                {/* Description */}
                {roomType.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{roomType.description}</p>
                )}

                {/* Room Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users size={16} className="mr-2" />
                    <span>Tối đa {roomType.maxOccupancy} người</span>
                  </div>
                  {roomType.bedType && (
                    <div className="flex items-center text-sm text-gray-600">
                      <BedDouble size={16} className="mr-2" />
                      <span>{roomType.bedType}</span>
                    </div>
                  )}
                  {roomType.roomSize && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Settings size={16} className="mr-2" />
                      <span>{roomType.roomSize}m²</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign size={16} className="mr-2" />
                    <span className="font-medium text-blue-600">
                      {formatCurrency(roomType.pricePerNight)}/đêm
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar size={16} className="mr-2" />
                    <span>{roomType.totalRooms} phòng (Còn trống: {roomType.availableRooms})</span>
                  </div>
                </div>

                {/* Amenities */}
                {roomType.amenities && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Tiện nghi:</p>
                    <div className="flex flex-wrap gap-1">
                      {roomType.amenities.split(',').slice(0, 3).map((amenity, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {amenity.trim()}
                        </span>
                      ))}
                      {roomType.amenities.split(',').length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                          +{roomType.amenities.split(',').length - 3} khác
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/admin/room-types/${roomType.id}`)}
                    className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    <Eye size={16} className="mr-1" />
                    Xem
                  </button>
                  <button
                    onClick={() => navigate(`/admin/room-types/edit/${roomType.id}`)}
                    className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-200 transition-colors flex items-center justify-center"
                  >
                    <Edit size={16} className="mr-1" />
                    Sửa
                  </button>
                  <button
                    onClick={() => handleToggleRoomTypeStatus(roomType.id)}
                    disabled={actionLoading === `roomtype-${roomType.id}`}
                    className={`px-3 py-2 rounded text-sm transition-colors flex items-center justify-center disabled:opacity-50 ${
                      roomType.isActive 
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {roomType.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  </button>
                  <button
                    onClick={() => handleDeleteRoomType(roomType.id, roomType.name)}
                    disabled={actionLoading === `delete-roomtype-${roomType.id}`}
                    className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200 transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="animate-spin mr-2" size={24} />
          <span>Đang tải thông tin khách sạn...</span>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="w-full">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy khách sạn</h2>
          <p className="text-gray-600 mb-4">Khách sạn có thể đã bị xóa hoặc không tồn tại.</p>
          <button
            onClick={() => navigate('/admin/hotels')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/admin/hotels')}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Chi tiết khách sạn</h1>
            <p className="text-gray-600 mt-1">{hotel.name}</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleToggleStatus}
            disabled={actionLoading === 'status'}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50 ${
              hotel.isActive 
                ? 'bg-orange-600 text-white hover:bg-orange-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {hotel.isActive ? <ToggleRight size={20} className="mr-2" /> : <ToggleLeft size={20} className="mr-2" />}
            {actionLoading === 'status' ? 'Đang cập nhật...' : (hotel.isActive ? 'Vô hiệu hóa' : 'Kích hoạt')}
          </button>
          
          <button
            onClick={handleToggleFeatured}
            disabled={actionLoading === 'featured'}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50 ${
              hotel.isFeatured 
                ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            <Award size={20} className="mr-2" />
            {actionLoading === 'featured' ? 'Đang cập nhật...' : (hotel.isFeatured ? 'Bỏ nổi bật' : 'Đặt nổi bật')}
          </button>
          
          <button
            onClick={() => navigate(`/admin/hotels/edit/${hotel.id}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Edit size={20} className="mr-2" />
            Chỉnh sửa
          </button>
          
          <button
            onClick={handleDeleteHotel}
            disabled={actionLoading === 'delete'}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
          >
            <Trash size={20} className="mr-2" />
            {actionLoading === 'delete' ? 'Đang xóa...' : 'Xóa'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Tổng quan
          </button>
          <button
            onClick={() => setActiveTab('room-types')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'room-types'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Loại phòng
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'room-types' && renderRoomTypes()}
    </div>
  );
};

export default AdminHotelDetail; 