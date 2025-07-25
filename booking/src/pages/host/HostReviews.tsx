import React, { useState, useEffect } from 'react';
import { Search, Star, Filter, Calendar, MessageSquare, User, Hotel } from 'lucide-react';
import { reviewAPI, hotelAPI, HotelResponse } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  hotelName: string;
  userName: string;
  userEmail: string;
}

interface ReviewsState {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  totalReviews: number;
  currentPage: number;
  totalPages: number;
}

const HostReviews: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  console.log('HostReviews: Component rendered, user:', user);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [hotelFilter, setHotelFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);


  const [state, setState] = useState<ReviewsState>({
    reviews: [],
    loading: true,
    error: null,
    totalReviews: 0,
    currentPage: 0,
    totalPages: 0
  });

  const [hotels, setHotels] = useState<HotelResponse[]>([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    totalHotels: 0
  });

  const pageSize = 10;

  // Load host hotels
  const loadHotels = async () => {
    try {
      console.log('HostReviews: Loading hotels...');
      const response = await hotelAPI.getMyHotels(0, 100, 'name');
      console.log('HostReviews: Hotels response:', response.data);
      
      if (response.data.success) {
        setHotels(response.data.result.content);
        setStats(prev => ({ ...prev, totalHotels: response.data.result.content.length }));
        console.log('HostReviews: Hotels loaded successfully:', response.data.result.content.length);
      } else {
        console.error('HostReviews: Hotels response not successful:', response.data);
      }
    } catch (error) {
      console.error('HostReviews: Error loading hotels:', error);
      showToast('error', 'Error', 'Unable to load hotel list');
    }
  };

  // Load review statistics
  const loadStats = async () => {
    try {
      console.log('HostReviews: Loading stats...');
      const [countResponse, ratingResponse] = await Promise.all([
        reviewAPI.getHostReviewsCount().catch((err) => {
          console.error('HostReviews: Error getting reviews count:', err);
          return { data: { success: false, result: 0 } };
        }),
        reviewAPI.getHostAverageRating().catch((err) => {
          console.error('HostReviews: Error getting average rating:', err);
          return { data: { success: false, result: 0 } };
        })
      ]);
      
      console.log('HostReviews: Stats responses:', { countResponse: countResponse.data, ratingResponse: ratingResponse.data });
      
      if (countResponse.data.success && ratingResponse.data.success) {
        setStats(prev => ({
          ...prev,
          totalReviews: countResponse.data.result,
          averageRating: ratingResponse.data.result
        }));
        console.log('HostReviews: Stats loaded successfully');
      }
    } catch (error) {
      console.error('HostReviews: Error loading stats:', error);
    }
  };

  // Fetch reviews with filters
  const fetchReviews = async (page: number = 0) => {
    try {
      console.log('HostReviews: Fetching reviews, page:', page, 'filters:', { searchTerm, ratingFilter, hotelFilter });
      setState(prev => ({ ...prev, loading: true, error: null }));

      let response;
      
      if (searchTerm.trim()) {
        console.log('HostReviews: Using search API');
        response = await reviewAPI.searchHostReviews(searchTerm.trim(), page, pageSize, 'createdAt');
      } else {
        const filterParams: any = {
          pageNumber: page,
          pageSize: pageSize,
          sortBy: 'createdAt'
        };

        if (hotelFilter !== 'all') {
          filterParams.hotelId = hotelFilter;
        }

        if (ratingFilter !== 'all') {
          filterParams.rating = parseInt(ratingFilter);
        }

        console.log('HostReviews: Using filter API with params:', filterParams);
        response = await reviewAPI.getHostReviewsWithFilters(filterParams);
      }

      console.log('HostReviews: Reviews response:', response.data);
      const data = response.data.result;
      
      setState(prev => ({
        ...prev,
        reviews: data.content || [],
        totalReviews: data.totalElements || 0,
        currentPage: data.pageNumber || 0,
        totalPages: data.totalPages || 0,
        loading: false
      }));

      console.log('HostReviews: Reviews loaded successfully, count:', data.content?.length || 0);

    } catch (error: any) {
      console.error('HostReviews: Error fetching reviews:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'An error occurred while loading the review list'
      }));
    }
  };

  useEffect(() => {
    console.log('HostReviews: Initial useEffect triggered');
    loadHotels();
    loadStats();
  }, []);

  useEffect(() => {
    console.log('HostReviews: Filter useEffect triggered');
    fetchReviews(0);
    setCurrentPage(0);
  }, [searchTerm, ratingFilter, hotelFilter]);

  useEffect(() => {
    console.log('HostReviews: Page useEffect triggered, page:', currentPage);
    fetchReviews(currentPage);
  }, [currentPage]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };



  const handleClearFilters = () => {
    console.log('HostReviews: Clear filters triggered');
    setSearchTerm('');
    setRatingFilter('all');
    setHotelFilter('all');
    setCurrentPage(0);
  };

  console.log('HostReviews: Current state:', { state, stats, hotels: hotels.length });

  if (state.loading && state.reviews.length === 0) {
    return (
      <div className="w-full">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading reviews...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Review Management</h1>
        <p className="text-gray-600 mt-1">View and manage reviews for your hotels</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}/5</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Hotel className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hotels</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalHotels}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{state.error}</p>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
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
                value={hotelFilter}
                onChange={(e) => setHotelFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Hotels</option>
                {hotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.name} - {hotel.city}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
          <span>Showing {state.reviews.length} / {state.totalReviews} reviews</span>
        </div>
      </div>



      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        {state.reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-600">
              {searchTerm || ratingFilter !== 'all' || hotelFilter !== 'all'
                ? 'Try changing the filters to see different results'
                : 'No reviews for your hotels yet'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {state.reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
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
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        <Hotel size={14} className="mr-1 text-gray-500" />
                        {review.hotelName || 'Unknown Hotel'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        <User size={14} className="mr-1 text-gray-500" />
                        {review.userName || 'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {review.userEmail || 'Email not available'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                        {formatDate(review.createdAt)}
                      </div>
                      {review.updatedAt !== review.createdAt && (
                        <div className="text-xs text-gray-400 mt-1">
                          Updated: {formatDate(review.updatedAt)}
                        </div>
                      )}
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

export default HostReviews; 