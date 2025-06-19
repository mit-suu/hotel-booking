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
}

const VoucherForm: React.FC<VoucherFormProps> = ({
  voucher,
  onSubmit,
  onCancel,
  isLoading = false
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
    applicableScope: voucher?.applicableScope || ApplicableScope.ALL_HOTELS,
    hotelIds: voucher?.hotelIds || []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.code) newErrors.code = 'Mã voucher là bắt buộc';
    else if (!/^[A-Z0-9]+$/.test(formData.code)) newErrors.code = 'Mã voucher chỉ được chứa chữ in hoa và số';
    
    if (!formData.name) newErrors.name = 'Tên voucher là bắt buộc';
    if (!formData.discountValue || formData.discountValue <= 0) newErrors.discountValue = 'Giá trị giảm giá phải lớn hơn 0';
    if (!formData.startDate) newErrors.startDate = 'Ngày bắt đầu là bắt buộc';
    if (!formData.endDate) newErrors.endDate = 'Ngày kết thúc là bắt buộc';

    // Date validation
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const now = new Date();

      if (endDate <= startDate) newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    }

    // Discount type specific validation
    if (formData.discountType === DiscountType.PERCENTAGE) {
      if (formData.discountValue > 100) newErrors.discountValue = 'Phần trăm giảm giá không được vượt quá 100%';
      if (!formData.maxDiscount) newErrors.maxDiscount = 'Số tiền giảm tối đa là bắt buộc cho voucher phần trăm';
    }

    // Applicable scope validation
    if (formData.applicableScope === ApplicableScope.SPECIFIC_HOTELS) {
      if (!formData.hotelIds || formData.hotelIds.length === 0) {
        newErrors.hotelIds = 'Phải chọn ít nhất một khách sạn khi áp dụng cho khách sạn cụ thể';
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
          {voucher ? 'Chỉnh sửa voucher' : 'Tạo voucher mới'}
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
              Mã voucher *
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.code ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="VD: SUMMER2024"
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
              Tên voucher *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="VD: Khuyến mãi mùa hè"
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
            Mô tả
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Mô tả chi tiết về voucher..."
          />
        </div>

        {/* Discount Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại giảm giá *
            </label>
            <select
              value={formData.discountType}
              onChange={(e) => handleInputChange('discountType', e.target.value as DiscountType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={DiscountType.PERCENTAGE}>Giảm theo phần trăm</option>
              <option value={DiscountType.HOTEL_SPECIFIC}>Khách sạn cụ thể</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giá trị giảm giá * {formData.discountType === DiscountType.PERCENTAGE ? '(%)' : '(VNĐ)'}
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
                Số tiền giảm tối đa * (VNĐ)
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
              Giá trị đặt phòng tối thiểu (VNĐ)
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
              Giới hạn sử dụng
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
              Ngày bắt đầu *
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
              Ngày kết thúc *
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
            Phạm vi áp dụng *
          </label>
          <select
            value={formData.applicableScope}
            onChange={(e) => handleInputChange('applicableScope', e.target.value as ApplicableScope)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={ApplicableScope.ALL_HOTELS}>Tất cả khách sạn</option>
            <option value={ApplicableScope.SPECIFIC_HOTELS}>Khách sạn cụ thể</option>
          </select>
        </div>

        {/* Hotel Selection */}
        {formData.applicableScope === ApplicableScope.SPECIFIC_HOTELS && (
          <HotelSelector
            selectedHotelIds={formData.hotelIds || []}
            onHotelSelectionChange={(hotelIds) => handleInputChange('hotelIds', hotelIds)}
            error={errors.hotelIds}
          />
        )}

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang xử lý...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                {voucher ? 'Cập nhật' : 'Tạo voucher'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VoucherForm; 