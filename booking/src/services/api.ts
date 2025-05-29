import axios from 'axios';

const API_URL = 'http://localhost:8080';  // Direct API endpoint

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
  password: string;
  email: string;
  tel?: string;
  address?: string;
  dob?: string; // ISO date string
  active?: boolean; // Add active field for user status
  emailVerified?: boolean; // Add email verification field
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
  latitude?: number;
  longitude?: number;
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
  latitude?: number;
  longitude?: number;
  amenities?: string;
  cancellationPolicy?: string;
  petPolicy?: string;
  isActive?: boolean;
  isFeatured?: boolean;
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
  isActive: boolean;
  isFeatured: boolean;
  pricePerNight?: number;
  latitude?: number;
  longitude?: number;
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
  updateUserRoles: (id: string, data: RoleUpdateRequest) =>
    api.put<UserResponse>(`/users/role/${id}`, data),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
  getAllUsers: (pageNumber = 0, pageSize = 5, sortBy = 'id') =>
    api.get('/users', { params: { pageNumber, pageSize, sortBy } })
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
  // Admin operations
  getAllHotels: (pageNumber = 0, pageSize = 10, sortBy = 'createdAt') =>
    api.get('/hotels/admin', { params: { pageNumber, pageSize, sortBy } }),
  
  getAllHotelsWithFilters: (params: {
    city?: string;
    country?: string;
    starRating?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    minPrice?: number;
    maxPrice?: number;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
  }) => api.get('/hotels/admin/filter', { params }),
  
  getHotelById: (id: string) => api.get(`/hotels/${id}`),
  
  createHotel: (data: HotelCreateRequest) =>
    api.post('/hotels/admin', data),
  
  updateHotel: (id: string, data: HotelUpdateRequest) =>
    api.put(`/hotels/admin/${id}`, data),
  
  deleteHotel: (id: string) => api.delete(`/hotels/admin/${id}`),
  
  toggleHotelStatus: (id: string) =>
    api.put(`/hotels/admin/${id}/toggle-status`),
  
  toggleFeaturedStatus: (id: string) =>
    api.put(`/hotels/admin/${id}/toggle-featured`),
  
  // Search and filter operations
  searchHotels: (keyword: string, pageNumber = 0, pageSize = 10, sortBy = 'createdAt') =>
    api.get('/hotels/search', { params: { keyword, pageNumber, pageSize, sortBy } }),
  
  getHotelsByCity: (city: string, pageNumber = 0, pageSize = 10, sortBy = 'createdAt') =>
    api.get('/hotels/city', { params: { city, pageNumber, pageSize, sortBy } }),
  
  getHotelsByCountry: (country: string, pageNumber = 0, pageSize = 10, sortBy = 'createdAt') =>
    api.get('/hotels/country', { params: { country, pageNumber, pageSize, sortBy } }),
  
  getHotelsByStarRating: (starRating: number, pageNumber = 0, pageSize = 10, sortBy = 'createdAt') =>
    api.get('/hotels/star-rating', { params: { starRating, pageNumber, pageSize, sortBy } }),
  
  getActiveHotels: (pageNumber = 0, pageSize = 10, sortBy = 'createdAt') =>
    api.get('/hotels/active', { params: { pageNumber, pageSize, sortBy } }),
  
  getFeaturedHotels: (pageNumber = 0, pageSize = 10, sortBy = 'createdAt') =>
    api.get('/hotels/featured', { params: { pageNumber, pageSize, sortBy } }),
  
  getHotelsByOwner: (ownerId: string, pageNumber = 0, pageSize = 10, sortBy = 'createdAt') =>
    api.get(`/hotels/admin/owner/${ownerId}`, { params: { pageNumber, pageSize, sortBy } }),
  
  getMyHotels: (pageNumber = 0, pageSize = 10, sortBy = 'createdAt') =>
    api.get('/hotels/my', { params: { pageNumber, pageSize, sortBy } }),
  
  getHotelsNearLocation: (params: {
    latitude: number;
    longitude: number;
    radiusKm: number;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
  }) => api.get('/hotels/near', { params }),
  
  // Statistics
  getTotalHotelsCount: () => api.get('/hotels/admin/stats/total'),
  getActiveHotelsCount: () => api.get('/hotels/admin/stats/active'),
  getFeaturedHotelsCount: () => api.get('/hotels/admin/stats/featured'),
  getHotelsCountByOwner: (ownerId: string) => api.get(`/hotels/admin/stats/owner/${ownerId}`)
};

export default api;
