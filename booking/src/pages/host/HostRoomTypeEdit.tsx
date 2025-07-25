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
    'Free WiFi', 'Air Conditioning', 'Flat-screen TV', 'Minibar', 'Safe',
    'Hair Dryer', 'Work Desk', 'Sofa', 'Balcony', 'Sea View',
    'City View', 'Mountain View', 'Private Bathroom', 'Bathtub', 'Shower',
    'Toiletries', 'Towels', 'Slippers', 'Bathrobe', 'Coffee Machine',
    'Electric Kettle', 'Mini Fridge', 'Air Conditioning', 'Ceiling Fan', 'Opening Windows',
    'Curtains', 'Double Bed', 'Single Bed', 'Bed Linen', 'Pillows',
    'Blanket', 'Reading Light', 'Power Outlets', 'Vacuum Cleaner', 'Telephone',
    'Radio', 'Bluetooth Speaker', 'Phone Charger', 'High-speed Internet'
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
        setSelectedAmenities(roomTypeData.amenities.split(',').map((item: string) => item.trim()));
      }
    } catch (error) {
      console.error('Error fetching room type:', error);
      showToast('error', 'Failed to load room type information');
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
    
    if (!formData.name?.trim()) {
      showToast('error', 'Please enter room type name');
      return;
    }

    if ((formData.pricePerNight || 0) <= 0) {
      showToast('error', 'Please enter a valid room price');
      return;
    }

    if ((formData.totalRooms || 0) <= 0) {
      showToast('error', 'Please enter a valid number of rooms');
      return;
    }

    try {
      setSaving(true);
      await hostRoomTypeAPI.updateMyRoomType(id!, formData);
      showToast('success', 'Room type updated successfully');
      navigate(`/host/room-types/${id}`);
    } catch (error) {
      console.error('Error updating room type:', error);
      showToast('error', 'Failed to update room type');
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
            <h2 className="text-2xl font-bold text-gray-900">Room type not found</h2>
            <p className="mt-2 text-gray-600">The room type does not exist or you don't have access to it.</p>
            <button
              onClick={() => navigate('/host/room-types')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
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
                <h1 className="text-3xl font-bold text-gray-900">Edit Room Type</h1>
                <p className="mt-2 text-gray-600">Update room type information: {roomType.name}</p>
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
              <h2 className="text-xl font-semibold text-gray-900">Hotel</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hotel
              </label>
              <input
                type="text"
                value={roomType.hotelName}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
                              <p className="mt-1 text-sm text-gray-500">Cannot change hotel for existing room type</p>
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
                <p className="mt-1 text-sm text-gray-500">
                  Currently {roomType.availableRooms} available rooms / {roomType.totalRooms} total rooms
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
              <h2 className="text-xl font-semibold text-gray-900">Image</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
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
                    src={formData.imageUrl || 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg'}
                    alt="Preview"
                    className="w-32 h-24 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg';
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
              <h2 className="text-xl font-semibold text-gray-900">Amenities</h2>
            </div>

            {/* Predefined Amenity Tags */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Available Amenities:
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
                placeholder="Free WiFi, Air Conditioning, Flat-screen TV..."
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
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Save Changes
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