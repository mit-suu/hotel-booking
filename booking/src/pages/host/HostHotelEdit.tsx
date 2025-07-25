import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Hotel, MapPin, Phone, Mail, Globe, Star, Clock, DollarSign, Save, ArrowLeft } from 'lucide-react';
import { hotelAPI, HotelResponse, HotelUpdateRequest } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import ImageUploadSection from '../../components/ui/ImageUploadSection';

const HostHotelEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<HotelUpdateRequest>({
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
    active: true,
    featured: false
  });

  useEffect(() => {
    fetchHotel();
  }, [id]);

  const fetchHotel = async () => {
    try {
      setLoading(true);
      const response = await hotelAPI.getMyHotelById(id!);
      const hotel = response.data.result;
      setFormData({
        name: hotel.name || '',
        description: hotel.description || '',
        address: hotel.address || '',
        city: hotel.city || '',
        country: hotel.country || '',
        phone: hotel.phone || '',
        email: hotel.email || '',
        website: hotel.website || '',
        starRating: hotel.starRating || 1,
        checkInTime: hotel.checkInTime || '',
        checkOutTime: hotel.checkOutTime || '',
        imageUrl: hotel.imageUrl || '',
        pricePerNight: hotel.pricePerNight || 0,
        amenities: hotel.amenities || '',
        cancellationPolicy: hotel.cancellationPolicy || '',
        petPolicy: hotel.petPolicy || '',
        active: hotel.active,
        featured: hotel.featured
      });
    } catch (error: any) {
      console.error('Error fetching hotel:', error);
      showToast('error', 'Error', 'Unable to load hotel information');
      navigate('/host/hotels');
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
    try {
      setSaving(true);
      
      // Remove featured field from submission - only admin can modify this
      const { featured, ...submitData } = formData;
      
      await hotelAPI.updateMyHotel(id!, submitData);
      showToast('success', 'Success', 'Hotel information updated successfully');
      navigate(`/host/hotels/${id}`);
    } catch (error: any) {
      console.error('Error updating hotel:', error);
      showToast('error', 'Error', 'Unable to update hotel information');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading hotel information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate(`/host/hotels/${id}`)}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Hotel</h1>
                <p className="text-gray-600 mt-1">Update your hotel's detailed information</p>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                placeholder="Detailed description of your hotel..."
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
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                    <option key={rating} value={rating}>{rating} star{rating > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Night (VND)
                </label>
                <input
                  type="number"
                  name="pricePerNight"
                  min="0"
                  value={formData.pricePerNight}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Amenities */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Hotel Amenities</h3>
              <textarea
                name="amenities"
                rows={3}
                value={formData.amenities}
                onChange={handleInputChange}
                placeholder="e.g: Free WiFi, Swimming Pool, Gym, Spa, Restaurant, Bar..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {/* Predefined Amenity Tags */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Available Amenities (click to add/remove)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Free WiFi', 'Swimming Pool', 'Spa & Massage', 'Restaurant', 'Fitness Center', 
                    'Parking', '24/7 Room Service', '24/7 Front Desk', 'Elevator',
                    'Air Conditioning', 'TV', 'Mini Fridge', 'Safe Box', 'Hair Dryer',
                    'Bathtub', 'Shower', 'Slippers', 'Bathrobe',
                    'Work Desk', 'Sofa', 'Balcony', 'Ocean View',
                    'City View', 'Mountain View', 'Bar', 'Karaoke',
                    'Tennis Court', 'Golf Course', 'Private Beach', 'Laundry Service',
                    'Airport Shuttle', 'Bicycle Rental', 'Kids Play Area',
                    'Meeting Room', 'Shopping Center', 'ATM', 'Gift Shop'
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Enhanced Image Upload Section */}
          <ImageUploadSection
            title="Hotel Images"
            imageUrl={formData.imageUrl || ''}
            onImageUrlChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
            uploadType="hotel-image"
          />

          {/* Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-900">
              <Clock className="mr-3 text-orange-600" size={24} />
              Hotel Status
            </h2>
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
                <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                  Active
                </label>
              </div>
              
              {/* Featured status - Read only for hosts */}
              {formData.featured && (
                <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="h-4 w-4 bg-yellow-500 rounded mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Featured Hotel</p>
                    <p className="text-xs text-yellow-600">This status can only be changed by the administrator</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4 sm:justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(`/host/hotels/${id}`)}
              className="w-full sm:w-auto px-8 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} className="mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HostHotelEdit; 