import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, BedDouble, Users, DollarSign, FileText, Hotel } from 'lucide-react';
import { roomTypeAPI, hotelAPI, RoomTypeCreateRequest, HotelResponse } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import ImageUploadSection from '../../components/ui/ImageUploadSection';

const AdminRoomTypeAdd: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [hotels, setHotels] = useState<HotelResponse[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<HotelResponse | null>(null);
  
  const preselectedHotelId = searchParams.get('hotelId');
  
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

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    if (preselectedHotelId && hotels.length > 0) {
      const hotel = hotels.find(h => h.id === preselectedHotelId);
      if (hotel) {
        setSelectedHotel(hotel);
        setFormData(prev => ({ ...prev, hotelId: preselectedHotelId }));
      }
    }
  }, [preselectedHotelId, hotels]);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await hotelAPI.getAllHotels(0, 100);
      const data = response.data;
      if (data.success) {
        setHotels(data.result.content);
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
      showToast('error', 'Error', 'Unable to load hotel list');
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

    if (name === 'hotelId') {
      const hotel = hotels.find(h => h.id === value);
      setSelectedHotel(hotel || null);
    }
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
      setLoading(true);
      const response = await roomTypeAPI.createRoomType(formData);
      const data = response.data;
      
      if (data.success) {
        showToast('success', 'Success', 'New room type has been added');
        navigate(`/admin/room-types/${data.result.id}`);
      } else {
        showToast('error', 'Error', data.message || 'Unable to add room type');
      }
    } catch (error: any) {
      console.error('Error creating room type:', error);
      showToast('error', 'Error', 'Unable to add room type');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => preselectedHotelId ? navigate(`/admin/hotels/${preselectedHotelId}`) : navigate('/admin/room-types')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Add New Room Type</h1>
            {selectedHotel && (
              <p className="text-gray-600">For hotel: {selectedHotel.name}</p>
            )}
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => preselectedHotelId ? navigate(`/admin/hotels/${preselectedHotelId}`) : navigate('/admin/room-types')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
          >
            <Save size={20} className="mr-2" />
            {loading ? 'Saving...' : 'Create Room Type'}
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hotel Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Hotel size={20} className="mr-2 text-blue-500" />
            Select Hotel
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hotel <span className="text-red-500">*</span>
            </label>
            <select
              name="hotelId"
              value={formData.hotelId}
              onChange={handleInputChange}
              disabled={!!preselectedHotelId}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              required
            >
              <option value="">Select hotel</option>
              {hotels.map(hotel => (
                <option key={hotel.id} value={hotel.id}>
                  {hotel.name} - {hotel.city}
                </option>
              ))}
            </select>
            {preselectedHotelId && (
              <p className="text-sm text-gray-500 mt-1">
                Room type will be added to this hotel.
              </p>
            )}
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FileText size={20} className="mr-2 text-blue-500" />
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Type Name <span className="text-red-500">*</span>
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
                Bed Type
              </label>
              <select
                name="bedType"
                value={formData.bedType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select bed type</option>
                <option value="Single">Single Bed</option>
                <option value="Double">Double Bed</option>
                <option value="Queen">Queen Bed</option>
                <option value="King">King Bed</option>
                <option value="Twin">Twin Beds</option>
                <option value="Sofa Bed">Sofa Bed</option>
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

        {/* Room Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <BedDouble size={20} className="mr-2 text-green-500" />
            Room Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Occupancy <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="maxOccupancy"
                value={formData.maxOccupancy}
                onChange={handleInputChange}
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Size (m²)
              </label>
              <input
                type="number"
                name="roomSize"
                value={formData.roomSize}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Rooms <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="totalRooms"
                value={formData.totalRooms}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <DollarSign size={20} className="mr-2 text-yellow-500" />
            Pricing Information
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price per Night (VND) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="pricePerNight"
              value={formData.pricePerNight}
              onChange={handleInputChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            📸 Additional Information
          </h2>
          <div className="space-y-4">
            <ImageUploadSection
              title="Room Type Image"
              imageUrl={formData.imageUrl || ''}
              onImageUrlChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
              uploadType="room-image"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Amenities (separated by commas)
              </label>
              <textarea
                name="amenities"
                value={formData.amenities}
                onChange={handleInputChange}
                rows={2}
                placeholder="Wi-Fi, TV, Air Conditioning, Mini Fridge, Balcony..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Predefined Room Amenity Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Available Room Amenities (click to add/remove)
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Free Wi-Fi', 'Flat-screen TV', 'Air Conditioning', 'Mini Fridge', 
                  'Safe', 'Hair Dryer', 'Bathtub', 'Shower', 'Slippers',
                  'Bathrobe', 'Work Desk', 'Sofa', 'Balcony', 'Window',
                  'Ocean View', 'City View', 'Mountain View', 'Garden View',
                  'Coffee Maker', 'Electric Kettle', 'Glassware', 'Bath Towels', 'Face Towels',
                  'Toilet Paper', 'Shampoo', 'Body Wash', 'Soap', 'Toothpaste',
                  'Toothbrush', 'Comb', 'Vanity Mirror', 'Reading Light',
                  'Curtains', 'Blackout Curtains', 'Wardrobe', 'Coat Hangers', 'Individual AC',
                  'Ceiling Fan', 'Wooden Floor', 'Carpet', 'Telephone', 'Fax Machine'
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
                💡 Tip: Click on the tags to add/remove room amenities. You can also type directly in the text box above.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminRoomTypeAdd; 