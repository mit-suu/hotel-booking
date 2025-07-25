import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import FileUpload from './FileUpload';
import { UploadResponse } from '../../services/api';

interface ImageUploadSectionProps {
  title?: string;
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
  uploadType?: 'image' | 'hotel-image' | 'room-image';
  errors?: { imageUrl?: string };
  required?: boolean;
  className?: string;
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  title = 'Image',
  imageUrl,
  onImageUrlChange,
  uploadType = 'hotel-image',
  errors = {},
  required = false,
  className = ''
}) => {
  // Handle upload success
  const handleUploadSuccess = (url: string, uploadData?: UploadResponse) => {
    onImageUrlChange(url);
  };

    return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8 ${className}`}>
      <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-900">
        <ImageIcon className="mr-3 text-indigo-600" size={24} />
        {title}
        {required && <span className="text-red-500 ml-1">*</span>}
      </h2>

      {/* File Upload Section */}
      <div className="space-y-4">
        <FileUpload
          onUpload={handleUploadSuccess}
          uploadType={uploadType}
          currentImageUrl={imageUrl}
          maxSize={10} // 10MB for hotels
        />
        
        {/* Info about file upload */}
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <div className="flex items-start space-x-2">
            <ImageIcon size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-800">Upload directly to Cloudinary</p>
              <p className="text-blue-700 mt-1">
                {uploadType === 'hotel-image' 
                  ? 'Image will be optimized to 1200x800px for hotels'
                  : uploadType === 'room-image'
                  ? 'Image will be optimized to 800x600px for rooms'
                  : 'Image will be optimized for best display'
                }
              </p>
            </div>
          </div>
        </div>
        
        {/* Error display if any */}
        {errors.imageUrl && (
          <p className="mt-2 text-sm text-red-600">{errors.imageUrl}</p>
        )}
      </div>
    </div>
  );
};

export default ImageUploadSection; 