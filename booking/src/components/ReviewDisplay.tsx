import React, { useState } from 'react';
import { Star, Calendar, Shield, User, MessageSquare, MoreHorizontal } from 'lucide-react';
import { ReviewResponse } from '../types/review';
import ReviewFilters from './ReviewFilters';

interface ReviewDisplayProps {
  reviews: ReviewResponse[];
  loading?: boolean;
  showPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  hotelId?: string;
  showStats?: boolean;
  showFilters?: boolean;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}

const ReviewDisplay: React.FC<ReviewDisplayProps> = ({
  reviews,
  loading = false,
  showPagination = false,
  currentPage = 0,
  totalPages = 0,
  onPageChange,
  hotelId,
  showStats = false,
  showFilters = false
}) => {
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [filteredReviews, setFilteredReviews] = useState<ReviewResponse[]>(reviews);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Filter and sort reviews
  React.useEffect(() => {
    let filtered = [...reviews];

    // Apply rating filter
    if (selectedRating !== null) {
      filtered = filtered.filter(review => review.rating === selectedRating);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;

        default:
          return 0;
      }
    });

    setFilteredReviews(filtered);
  }, [reviews, selectedRating, sortBy]);

  // Calculate review statistics
  React.useEffect(() => {
    if ((showStats || showFilters) && reviews.length > 0) {
      const totalReviews = reviews.length;
      const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
      
      const ratingDistribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviews.forEach(review => {
        ratingDistribution[review.rating]++;
      });

      setStats({ averageRating, totalReviews, ratingDistribution });
    }
  }, [reviews, showStats, showFilters]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const reviewDate = new Date(dateString);
    const diffInMs = now.getTime() - reviewDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Hôm nay';
    if (diffInDays === 1) return 'Hôm qua';
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} tháng trước`;
    return `${Math.floor(diffInDays / 365)} năm trước`;
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    };

    return Array(5).fill(0).map((_, index) => (
      <Star 
        key={index} 
        className={`${sizeClasses[size]} ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`} 
      />
    ));
  };



  const toggleReviewExpansion = (reviewId: string) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const getStatusBadge = (review: ReviewResponse) => {
    return null; // Không hiển thị badge nào nữa
  };

  const isLongComment = (comment: string) => comment && comment.length > 300;

  if (loading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Statistics */}
      {showStats && stats && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Reviews</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(stats.averageRating), 'lg')}
              </div>
              <div className="text-sm text-gray-600">
                Từ {stats.totalReviews} đánh giá
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = stats.ratingDistribution[rating] || 0;
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center space-x-2">
                    <span className="text-sm font-medium w-4">{rating}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Review Filters */}
      {showFilters && stats && (
        <ReviewFilters
          totalReviews={reviews.length}
          selectedRating={selectedRating}
          sortBy={sortBy}
          onRatingFilter={setSelectedRating}
          onSortChange={setSortBy}
          ratingDistribution={stats.ratingDistribution}
        />
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có đánh giá nào</h3>
            <p className="text-gray-600">Hãy là người đầu tiên để lại đánh giá cho khách sạn này.</p>
          </div>
                  ) : (
            filteredReviews.map((review) => {
            const isExpanded = expandedReviews.has(review.id);
            const shouldTruncate = review.comment && isLongComment(review.comment) && !isExpanded;
            const displayComment = shouldTruncate 
              ? review.comment!.substring(0, 300) + '...' 
              : review.comment;

            return (
              <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                {/* Review Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    {/* User Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      <User className="h-6 w-6" />
                    </div>
                    
                    {/* User Info & Rating */}
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900">
                          {review.userName || 'Khách ẩn danh'}
                        </h4>
                        {getStatusBadge(review)}
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {review.rating}/5
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{getRelativeTime(review.createdAt)}</span>
                        <span className="mx-2">•</span>
                        <span>{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Options Menu */}
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>

                {/* Review Content */}
                {review.comment && (
                  <div className="mb-4">
                    <p className="text-gray-800 leading-relaxed">
                      {displayComment}
                    </p>
                    
                    {review.comment && isLongComment(review.comment) && (
                      <button
                        onClick={() => toggleReviewExpansion(review.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
                      >
                        {isExpanded ? 'Show Less' : 'Show More'}
                      </button>
                    )}
                  </div>
                )}


              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-center space-x-2 mt-8">
          <button
            onClick={() => onPageChange(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className={`px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium ${
              currentPage === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Trước
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(0, Math.min(currentPage - 2, totalPages - 5)) + i;
            const isActive = pageNum === currentPage;
            
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-4 py-2 border rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum + 1}
              </button>
            );
          })}
          
          <button
            onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage >= totalPages - 1}
            className={`px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium ${
              currentPage >= totalPages - 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewDisplay; 