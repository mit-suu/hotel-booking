import React, { useState, useEffect } from 'react';
import { Star, Edit, Trash, Calendar, MapPin, Eye, AlertCircle, MessageSquare } from 'lucide-react';
import { reviewAPI, ReviewResponse } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface MyReviewsState {
  reviews: ReviewResponse[];
  loading: boolean;
  error: string | null;
  totalReviews: number;
  currentPage: number;
  totalPages: number;
}

const MyReviews: React.FC = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<MyReviewsState>({
    reviews: [],
    loading: true,
    error: null,
    totalReviews: 0,
    currentPage: 0,
    totalPages: 0
  });

  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    rating: 0,
    comment: ''
  });

  const pageSize = 10;

  const fetchMyReviews = async (page: number = 0) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await reviewAPI.getMyReviews(page, pageSize, 'createdAt');
      const data = response.data.result;
      
      setState(prev => ({
        ...prev,
        reviews: data.content,
        totalReviews: data.totalElements,
        currentPage: data.pageNumber,
        totalPages: data.totalPages,
        loading: false
      }));
    } catch (error: any) {
      console.error('Error fetching my reviews:', error);
      
      let errorMessage = 'An error occurred while loading reviews.';
      
      if (error.response?.status === 401) {
        errorMessage = 'You need to log in to view your reviews.';
        // Redirect to login
        navigate('/login');
        return;
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  };

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const handleEditClick = (review: ReviewResponse) => {
    setEditingReview(review.id);
    setEditForm({
      rating: review.rating,
      comment: review.comment || ''
    });
  };

  const handleEditCancel = () => {
    setEditingReview(null);
    setEditForm({ rating: 0, comment: '' });
  };

  const handleEditSubmit = async (reviewId: string) => {
    try {
      if (editForm.rating === 0) {
        alert('Please select a star rating');
        return;
      }

      if (editForm.comment.length > 2000) {
        alert('Review content must not exceed 2000 characters');
        return;
      }

      await reviewAPI.updateMyReview(reviewId, {
        rating: editForm.rating,
        comment: editForm.comment.trim()
      });

      // Refresh reviews
      await fetchMyReviews(state.currentPage);
      setEditingReview(null);
      alert('Review updated successfully!');
    } catch (error: any) {
      console.error('Error updating review:', error);
      alert('An error occurred while updating the review. Please try again.');
    }
  };

  const handleDelete = async (reviewId: string, hotelName: string) => {
    if (!window.confirm(`Are you sure you want to delete the review for "${hotelName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await reviewAPI.deleteMyReview(reviewId);
      
      // Remove the deleted review from state
      setState(prev => ({
        ...prev,
        reviews: prev.reviews.filter(review => review.id !== reviewId),
        totalReviews: prev.totalReviews - 1
      }));
      
      alert('Review has been deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting review:', error);
      
      if (error.response?.status === 401) {
        alert('You need to log in to delete reviews.');
      } else if (error.response?.status === 403) {
        alert('You do not have permission to delete this review.');
      } else if (error.response?.status === 404) {
        alert('Review not found.');
      } else {
        alert('An error occurred while deleting the review. Please try again.');
      }
    }
  };

  const handleViewHotel = (hotelId: string) => {
    navigate(`/hotels/${hotelId}`);
  };

  const handlePageChange = (newPage: number) => {
    fetchMyReviews(newPage);
  };

  const renderStars = (rating: number, interactive: boolean = false, onRatingChange?: (rating: number) => void) => {
    return Array(5).fill(0).map((_, index) => {
      const starRating = index + 1;
      const isActive = starRating <= rating;
      
      return (
        <button
          key={index}
          type="button"
          onClick={() => interactive && onRatingChange && onRatingChange(starRating)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform ${
            isActive ? 'text-yellow-400' : 'text-gray-300'
          }`}
          disabled={!interactive}
        >
          <Star 
            size={interactive ? 24 : 16} 
            className={`${isActive ? 'fill-current' : ''}`}
          />
        </button>
      );
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (review: ReviewResponse) => {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <Star className="w-3 h-3 mr-1" />
        Published
      </span>
    );
  };

  if (state.loading && state.reviews.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">An error occurred</h3>
            <p className="text-red-600 mb-4">{state.error}</p>
            <button
              onClick={() => fetchMyReviews()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Reviews</h1>
          <p className="text-gray-600">
            Manage and edit your written reviews ({state.totalReviews} reviews)
          </p>
        </div>

        {/* Reviews List */}
        {state.reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't written any reviews. Book a stay and share your experience!
            </p>
            <button
              onClick={() => navigate('/hotels')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Explore hotels
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {state.reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  {/* Review Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {review.hotelName}
                        </h3>
                        {getStatusBadge(review)}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(review.createdAt)}
                        </div>

                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleViewHotel(review.hotelId)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View hotel"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEditClick(review)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(review.id, review.hotelName || 'this hotel')}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Review Content */}
                  {editingReview === review.id ? (
                    /* Edit Mode */
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rating
                        </label>
                        <div className="flex">
                          {renderStars(editForm.rating, true, (rating) => 
                            setEditForm(prev => ({ ...prev, rating }))
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Review content
                        </label>
                        <textarea
                          value={editForm.comment}
                          onChange={(e) => setEditForm(prev => ({ ...prev, comment: e.target.value }))}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Share your experience..."
                          maxLength={2000}
                        />
                        <div className="text-right text-sm text-gray-500 mt-1">
                          {editForm.comment.length}/2000
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={handleEditCancel}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleEditSubmit(review.id)}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
                        >
                          Save changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div>
                      <div className="flex items-center mb-3">
                        {renderStars(review.rating)}
                        <span className="ml-2 text-sm text-gray-600">
                          {review.rating}/5 stars
                        </span>
                      </div>
                      
                      {review.comment && (
                        <p className="text-gray-700 leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {state.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => handlePageChange(state.currentPage - 1)}
                disabled={state.currentPage === 0}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                  state.currentPage === 0
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, state.totalPages) }, (_, i) => {
                const pageNum = Math.max(0, Math.min(state.currentPage - 2, state.totalPages - 5)) + i;
                const isActive = pageNum === state.currentPage;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      isActive
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(state.currentPage + 1)}
                disabled={state.currentPage >= state.totalPages - 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                  state.currentPage >= state.totalPages - 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReviews; 