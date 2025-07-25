import React from 'react';
import { Filter, SortAsc, Star } from 'lucide-react';

interface ReviewFiltersProps {
  totalReviews: number;
  selectedRating: number | null;
  sortBy: 'newest' | 'oldest' | 'highest' | 'lowest';
  onRatingFilter: (rating: number | null) => void;
  onSortChange: (sort: 'newest' | 'oldest' | 'highest' | 'lowest') => void;
  ratingDistribution?: { [key: number]: number };
}

const ReviewFilters: React.FC<ReviewFiltersProps> = ({
  totalReviews,
  selectedRating,
  sortBy,
  onRatingFilter,
  onSortChange,
  ratingDistribution = {}
}) => {
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, index) => (
      <Star 
        key={index} 
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`} 
      />
    ));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Rating Filters */}
        <div className="flex-1">
          {/* <div className="flex items-center mb-3">
            <Filter className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="font-medium text-gray-900">Filter</h3>
          </div> */}
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onRatingFilter(null)}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                selectedRating === null
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              All ({totalReviews})
            </button>
            
            {[5, 4, 3, 2, 1].map(rating => {
              const count = ratingDistribution[rating] || 0;
              
              return (
                <button
                  key={rating}
                  onClick={() => onRatingFilter(rating)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors flex items-center ${
                    selectedRating === rating
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex mr-2">
                    {renderStars(rating)}
                  </div>
                  ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort Options */}
        {/* <div className="lg:w-64">
          <div className="flex items-center mb-3">
            <SortAsc className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="font-medium text-gray-900">Sort</h3>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div> */}
      </div>
    </div>
  );
};

export default ReviewFilters; 