import { ArrowRight, Banknote, CreditCard, QrCode, Smartphone, X } from 'lucide-react';
import React, { useState } from 'react';
import { PaymentBankOption, VNPAY_BANK_OPTIONS } from '../types/vnpay';

interface VNPayPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bankCode: string) => void;
  totalAmount: number;
  orderInfo: string;
  loading?: boolean;
}

const VNPayPaymentModal: React.FC<VNPayPaymentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  totalAmount,
  orderInfo,
  loading = false
}) => {
  const [selectedBank, setSelectedBank] = useState<string>('');

  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getPaymentIcon = (bankCode: string) => {
    switch (bankCode) {
      case 'VNPAYQR':
        return <QrCode className="h-6 w-6" />;
      case 'VNBANK':
        return <Banknote className="h-6 w-6" />;
      case 'INTCARD':
      case 'VISA':
      case 'MASTERCARD':
      case 'JCB':
        return <CreditCard className="h-6 w-6" />;
      default:
        return <Smartphone className="h-6 w-6" />;
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedBank);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Thanh toán VNPay</h2>
            <p className="text-sm text-gray-600 mt-1">Chọn phương thức thanh toán</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Order Summary */}
        <div className="p-6 border-b border-gray-200 bg-blue-50">
          <h3 className="font-semibold text-blue-900 mb-2">Thông tin đơn hàng</h3>
          <div className="space-y-1 text-sm">
            <p className="text-blue-800">{orderInfo}</p>
            <p className="text-lg font-bold text-blue-900">
              Tổng tiền: {formatCurrency(totalAmount)}
            </p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Chọn hình thức thanh toán</h3>
          <div className="space-y-3">
            {(() => {
              const bankOption = VNPAY_BANK_OPTIONS.find(option => option.code === 'VNBANK');
              return bankOption ? (
                <label
                  key={bankOption.code}
                  className={`block border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedBank === bankOption.code
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="radio"
                    name="bankCode"
                    value={bankOption.code}
                    checked={selectedBank === bankOption.code}
                    onChange={(e) => !loading && setSelectedBank(e.target.value)}
                    disabled={loading}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div className={`mr-3 ${
                      selectedBank === bankOption.code ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      {getPaymentIcon(bankOption.code)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {bankOption.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {bankOption.description}
                      </div>
                    </div>
                    {selectedBank === bankOption.code && (
                      <div className="ml-3 text-blue-600">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </label>
              ) : null;
            })()}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Hủy
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang xử lý...
              </>
            ) : (
              <>
                Tiếp tục thanh toán
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VNPayPaymentModal; 