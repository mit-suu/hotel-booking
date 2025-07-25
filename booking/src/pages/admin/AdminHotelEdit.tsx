import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, MapPin, Star, Clock, Globe, Phone, Mail, DollarSign, Image, FileText, Users, Bed, User, RefreshCw } from 'lucide-react';
import { hotelAPI, HotelResponse, HotelUpdateRequest, userAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import ImageUploadSection from '../../components/ui/ImageUploadSection';

interface HostOption {
  id: string;
  name: string;
  email: string;
  username: string;
}

const AdminHotelEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hotel, setHotel] = useState<HotelResponse | null>(null);
  const [hosts, setHosts] = useState<HostOption[]>([]);
  const [hostsLoading, setHostsLoading] = useState(false);
  const [formData, setFormData] = useState({
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
    petPolicy: '',
    ownerId: '',
    active: true,
    featured: false
  });

  useEffect(() => {
    if (id) {
      fetchHotel();
      fetchHosts();
    }
  }, [id]);

  const fetchHosts = async () => {
    try {
      setHostsLoading(true);
      const response = await userAPI.getHosts(0, 100, 'name');
      const data = response.data;
      
      if (data.success && data.result) {
        const hostOptions: HostOption[] = data.result.content.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username
        }));
        setHosts(hostOptions);
      }
    } catch (error: any) {
      console.error('Error fetching hosts:', error);
              showToast('error', 'Error', 'Unable to load owner list');
    } finally {
      setHostsLoading(false);
    }
  };

  const fetchHotel = async () => {
    try {
      setLoading(true);
      const response = await hotelAPI.getAdminHotelById(id!);
      const hotelData = response.data.result || response.data;
      setHotel(hotelData);
      
      // Populate form with existing data
      setFormData({
        name: hotelData.name || '',
        description: hotelData.description || '',
        address: hotelData.address || '',
        city: hotelData.city || '',
        country: hotelData.country || '',
        phone: hotelData.phone || '',
        email: hotelData.email || '',
        website: hotelData.website || '',
        starRating: hotelData.starRating || 1,
        checkInTime: hotelData.checkInTime || '',
        checkOutTime: hotelData.checkOutTime || '',
        imageUrl: hotelData.imageUrl || '',
        pricePerNight: hotelData.pricePerNight || 0,
        amenities: hotelData.amenities || '',
        cancellationPolicy: hotelData.cancellationPolicy || '',
        petPolicy: hotelData.petPolicy || '',
        ownerId: hotelData.ownerId || '',
        active: hotelData.active,
        featured: hotelData.featured
      });
    } catch (error: any) {
      console.error('Error fetching hotel:', error);
              showToast('error', 'Error', 'Unable to load hotel information');
      navigate('/admin/hotels');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address) {
              showToast('error', 'Error', 'Please fill in all required information');
      return;
    }

    try {
      setSaving(true);
      await hotelAPI.updateHotelByAdmin(id!, formData);
      showToast('success', 'Success', 'Hotel information updated successfully');
      navigate(`/admin/hotels/${id}`);
    } catch (error: any) {
      console.error('Error updating hotel:', error);
      showToast('error', 'Error', 'Unable to update hotel');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Hotel not found</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/admin/hotels')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Edit Hotel</h1>
            <p className="text-gray-600">{hotel.name}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate(`/admin/hotels/${id}`)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
          >
            <Save size={20} className="mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FileText size={20} className="mr-2 text-blue-500" />
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hotel Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Star Rating
              </label>
              <select
                name="starRating"
                value={formData.starRating}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5].map(star => (
                  <option key={star} value={star}>{star} stars</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <MapPin size={20} className="mr-2 text-green-500" />
            Location Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Phone size={20} className="mr-2 text-purple-500" />
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Booking Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Clock size={20} className="mr-2 text-orange-500" />
            Thông tin đặt phòng
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giờ nhận phòng
              </label>
              <input
                type="time"
                name="checkInTime"
                value={formData.checkInTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giờ trả phòng
              </label>
              <input
                type="time"
                name="checkOutTime"
                value={formData.checkOutTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá mỗi đêm (VND)
              </label>
              <input
                type="number"
                name="pricePerNight"
                value={formData.pricePerNight}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Image size={20} className="mr-2 text-indigo-500" />
            Thông tin bổ sung
          </h2>
          <div className="space-y-4">
            <div>
              <ImageUploadSection
                title="Hotel Image"
                imageUrl={formData.imageUrl || ''}
                onImageUrlChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                uploadType="hotel-image"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amenities (comma separated)
              </label>
              <textarea
                name="amenities"
                value={formData.amenities}
                onChange={handleInputChange}
                rows={2}
                placeholder="WiFi, Pool, Spa, Restaurant..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Predefined Amenity Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select available amenities (click to add/remove)
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
                💡 Tip: Click on tags to add/remove amenities. You can also type directly in the text box above.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cancellation Policy
              </label>
              <textarea
                name="cancellationPolicy"
                value={formData.cancellationPolicy}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pet Policy
              </label>
              <textarea
                name="petPolicy"
                value={formData.petPolicy}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Owner Management - Admin Only */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <User size={20} className="mr-2 text-purple-500" />
            Owner Management
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Owner
              </label>
              {hotel && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="font-medium text-gray-900">{hotel.ownerName || 'N/A'}</p>
                  <p className="text-sm text-gray-600">{hotel.ownerEmail || 'No email'}</p>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select New Owner
              </label>
              <select
                name="ownerId"
                value={formData.ownerId}
                onChange={handleInputChange}
                disabled={hostsLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">-- Keep current owner --</option>
                {hostsLoading ? (
                  <option value="">Loading list...</option>
                ) : (
                  hosts.map((host) => (
                    <option key={host.id} value={host.id}>
                      {host.name} ({host.email})
                    </option>
                  ))
                )}
              </select>
              {hostsLoading && (
                <p className="text-sm text-gray-500 mt-1 flex items-center">
                  <RefreshCw size={12} className="animate-spin mr-1" />
                  Loading owner list...
                </p>
              )}
              {!hostsLoading && hosts.length === 0 && (
                <p className="text-sm text-yellow-600 mt-1">
                  ⚠️ No users found with HOST role
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                💡 Tip: Only shows users with HOST role. To change owner, select a new person from the list.
              </p>
            </div>
          </div>
        </div>

        {/* Status Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Status Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Hotel is active
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                Featured hotel
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminHotelEdit; 