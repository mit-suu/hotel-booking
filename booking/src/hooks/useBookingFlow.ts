import { useState, useCallback } from 'react';
import { BookingCreateRequest } from '../services/api';

export interface BookingFlowStep {
  step: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
  isValid?: boolean;
}

export interface BookingFlowState {
  currentStep: number;
  formData: Partial<BookingCreateRequest>;
  errors: Record<string, string>;
  touchedFields: Record<string, boolean>;
  isLoading: boolean;
}

export interface BookingFlowActions {
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: <K extends keyof BookingCreateRequest>(field: K, value: BookingCreateRequest[K]) => void;
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  setTouched: (field: string, touched?: boolean) => void;
  setLoading: (loading: boolean) => void;
  validateStep: (step: number) => boolean;
  resetForm: () => void;
}

const initialFormData: Partial<BookingCreateRequest> = {
  paymentMethod: 'CASH_ON_CHECKIN',
  specialRequests: ''
};

const totalSteps = 4;

export const useBookingFlow = (
  initialData?: Partial<BookingCreateRequest>
): [BookingFlowState, BookingFlowActions] => {
  const [state, setState] = useState<BookingFlowState>({
    currentStep: 1,
    formData: { ...initialFormData, ...initialData },
    errors: {},
    touchedFields: {},
    isLoading: false
  });

  const setCurrentStep = useCallback((step: number) => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(1, Math.min(step, totalSteps))
    }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, totalSteps)
    }));
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1)
    }));
  }, []);

  const updateFormData = useCallback(<K extends keyof BookingCreateRequest>(
    field: K,
    value: BookingCreateRequest[K]
  ) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
      touchedFields: { ...prev.touchedFields, [field]: true }
    }));
  }, []);

  const setError = useCallback((field: string, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error }
    }));
  }, []);

  const clearError = useCallback((field: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: '' }
    }));
  }, []);

  const setTouched = useCallback((field: string, touched: boolean = true) => {
    setState(prev => ({
      ...prev,
      touchedFields: { ...prev.touchedFields, [field]: touched }
    }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    const { formData } = state;
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        // Step 1: Review - validate booking details
        if (!formData.hotelId) {
          newErrors.hotelId = 'Hotel is required';
        }
        if (!formData.roomTypeId) {
          newErrors.roomTypeId = 'Room type is required';
        }
        if (!formData.checkInDate) {
          newErrors.checkInDate = 'Check-in date is required';
        }
        if (!formData.checkOutDate) {
          newErrors.checkOutDate = 'Check-out date is required';
        }
        if (!formData.guests || formData.guests < 1) {
          newErrors.guests = 'Number of guests must be at least 1';
        }
        if (!formData.totalAmount || formData.totalAmount <= 0) {
          newErrors.totalAmount = 'Total amount must be greater than 0';
        }

        // Validate dates
        if (formData.checkInDate && formData.checkOutDate) {
          const checkIn = new Date(formData.checkInDate);
          const checkOut = new Date(formData.checkOutDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (checkIn < today) {
            newErrors.checkInDate = 'Check-in date cannot be in the past';
          }
          if (checkOut <= checkIn) {
            newErrors.checkOutDate = 'Check-out date must be after check-in date';
          }
        }
        break;

      case 2:
        // Step 2: Guest Information - handled by authentication system
        // No validation needed as guest info comes from authenticated user
        break;

      case 3:
        // Step 3: Payment Method
        if (!formData.paymentMethod) {
          newErrors.paymentMethod = 'Please select a payment method';
        }
        break;

      case 4:
        // Step 4: Final validation (all previous steps)
        return validateStep(1) && validateStep(3);
    }

    setState(prev => ({ ...prev, errors: newErrors }));
    return Object.keys(newErrors).length === 0;
  }, [state]);

  const resetForm = useCallback(() => {
    setState({
      currentStep: 1,
      formData: { ...initialFormData, ...initialData },
      errors: {},
      touchedFields: {},
      isLoading: false
    });
  }, [initialData]);

  const actions: BookingFlowActions = {
    setCurrentStep,
    nextStep,
    prevStep,
    updateFormData,
    setError,
    clearError,
    setTouched,
    setLoading,
    validateStep,
    resetForm
  };

  return [state, actions];
};

// Helper function to get step configuration
export const getStepConfig = (currentStep: number): BookingFlowStep[] => [
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
    description: 'Authenticate and verify details',
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

// Validation rules for BookingCreateRequest fields
export const validationRules = {
  hotelId: {
    required: true,
    message: 'Hotel selection is required'
  },
  roomTypeId: {
    required: true,
    message: 'Room type selection is required'
  },
  checkInDate: {
    required: true,
    message: 'Check-in date is required'
  },
  checkOutDate: {
    required: true,
    message: 'Check-out date is required'
  },
  guests: {
    required: true,
    min: 1,
    max: 10,
    message: 'Number of guests must be between 1 and 10'
  },
  totalAmount: {
    required: true,
    min: 0,
    message: 'Total amount must be greater than 0'
  },
  paymentMethod: {
    required: true,
    message: 'Please select a payment method'
  },
  specialRequests: {
    required: false,
    maxLength: 1000,
    message: 'Special requests cannot exceed 1000 characters'
  }
};

// Field labels for error messages
export const fieldLabels = {
  hotelId: 'Hotel',
  roomTypeId: 'Room Type',
  checkInDate: 'Check-in Date',
  checkOutDate: 'Check-out Date',
  guests: 'Number of Guests',
  totalAmount: 'Total Amount',
  paymentMethod: 'Payment Method',
  specialRequests: 'Special Requests'
};

export default useBookingFlow; 