// VNPay Payment Types
export interface VNPayPaymentRequest {
  bookingId: string;
  amount: number;
  orderInfo: string;
  bankCode?: string;
  locale?: string;
}

export interface VNPayPaymentResponse {
  code: string;
  message: string;
  paymentUrl: string;
}

export interface VNPayCallbackRequest {
  vnp_TmnCode: string;
  vnp_Amount: number;
  vnp_BankCode?: string;
  vnp_BankTranNo?: string;
  vnp_CardType?: string;
  vnp_PayDate?: string;
  vnp_OrderInfo?: string;
  vnp_TransactionNo?: string;
  vnp_ResponseCode: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHashType?: string;
  vnp_SecureHash: string;
}

export interface VNPayReturnParams {
  vnp_Amount?: string;
  vnp_BankCode?: string;
  vnp_BankTranNo?: string;
  vnp_CardType?: string;
  vnp_OrderInfo?: string;
  vnp_PayDate?: string;
  vnp_ResponseCode?: string;
  vnp_TmnCode?: string;
  vnp_TransactionNo?: string;
  vnp_TransactionStatus?: string;
  vnp_TxnRef?: string;
  vnp_SecureHash?: string;
  vnp_SecureHashType?: string;
}

export interface PaymentBankOption {
  code: string;
  name: string;
  logo?: string;
  description?: string;
}

export const VNPAY_BANK_OPTIONS: PaymentBankOption[] = [
  { code: '', name: 'Tất cả phương thức thanh toán', description: 'VNPay sẽ hiển thị tất cả phương thức có sẵn' },
  { code: 'VNPAYQR', name: 'Thanh toán QR Code', description: 'Quét mã QR để thanh toán' },
  { code: 'VNBANK', name: 'Chuyển khoản ngân hàng', description: 'Chuyển khoản qua tài khoản ngân hàng' },
  { code: 'INTCARD', name: 'Thẻ quốc tế', description: 'Visa, Mastercard, JCB' },
  { code: 'VISA', name: 'Thẻ Visa', description: 'Thanh toán bằng thẻ Visa' },
  { code: 'MASTERCARD', name: 'Thẻ Mastercard', description: 'Thanh toán bằng thẻ Mastercard' },
  { code: 'JCB', name: 'Thẻ JCB', description: 'Thanh toán bằng thẻ JCB' },
];

export const VNPAY_RESPONSE_CODES: Record<string, string> = {
  '00': 'Giao dịch thành công',
  '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
  '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
  '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
  '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
  '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
  '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.',
  '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
  '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
  '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
  '75': 'Ngân hàng thanh toán đang bảo trì.',
  '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch',
  '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)'
}; 