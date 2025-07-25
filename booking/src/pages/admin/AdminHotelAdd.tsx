import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X, Plus, Star, MapPin, Phone, Mail, Globe, Clock, Shield, Heart } from 'lucide-react';
import { hotelAPI, HotelCreateRequest } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import ImageUploadSection from '../../components/ui/ImageUploadSection';

const AdminHotelAdd: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
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
    pricePerNight: 0,
    checkInTime: '14:00',
    checkOutTime: '12:00',
    amenities: '',
    cancellationPolicy: '',
    petPolicy: '',
    commissionRate: 15.00,
    imageUrl: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Required fields validation
    if (!formData.name?.trim()) {
      newErrors.name = 'Hotel name is required';
    }
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.address?.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city?.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.country?.trim()) {
      newErrors.country = 'Country is required';
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    // Phone validation
    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }

    // Price validation
    if (!formData.pricePerNight || formData.pricePerNight <= 0) {
      newErrors.pricePerNight = 'Room price must be greater than 0';
    }

    // Star rating validation
    if (!formData.starRating || formData.starRating < 1 || formData.starRating > 5) {
      newErrors.starRating = 'Star rating must be from 1 to 5';
    }

    // Commission rate validation
    if (!formData.commissionRate || formData.commissionRate < 0 || formData.commissionRate > 100) {
      newErrors.commissionRate = 'Commission rate must be between 0% and 100%';
    }

    // Website validation
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Website must start with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'starRating' || name === 'pricePerNight' || name === 'commissionRate' ? Number(value) : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('error', 'Error', 'Please check the information entered');
      return;
    }

    try {
      setLoading(true);
      const response = await hotelAPI.createHotelByAdmin(formData);
      const hotelId = response.data.result?.id || response.data.id;
      showToast('success', 'Success', 'New hotel has been created');
      navigate(`/admin/hotels/${hotelId}`);
    } catch (error: any) {
      console.error('Error creating hotel:', error);
      showToast('error', 'Error', 'Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All entered information will be lost.')) {
      navigate('/admin/hotels');
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/admin/hotels')}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Add New Hotel</h1>
            <p className="text-gray-600 mt-1">Enter detailed hotel information</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin size={20} className="mr-2 text-blue-500" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hotel Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter hotel name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Star Rating <span className="text-red-500">*</span>
              </label>
              <select
                name="starRating"
                value={formData.starRating}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.starRating ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {[1, 2, 3, 4, 5].map(star => (
                  <option key={star} value={star}>
                    {star} star{star > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
              {errors.starRating && <p className="mt-1 text-sm text-red-600">{errors.starRating}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter detailed description about the hotel"
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter full address"
              />
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter city name"
              />
              {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.country ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter country name"
              />
              {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Price/Night (VND) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="pricePerNight"
                value={formData.pricePerNight}
                onChange={handleInputChange}
                min="0"
                step="1000"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.pricePerNight ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter room price"
              />
              {errors.pricePerNight && <p className="mt-1 text-sm text-red-600">{errors.pricePerNight}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commission Rate (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="commissionRate"
                value={formData.commissionRate}
                onChange={handleInputChange}
                min="0"
                max="100"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.commissionRate ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="15.00"
              />
              {errors.commissionRate && <p className="mt-1 text-sm text-red-600">{errors.commissionRate}</p>}
              <p className="mt-1 text-xs text-gray-500">
                💡 Platform commission rate (e.g., 15.00 for 15%)
              </p>
            </div>

            <div className="md:col-span-2">
              <ImageUploadSection
                title="Hotel Image"
                imageUrl={formData.imageUrl || ''}
                onImageUrlChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                uploadType="hotel-image"
                errors={{ imageUrl: errors.imageUrl }}
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Phone size={20} className="mr-2 text-blue-500" />
            Contact Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter phone number"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.website ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://example.com"
              />
              {errors.website && <p className="mt-1 text-sm text-red-600">{errors.website}</p>}
            </div>
          </div>
        </div>

        {/* Check-in/Check-out Times */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock size={20} className="mr-2 text-blue-500" />
            Check-in/Check-out Times
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-in Time
              </label>
              <input
                type="time"
                name="checkInTime"
                value={formData.checkInTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-out Time
              </label>
              <input
                type="time"
                name="checkOutTime"
                value={formData.checkOutTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star size={20} className="mr-2 text-blue-500" />
            Amenities
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amenities List (separated by commas)
              </label>
              <textarea
                name="amenities"
                value={formData.amenities}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Wi-Fi, Swimming Pool, Spa, Restaurant, Gym, Parking"
              />
            </div>

            {/* Predefined Amenity Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Available Amenities (click to add)
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Free Wi-Fi', 'Swimming Pool', 'Spa & Massage', 'Restaurant', 'Fitness Center', 
                  'Parking', '24-hour Room Service', '24-hour Front Desk', 'Elevator',
                  'Air Conditioning', 'Television', 'Mini Fridge', 'Safe', 'Hair Dryer',
                  'Bathtub', 'Shower', 'Slippers', 'Bathrobe',
                  'Work Desk', 'Sofa', 'Balcony', 'Ocean View',
                  'City View', 'Mountain View', 'Bar', 'Karaoke',
                  'Tennis Court', 'Golf Course', 'Private Beach', 'Laundry Service',
                  'Airport Shuttle', 'Bicycle Rental', 'Kids Play Area',
                  'Meeting Rooms', 'Shopping Center', 'ATM', 'Gift Shop'
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
                💡 Tip: Click on the tags to add/remove amenities. You can also type directly in the text box above.
              </p>
            </div>
          </div>
        </div>

        {/* Policies */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield size={20} className="mr-2 text-blue-500" />
            Policies
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cancellation Policy
              </label>
              <textarea
                name="cancellationPolicy"
                value={formData.cancellationPolicy}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Free cancellation before 24 hours"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pet Policy
              </label>
              <textarea
                name="petPolicy"
                value={formData.petPolicy}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Pets are not allowed"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
          >
            <Save size={20} className="mr-2" />
            {loading ? 'Saving...' : 'Save Hotel'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminHotelAdd; 