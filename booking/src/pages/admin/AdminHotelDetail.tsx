import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash, Plus, Star, MapPin, Users, BedDouble, Calendar, DollarSign, Settings, Eye, Check, X, RefreshCw, ToggleLeft, ToggleRight, Award, Phone, Mail, Globe, Clock, Shield, Heart } from 'lucide-react';
import { hotelAPI, HotelResponse } from '../../services/api';
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

  useEffect(() => {
    fetchHotelDetails();
  }, [id]);

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
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
    </div>
  );
};

export default AdminHotelDetail; 