import React from 'react';
import { Tag, Percent, Clock, Users } from 'lucide-react';
import { VoucherResponse, DiscountType } from '../types/voucher';
import { useAvailableVouchers } from '../hooks/useAvailableVouchers';

interface AvailableVouchersProps {
  hotelId: string;
  onVoucherSelect?: (voucherCode: string) => void;
  className?: string;
}

const AvailableVouchers: React.FC<AvailableVouchersProps> = ({
  hotelId,
  onVoucherSelect,
  className = ''
}) => {
  const { vouchers, loading, error } = useAvailableVouchers(hotelId);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getDiscountText = (voucher: VoucherResponse) => {
    if (voucher.discountType === DiscountType.PERCENTAGE) {
      const maxText = voucher.maxDiscount ? ` (tối đa ${formatCurrency(voucher.maxDiscount)})` : '';
      return `${voucher.discountValue}%${maxText}`;
    }
    return formatCurrency(voucher.discountValue);
  };

  const getRemainingUsage = (voucher: VoucherResponse) => {
    if (!voucher.usageLimit) return 'Không giới hạn';
    const remaining = voucher.usageLimit - voucher.usageCount;
    return `${remaining} lượt còn lại`;
  };

  if (loading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="space-y-2">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <Tag size={24} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">Không thể tải voucher</p>
        </div>
      </div>
    );
  }

  if (vouchers.length === 0) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <Tag size={24} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">Không có voucher nào khả dụng cho khách sạn này</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center mb-3">
        <Tag size={20} className="text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Voucher khả dụng</h3>
      </div>

      <div className="space-y-3">
        {vouchers.map((voucher) => (
          <div
            key={voucher.id}
            className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onVoucherSelect?.(voucher.code)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    {voucher.code}
                  </span>
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    {voucher.name}
                  </span>
                </div>

                <div className="text-sm text-gray-600 mb-2">
                  {voucher.description}
                </div>

                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Percent size={12} className="mr-1 text-green-600" />
                    <span>Giảm {getDiscountText(voucher)}</span>
                  </div>

                  <div className="flex items-center">
                    <Users size={12} className="mr-1 text-blue-600" />
                    <span>{getRemainingUsage(voucher)}</span>
                  </div>

                  <div className="flex items-center">
                    <Clock size={12} className="mr-1 text-orange-600" />
                    <span>Đến {formatDate(voucher.endDate)}</span>
                  </div>
                </div>

                {voucher.minBookingValue && (
                  <div className="mt-1 text-xs text-gray-500">
                    Áp dụng cho đơn từ {formatCurrency(voucher.minBookingValue)}
                  </div>
                )}
              </div>

              <div className="ml-3 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onVoucherSelect?.(voucher.code);
                  }}
                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 text-xs text-gray-500 text-center">
        Nhấp vào voucher để áp dụng
      </div>
    </div>
  );
};

export default AvailableVouchers; 