import React, { useState, useEffect } from 'react';
import { Save, X, AlertCircle } from 'lucide-react';
import { VoucherRequest, VoucherResponse, DiscountType, ApplicableScope } from '../types/voucher';
import { HotelResponse } from '../services/api';
import HotelSelector from './HotelSelector';

interface VoucherFormProps {
  voucher?: VoucherResponse;
  onSubmit: (data: VoucherRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isHostMode?: boolean;
  hostHotels?: any[];
  hotels?: any[];
}

const VoucherForm: React.FC<VoucherFormProps> = ({
  voucher,
  onSubmit,
  onCancel,
  isLoading = false,
  isHostMode = false,
  hostHotels = [],
  hotels = []
}) => {
  const [formData, setFormData] = useState<VoucherRequest>({
    code: voucher?.code || '',
    name: voucher?.name || '',
    description: voucher?.description || '',
    discountType: voucher?.discountType || DiscountType.PERCENTAGE,
    discountValue: voucher?.discountValue || 0,
    maxDiscount: voucher?.maxDiscount || undefined,
    minBookingValue: voucher?.minBookingValue || undefined,
    startDate: voucher?.startDate ? voucher.startDate.substring(0, 16) : '',
    endDate: voucher?.endDate ? voucher.endDate.substring(0, 16) : '',
    usageLimit: voucher?.usageLimit || undefined,
    applicableScope: isHostMode ? ApplicableScope.SPECIFIC_HOTELS : (voucher?.applicableScope || ApplicableScope.ALL_HOTELS),
    hotelIds: voucher?.hotelIds || []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.code) newErrors.code = 'Voucher code is required';
    else if (!/^[A-Z0-9]+$/.test(formData.code)) newErrors.code = 'Voucher code must contain only uppercase letters and numbers';
    
    if (!formData.name) newErrors.name = 'Voucher name is required';
    if (!formData.discountValue || formData.discountValue <= 0) newErrors.discountValue = 'Discount value must be greater than 0';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';

    // Date validation
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const now = new Date();

      if (endDate <= startDate) newErrors.endDate = 'End date must be after start date';
    }

    // Discount type specific validation
    if (formData.discountType === DiscountType.PERCENTAGE) {
      if (formData.discountValue > 100) newErrors.discountValue = 'Discount percentage cannot exceed 100%';
      if (!formData.maxDiscount) newErrors.maxDiscount = 'Maximum discount amount is required for percentage vouchers';
    }

    // Applicable scope validation
    if (formData.applicableScope === ApplicableScope.SPECIFIC_HOTELS) {
      if (!formData.hotelIds || formData.hotelIds.length === 0) {
        newErrors.hotelIds = 'Must select at least one hotel when applying to specific hotels';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Convert date strings to ISO format
      const submitData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      };
      onSubmit(submitData);
    }
  };

  const handleInputChange = (field: keyof VoucherRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {voucher ? 'Edit Voucher' : 'Create New Voucher'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voucher Code *
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.code ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g: SUMMER2024"
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors.code}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voucher Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g: Summer Sale"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors.name}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Detailed voucher description..."
          />
        </div>

        {/* Discount Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Type *
            </label>
            <select
              value={formData.discountType}
              onChange={(e) => handleInputChange('discountType', e.target.value as DiscountType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={DiscountType.PERCENTAGE}>Percentage Discount</option>
              <option value={DiscountType.HOTEL_SPECIFIC}>Hotel Specific</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Value * {formData.discountType === DiscountType.PERCENTAGE ? '(%)' : '(VND)'}
            </label>
            <input
              type="number"
              value={formData.discountValue}
              onChange={(e) => handleInputChange('discountValue', Number(e.target.value))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.discountValue ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={formData.discountType === DiscountType.PERCENTAGE ? "20" : "500000"}
              min="0"
              max={formData.discountType === DiscountType.PERCENTAGE ? "100" : undefined}
            />
            {errors.discountValue && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors.discountValue}
              </p>
            )}
          </div>
        </div>

        {/* Additional Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {formData.discountType === DiscountType.PERCENTAGE && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Discount Amount * (VND)
              </label>
              <input
                type="number"
                value={formData.maxDiscount || ''}
                onChange={(e) => handleInputChange('maxDiscount', e.target.value ? Number(e.target.value) : undefined)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.maxDiscount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="2000000"
                min="0"
              />
              {errors.maxDiscount && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.maxDiscount}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Booking Value (VND)
            </label>
            <input
              type="number"
              value={formData.minBookingValue || ''}
              onChange={(e) => handleInputChange('minBookingValue', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1000000"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usage Limit
            </label>
            <input
              type="number"
              value={formData.usageLimit || ''}
              onChange={(e) => handleInputChange('usageLimit', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1000"
              min="1"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.startDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors.startDate}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date *
            </label>
            <input
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.endDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors.endDate}
              </p>
            )}
          </div>
        </div>

        {/* Applicable Scope */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Applicable Scope *
          </label>
          {isHostMode ? (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
              <span>Specific Hotels</span>
              <p className="text-xs text-gray-500 mt-1">
                Hosts can only create vouchers for their own hotels
              </p>
            </div>
          ) : (
            <select
              value={formData.applicableScope}
              onChange={(e) => handleInputChange('applicableScope', e.target.value as ApplicableScope)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={ApplicableScope.ALL_HOTELS}>All Hotels</option>
              <option value={ApplicableScope.SPECIFIC_HOTELS}>Specific Hotels</option>
            </select>
          )}
        </div>

        {/* Hotel Selection - chỉ hiển thị khi scope là SPECIFIC_HOTELS */}
        {formData.applicableScope === ApplicableScope.SPECIFIC_HOTELS && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Hotels *
            </label>
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
              {(isHostMode ? hostHotels : hotels).map((hotel) => (
                <label key={hotel.id} className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={(formData.hotelIds || []).includes(hotel.id)}
                    onChange={(e) => {
                      const currentHotelIds = formData.hotelIds || [];
                      const newHotelIds = e.target.checked
                        ? [...currentHotelIds, hotel.id]
                        : currentHotelIds.filter(id => id !== hotel.id);
                      handleInputChange('hotelIds', newHotelIds);
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{hotel.name}</span>
                  {isHostMode && (
                    <span className="text-xs text-gray-500">
                      ({hotel.address || 'No address'})
                    </span>
                  )}
                </label>
              ))}
              {(isHostMode ? hostHotels : hotels).length === 0 && (
                <p className="text-sm text-gray-500">
                  {isHostMode ? 'You don\'t have any hotels yet.' : 'No hotels available.'}
                </p>
              )}
            </div>
            {errors.hotelIds && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors.hotelIds}
              </p>
            )}
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                {voucher ? 'Update' : 'Create Voucher'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VoucherForm; 