// Voucher Types for Frontend
export interface VoucherRequest {
  code: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscount?: number;
  minBookingValue?: number;
  startDate: string; // ISO string
  endDate: string; // ISO string
  usageLimit?: number;
  applicableScope: ApplicableScope;
  hotelIds?: string[];
}

export interface VoucherUpdateRequest {
  code?: string;
  name?: string;
  description?: string;
  discountType?: DiscountType;
  discountValue?: number;
  maxDiscount?: number;
  minBookingValue?: number;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  applicableScope?: ApplicableScope;
  hotelIds?: string[];
}

export interface VoucherResponse {
  id: string;
  code: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscount?: number;
  minBookingValue?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usageCount: number;
  applicableScope: ApplicableScope;
  hotelIds?: string[];
  status: VoucherStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface VoucherValidationRequest {
  code: string;
  hotelId: string;
  bookingAmount: number;
}

export interface VoucherValidationResponse {
  valid: boolean;
  message?: string;
  discountAmount?: number;
  finalAmount?: number;
  voucher?: VoucherResponse;
}

// Enums matching backend
export enum VoucherStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
  USED_UP = 'USED_UP'
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  HOTEL_SPECIFIC = 'HOTEL_SPECIFIC'
}

export enum ApplicableScope {
  ALL_HOTELS = 'ALL_HOTELS',
  SPECIFIC_HOTELS = 'SPECIFIC_HOTELS'
}

// Filter and pagination types
export interface VoucherFilterParams {
  status?: VoucherStatus;
  discountType?: DiscountType;
  applicableScope?: ApplicableScope;
  name?: string;
  code?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
}

export interface VoucherStatsResponse {
  totalVouchers: number;
  activeVouchers: number;
  expiredVouchers: number;
  usedUpVouchers: number;
  totalDiscountAmount: number;
  totalUsageCount: number;
}

// API Response wrapper
export interface VoucherApiResponse<T> {
  code: number;
  success: boolean;
  message: string;
  result: T;
}

export interface VoucherListResponse {
  content: VoucherResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
} 