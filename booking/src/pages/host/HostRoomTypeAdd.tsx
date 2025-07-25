import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, BedDouble, Users, DollarSign, Image, FileText, Hotel, Home, Tag } from 'lucide-react';
import { hostRoomTypeAPI, hotelAPI, RoomTypeCreateRequest } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import ImageUploadSection from '../../components/ui/ImageUploadSection';

interface Hotel {
  id: string;
  name: string;
}

const HostRoomTypeAdd: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  // Get hotelId from URL params if exists
  const preselectedHotelId = searchParams.get('hotelId');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  
  const [formData, setFormData] = useState<RoomTypeCreateRequest>({
    name: '',
    description: '',
    maxOccupancy: 1,
    bedType: '',
    roomSize: 0,
    pricePerNight: 0,
    totalRooms: 1,
    imageUrl: '',
    amenities: '',
    hotelId: preselectedHotelId || ''
  });

  const predefinedAmenities = [
    'Free WiFi', 'Air conditioning', 'Flat-screen TV', 'Minibar', 'Safe',
    'Hair dryer', 'Desk', 'Sofa', 'Balcony', 'Sea view',
    'City view', 'Mountain view', 'Private bathroom', 'Bathtub', 'Shower',
    'Toiletries', 'Towels', 'Slippers', 'Bathrobe', 'Coffee machine',
    'Electric kettle', 'Mini fridge', 'Air conditioning', 'Ceiling fan', 'Openable windows',
    'Curtains', 'Double bed', 'Single bed', 'Bed linen', 'Pillows',
    'Blanket', 'Reading light', 'Power outlets', 'Vacuum cleaner', 'Telephone',
    'Radio', 'Bluetooth speaker', 'Phone charger', 'High-speed internet'
  ];

  useEffect(() => {
    fetchHotels();
  }, []);

  // Set selected hotel when hotels are loaded and preselectedHotelId exists
  useEffect(() => {
    if (preselectedHotelId && hotels.length > 0) {
      const hotel = hotels.find(h => h.id === preselectedHotelId);
      if (hotel) {
        setSelectedHotel(hotel);
      }
    }
  }, [preselectedHotelId, hotels]);

  const fetchHotels = async () => {
    try {
              const response = await hotelAPI.getMyHotels(0, 100);
      setHotels(response.data.result.content);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      showToast('error', 'Failed to load hotels list');
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
    
    if (!formData.hotelId) {
      showToast('error', 'Please select a hotel');
      return;
    }

    if (!formData.name.trim()) {
      showToast('error', 'Please enter room type name');
      return;
    }

    if (formData.pricePerNight <= 0) {
      showToast('error', 'Please enter a valid room price');
      return;
    }

    if (formData.totalRooms <= 0) {
      showToast('error', 'Please enter a valid number of rooms');
      return;
    }

    try {
      setLoading(true);
      await hostRoomTypeAPI.createMyRoomType(formData);
      showToast('success', 'Room type created successfully');
      // Navigate back to hotel detail if came from hotel, otherwise go to room types list
      if (preselectedHotelId) {
        navigate(`/host/hotels/${preselectedHotelId}`);
      } else {
        navigate('/host/room-types');
      }
    } catch (error) {
      console.error('Error creating room type:', error);
      showToast('error', 'Failed to create room type');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => preselectedHotelId 
                  ? navigate(`/host/hotels/${preselectedHotelId}`)
                  : navigate('/host/room-types')
                }
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Add New Room Type</h1>
                <p className="mt-2 text-gray-600">
                  {preselectedHotelId && selectedHotel 
                    ? `Create a new room type for hotel "${selectedHotel.name}"`
                    : 'Create a new room type for your hotel'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hotel Selection */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Hotel className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Select Hotel</h2>
              {preselectedHotelId && selectedHotel && (
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Selected from hotel
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hotel *
              </label>
              {preselectedHotelId && selectedHotel ? (
                <div className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-lg text-gray-700">
                  <div className="flex items-center">
                    <Hotel className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="font-medium">{selectedHotel.name}</span>
                    <span className="ml-2 text-sm text-gray-500">(Selected)</span>
                  </div>
                </div>
              ) : (
                <select
                  name="hotelId"
                  value={formData.hotelId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Hotel</option>
                  {hotels.map(hotel => (
                    <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                  ))}
                </select>
              )}
              {preselectedHotelId && selectedHotel && (
                <p className="mt-2 text-sm text-gray-600">
                  You are creating a room type for this hotel. If you want to select a different hotel, please go back to the room types list.
                </p>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <BedDouble className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Type Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g: Deluxe Room"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bed Type
                </label>
                <select
                  name="bedType"
                  value={formData.bedType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Bed Type</option>
                  <option value="Single">Single Bed</option>
                  <option value="Double">Double Bed</option>
                  <option value="Queen">Queen Bed</option>
                  <option value="King">King Bed</option>
                  <option value="Twin">Twin Beds</option>
                  <option value="Sofa Bed">Sofa Bed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Occupancy *
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
                  Room Size (m²)
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
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Detailed description of the room type..."
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
              <h2 className="text-xl font-semibold text-gray-900">Pricing & Quantity</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Night (VND) *
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
                  Total Rooms *
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
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <ImageUploadSection
            title="Room Type Image"
            imageUrl={formData.imageUrl || ''}
            onImageUrlChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
            uploadType="room-image"
            className="mb-6"
          />

          {/* Amenities */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                <Tag className="h-5 w-5 text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Amenities</h2>
            </div>

            {/* Predefined Amenity Tags */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select available amenities:
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
                Or enter amenities (comma separated):
              </label>
              <textarea
                name="amenities"
                value={formData.amenities}
                onChange={handleAmenitiesTextChange}
                rows={3}
                placeholder="Free WiFi, Air conditioning, Flat-screen TV..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => preselectedHotelId 
                  ? navigate(`/host/hotels/${preselectedHotelId}`)
                  : navigate('/host/room-types')
                }
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Create Room Type
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

export default HostRoomTypeAdd; 