import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  MapPin, Star, Phone, Mail, Globe, Clock, Users, 
  Wifi, Car, Utensils, Dumbbell, Waves, Coffee,
  ChevronLeft, Calendar, ArrowRight, Edit3, Check, X
} from 'lucide-react';
import { hotelAPI, HotelResponse, roomTypeAPI, RoomTypeResponse, reviewAPI } from '../services/api';
import ReviewForm from '../components/ReviewForm';
import ReviewEditForm from '../components/ReviewEditForm';
import ReviewDisplay from '../components/ReviewDisplay';
import { useAuth } from '../contexts/AuthContext';
import { getImageProps } from '../utils/imageUtils';

const HotelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Extract search context from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const checkInDate = searchParams.get('checkIn') || new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const checkOutDate = searchParams.get('checkOut') || new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
  const guestCount = parseInt(searchParams.get('guests') || '2');
  const returnUrl = searchParams.get('returnUrl');
  
  const [hotel, setHotel] = useState<HotelResponse | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'rooms' | 'reviews'>('overview');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userExistingReview, setUserExistingReview] = useState<any | null>(null);
  const [checkingUserReview, setCheckingUserReview] = useState(false);
  const [canReview, setCanReview] = useState<boolean>(false);
  const [checkingCanReview, setCheckingCanReview] = useState(false);
  
  // Search edit state
  const [isEditingSearch, setIsEditingSearch] = useState(false);
  const [isValidatingSearch, setIsValidatingSearch] = useState(false);
  const [editSearchData, setEditSearchData] = useState({
    checkInDate: checkInDate,
    checkOutDate: checkOutDate,
    guestCount: guestCount
  });

  // Calculate number of nights (will be updated when URL changes)
  const numberOfNights = Math.max(1, Math.ceil(
    (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)
  ));

  // Fetch hotel details
  const fetchHotelDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);

      const [hotelResponse, roomTypesResponse, reviewsResponse] = await Promise.all([
        hotelAPI.getHotelDetails(id),
        roomTypeAPI.getRoomTypesByHotel(id, 0, 20),
        reviewAPI.getReviewsByHotel(id, 0, 10).catch(() => ({ data: { result: { content: [] } } }))
      ]);

      if (hotelResponse.data.success) {
        setHotel(hotelResponse.data.result);
      } else {
        setError('Hotel information not found');
      }

      if (roomTypesResponse.data.success) {
        setRoomTypes(roomTypesResponse.data.result.content || []);
      }

      if (reviewsResponse.data.success) {
        setReviews(reviewsResponse.data.result.content || []);
      }

    } catch (err) {
      console.error('Error fetching hotel details:', err);
      setError('An error occurred while loading hotel information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotelDetails();
  }, [id]);

  // Update edit search data when URL parameters change
  useEffect(() => {
    setEditSearchData({
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      guestCount: guestCount
    });
  }, [checkInDate, checkOutDate, guestCount]);

  useEffect(() => {
    if (user && id) {
      checkUserExistingReview();
      checkCanReviewHotel();
    } else {
      setUserExistingReview(null);
      setCanReview(false);
    }
  }, [user, id]);

  // Format price
  const formatPrice = (price: number | undefined) => {
    if (!price) return 'Contact';
    return price.toLocaleString('en-US') + ' VND';
  };

  // Render stars
  const renderStars = (rating: number | undefined) => {
    if (!rating) return null;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  // Get amenity icon
  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes('wifi') || lowerAmenity.includes('internet')) return <Wifi className="h-5 w-5" />;
    if (lowerAmenity.includes('parking') || lowerAmenity.includes('car park')) return <Car className="h-5 w-5" />;
    if (lowerAmenity.includes('restaurant') || lowerAmenity.includes('dining')) return <Utensils className="h-5 w-5" />;
    if (lowerAmenity.includes('gym') || lowerAmenity.includes('fitness')) return <Dumbbell className="h-5 w-5" />;
    if (lowerAmenity.includes('pool') || lowerAmenity.includes('swimming')) return <Waves className="h-5 w-5" />;
    if (lowerAmenity.includes('bar') || lowerAmenity.includes('coffee')) return <Coffee className="h-5 w-5" />;
    return <Star className="h-5 w-5" />;
  };



  // Check if user has existing review for this hotel
  const checkUserExistingReview = async () => {
    if (!user || !id) return;
    
    try {
      setCheckingUserReview(true);
      // Get user's reviews and find one for this hotel
      const response = await reviewAPI.getMyReviews(0, 100); // Get all user reviews
      if (response.data.success) {
        const existingReview = response.data.result.content.find(
          (review: any) => review.hotelId === id
        );
        setUserExistingReview(existingReview || null);
      }
    } catch (error) {
      console.error('Error checking user existing review:', error);
      setUserExistingReview(null);
    } finally {
      setCheckingUserReview(false);
    }
  };

  // Handle review success
  const handleReviewSuccess = (reviewId: string) => {
    setShowReviewForm(false);
    setUserExistingReview(null); // Reset so we can fetch updated review
    // Refresh reviews and check user review again
    Promise.all([fetchHotelDetails(), checkUserExistingReview(), checkCanReviewHotel()]);
    alert('Your review has been submitted successfully!');
  };

  // Handle review update success
  const handleReviewUpdateSuccess = () => {
    setShowReviewForm(false);
    // Refresh reviews and user review
    Promise.all([fetchHotelDetails(), checkUserExistingReview(), checkCanReviewHotel()]);
    alert('Your review has been updated!');
  };

  // Handle review delete success
  const handleReviewDeleteSuccess = () => {
    setShowReviewForm(false);
    setUserExistingReview(null); // Clear existing review
    // Refresh reviews and can review status
    Promise.all([fetchHotelDetails(), checkCanReviewHotel()]);
    alert('Your review has been deleted!');
  };

  // Check if user can review this hotel (has completed booking)
  const checkCanReviewHotel = async () => {
    if (!user || !id) return;
    
    try {
      setCheckingCanReview(true);
      const response = await reviewAPI.canReviewHotel(id);
      if (response.data.success) {
        setCanReview(response.data.result);
      }
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      setCanReview(false);
    } finally {
      setCheckingCanReview(false);
    }
  };

  // Handle search edit
  const handleSearchEdit = () => {
    setIsEditingSearch(true);
    setEditSearchData({
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      guestCount: guestCount
    });
  };

  const handleSearchCancel = () => {
    setIsEditingSearch(false);
    setEditSearchData({
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      guestCount: guestCount
    });
  };

  const handleSearchSave = async () => {
    try {
      setIsValidatingSearch(true);
      
      // Basic validation
      const checkIn = new Date(editSearchData.checkInDate);
      const checkOut = new Date(editSearchData.checkOutDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkIn < today) {
        alert('❌ Check-in date cannot be in the past');
        return;
      }

      if (checkOut <= checkIn) {
        alert('❌ Check-out date must be after check-in date');
        return;
      }

      if (editSearchData.guestCount < 1 || editSearchData.guestCount > 20) {
        alert('❌ Guest count must be between 1 and 20');
        return;
      }

      // Advanced validation with hotel data
      const validationResult = await validateSearchWithHotel();
      
      if (!validationResult.isValid) {
        const confirmMessage = validationResult.message + '\n\nDo you want to continue anyway?';
        if (!confirm(confirmMessage)) {
          return;
        }
      }

      // Update URL with new search parameters
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.set('checkIn', editSearchData.checkInDate);
      newSearchParams.set('checkOut', editSearchData.checkOutDate);
      newSearchParams.set('guests', editSearchData.guestCount.toString());

      navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
      setIsEditingSearch(false);
      
      // Show success message
      const nights = Math.ceil((new Date(editSearchData.checkOutDate).getTime() - new Date(editSearchData.checkInDate).getTime()) / (1000 * 60 * 60 * 24));
      
      if (validationResult.isValid) {
        alert(`✅ Search updated successfully!\n${editSearchData.guestCount} guest${editSearchData.guestCount > 1 ? 's' : ''} for ${nights} night${nights > 1 ? 's' : ''}.`);
      } else {
        alert(`⚠️ Search updated with warnings.\n${editSearchData.guestCount} guest${editSearchData.guestCount > 1 ? 's' : ''} for ${nights} night${nights > 1 ? 's' : ''}.`);
      }
    } catch (error) {
      console.error('Error validating search:', error);
      alert('❌ An error occurred while validating your search. Please try again.');
    } finally {
      setIsValidatingSearch(false);
    }
  };

  const handleSearchInputChange = (field: string, value: string | number) => {
    setEditSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validate search criteria with hotel data
  const validateSearchWithHotel = async () => {
    if (!hotel || !roomTypes.length) {
      return {
        isValid: false,
        message: 'Hotel information is not available. Please try again later.'
      };
    }

    const issues = [];
    let hasAvailableRooms = false;
    let hasCapacityForGuests = false;

    // Check if any room type can accommodate the guest count
    roomTypes.forEach(roomType => {
      if (roomType.maxOccupancy >= editSearchData.guestCount) {
        hasCapacityForGuests = true;
        
        // Check if this room type has available rooms
        if (roomType.availableRooms > 0) {
          hasAvailableRooms = true;
        }
      }
    });

    // Check guest capacity
    if (!hasCapacityForGuests) {
      const maxCapacity = Math.max(...roomTypes.map(rt => rt.maxOccupancy));
      issues.push(`❌ Guest Capacity Issue: This hotel can accommodate maximum ${maxCapacity} guests per room, but you selected ${editSearchData.guestCount} guests.`);
    }

    // Check room availability (basic check - in real app would check specific dates)
    if (!hasAvailableRooms && hasCapacityForGuests) {
      issues.push(`⚠️ Availability Warning: No rooms are currently showing as available. This might be due to the selected dates or the rooms may be fully booked.`);
    }

    // Check date range reasonableness
    const nights = Math.ceil((new Date(editSearchData.checkOutDate).getTime() - new Date(editSearchData.checkInDate).getTime()) / (1000 * 60 * 60 * 24));
    if (nights > 30) {
      issues.push(`⚠️ Extended Stay: You selected ${nights} nights, which is quite long. Please confirm this is correct.`);
    }

    // Check if dates are too far in the future
    const monthsAhead = (new Date(editSearchData.checkInDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsAhead > 12) {
      issues.push(`⚠️ Advance Booking: Your check-in date is more than 12 months ahead. Availability may not be accurate.`);
    }

    // Check for weekend/holiday pricing (basic check)
    const checkInDay = new Date(editSearchData.checkInDate).getDay();
    const checkOutDay = new Date(editSearchData.checkOutDate).getDay();
    if ((checkInDay === 5 || checkInDay === 6) || (checkOutDay === 0 || checkOutDay === 1)) {
      issues.push(`💰 Pricing Note: Your stay includes weekends, which may have different pricing.`);
    }

    // Check if there are suitable room types available
    if (hasCapacityForGuests) {
      const suitableRooms = roomTypes.filter(rt => rt.maxOccupancy >= editSearchData.guestCount);
      const availableSuitableRooms = suitableRooms.filter(rt => rt.availableRooms > 0);
      
      if (availableSuitableRooms.length === 0) {
        issues.push(`⚠️ Room Availability: No rooms are currently available for ${editSearchData.guestCount} guests. Available room types: ${suitableRooms.map(rt => `${rt.name} (${rt.maxOccupancy} guests max)`).join(', ')}`);
      } else {
        // Show available options
        const roomOptions = availableSuitableRooms.map(rt => 
          `${rt.name} (${rt.maxOccupancy} guests, ${rt.availableRooms} rooms available)`
        ).join(', ');
        
        if (availableSuitableRooms.length < suitableRooms.length) {
          issues.push(`ℹ️ Available Options: ${roomOptions}`);
        }
      }
    }

    // Special occasion check (basic)
    const month = new Date(editSearchData.checkInDate).getMonth() + 1;
    const day = new Date(editSearchData.checkInDate).getDate();
    
    // Holiday periods that might affect availability/pricing
    if ((month === 12 && day >= 20) || (month === 1 && day <= 7)) {
      issues.push(`🎄 Holiday Period: Your stay is during the holiday season (Christmas/New Year), expect higher demand and pricing.`);
    } else if (month === 2 && day >= 10 && day <= 20) {
      issues.push(`🧧 Holiday Period: Your stay may coincide with Lunar New Year, which affects availability in Vietnam.`);
    }

    if (issues.length === 0) {
      return {
        isValid: true,
        message: 'All criteria look good!'
      };
    }

    // Categorize issues
    const errors = issues.filter(issue => issue.includes('❌'));
    const warnings = issues.filter(issue => issue.includes('⚠️') || issue.includes('💰'));

    if (errors.length > 0) {
      return {
        isValid: false,
        message: `Issues found:\n\n${errors.join('\n\n')}${warnings.length > 0 ? '\n\nAdditional notes:\n' + warnings.join('\n') : ''}`
      };
    }

    return {
      isValid: false,
      message: `Please note:\n\n${warnings.join('\n\n')}`
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-300 rounded-lg mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-6"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-300 rounded w-4/6"></div>
                </div>
              </div>
              <div>
                <div className="h-64 bg-gray-300 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-lg mb-4">{error || 'Hotel not found'}</div>
          <Link
            to="/hotels"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to hotel list
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb with Search Context */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <ChevronLeft className="h-4 w-4 rotate-180" />
              <Link 
                to={returnUrl || "/hotels"} 
                className="hover:text-blue-600"
              >
                Hotels
              </Link>
              <ChevronLeft className="h-4 w-4 rotate-180" />
              <span className="text-gray-900 font-medium">{hotel.name}</span>
            </div>
            
            {/* Search Context Summary */}
            <div className="hidden md:flex items-center space-x-4 text-sm">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(checkInDate).toLocaleDateString('vi-VN')} - {new Date(checkOutDate).toLocaleDateString('vi-VN')}
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="h-4 w-4 mr-1" />
                {guestCount} guests
              </div>
              <div className="text-blue-600 font-medium">
                {numberOfNights} nights
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Image */}
        <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-8">
          <img
            {...getImageProps(hotel.imageUrl, 'hotel', hotel.name)}
            className="w-full h-full object-cover"
          />
          {hotel.featured && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Featured
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hotel Header */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{hotel.address}</span>
                  </div>
                  {hotel.city && (
                    <div className="text-gray-600">
                      {hotel.city}{hotel.country && `, ${hotel.country}`}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  {hotel.starRating && (
                    <div className="flex items-center mb-2">
                      {renderStars(hotel.starRating)}
                      <span className="ml-2 text-lg font-medium">{hotel.starRating} stars</span>
                    </div>
                  )}
                  {hotel.averageRating && (
                    <div className="text-sm text-gray-600">
                      {hotel.averageRating.toFixed(1)}/5 ({hotel.totalReviews || 0} reviews)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'rooms', label: `Rooms (${roomTypes.length})` },
                  { id: 'reviews', label: `Reviews (${reviews.length})` }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      selectedTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {selectedTab === 'overview' && (
              <div className="space-y-8">
                {/* Description */}
                {hotel.description && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{hotel.description}</p>
                  </div>
                )}

                {/* Amenities */}
                {hotel.amenities && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Amenities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {hotel.amenities.split(',').map((amenity, index) => (
                        <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                          {getAmenityIcon(amenity.trim())}
                          <span className="ml-3 text-gray-700">{amenity.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Policies */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {hotel.cancellationPolicy && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Cancellation Policy</h3>
                      <p className="text-gray-700">{hotel.cancellationPolicy}</p>
                    </div>
                  )}
                  {hotel.petPolicy && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Pet Policy</h3>
                      <p className="text-gray-700">{hotel.petPolicy}</p>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hotel.phone && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Phone className="h-5 w-5 text-gray-600" />
                        <span className="ml-3 text-gray-700">{hotel.phone}</span>
                      </div>
                    )}
                    {hotel.email && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Mail className="h-5 w-5 text-gray-600" />
                        <span className="ml-3 text-gray-700">{hotel.email}</span>
                      </div>
                    )}
                    {hotel.website && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Globe className="h-5 w-5 text-gray-600" />
                        <a 
                          href={hotel.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-3 text-blue-600 hover:underline"
                        >
                          {hotel.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'rooms' && (
              <div className="space-y-6">
                {roomTypes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No room information available
                  </div>
                ) : (
                  roomTypes.map((roomType) => (
                    <div key={roomType.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/3">
                          <img
                            {...getImageProps(roomType.imageUrl, 'room', roomType.name)}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        </div>
                        <div className="md:w-2/3">
                          <h4 className="text-xl font-semibold mb-2">{roomType.name}</h4>
                          {roomType.description && (
                            <p className="text-gray-600 mb-4">{roomType.description}</p>
                          )}
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 text-gray-500 mr-2" />
                              <span className="text-sm text-gray-700">
                                Max {roomType.maxOccupancy} guests
                              </span>
                            </div>
                            {roomType.bedType && (
                              <div className="text-sm text-gray-700">
                                Bed type: {roomType.bedType}
                              </div>
                            )}
                            {roomType.roomSize && (
                              <div className="text-sm text-gray-700">
                                Size: {roomType.roomSize}m²
                              </div>
                            )}
                            <div className="text-sm text-gray-700">
                              Available: {roomType.availableRooms} rooms
                            </div>
                          </div>

                          {roomType.amenities && (
                            <div className="mb-4">
                              <div className="text-xs text-gray-600 mb-2">Room amenities:</div>
                              <div className="flex flex-wrap gap-2">
                                {roomType.amenities.split(',').map((amenity, index) => (
                                  <span 
                                    key={index}
                                    className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200"
                                  >
                                    {amenity.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-2xl font-bold text-blue-600">
                                {formatPrice(roomType.pricePerNight)}
                              </div>
                              <div className="text-sm text-gray-600">per night</div>
                              {numberOfNights > 1 && (
                                <div className="text-lg font-semibold text-green-600 mt-1">
                                  {formatPrice(roomType.pricePerNight * numberOfNights)} total
                                </div>
                              )}
                            </div>
                            
                            <div className="text-right">
                              {/* Availability Check */}
                              {roomType.maxOccupancy < guestCount ? (
                                <div className="text-red-600 text-sm mb-2">
                                  Room capacity exceeded
                                </div>
                              ) : roomType.availableRooms === 0 ? (
                                <div className="text-red-600 text-sm mb-2">
                                  Sold out
                                </div>
                              ) : (
                                <div className="text-green-600 text-sm mb-2">
                                  {roomType.availableRooms} rooms available
                                </div>
                              )}
                              
                              <button 
                                onClick={() => {
                                  if (roomType.maxOccupancy < guestCount) {
                                    alert(`This room can accommodate maximum ${roomType.maxOccupancy} guests. Please select a different room type or reduce guest count.`);
                                    return;
                                  }
                                  if (roomType.availableRooms === 0) {
                                    alert('This room type is currently sold out for the selected dates.');
                                    return;
                                  }
                                  
                                  const bookingParams = new URLSearchParams({
                                    hotelId: hotel.id,
                                    roomTypeId: roomType.id,
                                    checkIn: checkInDate,
                                    checkOut: checkOutDate,
                                    guests: guestCount.toString()
                                  });
                                  navigate(`/booking?${bookingParams.toString()}`);
                                }}
                                disabled={roomType.maxOccupancy < guestCount || roomType.availableRooms === 0}
                                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                                  roomType.maxOccupancy < guestCount || roomType.availableRooms === 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                              >
                                {roomType.maxOccupancy < guestCount 
                                  ? 'Capacity Exceeded' 
                                  : roomType.availableRooms === 0 
                                  ? 'Sold Out' 
                                  : 'Book Now'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {selectedTab === 'reviews' && (
              <div className="space-y-6">
                {/* Review Form Section */}
                {user ? (
                  <div className="mb-8">
                    {checkingUserReview || checkingCanReview ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600 mt-2">Checking review status...</p>
                      </div>
                    ) : userExistingReview ? (
                      // User has existing review - show edit option
                      !showReviewForm ? (
                        <div className="text-center">
                          <h4 className="text-lg font-medium text-gray-900 mb-2">
                            You have already reviewed this hotel
                          </h4>
                          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-center mb-2">
                              {Array(5).fill(0).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-5 w-5 ${i < userExistingReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                              <span className="ml-2 text-sm text-gray-600">
                                {userExistingReview.rating}/5 stars
                              </span>
                            </div>
                            {userExistingReview.comment && (
                              <p className="text-gray-700 text-sm">"{userExistingReview.comment}"</p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              Reviewed on {new Date(userExistingReview.createdAt).toLocaleDateString('en-US')}
                            </p>
                          </div>
                          <button
                            onClick={() => setShowReviewForm(true)}
                            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
                          >
                            Edit review
                          </button>
                        </div>
                      ) : (
                        <ReviewEditForm
                          review={{
                            id: userExistingReview.id,
                            rating: userExistingReview.rating,
                            comment: userExistingReview.comment,
                            hotelId: userExistingReview.hotelId,
                            hotelName: hotel?.name
                          }}
                          onSuccess={handleReviewUpdateSuccess}
                          onCancel={() => setShowReviewForm(false)}
                          onDelete={handleReviewDeleteSuccess}
                        />
                      )
                    ) : canReview ? (
                      // User can review - show create option
                      !showReviewForm ? (
                        <div className="text-center">
                          <h4 className="text-lg font-medium text-gray-900 mb-2">
                            Share your experience
                          </h4>
                          <p className="text-gray-600 mb-4">
                            Your review will help others make better choices
                          </p>
                          <button
                            onClick={() => setShowReviewForm(true)}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Write a review
                          </button>
                        </div>
                      ) : (
                        <ReviewForm
                          hotelId={hotel?.id || ''}
                          hotelName={hotel?.name || ''}
                          onSuccess={handleReviewSuccess}
                          onCancel={() => setShowReviewForm(false)}
                        />
                      )
                    ) : (
                      // User cannot review - show message
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          Review not available
                        </h4>
                        <p className="text-gray-600 mb-4">
                          Please book and complete your stay to leave a review.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      Login to write a review
                    </h4>
                    <p className="text-gray-600 mb-4">
                      You need to login to share your experience and review this hotel
                    </p>
                    <Link
                      to="/login"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
                    >
                      Login
                    </Link>
                  </div>
                )}

                {/* Enhanced Reviews Display */}
                <ReviewDisplay 
                  reviews={reviews}
                  loading={loading}
                  showStats={true}
                  showFilters={true}
                  hotelId={hotel?.id}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Booking Information</h3>
              
              {/* Price */}
              <div className="mb-6">
                <div className="text-3xl font-bold text-blue-600">
                  {formatPrice(hotel.pricePerNight)}
                </div>
                {hotel.pricePerNight && (
                  <div className="text-gray-500">per night</div>
                )}
              </div>

              {/* Check times */}
              {(hotel.checkInTime || hotel.checkOutTime) && (
                <div className="mb-6 space-y-3">
                  {hotel.checkInTime && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-700">
                        Check-in: {hotel.checkInTime}
                      </span>
                    </div>
                  )}
                  {hotel.checkOutTime && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-700">
                        Check-out: {hotel.checkOutTime}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">
                    {hotel.totalRoomTypes || 0}
                  </div>
                  <div className="text-sm text-gray-600">Room types</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">
                    {hotel.totalRooms || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total rooms</div>
                </div>
              </div>

              {/* Enhanced Search Context Display */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-blue-800">Your Search</h4>
                  {!isEditingSearch && (
                    <button
                      onClick={handleSearchEdit}
                      className="text-blue-600 hover:text-blue-700 p-1 rounded-md hover:bg-blue-100 transition-colors"
                      title="Edit search criteria"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {!isEditingSearch ? (
                  // Display mode
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-blue-700">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{new Date(checkInDate).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })} - {new Date(checkOutDate).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center text-blue-700">
                      <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{guestCount} guest{guestCount > 1 ? 's' : ''} • {numberOfNights} night{numberOfNights > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                ) : (
                  // Edit mode
                  <div className="space-y-4">
                    {/* Check-in Date */}
                    <div>
                      <label className="block text-xs font-medium text-blue-800 mb-1">
                        Check-in Date
                      </label>
                      <input
                        type="date"
                        value={editSearchData.checkInDate}
                        onChange={(e) => handleSearchInputChange('checkInDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 text-sm border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Check-out Date */}
                    <div>
                      <label className="block text-xs font-medium text-blue-800 mb-1">
                        Check-out Date
                      </label>
                      <input
                        type="date"
                        value={editSearchData.checkOutDate}
                        onChange={(e) => handleSearchInputChange('checkOutDate', e.target.value)}
                        min={editSearchData.checkInDate}
                        className="w-full px-3 py-2 text-sm border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Guest Count */}
                    <div>
                      <label className="block text-xs font-medium text-blue-800 mb-1">
                        Number of Guests
                      </label>
                      <select
                        value={editSearchData.guestCount}
                        onChange={(e) => handleSearchInputChange('guestCount', parseInt(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                          <option key={num} value={num}>
                            {num} guest{num > 1 ? 's' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                                         {/* Info Message */}
                     <div className="bg-blue-100 text-blue-700 text-xs p-2 rounded-md">
                       <span className="font-medium">Note:</span> Changing search criteria may affect room availability and pricing.
                     </div>

                     {/* Action Buttons */}
                     <div className="flex space-x-2 pt-2">
                       <button
                         onClick={handleSearchSave}
                         disabled={isValidatingSearch}
                         className={`flex-1 px-3 py-2 rounded-md transition-colors text-sm font-medium flex items-center justify-center ${
                           isValidatingSearch 
                             ? 'bg-blue-400 text-white cursor-not-allowed' 
                             : 'bg-blue-600 text-white hover:bg-blue-700'
                         }`}
                       >
                         {isValidatingSearch ? (
                           <>
                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                             Checking...
                           </>
                         ) : (
                           <>
                             <Check className="h-4 w-4 mr-1" />
                             Apply
                           </>
                         )}
                       </button>
                       <button
                         onClick={handleSearchCancel}
                         disabled={isValidatingSearch}
                         className={`flex-1 px-3 py-2 rounded-md transition-colors text-sm font-medium flex items-center justify-center ${
                           isValidatingSearch 
                             ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                             : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                         }`}
                       >
                         <X className="h-4 w-4 mr-1" />
                         Cancel
                       </button>
                     </div>
                  </div>
                )}
              </div>

              {/* Booking Button */}
              <button 
                onClick={() => {
                  // Find best available room type
                  const availableRoomTypes = roomTypes.filter(rt => 
                    rt.availableRooms > 0 && rt.maxOccupancy >= guestCount
                  );
                  
                  if (availableRoomTypes.length > 0) {
                    // Use the cheapest available room type
                    const cheapestRoom = availableRoomTypes.reduce((prev, current) => 
                      prev.pricePerNight < current.pricePerNight ? prev : current
                    );
                    
                    const bookingParams = new URLSearchParams({
                      hotelId: hotel.id,
                      roomTypeId: cheapestRoom.id,
                      checkIn: checkInDate,
                      checkOut: checkOutDate,
                      guests: guestCount.toString()
                    });
                    navigate(`/booking?${bookingParams.toString()}`);
                  } else {
                    alert(`No rooms available for ${guestCount} guests on the selected dates. Please try different dates or guest count.`);
                  }
                }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold mb-4"
              >
                Book Now
              </button>
              
              <Link 
                to="/hotels"
                className="w-full block text-center border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View other hotels
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetailPage;
