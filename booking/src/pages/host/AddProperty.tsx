import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Upload } from 'lucide-react';

interface PropertyFormData {
  name: string;
  type: string;
  location: string;
  address: string;
  description: string;
  price: number;
  rooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
}

const AddProperty: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PropertyFormData>({
    name: '',
    type: 'hotel',
    location: '',
    address: '',
    description: '',
    price: 0,
    rooms: 1,
    bathrooms: 1,
    amenities: [],
    images: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const propertyTypes = [
    { value: 'hotel', label: 'Khách sạn' },
    { value: 'resort', label: 'Khu nghỉ dưỡng' },
    { value: 'apartment', label: 'Căn hộ' },
    { value: 'villa', label: 'Biệt thự' },
    { value: 'homestay', label: 'Homestay' }
  ];

  const amenitiesList = [
    { id: 'wifi', label: 'Wifi miễn phí' },
    { id: 'pool', label: 'Hồ bơi' },
    { id: 'spa', label: 'Spa' },
    { id: 'gym', label: 'Phòng gym' },
    { id: 'restaurant', label: 'Nhà hàng' },
    { id: 'parking', label: 'Bãi đỗ xe' },
    { id: 'ac', label: 'Điều hòa' },
    { id: 'tv', label: 'TV' },
    { id: 'kitchen', label: 'Bếp' },
    { id: 'washer', label: 'Máy giặt' },
    { id: 'breakfast', label: 'Bữa sáng miễn phí' },
    { id: 'workspace', label: 'Khu vực làm việc' }
  ];

  // Sample images for demo
  const sampleImages = [
    'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg',
    'https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg',
    'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg',
    'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
    'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'rooms' || name === 'bathrooms' ? Number(value) : value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAmenityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      amenities: checked 
        ? [...prev.amenities, value] 
        : prev.amenities.filter(amenity => amenity !== value)
    }));
  };

  const handleAddImage = () => {
    // In a real app, this would be an image upload
    // For demo, we'll add a random sample image
    const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    if (!formData.images.includes(randomImage)) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, randomImage]
      }));
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập tên khách sạn';
      if (!formData.type) newErrors.type = 'Vui lòng chọn loại hình lưu trú';
      if (!formData.location.trim()) newErrors.location = 'Vui lòng nhập địa điểm';
      if (!formData.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ chi tiết';
    } else if (step === 2) {
      if (!formData.description.trim()) newErrors.description = 'Vui lòng nhập mô tả';
      if (formData.price <= 0) newErrors.price = 'Giá phải lớn hơn 0';
      if (formData.rooms <= 0) newErrors.rooms = 'Số phòng phải lớn hơn 0';
      if (formData.bathrooms <= 0) newErrors.bathrooms = 'Số phòng tắm phải lớn hơn 0';
      if (formData.amenities.length === 0) newErrors.amenities = 'Vui lòng chọn ít nhất một tiện nghi';
    } else if (step === 3) {
      if (formData.images.length === 0) newErrors.images = 'Vui lòng thêm ít nhất một hình ảnh';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      // In a real app, this would submit to an API
      alert('Khách sạn đã được thêm thành công!');
      navigate('/host/properties');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/host/properties')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={20} className="mr-1" />
          Quay lại danh sách khách sạn
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold">Thêm khách sạn mới</h1>
            <p className="text-gray-600">Điền đầy đủ thông tin để thêm khách sạn của bạn</p>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <React.Fragment key={index}>
                  <div className="flex flex-col items-center">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        currentStep > index + 1 
                          ? 'bg-green-500 text-white' 
                          : currentStep === index + 1 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {currentStep > index + 1 ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className="text-sm mt-2">
                      {index === 0 ? 'Thông tin cơ bản' : index === 1 ? 'Chi tiết' : 'Hình ảnh'}
                    </span>
                  </div>
                  {index < totalSteps - 1 && (
                    <div 
                      className={`flex-1 h-1 mx-2 ${
                        currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    ></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Tên khách sạn <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nhập tên khách sạn"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      Loại hình lưu trú <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.type ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      {propertyTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                    {errors.type && <p className="mt-1 text-sm text-red-500">{errors.type}</p>}
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      Địa điểm <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.location ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ví dụ: Hà Nội, Đà Nẵng, Nha Trang..."
                    />
                    {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ chi tiết <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nhập địa chỉ chi tiết"
                    />
                    {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
                  </div>
                </div>
              )}

              {/* Step 2: Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Mô tả chi tiết về khách sạn của bạn"
                    ></textarea>
                    {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                        Giá phòng cơ bản (VNĐ/đêm) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        min="0"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.price ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ví dụ: 1000000"
                      />
                      {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
                    </div>

                    <div>
                      <label htmlFor="rooms" className="block text-sm font-medium text-gray-700 mb-1">
                        Số phòng <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="rooms"
                        name="rooms"
                        value={formData.rooms}
                        onChange={handleInputChange}
                        min="1"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.rooms ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.rooms && <p className="mt-1 text-sm text-red-500">{errors.rooms}</p>}
                    </div>

                    <div>
                      <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                        Số phòng tắm <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="bathrooms"
                        name="bathrooms"
                        value={formData.bathrooms}
                        onChange={handleInputChange}
                        min="1"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.bathrooms ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.bathrooms && <p className="mt-1 text-sm text-red-500">{errors.bathrooms}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiện nghi <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {amenitiesList.map(amenity => (
                        <label key={amenity.id} className="flex items-center">
                          <input
                            type="checkbox"
                            name="amenities"
                            value={amenity.label}
                            checked={formData.amenities.includes(amenity.label)}
                            onChange={handleAmenityChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{amenity.label}</span>
                        </label>
                      ))}
                    </div>
                    {errors.amenities && <p className="mt-1 text-sm text-red-500">{errors.amenities}</p>}
                  </div>
                </div>
              )}

              {/* Step 3: Images */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hình ảnh khách sạn <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <button
                        type="button"
                        onClick={handleAddImage}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Upload className="h-5 w-5 mr-2" />
                        Tải lên hình ảnh
                      </button>
                      <p className="mt-2 text-sm text-gray-500">
                        Hỗ trợ JPG, PNG, GIF. Kích thước tối đa 5MB.
                      </p>
                    </div>
                    {errors.images && <p className="mt-1 text-sm text-red-500">{errors.images}</p>}
                  </div>

                  {formData.images.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Hình ảnh đã tải lên</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Property ${index + 1}`}
                              className="h-32 w-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                        <div 
                          className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50"
                          onClick={handleAddImage}
                        >
                          <Plus size={24} className="text-gray-400" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Quay lại
                </button>
              ) : (
                <div></div>
              )}
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Tiếp theo
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  Hoàn thành
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;
