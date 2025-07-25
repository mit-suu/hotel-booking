import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { uploadAPI, UploadResponse } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface FileUploadProps {
  onUpload: (url: string, uploadData?: UploadResponse) => void;
  onError?: (error: string) => void;
  accept?: string;
  maxSize?: number; // MB
  uploadType?: 'image' | 'hotel-image' | 'room-image';
  currentImageUrl?: string;
  className?: string;
  disabled?: boolean;
}

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  preview: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  onError,
  accept = 'image/*',
  maxSize = 5, // 5MB default
  uploadType = 'image',
  currentImageUrl,
  className = '',
  disabled = false
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
    preview: currentImageUrl || null
  });

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Only image files are accepted';
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      return `File too large. Maximum size: ${maxSize}MB`;
    }

    // Check specific image formats
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Only accepts formats: JPG, PNG, GIF, WebP';
    }

    return null;
  }, [maxSize]);

  // Handle file upload
  const handleUpload = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setUploadState(prev => ({ ...prev, error: validationError }));
      onError?.(validationError);
      showToast('error', 'Error', validationError);
      return;
    }

    setUploadState(prev => ({
      ...prev,
      uploading: true,
      progress: 0,
      error: null,
      preview: URL.createObjectURL(file)
    }));

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 200);

      let response;
      switch (uploadType) {
        case 'hotel-image':
          response = await uploadAPI.uploadHotelImage(file);
          break;
        case 'room-image':
          response = await uploadAPI.uploadRoomImage(file);
          break;
        default:
          response = await uploadAPI.uploadImage(file);
      }

      clearInterval(progressInterval);

      if (response.data.success && response.data.result) {
        setUploadState(prev => ({
          ...prev,
          uploading: false,
          progress: 100,
          error: null
        }));

        const uploadData = response.data.result;
        if (uploadData.imageUrl) {
          onUpload(uploadData.imageUrl, uploadData);
        } else {
          throw new Error('No image URL received from server');
        }
        showToast('success', 'Success', 'Image uploaded successfully');
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error: any) {
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        progress: 0,
        error: error.response?.data?.message || error.message || 'Upload failed'
      }));
      onError?.(error.message);
      showToast('error', 'Upload Error', error.response?.data?.message || error.message || 'Upload failed');
    }
  }, [uploadType, validateFile, onUpload, onError, showToast]);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || uploadState.uploading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleUpload(files[0]);
    }
  }, [disabled, uploadState.uploading, handleUpload]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
  }, [handleUpload]);

  // Open file dialog
  const openFileDialog = useCallback(() => {
    if (!disabled && !uploadState.uploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, uploadState.uploading]);

  // Clear upload
  const clearUpload = useCallback(() => {
    setUploadState(prev => ({
      ...prev,
      preview: null,
      error: null,
      progress: 0
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Get upload type label
  const getUploadTypeLabel = () => {
    switch (uploadType) {
      case 'hotel-image':
        return 'hotel image (1200x800)';
      case 'room-image':
        return 'room image (800x600)';
      default:
        return 'image';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
        className={`
          relative border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer
          ${uploadState.preview ? 'h-64 p-0' : 'p-6 min-h-[200px]'}
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled || uploadState.uploading ? 'opacity-50 cursor-not-allowed' : ''}
          ${uploadState.error ? 'border-red-300 bg-red-50' : ''}
          ${uploadState.preview && !uploadState.uploading ? 'border-green-300 bg-green-50' : ''}
        `}
      >
        {/* Preview Image */}
        {uploadState.preview && (
          <div className="absolute inset-0 rounded-lg overflow-hidden">
            <img
              src={uploadState.preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {!uploadState.uploading && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearUpload();
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                type="button"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {/* Upload Content */}
        <div className={`text-center ${uploadState.preview ? 'hidden' : ''}`}>
          <div className="flex flex-col items-center space-y-3">
            {uploadState.uploading ? (
              <Loader2 size={48} className="text-blue-500 animate-spin" />
            ) : uploadState.error ? (
              <AlertCircle size={48} className="text-red-500" />
            ) : (
              <Upload size={48} className="text-gray-400" />
            )}

            <div className="space-y-1">
              {uploadState.uploading ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Uploading {getUploadTypeLabel()}...
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadState.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{uploadState.progress}%</p>
                </div>
              ) : uploadState.error ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-red-600">Upload failed</p>
                  <p className="text-xs text-red-500">{uploadState.error}</p>
                  <p className="text-xs text-gray-500">Click to retry</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">
                    Drag and drop {getUploadTypeLabel()} here
                  </p>
                  <p className="text-xs text-gray-500">
                    or <span className="text-blue-600 font-medium">click to select file</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    Supports: JPG, PNG, GIF, WebP • Max {maxSize}MB
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upload Success Overlay */}
        {uploadState.preview && uploadState.progress === 100 && !uploadState.uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="bg-white rounded-full p-3">
              <CheckCircle size={32} className="text-green-500" />
            </div>
          </div>
        )}
      </div>

      {/* File Info */}
      {uploadState.preview && uploadState.progress === 100 && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          <ImageIcon size={12} className="inline mr-1" />
          Upload successful • Click to change
        </div>
      )}
    </div>
  );
};

export default FileUpload; 