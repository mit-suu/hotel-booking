// Hotel and Room Type Definitions

export interface RoomType {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  capacity: number;
  bedType: string;
  size: string;
  amenities: string[];
  images: string[];
  totalRooms: number;
  availableRooms: number;
}

export interface SeasonalPricing {
  id: string;
  roomTypeId: string;
  name: string;
  startDate: string;
  endDate: string;
  priceMultiplier: number; // 1.0 = base price, 1.5 = 150% of base price
  isActive: boolean;
}

export interface RoomAvailability {
  roomTypeId: string;
  date: string;
  availableRooms: number;
  price: number; // Final price after seasonal adjustments
}

export interface Hotel {
  id: string;
  name: string;
  description: string;
  location: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  type: 'Hotel' | 'Resort' | 'Homestay' | 'Villa' | 'Apartment';
  owner: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  rating: number;
  reviewCount: number;
  roomTypes: RoomType[];
  seasonalPricing: SeasonalPricing[];
  amenities: string[];
  policies: {
    checkIn: string;
    checkOut: string;
    cancellationPolicy: string;
    childPolicy?: string;
    petPolicy?: string;
  };
  images: string[];
  status: 'active' | 'pending' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface BookingRoom {
  roomTypeId: string;
  roomTypeName: string;
  quantity: number;
  pricePerNight: number;
  totalNights: number;
  subtotal: number;
}

export interface Booking {
  id: string;
  hotelId: string;
  hotelName: string;
  guestInfo: {
    name: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
  checkIn: string;
  checkOut: string;
  totalGuests: number;
  rooms: BookingRoom[];
  totalAmount: number;
  taxes: number;
  fees: number;
  finalAmount: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no-show';
  paymentStatus: 'paid' | 'pending' | 'partial' | 'refunded';
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
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

export interface HotelSearchFilters {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  rooms?: number;
  priceRange?: {
    min: number;
    max: number;
  };
  hotelType?: string[];
  amenities?: string[];
  rating?: number;
  sortBy?: 'price' | 'rating' | 'distance' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export interface RoomSearchResult {
  roomType: RoomType;
  availableRooms: number;
  pricePerNight: number;
  totalPrice: number;
  isAvailable: boolean;
}

export interface HotelSearchResult {
  hotel: Hotel;
  availableRoomTypes: RoomSearchResult[];
  minPrice: number;
  maxPrice: number;
  distance?: number;
} 