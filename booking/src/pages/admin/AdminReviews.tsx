import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Filter, Check, X, Trash, Eye, Calendar, MessageSquare, Flag, User, Hotel, RefreshCw } from 'lucide-react';
import { reviewAPI, ReviewResponse } from '../../services/api';

interface ReviewsState {
  reviews: ReviewResponse[];
  loading: boolean;
  error: string | null;
  totalReviews: number;
  currentPage: number;
  totalPages: number;
}

const AdminReviews: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0); // Backend uses 0-based pagination
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [state, setState] = useState<ReviewsState>({
    reviews: [],
    loading: true,
    error: null,
    totalReviews: 0,
    currentPage: 0,
    totalPages: 0
  });

  const pageSize = 10;

  // Fetch reviews with filters
  const fetchReviews = async (page: number = 0) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      let response;
      
      if (searchTerm.trim()) {
        // Use search API
        response = await reviewAPI.searchReviews(searchTerm.trim(), page, pageSize, 'createdAt');
      } else {
        // Build filter parameters
        const filterParams: any = {
          pageNumber: page,
          pageSize: pageSize,
          sortBy: 'createdAt'
        };

        if (ratingFilter !== 'all') {
          if (ratingFilter === 'low') {
            // For low ratings, we'll need to fetch all and filter client-side or add backend support
            filterParams.rating = null;
          } else {
            filterParams.rating = parseInt(ratingFilter);
          }
        }



        response = await reviewAPI.getAllReviewsWithFilters(filterParams);
      }

      const data = response.data.result;
      
      setState(prev => ({
        ...prev,
        reviews: data.content || [],
        totalReviews: data.totalElements || 0,
        currentPage: data.pageNumber || 0,
        totalPages: data.totalPages || 0,
        loading: false
      }));

    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'An error occurred while loading the review list'
      }));
    }
  };

  useEffect(() => {
    fetchReviews(0);
    setCurrentPage(0);
  }, [searchTerm, ratingFilter]);

  useEffect(() => {
    fetchReviews(currentPage);
  }, [currentPage]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(state.reviews.map(review => review.id));
    }
    setIsSelectAll(!isSelectAll);
  };

  const handleSelectReview = (reviewId: string) => {
    if (selectedReviews.includes(reviewId)) {
      setSelectedReviews(selectedReviews.filter(id => id !== reviewId));
    } else {
      setSelectedReviews([...selectedReviews, reviewId]);
    }
  };

  const handleViewProperty = (hotelId: string) => {
    navigate(`/admin/hotels/${hotelId}`);
  };

  const handleViewUser = (userId: string) => {
    navigate(`/admin/users/${userId}`);
  };



  const handleDeleteReview = async (reviewId: string) => {
          if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(reviewId);
      await reviewAPI.deleteReview(reviewId);
      await fetchReviews(currentPage);
              alert('Review deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting review:', error);
              alert('An error occurred while deleting the review');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkAction = async (action: 'delete') => {
    if (selectedReviews.length === 0) return;
    
    const actionText = 'delete';
    
    if (!window.confirm(`Are you sure you want to ${actionText} ${selectedReviews.length} selected reviews?`)) {
      return;
    }

    try {
      setActionLoading('bulk');
      
      const promises = selectedReviews.map(reviewId => {
        return reviewAPI.deleteReview(reviewId);
      });

      await Promise.all(promises);
      await fetchReviews(currentPage);
      setSelectedReviews([]);
      setIsSelectAll(false);
      alert(`Successfully ${actionText}d ${selectedReviews.length} reviews!`);
    } catch (error: any) {
      console.error(`Error performing bulk ${action}:`, error);
      alert(`An error occurred while ${action}ing reviews`);
    } finally {
      setActionLoading(null);
    }
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, index) => (
      <Star 
        key={index} 
        size={16} 
        className={`${index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const getStatusBadge = (review: ReviewResponse) => {
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Published</span>;
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleRefresh = () => {
    fetchReviews(currentPage);
  };

  if (state.loading && state.reviews.length === 0) {
    return (
      <div className="w-full">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
                  <h1 className="text-xl sm:text-2xl font-bold">Review Management</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            disabled={state.loading}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${state.loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{state.error}</p>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
                              placeholder="Search by review content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Reviews</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
                <option value="low">Low Rating (≤ 3 stars)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedReviews.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex justify-between items-center">
          <span className="text-blue-700">Selected {selectedReviews.length} reviews</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('delete')}
              disabled={actionLoading !== null}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
            >
              <Trash size={16} className="mr-1" />
                              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        {state.reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-600">
              {searchTerm || ratingFilter !== 'all' 
                ? 'Try changing the filters to see different results'
                : 'No reviews in the system yet'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isSelectAll}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Review
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hotel
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reviewer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Review Date
                  </th>
                 
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {state.reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedReviews.includes(review.id)}
                          onChange={() => handleSelectReview(review.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center mb-2">
                        <div className="flex mr-2">
                          {renderStars(review.rating)}
                        </div>
                        
                      </div>
                      <p className="text-sm text-gray-900">
                        {review.comment || <em className="text-gray-500">No comment</em>}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleViewProperty(review.hotelId)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Hotel size={14} className="mr-1" />
                        {review.hotelName || 'N/A'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleViewUser(review.userId)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <User size={14} className="mr-1" />
                        {review.userName || 'N/A'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                        {formatDate(review.createdAt)}
                      </div>
                    </td> 
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          disabled={actionLoading === review.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {state.totalPages > 1 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0 || state.loading}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(Math.min(state.totalPages - 1, currentPage + 1))}
                disabled={currentPage >= state.totalPages - 1 || state.loading}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage >= state.totalPages - 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{currentPage * pageSize + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min((currentPage + 1) * pageSize, state.totalReviews)}
                  </span>{' '}
                  of <span className="font-medium">{state.totalReviews}</span> reviews
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0 || state.loading}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === 0
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                                      >
                      Previous
                    </button>
                  
                  {Array.from({ length: Math.min(5, state.totalPages) }, (_, i) => {
                    const pageNum = Math.max(0, Math.min(currentPage - 2, state.totalPages - 5)) + i;
                    const isActive = pageNum === currentPage;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={state.loading}
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
                    onClick={() => handlePageChange(Math.min(state.totalPages - 1, currentPage + 1))}
                    disabled={currentPage >= state.totalPages - 1 || state.loading}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage >= state.totalPages - 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                                      >
                      Next
                    </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviews;

