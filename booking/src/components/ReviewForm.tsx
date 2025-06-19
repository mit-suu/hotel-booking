import React, { useState } from 'react';
import { Star, MessageSquare, Send, AlertCircle } from 'lucide-react';
import { reviewAPI, ReviewCreateRequest } from '../services/api';

interface ReviewFormProps {
  hotelId: string;
  hotelName: string;
  onSuccess?: (reviewId: string) => void;
  onCancel?: () => void;
  className?: string;
}

interface FormData {
  rating: number;
  comment: string;
}

interface FormErrors {
  rating?: string;
  comment?: string;
  submit?: string;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  hotelId,
  hotelName,
  onSuccess,
  onCancel,
  className = ''
}) => {
  const [formData, setFormData] = useState<FormData>({
    rating: 0,
    comment: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.rating === 0) {
      newErrors.rating = 'Please select a rating';
    } else if (formData.rating < 1 || formData.rating > 5) {
              newErrors.rating = 'Rating must be between 1 and 5 stars';
    }

    // Comment is optional, but if provided, check length limits
    if (formData.comment.trim().length > 0 && formData.comment.length > 2000) {
              newErrors.comment = 'Review content must not exceed 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: undefined }));
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const comment = e.target.value;
    setFormData(prev => ({ ...prev, comment }));
    
    // Clear error if comment is within valid range (empty is ok, or under 2000 chars)
    if (errors.comment && (comment.trim().length === 0 || comment.length <= 2000)) {
      setErrors(prev => ({ ...prev, comment: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const reviewData: ReviewCreateRequest = {
        rating: formData.rating,
        comment: formData.comment.trim(),
        hotelId: hotelId
      };

      const response = await reviewAPI.createReview(reviewData);
      const reviewId = response.data.result.id;

      // Reset form
      setFormData({ rating: 0, comment: '' });
      
      if (onSuccess) {
        onSuccess(reviewId);
      } else {
        alert('Your review has been submitted successfully!');
      }
    } catch (error: any) {
      console.error('Error creating review:', error);
      
              let errorMessage = 'An error occurred while submitting the review. Please try again.';
      
      if (error.response?.status === 400) {
        const backendError = error.response?.data?.message;
        if (backendError?.includes('already reviewed')) {
          errorMessage = 'You have already reviewed this hotel. Each customer can only review once.';
        } else {
          errorMessage = backendError || errorMessage;
        }
      } else if (error.response?.status === 401) {
                  errorMessage = 'You need to login to be able to review.';
      } else if (error.response?.status === 404) {
                  errorMessage = 'Hotel not found. Please try again.';
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array(5).fill(0).map((_, index) => {
      const starRating = index + 1;
      const isActive = starRating <= (hoverRating || formData.rating);
      
      return (
        <button
          key={index}
          type="button"
          onClick={() => handleRatingClick(starRating)}
          onMouseEnter={() => setHoverRating(starRating)}
          onMouseLeave={() => setHoverRating(0)}
          className={`p-1 transition-colors duration-200 ${
            isActive ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
          }`}
          disabled={isSubmitting}
        >
          <Star 
            size={32} 
            className={`${isActive ? 'fill-current' : ''}`}
          />
        </button>
      );
    });
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Rất tệ';
      case 2: return 'Tệ';
      case 3: return 'Bình thường';
      case 4: return 'Tốt';
      case 5: return 'Xuất sắc';
      default: return '';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Rate Hotel
        </h3>
        <p className="text-gray-600">
          Chia sẻ trải nghiệm của bạn tại <span className="font-medium">{hotelName}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Overall Rating *
          </label>
          <div className="flex items-center space-x-2">
            <div className="flex">
              {renderStars()}
            </div>
            {(hoverRating || formData.rating) > 0 && (
              <span className="text-sm font-medium text-gray-700 ml-3">
                {getRatingText(hoverRating || formData.rating)}
              </span>
            )}
          </div>
          {errors.rating && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.rating}
            </p>
          )}
        </div>

        {/* Comment Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review Content (Optional)
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <textarea
              value={formData.comment}
              onChange={handleCommentChange}
                              placeholder="Share your experience about this hotel. What did you like most? Is there anything that needs improvement?"
              rows={5}
              className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                errors.comment ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
              maxLength={2000}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            {errors.comment ? (
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.comment}
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Chia sẻ thêm về trải nghiệm của bạn
              </p>
            )}
            <span className="text-sm text-gray-500">
              {formData.comment.length}/2000
            </span>
          </div>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {errors.submit}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 disabled:opacity-50"
            >
              Hủy
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || formData.rating === 0}
            className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang gửi...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Review
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm; 