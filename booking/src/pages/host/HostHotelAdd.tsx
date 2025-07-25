import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hotel, MapPin, Phone, Mail, Globe, Star, Clock, DollarSign, Save, ArrowLeft } from 'lucide-react';
import { hotelAPI, HotelCreateRequest } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import ImageUploadSection from '../../components/ui/ImageUploadSection';

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
    petPolicy: '',
    commissionRate: 15.00 // Default commission rate - only admin can modify
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Hotel name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Hotel name must be at least 2 characters';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    // Phone validation
    if (formData.phone && !/^[+]?[0-9\s\-\(\)]{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }

    // Website validation
    if (formData.website && !/^(https?:\/\/)?(www\.)?[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(\/.*)?$/.test(formData.website)) {
      newErrors.website = 'Invalid website URL';
    }

    // Price validation
    if (formData.pricePerNight && formData.pricePerNight <= 0) {
      newErrors.pricePerNight = 'Room price must be greater than 0';
    }

    // Time validation
    if (formData.checkInTime && formData.checkOutTime) {
      if (formData.checkInTime >= formData.checkOutTime) {
        newErrors.checkOutTime = 'Check-out time must be after check-in time';
      }
    }

    // Image URL validation
    if (formData.imageUrl && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(formData.imageUrl)) {
      newErrors.imageUrl = 'Invalid image URL (only jpg, jpeg, png, gif, webp are accepted)';
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
      showToast('error', 'Error', 'Please check the input fields');
      return;
    }

    try {
      setLoading(true);
      
      // Ensure featured is not set by host - backend will handle this
      const submitData = { ...formData, isFeatured: false };
      
      const response = await hotelAPI.createMyHotel(submitData);
      
      if (response.data.success) {
        showToast('success', 'Success', 'Hotel added successfully');
        navigate('/host/hotels');
      } else {
        throw new Error(response.data.message || 'Failed to add hotel');
      }
    } catch (error: any) {
      console.error('Error creating hotel:', error);
      showToast('error', 'Error', error.response?.data?.message || error.message || 'Failed to add hotel');
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
                <h1 className="text-3xl font-bold text-gray-900">Add New Hotel</h1>
                <p className="text-gray-600 mt-1">Fill in the details to create a new hotel</p>
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
                Basic Information
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hotel Name *
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
                    Address *
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
                    City
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
                    Country
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
                  Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Enter detailed description of your hotel..."
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-900">
                <Phone className="mr-3 text-green-600" size={24} />
                Contact Information
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
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
                Hotel Details
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Star Rating
                  </label>
                  <select
                    name="starRating"
                    value={formData.starRating}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5].map(rating => (
                      <option key={rating} value={rating}>{rating} stars</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Price (VND)
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
                    Check-in Time
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
                    Check-out Time
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
                <h3 className="text-lg font-medium text-gray-900 mb-4">Hotel Amenities</h3>
                <textarea
                  name="amenities"
                  rows={3}
                  value={formData.amenities}
                  onChange={handleInputChange}
                  placeholder="VD: Free WiFi, Swimming Pool, Gym, Spa, Restaurant, Bar..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                {/* Predefined Amenity Tags */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select available amenities (click to add/remove)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Free WiFi', 'Swimming Pool', 'Spa & Massage', 'Restaurant', 'Gym', 
                      'Parking', '24/7 Room Service', '24/7 Reception', 'Elevator',
                      'Air Conditioning', 'TV', 'Mini Fridge', 'Safe Deposit', 'Hair Dryer',
                      'Bathtub', 'Shower', 'Bathrobes', 'Towels',
                      'Work Desk', 'Sofa', 'Balcony', 'Sea View',
                      'City View', 'Mountain View', 'Bar', 'Karaoke',
                      'Tennis Court', 'Golf Course', 'Private Beach', 'Laundry Service',
                      'Airport Transfer', 'Kids Club',
                      'Meeting Room', 'Shopping Center', 'ATM', 'Souvenir Shop'
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
                    💡 Tip: Click on tags to add/remove amenities. You can also type directly above.
                  </p>
                </div>
              </div>
            </div>

            {/* Policies */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-900">
                <Clock className="mr-3 text-purple-600" size={24} />
                Hotel Policies
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cancellation Policy
                  </label>
                  <textarea
                    name="cancellationPolicy"
                    rows={3}
                    value={formData.cancellationPolicy}
                    onChange={handleInputChange}
                    placeholder="VD: Free cancellation before 24 hours..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pet Policy
                  </label>
                  <textarea
                    name="petPolicy"
                    rows={3}
                    value={formData.petPolicy}
                    onChange={handleInputChange}
                    placeholder="VD: Pets allowed with extra charge..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Enhanced Image Upload Section */}
            <ImageUploadSection
              title="Hotel Image"
              imageUrl={formData.imageUrl || ''}
              onImageUrlChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
              uploadType="hotel-image"
              errors={{ imageUrl: errors.imageUrl }}
            />

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 sm:justify-end pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/host/hotels')}
                className="w-full sm:w-auto px-8 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Save size={20} className="mr-2" />
                    Add Hotel
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