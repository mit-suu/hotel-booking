import React, { useState } from 'react';
import { Star, X, Trash2 } from 'lucide-react';
import { reviewAPI, ReviewUpdateRequest } from '../services/api';

interface ReviewEditFormProps {
  review: {
    id: string;
    rating: number;
    comment?: string;
    hotelId: string;
    hotelName?: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const ReviewEditForm: React.FC<ReviewEditFormProps> = ({
  review,
  onSuccess,
  onCancel,
  onDelete
}) => {
  const [rating, setRating] = useState(review.rating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(review.comment || '');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Vui lòng chọn số sao đánh giá');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const updateData: ReviewUpdateRequest = {
        rating,
        comment: comment.trim() || undefined
      };

      await reviewAPI.updateMyReview(review.id, updateData);
      onSuccess();
    } catch (error: any) {
      console.error('Error updating review:', error);
      
      if (error.response?.status === 401) {
        setError('Bạn cần đăng nhập để chỉnh sửa đánh giá');
      } else if (error.response?.status === 403) {
        setError('Bạn không có quyền chỉnh sửa đánh giá này');
      } else if (error.response?.status === 404) {
        setError('Không tìm thấy đánh giá');
      } else {
        setError(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật đánh giá');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      setDeleting(true);
      setError(null);

      await reviewAPI.deleteMyReview(review.id);
      
      if (onDelete) {
        onDelete();
      } else {
        onSuccess(); // Fallback to onSuccess if onDelete not provided
      }
    } catch (error: any) {
      console.error('Error deleting review:', error);
      
      if (error.response?.status === 401) {
        setError('Bạn cần đăng nhập để xóa đánh giá');
      } else if (error.response?.status === 403) {
        setError('Bạn không có quyền xóa đánh giá này');
      } else if (error.response?.status === 404) {
        setError('Không tìm thấy đánh giá');
      } else {
        setError(error.response?.data?.message || 'Có lỗi xảy ra khi xóa đánh giá');
      }
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const renderStars = () => {
    return Array(5).fill(0).map((_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= (hoveredRating || rating);
      
      return (
        <button
          key={index}
          type="button"
          className={`p-1 transition-colors ${isFilled ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          onClick={() => setRating(starValue)}
        >
          <Star 
            className={`h-8 w-8 ${isFilled ? 'fill-current' : ''}`} 
          />
        </button>
      );
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Chỉnh sửa đánh giá cho {review.hotelName}
        </h3>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Đánh giá của bạn *
          </label>
          <div className="flex items-center space-x-1">
            {renderStars()}
            <span className="ml-3 text-sm text-gray-600">
              ({rating > 0 ? rating : 0}/5 sao)
            </span>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nội dung đánh giá (tùy chọn)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Chia sẻ trải nghiệm của bạn về khách sạn này..."
            maxLength={2000}
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {comment.length}/2000 ký tự
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          {/* Delete Button */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || deleting}
            className={`px-4 py-2 text-sm font-medium border rounded-lg transition-colors flex items-center space-x-2 ${
              showDeleteConfirm 
                ? 'text-white bg-red-600 border-red-600 hover:bg-red-700' 
                : 'text-red-600 bg-white border-red-300 hover:bg-red-50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Trash2 className="h-4 w-4" />
            <span>
              {deleting 
                ? 'Đang xóa...' 
                : showDeleteConfirm 
                  ? 'Xác nhận xóa' 
                  : 'Xóa đánh giá'
              }
            </span>
          </button>

          {/* Cancel if showing delete confirm */}
          {showDeleteConfirm && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Hủy xóa
            </button>
          )}

          {/* Right side buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={deleting}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || deleting || rating === 0}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Đang cập nhật...' : 'Cập nhật đánh giá'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ReviewEditForm; 