import axios from 'axios';
import {
  VoucherRequest,
  VoucherUpdateRequest,
  VoucherResponse,
  VoucherValidationRequest,
  VoucherValidationResponse,
  VoucherFilterParams,
  VoucherStatsResponse,
  VoucherApiResponse,
  VoucherListResponse
} from '../types/voucher';

//const API_URL = 'https://bk.blwsmartware.net';
const API_URL = 'http://localhost:8080'; // Direct API endpoint

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'accept': '*/*'
  },
});

// Add request interceptor để thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor để handle authentication errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If the error status is 401 and we haven't already tried to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          // Try to refresh the token
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken: refreshToken
          });
          
          const newToken = response.data.result.token;
          localStorage.setItem('token', newToken);
          
          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  username: string;
  password: string;
  email?: string;
}

export interface UserUpdateRequest {
  name: string;
  username: string;
  email: string;
  tel?: string;
  address?: string;
  dob?: string; // ISO date string
  active?: boolean; // Add active field for user status
  emailVerified?: boolean; // Add email verification field
}

export interface ProfileUpdateRequest {
  name: string;
  username: string;
  email: string;
  tel?: string;
  address?: string;
  dob?: string; // ISO date string
}

export interface PasswordUpdateRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AdminPasswordUpdateRequest {
  newPassword: string;
}

export interface RoleUpdateRequest {
  roleIds: number[];
}

// Hotel Types
export interface HotelCreateRequest {
  name: string;
  description?: string;
  address: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  starRating?: number;
  checkInTime?: string;
  checkOutTime?: string;
  imageUrl?: string;
  pricePerNight?: number;
  amenities?: string;
  cancellationPolicy?: string;
  petPolicy?: string;
  ownerId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface HotelUpdateRequest {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  starRating?: number;
  checkInTime?: string;
  checkOutTime?: string;
  imageUrl?: string;
  pricePerNight?: number;
  amenities?: string;
  cancellationPolicy?: string;
  petPolicy?: string;
  ownerId?: string;
  active?: boolean;
  featured?: boolean; // Note: Only admin can modify this field
}



export interface HotelFilterParams {
  city?: string;
  country?: string;
  starRating?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string; // Comma-separated amenities string for backend
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
}

export interface HostHotelFilterParams {
  city?: string;
  country?: string;
  starRating?: number;
  isActive?: boolean;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
}

export interface HotelResponse {
  id: string;
  name: string;
  description?: string;
  address: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  starRating?: number;
  checkInTime?: string;
  checkOutTime?: string;
  imageUrl?: string;
  active: boolean;
  featured: boolean;
  pricePerNight?: number;
  amenities?: string;
  cancellationPolicy?: string;
  petPolicy?: string;
  ownerId: string;
  ownerName?: string;
  ownerEmail?: string;
  totalRoomTypes?: number;
  totalRooms?: number;
  availableRooms?: number;
  averageRating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface RoleResponse {
  code: number;
  success: boolean;
  message: string;
  result: {
    content: Role[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

export interface AuthResponse {
  code: number;
  success: boolean;
  message: string;
  result: {
    tokenType: string;
    token: string;
    refreshToken: string;
    expiresIn: string;
  }
}

export interface UserResponse {
  code: number;
  success: boolean;
  message: string;
  result: {
    id: string;
    name: string;
    username: string;
    email: string;
    tel?: string;
    address?: string;
    dob?: string;
    createAt: string;
    updateAt: string;
    roles: Array<{
      id: number;
      name: string;
      description: string;
    }>;
    active: boolean;
    emailVerified?: boolean;
    hostRequested?: boolean;
  }
}

// Thêm các interface mới cho authentication
export interface ForgotPasswordRequest {
  email: string;
}

export interface NewPasswordRequest {
  email: string;
  code: string;
  password: string;
}

export interface ConfirmEmailRequest {
  email: string;
  code: string;
}

export interface ResendCodeRequest {
  email: string;
}

export interface VerifyResponse {
  code: number;
  success: boolean;
  message: string;
  result: {
    expiration: string;
    username: string;
    valid: boolean;
  };
}

// Auth APIs
export const authAPI = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterRequest) =>
    api.post<UserResponse>('/auth/register', {
      password: data.password,
      name: data.name,
      username: data.username,
      email: data.email
    }),
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
  refresh: (refreshToken: string) =>
    api.post<AuthResponse>('/auth/refresh', { refreshToken }),
  verify: (token: string) =>
    api.post<VerifyResponse>('/auth/verify', { token }),
  // Thêm các API mới
  forgotPassword: (data: ForgotPasswordRequest) =>
    api.post<UserResponse>('/auth/forgot-password', data),
  newPassword: (data: NewPasswordRequest) =>
    api.post<UserResponse>('/auth/new-password', data),
  confirmEmail: (data: ConfirmEmailRequest) =>
    api.post<UserResponse>('/auth/confirm-email', data),
  resendCode: (data: ResendCodeRequest) =>
    api.post<UserResponse>('/auth/resend-code', data)
};

// User APIs
export const userAPI = {
  getMe: () => api.get<UserResponse>('/users/me'),
  getUser: (id: string) => api.get<UserResponse>(`/users/${id}`),
  updateUser: (id: string, data: UserUpdateRequest) => 
    api.put<UserResponse>(`/users/${id}`, data),
  updateMyProfile: (data: ProfileUpdateRequest) =>
    api.put<UserResponse>('/users/profile', data),
  updateMyPassword: (data: PasswordUpdateRequest) =>
    api.put<UserResponse>('/users/password', data),
  updatePassword: (id: string, data: PasswordUpdateRequest) =>
    api.put<UserResponse>(`/users/${id}/password`, data),
  adminUpdatePassword: (id: string, data: AdminPasswordUpdateRequest) =>
    api.put<UserResponse>(`/users/admin/${id}/password`, data),
  updateUserRoles: (id: string, data: RoleUpdateRequest) =>
    api.put<UserResponse>(`/users/role/${id}`, data),
  requestHost: () =>
    api.post<UserResponse>('/users/request-host'),
  approveHostRequest: (id: string) =>
    api.put<UserResponse>(`/users/approve-host/${id}`),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
  getAllUsers: (pageNumber = 0, pageSize = 5, sortBy = 'id') =>
    api.get('/users', { params: { pageNumber, pageSize, sortBy } }),
  getHosts: (pageNumber = 0, pageSize = 100, sortBy = 'name') =>
    api.get('/users/hosts', { params: { pageNumber, pageSize, sortBy } })
};

// Role APIs
export const roleAPI = {
  getAllRoles: (pageNumber = 0, pageSize = 100, sortBy = 'id') =>
    api.get<RoleResponse>('/roles', { params: { pageNumber, pageSize, sortBy } }),
  getRole: (id: number) => api.get(`/roles/${id}`),
  getRoleByName: (name: string) => api.get(`/roles/name/${name}`)
};

// Hotel APIs
export const hotelAPI = {
  // ===== PUBLIC APIs =====
  getHotelDetails: (id: string) =>
    api.get(`/hotels/${id}`),

  searchHotels: (keyword: string, pageNumber = 0, pageSize = 10, sortBy = 'name') =>
    api.get('/hotels/search', { params: { keyword, pageNumber, pageSize, sortBy } }),

  getHotelsByCity: (city: string, pageNumber = 0, pageSize = 10, sortBy = 'name') =>
    api.get(`/hotels/city/${city}`, { params: { pageNumber, pageSize, sortBy } }),

  getHotelsByCountry: (country: string, pageNumber = 0, pageSize = 10, sortBy = 'name') =>
    api.get(`/hotels/country/${country}`, { params: { pageNumber, pageSize, sortBy } }),

  getHotelsByStarRating: (starRating: number, pageNumber = 0, pageSize = 10, sortBy = 'name') =>
    api.get(`/hotels/rating/${starRating}`, { params: { pageNumber, pageSize, sortBy } }),

  getActiveHotels: (pageNumber = 0, pageSize = 10, sortBy = 'name') =>
    api.get('/hotels/active', { params: { pageNumber, pageSize, sortBy } }),

  getFeaturedHotels: (pageNumber = 0, pageSize = 10, sortBy = 'name') =>
    api.get('/hotels/featured', { params: { pageNumber, pageSize, sortBy } }),

  // New public search with filters API
  searchHotelsWithFilters: (params: HotelFilterParams) =>
    api.get('/hotels/search/filters', { params }),

  // Get all available amenities from hotels
  getAvailableAmenities: () =>
    api.get('/hotels/amenities'),



  // ===== ADMIN APIs =====
  getAdminHotels: (pageNumber = 0, pageSize = 10, sortBy = 'id') =>
    api.get('/hotels/admin', { params: { pageNumber, pageSize, sortBy } }),

  getAdminHotelsWithFilters: (params: HotelFilterParams) => 
    api.get('/hotels/admin/filter', { params }),

  createHotelByAdmin: (data: HotelCreateRequest) =>
    api.post('/hotels/admin', data),

  updateHotelByAdmin: (id: string, data: HotelUpdateRequest) =>
    api.put(`/hotels/admin/${id}`, data),

  deleteHotelByAdmin: (id: string) =>
    api.delete(`/hotels/admin/${id}`),

  toggleHotelStatus: (id: string) =>
    api.put(`/hotels/admin/${id}/toggle-status`),

  toggleHotelFeatured: (id: string) =>
    api.put(`/hotels/admin/${id}/toggle-featured`),

  getHotelsByOwner: (ownerId: string, pageNumber = 0, pageSize = 10, sortBy = 'id') =>
    api.get(`/hotels/admin/owner/${ownerId}`, { params: { pageNumber, pageSize, sortBy } }),

  // Admin Statistics
  getTotalHotelsCount: () =>
    api.get('/hotels/admin/stats/total'),

  getActiveHotelsCount: () =>
    api.get('/hotels/admin/stats/active'),

  getFeaturedHotelsCount: () =>
    api.get('/hotels/admin/stats/featured'),

  getHotelsCountByOwner: (ownerId: string) =>
    api.get(`/hotels/admin/stats/owner/${ownerId}`),

  // ===== HOST APIs =====
  getMyHotels: (pageNumber = 0, pageSize = 10, sortBy = 'id') =>
    api.get('/hotels/host', { params: { pageNumber, pageSize, sortBy } }),

  getMyHotelsWithFilters: (params: HostHotelFilterParams) => 
    api.get('/hotels/host/filter', { params }),

  getMyHotelById: (id: string) =>
    api.get(`/hotels/host/${id}`),

  createMyHotel: (data: HotelCreateRequest) =>
    api.post('/hotels/host', data),

  updateMyHotel: (id: string, data: Omit<HotelUpdateRequest, 'featured'>) =>
    api.put(`/hotels/host/${id}`, data),

  deleteMyHotel: (id: string) =>
    api.delete(`/hotels/host/${id}`),

  toggleMyHotelStatus: (id: string) =>
    api.put(`/hotels/host/${id}/toggle-status`),

  // Host Statistics
  getMyHotelsCount: () =>
    api.get('/hotels/host/stats/total'),

  getMyActiveHotelsCount: () =>
    api.get('/hotels/host/stats/active'),

  // ===== DEPRECATED - Keep for backward compatibility =====
  getAllHotels: (pageNumber = 0, pageSize = 10) =>
    api.get('/hotels/active', { params: { pageNumber, pageSize } }),

  getAdminHotelById: (id: string) =>
    api.get(`/hotels/${id}`),

  createHostHotel: (data: HotelCreateRequest) =>
    api.post('/hotels/host', data),

  getHostHotelById: (id: string) =>
    api.get(`/hotels/host/${id}`),

  updateHostHotel: (id: string, data: HotelUpdateRequest) =>
    api.put(`/hotels/host/${id}`, data),

  deleteHostHotel: (id: string) =>
    api.delete(`/hotels/host/${id}`)
};

// Room Type Types
export interface RoomTypeCreateRequest {
  name: string;
  description?: string;
  maxOccupancy: number;
  bedType?: string;
  roomSize?: number;
  pricePerNight: number;
  totalRooms: number;
  imageUrl?: string;
  amenities?: string;
  hotelId: string;
}

export interface RoomTypeUpdateRequest {
  name?: string;
  description?: string;
  maxOccupancy?: number;
  bedType?: string;
  roomSize?: number;
  pricePerNight?: number;
  totalRooms?: number;
  imageUrl?: string;
  amenities?: string;
  hotelId: string;
}

export interface RoomTypeResponse {
  id: string;
  name: string;
  description?: string;
  maxOccupancy: number;
  bedType?: string;
  roomSize?: number;
  pricePerNight: number;
  totalRooms: number;
  availableRooms: number;
  imageUrl?: string;
  amenities?: string;
  hotelId: string;
  hotelName?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// Room Type APIs
export const roomTypeAPI = {
  // Admin operations
  getAllRoomTypes: (pageNumber = 0, pageSize = 10, sortBy = 'createdAt') =>
    api.get('/room-types/admin', { params: { pageNumber, pageSize, sortBy } }),
  
  getAllRoomTypesWithFilters: (params: {
    hotelId?: string;
    minOccupancy?: number;
    maxOccupancy?: number;
    minPrice?: number;
    maxPrice?: number;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
  }) => api.get('/room-types/admin/filter', { params }),
  
  getRoomTypeById: (id: string) => api.get(`/room-types/${id}`),
  
  createRoomType: (data: RoomTypeCreateRequest) =>
    api.post('/room-types/admin', data),
  
  updateRoomType: (id: string, data: RoomTypeUpdateRequest) =>
    api.put(`/room-types/admin/${id}`, data),
  
  deleteRoomType: (id: string) => api.delete(`/room-types/admin/${id}`),
  
  // Hotel-specific operations
  getRoomTypesByHotel: (hotelId: string, pageNumber = 0, pageSize = 10, sortBy = 'name') =>
    api.get(`/room-types/hotel/${hotelId}`, { params: { pageNumber, pageSize, sortBy } }),
  
  getAvailableRoomTypesByHotel: (hotelId: string, pageNumber = 0, pageSize = 10, sortBy = 'pricePerNight') =>
    api.get(`/room-types/hotel/${hotelId}/available`, { params: { pageNumber, pageSize, sortBy } }),
  
  // Search and filter operations
  searchRoomTypes: (keyword: string, pageNumber = 0, pageSize = 10, sortBy = 'name') =>
    api.get('/room-types/search', { params: { keyword, pageNumber, pageSize, sortBy } }),
  
  getRoomTypesByOccupancy: (minOccupancy: number, pageNumber = 0, pageSize = 10, sortBy = 'name') =>
    api.get(`/room-types/occupancy/${minOccupancy}`, { params: { pageNumber, pageSize, sortBy } }),
  
  getRoomTypesByPriceRange: (params: {
    minPrice: number;
    maxPrice: number;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
  }) => api.get('/room-types/price-range', { params }),
  
  getAvailableRoomTypes: (pageNumber = 0, pageSize = 10, sortBy = 'pricePerNight') =>
    api.get('/room-types/available', { params: { pageNumber, pageSize, sortBy } }),
  
  // Statistics
  getTotalRoomTypesCount: () => api.get('/room-types/admin/stats/total'),
  getActiveRoomTypesCount: () => api.get('/room-types/admin/stats/active'),
  getRoomTypesCountByHotel: (hotelId: string) => api.get(`/room-types/admin/stats/hotel/${hotelId}`),
  toggleRoomTypeStatus: (roomTypeId: string) =>
    api.patch(`/room-types/admin/${roomTypeId}/toggle-status`)
};

// Host Room Type APIs
export const hostRoomTypeAPI = {
  // Get all room types for current host
  getMyRoomTypes: (pageNumber = 0, pageSize = 10, sortBy = 'name') =>
    api.get('/room-types/host/my-room-types', { params: { pageNumber, pageSize, sortBy } }),
  
  // Get room types for specific hotel (host must own the hotel)
  getMyHotelRoomTypes: (hotelId: string, pageNumber = 0, pageSize = 10, sortBy = 'name') =>
    api.get(`/room-types/host/hotel/${hotelId}/room-types`, { params: { pageNumber, pageSize, sortBy } }),
  
  // Get specific room type by ID (host must own the hotel)
  getMyRoomTypeById: (id: string) => api.get(`/room-types/host/${id}`),
  
  // Create new room type for host's hotel
  createMyRoomType: (data: RoomTypeCreateRequest) =>
    api.post('/room-types/host', data),
  
  // Update room type (host must own the hotel)
  updateMyRoomType: (id: string, data: RoomTypeUpdateRequest) =>
    api.put(`/room-types/host/${id}`, data),
  
  // Delete room type (host must own the hotel)
  deleteMyRoomType: (id: string) => api.delete(`/room-types/host/${id}`)
};



// Review Types
export interface ReviewCreateRequest {
  rating: number;
  comment?: string;
  hotelId: string;
  userId?: string;
}

export interface ReviewUpdateRequest {
  rating?: number;
  comment?: string;
}

export interface ReviewResponse {
  id: string;
  rating: number;
  comment?: string;
  helpfulCount: number;
  hotelId: string;
  hotelName?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  createdAt: string;
  updatedAt: string;
}

// Dashboard Statistics
export interface AdminDashboardResponse {
  totalHotels: number;
  activeHotels: number;
  inactiveHotels: number;
  featuredHotels: number;
  totalRoomTypes: number;
  totalReviews: number;
  approvedReviews: number;
  pendingReviews: number;
  verifiedReviews: number;
  totalUsers: number;
}

// Host Dashboard Statistics
export interface HostDashboardResponse {
  totalHotels: number;
  activeHotels: number;
  totalRoomTypes: number;
  totalBookings: number;
  monthlyRevenue: number;
  averageRating: number;
  occupancyRate: number;
  totalReviews: number;
  pendingBookings: number;
  confirmedBookings: number;
  recentBookings?: Array<{
    id: string;
    guestName: string;
    hotelName: string;
    checkInDate: string;
    checkOutDate: string;
    totalAmount: number;
    status: string;
  }>;
  monthlyRevenueData?: Array<{
    month: string;
    revenue: number;
  }>;
}

// Booking Types
export interface BookingCreateRequest {
  hotelId: string;
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  totalAmount: number;
  paymentMethod?: string;
  specialRequests?: string;
  voucherCode?: string;
}

export interface BookingUpdateRequest {
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  checkInDate?: string;
  checkOutDate?: string;
  guests?: number;
  totalAmount?: number;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED_BY_GUEST' | 'CANCELLED_BY_HOST';
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'REFUND_PENDING' | 'NO_PAYMENT' | 'CANCELLED';
  paymentMethod?: string;
  specialRequests?: string;
}

export interface BookingResponse {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  hotelId: string;
  hotelName: string;
  hotelAddress: string;
  hotelPhone: string;
  hotelEmail: string;
  roomTypeId: string;
  roomTypeName: string;
  roomDescription: string;
  maxOccupancy: number;
  bedType: string;
  userId?: string;
  userName?: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED_BY_GUEST' | 'CANCELLED_BY_HOST';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'REFUND_PENDING' | 'NO_PAYMENT' | 'CANCELLED';
  paymentMethod?: string;
  bookingReference: string;
  specialRequests?: string;
  numberOfNights: number;
  pricePerNight: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface BookingFilterParams {
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED_BY_GUEST' | 'CANCELLED_BY_HOST';
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'REFUND_PENDING' | 'NO_PAYMENT' | 'CANCELLED';
  hotelId?: string;
  guestName?: string;
  checkInDate?: string;
  checkOutDate?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
}

export interface BookingStatsResponse {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  occupancyRate: number;
}

// Review APIs
export const reviewAPI = {
  // Admin operations
  getAllReviews: (pageNumber = 0, pageSize = 10, sortBy = 'createdAt') =>
    api.get('/reviews/admin', { params: { pageNumber, pageSize, sortBy } }),
  
  getAllReviewsWithFilters: (params: {
    hotelId?: string;
    userId?: string;
    rating?: number;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
  }) => api.get('/reviews/admin/filter', { params }),
  
  deleteReview: (id: string) => api.delete(`/reviews/admin/${id}`),
  
  getReviewsByUser: (userId: string, pageNumber = 0, pageSize = 10, sortBy = 'createdAt') =>
    api.get(`/reviews/admin/user/${userId}`, { params: { pageNumber, pageSize, sortBy } }),
  
  // Public operations
  getReviewById: (id: string) => api.get(`/reviews/${id}`),
  
  getReviewsByHotel: (hotelId: string, pageNumber = 0, pageSize = 10, sortBy = 'createdAt') =>
    api.get(`/reviews/hotel/${hotelId}`, { params: { pageNumber, pageSize, sortBy } }),
  

  
  getHotelAverageRating: (hotelId: string) =>
    api.get(`/reviews/hotel/${hotelId}/average-rating`),
  
  getReviewsByRating: (rating: number, pageNumber = 0, pageSize = 10, sortBy = 'createdAt') =>
    api.get(`/reviews/rating/${rating}`, { params: { pageNumber, pageSize, sortBy } }),
  
  searchReviews: (keyword: string, pageNumber = 0, pageSize = 10, sortBy = 'createdAt') =>
    api.get('/reviews/search', { params: { keyword, pageNumber, pageSize, sortBy } }),
  
  // User operations
  createReview: (data: ReviewCreateRequest) =>
    api.post('/reviews', data),
  
  updateMyReview: (id: string, data: ReviewUpdateRequest) =>
    api.put(`/reviews/${id}`, data),
  
  deleteMyReview: (id: string) =>
    api.delete(`/reviews/${id}`),
  
  getMyReviews: (pageNumber = 0, pageSize = 10, sortBy = 'createdAt') =>
    api.get('/reviews/my', { params: { pageNumber, pageSize, sortBy } }),
  
  // Statistics
  getTotalReviewsCount: () => api.get('/reviews/admin/stats/total'),
  getApprovedReviewsCount: () => api.get('/reviews/admin/stats/approved'),
  getVerifiedReviewsCount: () => api.get('/reviews/admin/stats/verified'),
  getReviewsCountByHotel: (hotelId: string) => api.get(`/reviews/admin/stats/hotel/${hotelId}`),
  getReviewsCountByUser: (userId: string) => api.get(`/reviews/admin/stats/user/${userId}`)
};

// Admin Dashboard APIs
export const adminAPI = {
  getDashboard: () => api.get<{ success: boolean; result: AdminDashboardResponse }>('/admin/dashboard'),
  
  getHotelStats: () => api.get('/admin/stats/hotels'),
  
  getRoomTypeStats: () => api.get('/admin/stats/room-types'),
  
  getReviewStats: () => api.get('/admin/stats/reviews'),
  
  getUserStats: () => api.get('/admin/stats/users')
};

// Host Dashboard APIs
export const hostAPI = {
  getDashboard: () => api.get<{ success: boolean; result: HostDashboardResponse }>('/host/dashboard'),
  
  getHotelStats: () => api.get('/hotels/host/stats'),
  
  getBookingStats: () => api.get('/bookings/host/stats'),
  
  getRevenueStats: (year?: number, month?: number) => 
    api.get('/bookings/host/revenue-stats', { params: { year, month } }),
  
  getRecentBookings: (limit = 10) => 
    api.get('/bookings/host/recent', { params: { limit } }),
  
  getOccupancyStats: (hotelId?: string) => 
    api.get('/bookings/host/occupancy-stats', { params: { hotelId } }),
  
  getReviewStats: () => api.get('/reviews/host/stats')
};

// Booking APIs
export const bookingAPI = {
  // Host operations - get host's bookings
  getHostBookings: (params?: BookingFilterParams) =>
    api.get('/bookings/host', { params }),
  
  getHostBookingById: (id: string) => 
    api.get(`/bookings/host/${id}`),
  
  updateHostBooking: (id: string, data: BookingUpdateRequest) =>
    api.put(`/bookings/host/${id}`, data),
  
  confirmBooking: (id: string) =>
    api.patch(`/bookings/host/${id}/confirm`),
  
  cancelBooking: (id: string, reason?: string) =>
    api.patch(`/bookings/host/${id}/cancel`, { reason }),
  
  completeBooking: (id: string) =>
    api.patch(`/bookings/host/${id}/complete`),
  
  confirmPayment: (id: string) =>
    api.patch(`/bookings/host/${id}/confirm-payment`),
  
  processCancellation: (id: string, data: { refundAmount: number; reason: string; refundPercentage?: number }) =>
    api.patch(`/bookings/host/${id}/process-cancellation`, data),
  
  // Guest operations - create and manage own bookings
  createBooking: (data: BookingCreateRequest) =>
    api.post('/bookings', data),
  
  getMyBookings: (params?: BookingFilterParams) =>
    api.get('/bookings/my', { 
      params: { ...params, _t: Date.now() } // Cache busting
    }),
  
  getMyBookingById: (id: string) =>
    api.get(`/bookings/my/${id}`, { 
      params: { _t: Date.now() } // Cache busting
    }),
  
  updateMyBooking: (id: string, data: BookingUpdateRequest) =>
    api.put(`/bookings/my/${id}`, data),
  
  cancelMyBooking: (id: string, reason?: string) =>
    api.patch(`/bookings/my/${id}/cancel`, { reason }),
  
  // Admin operations
  getAllBookings: (params?: BookingFilterParams) =>
    api.get('/bookings/admin', { params }),
  
  getBookingById: (id: string) =>
    api.get(`/bookings/admin/${id}`),
  
  updateBooking: (id: string, data: BookingUpdateRequest) =>
    api.put(`/bookings/admin/${id}`, data),
  
  deleteBooking: (id: string) =>
    api.delete(`/bookings/admin/${id}`),
  
  adminConfirmPayment: (id: string) =>
    api.patch(`/bookings/admin/${id}/confirm-payment`),
  
  // Statistics
  getBookingStats: () => api.get('/bookings/stats'),
  getHostBookingStats: () => api.get('/bookings/host/stats'),
  
  // Search and filter
  searchBookings: (keyword: string, params?: BookingFilterParams) =>
    api.get('/bookings/search', { params: { ...params, keyword } }),
  
  getBookingsByDateRange: (startDate: string, endDate: string, params?: BookingFilterParams) =>
    api.get('/bookings/date-range', { params: { ...params, startDate, endDate } }),
  
  getBookingsByHotel: (hotelId: string, params?: BookingFilterParams) =>
    api.get(`/bookings/hotel/${hotelId}`, { params }),
  
  // Utility endpoints
  checkRoomAvailability: (roomTypeId: string, checkInDate: string, checkOutDate: string) =>
    api.get('/bookings/check-availability', { 
      params: { roomTypeId, checkInDate, checkOutDate } 
    }),
  
  // Statistics endpoints
  getTotalBookingsCount: () => api.get('/bookings/admin/stats/total'),
  getHostBookingsCount: () => api.get('/bookings/host/stats/total')
};

export const voucherAPI = {
  // Admin operations
  getAllVouchers: (params?: VoucherFilterParams) =>
    api.get<VoucherApiResponse<VoucherListResponse>>('/vouchers/admin', { params }),
  
  createVoucher: (data: VoucherRequest) =>
    api.post<VoucherApiResponse<VoucherResponse>>('/vouchers/admin', data),
  
  updateVoucher: (id: string, data: VoucherUpdateRequest) =>
    api.put<VoucherApiResponse<VoucherResponse>>(`/vouchers/admin/${id}`, data),
  
  deleteVoucher: (id: string) =>
    api.delete<VoucherApiResponse<void>>(`/vouchers/admin/${id}`),
  
  getVoucherById: (id: string) =>
    api.get<VoucherApiResponse<VoucherResponse>>(`/vouchers/admin/${id}`),
  
  toggleVoucherStatus: (id: string) =>
    api.patch<VoucherApiResponse<VoucherResponse>>(`/vouchers/admin/${id}/toggle-status`),
  
  searchVouchers: (keyword: string, params?: VoucherFilterParams) =>
    api.get<VoucherApiResponse<VoucherListResponse>>('/vouchers/admin/search', { 
      params: { ...params, keyword } 
    }),
  
  // Statistics
  getVoucherStats: () =>
    api.get<VoucherApiResponse<VoucherStatsResponse>>('/vouchers/admin/stats'),
  
  getTotalVouchersCount: () =>
    api.get<VoucherApiResponse<number>>('/vouchers/admin/stats/total'),
  
  getActiveVouchersCount: () =>
    api.get<VoucherApiResponse<number>>('/vouchers/admin/stats/active'),
  
  getExpiredVouchersCount: () =>
    api.get<VoucherApiResponse<number>>('/vouchers/admin/stats/expired'),
  
  getUsedUpVouchersCount: () =>
    api.get<VoucherApiResponse<number>>('/vouchers/admin/stats/used-up'),
  
  getTotalDiscountAmount: () =>
    api.get<VoucherApiResponse<number>>('/vouchers/admin/stats/discount-amount'),
  
  getTotalUsageCount: () =>
    api.get<VoucherApiResponse<number>>('/vouchers/admin/stats/usage-count'),
  
  // Public operations
  validateVoucher: (data: VoucherValidationRequest) =>
    api.post<VoucherApiResponse<VoucherValidationResponse>>('/vouchers/validate', data),
  
  getVoucherByCode: (code: string) =>
    api.get<VoucherApiResponse<VoucherResponse>>(`/vouchers/code/${code}`),
  
  getAvailableVouchersForHotel: (hotelId: string) =>
    api.get<VoucherApiResponse<VoucherResponse[]>>(`/vouchers/hotel/${hotelId}/available`),
  
  // Apply voucher to booking
  applyVoucherToBooking: (data: { voucherCode: string; bookingId: string }) =>
    api.post<VoucherApiResponse<{ discountAmount: number; finalAmount: number }>>('/vouchers/apply', data)
};

export default api;
