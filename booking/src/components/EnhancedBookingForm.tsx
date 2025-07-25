import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, Users, CreditCard, Check, ChevronLeft, ChevronRight, 
  Clock, Star, Wifi, Car, Coffee, Banknote, Smartphone, AlertCircle,
  User, Mail, Phone, MessageSquare, Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { bookingAPI, BookingCreateRequest, HotelResponse, RoomTypeResponse, vnpayAPI } from '../services/api';
import VoucherInput from './VoucherInput';
import VNPayPaymentModal from './VNPayPaymentModal';

interface EnhancedBookingFormProps {
  hotel: HotelResponse;
  roomType: RoomTypeResponse;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  onSuccess?: (bookingId: string) => void;
}

interface StepData {
  step: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

const EnhancedBookingForm: React.FC<EnhancedBookingFormProps> = ({
  hotel,
  roomType,
  checkInDate,
  checkOutDate,
  guests,
  onSuccess
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [showVNPayModal, setShowVNPayModal] = useState(false);
  const [vnpayLoading, setVnpayLoading] = useState(false);

  const [formData, setFormData] = useState<BookingCreateRequest>({
    hotelId: hotel.id,
    roomTypeId: roomType.id,
    checkInDate,
    checkOutDate,
    guests,
    totalAmount: 0,
    paymentMethod: 'VNPAY',
    specialRequests: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  // Voucher state
  const [appliedVoucherCode, setAppliedVoucherCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [originalAmount, setOriginalAmount] = useState<number>(0);

  // Calculate number of nights and total amount
  const numberOfNights = Math.ceil(
    (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  useEffect(() => {
    const baseAmount = numberOfNights * roomType.pricePerNight;
    setOriginalAmount(baseAmount);
    
    // Apply discount if voucher is applied
    const finalAmount = baseAmount - discountAmount;
    setFormData(prev => ({ ...prev, totalAmount: finalAmount }));
  }, [numberOfNights, roomType.pricePerNight, discountAmount]);

  // Steps configuration
  const steps: StepData[] = [
    {
      step: 1,
      title: 'Review Booking',
      description: 'Confirm your selection',
      isCompleted: currentStep > 1,
      isActive: currentStep === 1
    },
    {
      step: 2,
      title: 'Guest Information',
      description: 'Verify your details',
      isCompleted: currentStep > 2,
      isActive: currentStep === 2
    },
    {
      step: 3,
      title: 'Payment Method',
      description: 'Choose payment option',
      isCompleted: currentStep > 3,
      isActive: currentStep === 3
    },
    {
      step: 4,
      title: 'Confirmation',
      description: 'Review and confirm',
      isCompleted: false,
      isActive: currentStep === 4
    }
  ];

  // Check room availability
  useEffect(() => {
    const checkAvailability = async () => {
      setIsChecking(true);
      try {
        const response = await bookingAPI.checkRoomAvailability(
          roomType.id,
          checkInDate,
          checkOutDate
        );
        setIsAvailable(response.data.result);
      } catch (error) {
        console.error('Error checking availability:', error);
        setIsAvailable(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAvailability();
  }, [roomType.id, checkInDate, checkOutDate]);

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 2) {
      // Check if user is logged in and has complete profile
      if (!user) {
        newErrors.user = 'Please login to continue with booking';
        setErrors(newErrors);
        return false;
      }

      // Validate user profile completeness
      if (!user.name?.trim()) {
        newErrors.user = 'Please complete your profile with your name';
      }

      if (!user.email?.trim()) {
        newErrors.user = 'Please complete your profile with your email';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
        newErrors.user = 'Please update your email to a valid format';
      }
    }

    // VNPay is the only payment method, so no validation needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleInputChange = (field: keyof BookingCreateRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleVoucherApplied = (discount: number, voucherCode: string) => {
    setDiscountAmount(discount);
    setAppliedVoucherCode(voucherCode);
  };

  const handleVoucherRemoved = () => {
    setDiscountAmount(0);
    setAppliedVoucherCode('');
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep() || !isAvailable) return;

    // Only VNPay payment is available, show payment modal
    setShowVNPayModal(true);
  };

  const handleVNPayPayment = async (bankCode: string) => {
    setVnpayLoading(true);
    try {
      // First create the booking
      const bookingData = {
        ...formData,
        ...(appliedVoucherCode && { voucherCode: appliedVoucherCode })
      };
      
      const bookingResponse = await bookingAPI.createBooking(bookingData);
      const bookingId = bookingResponse.data.result.id;
      
      // Then create VNPay payment URL
      const orderInfo = `Thanh toan dat phong ${hotel.name} - ${roomType.name}`;
      const vnpayRequest = {
        bookingId: bookingId,
        amount: formData.totalAmount,
        orderInfo: orderInfo,
        bankCode: bankCode || undefined,
        locale: 'vn'
      };
      
      const paymentResponse = await vnpayAPI.createPayment(vnpayRequest);
      const paymentUrl = paymentResponse.data.result.paymentUrl;
      
      // Redirect to VNPay
      window.location.href = paymentUrl;
      
    } catch (error: any) {
      console.error('Error creating VNPay payment:', error);
      const errorMessage = error.response?.data?.message || 'Không thể tạo giao dịch thanh toán';
      alert(errorMessage);
    } finally {
      setVnpayLoading(false);
      setShowVNPayModal(false);
    }
  };

  const handleCloseVNPayModal = () => {
    setShowVNPayModal(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Show login required message if user is not authenticated
  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <User className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Login Required</h3>
        <p className="text-yellow-700 mb-4">You need to login to make a booking</p>
        <button 
          onClick={() => navigate('/login')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Login to Continue
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Progress Steps */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.step}>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.isCompleted 
                    ? 'bg-green-500 text-white' 
                    : step.isActive 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.isCompleted ? <Check className="h-4 w-4" /> : step.step}
                </div>
                <div className="ml-3 hidden sm:block">
                  <div className={`text-sm font-medium ${
                    step.isActive ? 'text-blue-600' : step.isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  step.isCompleted ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        {/* Availability Check */}
        {isChecking && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-blue-800">Checking room availability...</span>
            </div>
          </div>
        )}

        {isAvailable === false && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
              <span className="text-red-800">Room is not available for the selected dates</span>
            </div>
          </div>
        )}

        {errors.user && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
              <span className="text-red-800">{errors.user}</span>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="min-h-[400px]">
          {/* Step 1: Review Booking */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Review Your Booking</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hotel Information */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3">{hotel.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {hotel.address}
                    </div>
                    {hotel.starRating && (
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-2 text-yellow-500" />
                        {hotel.starRating} Star Hotel
                      </div>
                    )}
                  </div>
                  
                  {hotel.imageUrl && (
                    <img 
                      src={hotel.imageUrl} 
                      alt={hotel.name}
                      className="w-full h-32 object-cover rounded-lg mt-3"
                    />
                  )}
                </div>

                {/* Room Information */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3">{roomType.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Max {roomType.maxOccupancy} guests
                    </div>
                    {roomType.bedType && (
                      <div>Bed: {roomType.bedType}</div>
                    )}
                    {roomType.roomSize && (
                      <div>Size: {roomType.roomSize} m²</div>
                    )}
                  </div>
                  
                  {roomType.imageUrl && (
                    <img 
                      src={roomType.imageUrl} 
                      alt={roomType.name}
                      className="w-full h-32 object-cover rounded-lg mt-3"
                    />
                  )}
                </div>
              </div>

              {/* Booking Details */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-4">Booking Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center text-gray-600 mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      Check-in
                    </div>
                    <div className="font-medium">{formatDate(checkInDate)}</div>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-600 mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      Check-out
                    </div>
                    <div className="font-medium">{formatDate(checkOutDate)}</div>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-600 mb-2">
                      <Users className="h-4 w-4 mr-2" />
                      Guests
                    </div>
                    <div className="font-medium">{guests} guest{guests > 1 ? 's' : ''}</div>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-4">Price Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Room rate per night</span>
                    <span>{formatCurrency(roomType.pricePerNight)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Number of nights</span>
                    <span>{numberOfNights}</span>
                  </div>
                  <hr className="my-3" />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Amount</span>
                    <span className="text-blue-600">{formatCurrency(formData.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Guest Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Guest Information</h2>
              <p className="text-gray-600">Your information from your account will be used for this booking.</p>
              
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <h3 className="font-semibold mb-4">Booking Guest</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="h-4 w-4 inline mr-1" />
                      Full Name
                    </label>
                    <div className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900">
                      {user.name || 'Name not provided'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email Address
                    </label>
                    <div className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900">
                      {user.email || 'Email not provided'}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Phone Number
                    </label>
                    <div className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900">
                      {user.tel || 'Phone not provided'}
                    </div>
                  </div>
                </div>

                {(!user.name || !user.email) && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                      <div>
                        <p className="text-yellow-800 font-medium">Incomplete Profile</p>
                        <p className="text-yellow-700 text-sm">Please update your profile to continue with the booking.</p>
                        <button 
                          onClick={() => navigate('/profile')}
                          className="mt-2 text-blue-600 hover:text-blue-800 underline text-sm"
                        >
                          Update Profile
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="h-4 w-4 inline mr-1" />
                  Special Requests (Optional)
                </label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="Any special requests? (e.g., early check-in, room preferences, dietary requirements)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Special requests cannot be guaranteed but we'll do our best to accommodate them
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Payment Method */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
              <p className="text-gray-600">Secure payment through VNPay digital wallet.</p>
              
              {/* VNPay Payment Method - Selected by default */}
              <div className="border-2 border-blue-500 bg-blue-50 rounded-lg p-6">
                <div className="flex items-center">
                  <Smartphone className="h-6 w-6 text-blue-600 mr-4" />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="font-semibold text-blue-800 text-lg">VNPay Digital Wallet</div>
                      <Check className="h-5 w-5 ml-3 text-blue-600" />
                    </div>
                    <div className="text-blue-700 mt-1">
                      Thanh toán qua ví điện tử VNPay - An toàn, nhanh chóng và bảo mật
                    </div>
                    <div className="mt-3 flex items-center space-x-4 text-sm text-blue-600">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-1" />
                        <span>Bảo mật SSL 256-bit</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Xử lý tức thì</span>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 mr-1" />
                        <span>Đã được chứng nhận</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              

              {/* Voucher Section */}
              <VoucherInput
                hotelId={hotel.id}
                bookingAmount={originalAmount}
                onVoucherApplied={handleVoucherApplied}
                onVoucherRemoved={handleVoucherRemoved}
                appliedVoucherCode={appliedVoucherCode}
                disabled={loading}
              />

              {/* Booking Summary with Discount */}
              {originalAmount > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Chi tiết thanh toán</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Giá phòng ({numberOfNights} đêm):</span>
                      <span>{formatCurrency(originalAmount)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Giảm giá ({appliedVoucherCode}):</span>
                        <span>-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Tổng cộng:</span>
                      <span className="text-lg">{formatCurrency(formData.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Confirm Your Booking</h2>
              <p className="text-gray-600">Please review all details before confirming your booking.</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Guest Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-600">Name:</span> {user.name}</div>
                      <div><span className="text-gray-600">Email:</span> {user.email}</div>
                      {user.tel && (
                        <div><span className="text-gray-600">Phone:</span> {user.tel}</div>
                      )}
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Booking Details</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-600">Hotel:</span> {hotel.name}</div>
                      <div><span className="text-gray-600">Room:</span> {roomType.name}</div>
                      <div><span className="text-gray-600">Check-in:</span> {formatDate(checkInDate)}</div>
                      <div><span className="text-gray-600">Check-out:</span> {formatDate(checkOutDate)}</div>
                      <div><span className="text-gray-600">Guests:</span> {guests}</div>
                      <div><span className="text-gray-600">Nights:</span> {numberOfNights}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Payment Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Payment Method:</span> 
                        VNPay Digital Wallet
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Room Price ({numberOfNights} nights):</span>
                          <span>{formatCurrency(originalAmount)}</span>
                        </div>
                        {discountAmount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount ({appliedVoucherCode}):</span>
                            <span>-{formatCurrency(discountAmount)}</span>
                          </div>
                        )}
                        <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                          <span>Total Amount:</span>
                          <span>{formatCurrency(formData.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {formData.specialRequests && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Special Requests</h4>
                      <p className="text-sm text-gray-600">{formData.specialRequests}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-medium text-green-800">Ready to Book</h4>
                    <p className="text-green-700 text-sm mt-1">
                      By confirming this booking, you agree to the hotel's terms and conditions. 
                      You will receive a confirmation email once the booking is processed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              currentStep === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </button>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={isAvailable === false || (currentStep === 2 && (!user.name || !user.email))}
              className={`flex items-center px-6 py-2 rounded-lg transition-colors ${
                isAvailable === false || (currentStep === 2 && (!user.name || !user.email))
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || isAvailable === false}
              className={`flex items-center px-6 py-2 rounded-lg transition-colors ${
                loading || isAvailable === false
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Confirming...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Confirm Booking
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* VNPay Payment Modal */}
      <VNPayPaymentModal
        isOpen={showVNPayModal}
        onClose={handleCloseVNPayModal}
        onConfirm={handleVNPayPayment}
        totalAmount={formData.totalAmount}
        orderInfo={`Đặt phòng ${hotel.name} - ${roomType.name}`}
        loading={vnpayLoading}
      />
    </div>
  );
};

export default EnhancedBookingForm; 