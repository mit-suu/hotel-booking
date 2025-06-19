// Review Types - Matching backend response structure

export interface ReviewResponse {
  id: string;
  rating: number;
  comment?: string;
  helpfulCount: number;
  
  // Hotel information
  hotelId: string;
  hotelName?: string;
  
  // User information
  userId: string;
  userName?: string;
  userEmail?: string;
  
  // Audit fields
  createdAt: string;
  updatedAt: string;
}

export interface ReviewCreateRequest {
  rating: number;
  comment?: string;
  hotelId: string;
  userId?: string; // Optional - will use current user if not provided
}

export interface ReviewUpdateRequest {
  rating?: number;
  comment?: string;
}

// For paginated responses
export interface ReviewsPageResponse {
  content: ReviewResponse[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// Filter parameters for admin/search
export interface ReviewFilterParams {
  hotelId?: string;
  userId?: string;
  rating?: number;
  keyword?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
}

// Statistics response
export interface ReviewStatsResponse {
  total: number;
  averageRating: number;
  ratingDistribution: {
    [key: number]: number; // rating -> count
  };
}

// Legacy interface for backward compatibility - to be phased out
export interface LegacyReview {
  id: string;
  hotelId: string;
  bookingId: string;
  guestName: string;
  guestAvatar?: string;
  rating: number;
  roomTypeRating?: number;
  serviceRating?: number;
  locationRating?: number;
  cleanlinessRating?: number;
  comment: string;
  images?: string[];
  date: string;
  hotelResponse?: {
    message: string;
    date: string;
  };
} 