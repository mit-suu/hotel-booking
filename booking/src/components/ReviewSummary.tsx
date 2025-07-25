import React from 'react';
import { Star, MessageSquare, Shield } from 'lucide-react';

interface ReviewSummaryProps {
  averageRating?: number;
  totalReviews?: number;
  verifiedCount?: number;
  recentReviewText?: string;
  size?: 'sm' | 'md' | 'lg';
  showRecentReview?: boolean;
  className?: string;
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  averageRating = 0,
  totalReviews = 0,
  verifiedCount = 0,
  recentReviewText,
  size = 'md',
  showRecentReview = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: {
      stars: 'h-3 w-3',
      rating: 'text-sm',
      count: 'text-xs',
      gap: 'gap-1'
    },
    md: {
      stars: 'h-4 w-4',
      rating: 'text-base',
      count: 'text-sm',
      gap: 'gap-2'
    },
    lg: {
      stars: 'h-5 w-5',
      rating: 'text-lg',
      count: 'text-base',
      gap: 'gap-3'
    }
  };

  const classes = sizeClasses[size];

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, index) => (
      <Star 
        key={index} 
        className={`${classes.stars} ${
          index < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`} 
      />
    ));
  };

  const getRatingText = (rating: number) => {
    if (rating >= 4.5) return 'Xuất sắc';
    if (rating >= 4.0) return 'Tuyệt vời';
    if (rating >= 3.5) return 'Rất tốt';
    if (rating >= 3.0) return 'Tốt';
    if (rating >= 2.0) return 'Trung bình';
    return 'Cần cải thiện';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600 bg-green-50';
    if (rating >= 4.0) return 'text-blue-600 bg-blue-50';
    if (rating >= 3.5) return 'text-orange-600 bg-orange-50';
    if (rating >= 3.0) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (totalReviews === 0) {
    return (
      <div className={`flex items-center ${classes.gap} text-gray-500 ${className}`}>
        <MessageSquare className={`${classes.stars} text-gray-400`} />
        <span className={`${classes.count} text-gray-400`}>No reviews yet</span>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className={`flex items-center ${classes.gap}`}>
        {/* Rating Score */}
        <div className={`flex items-center ${classes.gap}`}>
          <span className={`font-semibold ${classes.rating} text-gray-900`}>
            {averageRating.toFixed(1)}
          </span>
          <div className="flex">
            {renderStars(averageRating)}
          </div>
        </div>

        {/* Rating Text and Count */}
        <div className={`flex items-center ${classes.gap}`}>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(averageRating)}`}>
            {getRatingText(averageRating)}
          </span>
          
          <div className={`flex items-center ${classes.gap} text-gray-600`}>
            <MessageSquare className={classes.stars} />
            <span className={classes.count}>
              {totalReviews} reviews
            </span>
            
            {verifiedCount > 0 && (
              <>
                <span className="mx-1">•</span>
                <div className={`flex items-center ${classes.gap}`}>
                  <Shield className={`${classes.stars} text-green-600`} />
                  <span className={`${classes.count} text-green-600`}>
                    {verifiedCount} xác minh
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Review */}
      {showRecentReview && recentReviewText && (
        <div className="mt-2 text-xs text-gray-600 italic">
          "{recentReviewText.length > 100 
            ? recentReviewText.substring(0, 100) + '...' 
            : recentReviewText}"
        </div>
      )}
    </div>
  );
};

export default ReviewSummary; 