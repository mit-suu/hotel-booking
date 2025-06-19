import React, { useState } from 'react';
import { Tag, Check, X, AlertCircle, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import { voucherAPI } from '../services/api';
import { VoucherValidationResponse } from '../types/voucher';
import AvailableVouchers from './AvailableVouchers';

interface VoucherInputProps {
  hotelId: string;
  bookingAmount: number;
  onVoucherApplied?: (discountAmount: number, voucherCode: string) => void;
  onVoucherRemoved?: () => void;
  appliedVoucherCode?: string;
  disabled?: boolean;
}

const VoucherInput: React.FC<VoucherInputProps> = ({
  hotelId,
  bookingAmount,
  onVoucherApplied,
  onVoucherRemoved,
  appliedVoucherCode,
  disabled = false
}) => {
  const [voucherCode, setVoucherCode] = useState(appliedVoucherCode || '');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<VoucherValidationResponse | null>(null);
  const [error, setError] = useState('');
  const [showAvailableVouchers, setShowAvailableVouchers] = useState(false);

  const validateVoucher = async () => {
    if (!voucherCode.trim()) {
      setError('Vui lòng nhập mã voucher');
      return;
    }

    setIsValidating(true);
    setError('');
    setValidationResult(null);

    try {
      const response = await voucherAPI.validateVoucher({
        code: voucherCode.toUpperCase(),
        hotelId,
        bookingAmount
      });

      if (response.data.success) {
        const result = response.data.result;
        setValidationResult(result);
        
        if (result.valid && result.discountAmount && onVoucherApplied) {
          onVoucherApplied(result.discountAmount, voucherCode.toUpperCase());
        } else if (!result.valid) {
          setError(result.message || 'Voucher không hợp lệ');
        }
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Không thể kiểm tra voucher');
    } finally {
      setIsValidating(false);
    }
  };

  const removeVoucher = () => {
    setVoucherCode('');
    setValidationResult(null);
    setError('');
    if (onVoucherRemoved) {
      onVoucherRemoved();
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validateVoucher();
    }
  };

  const handleVoucherSelect = async (selectedVoucherCode: string) => {
    setVoucherCode(selectedVoucherCode);
    setShowAvailableVouchers(false);
    
    // Auto-validate the selected voucher
    setIsValidating(true);
    setError('');
    setValidationResult(null);

    try {
      const response = await voucherAPI.validateVoucher({
        code: selectedVoucherCode,
        hotelId,
        bookingAmount
      });

      if (response.data.success) {
        const result = response.data.result;
        setValidationResult(result);
        
        if (result.valid && result.discountAmount && onVoucherApplied) {
          onVoucherApplied(result.discountAmount, selectedVoucherCode);
        } else if (!result.valid) {
          setError(result.message || 'Voucher không hợp lệ');
        }
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Không thể kiểm tra voucher');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center mb-3">
        <Tag size={20} className="text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Mã giảm giá</h3>
      </div>

      {!appliedVoucherCode ? (
        <div className="space-y-3">
          <div className="flex space-x-2">
            <div className="flex-1">
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="Nhập mã voucher (VD: SUMMER2024)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={disabled || isValidating}
              />
            </div>
            <button
              onClick={validateVoucher}
              disabled={disabled || isValidating || !voucherCode.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isValidating ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                'Áp dụng'
              )}
            </button>
          </div>

          {error && (
            <div className="flex items-center text-red-600 text-sm">
              <AlertCircle size={16} className="mr-2" />
              {error}
            </div>
          )}

          {validationResult && validationResult.valid && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center text-green-800 mb-2">
                <Check size={16} className="mr-2" />
                <span className="font-medium">Voucher hợp lệ!</span>
              </div>
              <div className="text-sm text-green-700">
                <div>Mã: <span className="font-medium">{validationResult.voucher?.code}</span></div>
                <div>Tên: {validationResult.voucher?.name}</div>
                <div className="flex justify-between mt-2 pt-2 border-t border-green-200">
                  <span>Giảm giá:</span>
                  <span className="font-semibold">-{formatCurrency(validationResult.discountAmount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Thành tiền:</span>
                  <span className="font-semibold">{formatCurrency(validationResult.finalAmount || 0)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-green-800">
              <Check size={16} className="mr-2" />
              <span className="font-medium">Đã áp dụng: {appliedVoucherCode}</span>
            </div>
            <button
              onClick={removeVoucher}
              disabled={disabled}
              className="text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              <X size={16} />
            </button>
          </div>
          {validationResult && (
            <div className="text-sm text-green-700 mt-2">
              <div className="flex justify-between">
                <span>Giảm giá:</span>
                <span className="font-semibold">-{formatCurrency(validationResult.discountAmount || 0)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Available Vouchers Section */}
      <div className="mt-3">
        <button
          onClick={() => setShowAvailableVouchers(!showAvailableVouchers)}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
          disabled={disabled}
        >
          <span>Xem voucher khả dụng</span>
          {showAvailableVouchers ? (
            <ChevronUp size={16} className="ml-1" />
          ) : (
            <ChevronDown size={16} className="ml-1" />
          )}
        </button>

        {showAvailableVouchers && (
          <div className="mt-3">
            <AvailableVouchers
              hotelId={hotelId}
              onVoucherSelect={handleVoucherSelect}
            />
          </div>
        )}
      </div>

      <div className="mt-3 text-xs text-gray-500">
        Nhập mã voucher hoặc chọn từ danh sách voucher khả dụng
      </div>
    </div>
  );
};

export default VoucherInput; 