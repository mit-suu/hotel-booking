import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Printer, Download, Mail, Building, User, 
  Calendar, DollarSign, Percent, Check, X, Clock, Edit, Save, Send
} from 'lucide-react';

interface CommissionPaymentDetail {
  id: string;
  period: {
    startDate: string;
    endDate: string;
  };
  ownerName: string;
  ownerId: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerAddress: string;
  ownerTaxId: string;
  ownerBankInfo: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    branch?: string;
    swiftCode?: string;
  };
  totalBookings: number;
  totalAmount: number;
  commissionAmount: number;
  ownerAmount: number;
  platformAmount: number;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  paymentDate?: string;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  invoices: {
    id: string;
    bookingId: string;
    propertyName: string;
    propertyId: string;
    checkIn: string;
    checkOut: string;
    guestName: string;
    amount: number;
    commissionAmount: number;
    commissionRate: number;
    date: string;
  }[];
  history: {
    date: string;
    action: string;
    user: string;
    notes?: string;
  }[];
}

const AdminCommissionPaymentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    paymentMethod: '',
    transactionId: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });

  // Sample commission payment data - in a real app, you would fetch this from an API
  const payment: CommissionPaymentDetail = {
    id: 'CP-001',
    period: {
      startDate: '2023-09-01',
      endDate: '2023-09-30'
    },
    ownerName: 'Công ty CP Vinpearl',
    ownerId: 'OWN-001',
    ownerEmail: 'finance@vinpearl.com',
    ownerPhone: '1900 2345',
    ownerAddress: '7 Đường Trường Sa, Vĩnh Hòa, Nha Trang, Khánh Hòa',
    ownerTaxId: '0123456789',
    ownerBankInfo: {
      bankName: 'Vietcombank',
      accountNumber: '1234567890',
      accountName: 'CÔNG TY CỔ PHẦN VINPEARL',
      branch: 'Chi nhánh Nha Trang',
      swiftCode: 'BFTVVNVX'
    },
    totalBookings: 45,
    totalAmount: 112500000,
    commissionAmount: 16875000,
    ownerAmount: 95625000,
    platformAmount: 16875000,
    status: 'pending',
    createdAt: '2023-10-01',
    updatedAt: '2023-10-01',
    notes: 'Thanh toán hoa hồng tháng 9/2023 cho Vinpearl',
    invoices: [
      {
        id: 'INV-001',
        bookingId: 'BK-001',
        propertyName: 'Vinpearl Resort & Spa Nha Trang',
        propertyId: 'PROP-001',
        checkIn: '2023-09-15',
        checkOut: '2023-09-18',
        guestName: 'Nguyễn Văn An',
        amount: 7500000,
        commissionAmount: 1125000,
        commissionRate: 15,
        date: '2023-09-20'
      },
      {
        id: 'INV-004',
        bookingId: 'BK-004',
        propertyName: 'Vinpearl Resort & Spa Nha Trang',
        propertyId: 'PROP-001',
        checkIn: '2023-09-10',
        checkOut: '2023-09-12',
        guestName: 'Phạm Thị Dung',
        amount: 3600000,
        commissionAmount: 540000,
        commissionRate: 15,
        date: '2023-09-12'
      },
      {
        id: 'INV-009',
        bookingId: 'BK-009',
        propertyName: 'Vinpearl Resort & Spa Đà Nẵng',
        propertyId: 'PROP-002',
        checkIn: '2023-09-12',
        checkOut: '2023-09-15',
        guestName: 'Trần Văn Bình',
        amount: 5400000,
        commissionAmount: 810000,
        commissionRate: 15,
        date: '2023-09-15'
      }
    ],
    history: [
      {
        date: '2023-10-01 08:30:00',
        action: 'Tạo thanh toán',
        user: 'Admin',
        notes: 'Tạo thanh toán hoa hồng tháng 9/2023'
      },
      {
        date: '2023-10-01 09:15:00',
        action: 'Gửi thông báo',
        user: 'System',
        notes: 'Đã gửi email thông báo thanh toán đến chủ khách sạn'
      }
    ]
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const formatDateTime = (dateTimeString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateTimeString).toLocaleString('vi-VN', options);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const handleGoBack = () => {
    navigate('/admin/commission-payments');
  };

  const handlePrintPayment = () => {
    window.print();
  };

  const handleDownloadPayment = () => {
    // Download payment logic would go here
    alert(`Đã tải xuống thanh toán có ID: ${id}`);
  };

  const handleSendNotification = () => {
    // Send notification logic would go here
    alert(`Đã gửi thông báo thanh toán đến: ${payment.ownerEmail}`);
  };

  const handleViewOwner = () => {
    navigate(`/admin/users/${payment.ownerId}`);
  };

  const handleViewInvoice = (invoiceId: string) => {
    navigate(`/admin/invoices/${invoiceId}`);
  };

  const handleViewBooking = (bookingId: string) => {
    navigate(`/admin/bookings/${bookingId}`);
  };

  const handleViewProperty = (propertyId: string) => {
    navigate(`/admin/hotels/${propertyId}`);
  };

  const handleSaveNotes = () => {
    // Save notes logic would go here
    alert('Đã lưu ghi chú');
    setIsEditingNotes(false);
  };

  const handleProcessPayment = () => {
    // Process payment logic would go here
    alert('Đã bắt đầu xử lý thanh toán');
  };

  const handleMarkAsPaid = () => {
    setIsEditingPayment(true);
  };

  const handleSavePaymentDetails = () => {
    // Save payment details logic would go here
    alert('Đã đánh dấu thanh toán là đã thanh toán');
    setIsEditingPayment(false);
  };

  const handleCancelPayment = () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy thanh toán này không?')) {
      // Cancel payment logic would go here
      alert('Đã hủy thanh toán');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Đã thanh toán</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Chờ thanh toán</span>;
      case 'processing':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Đang xử lý</span>;
      case 'failed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Thất bại</span>;
      default:
        return null;
    }
  };

  const getPeriodLabel = (startDate: string, endDate: string) => {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  return (<div className="w-full">
        <div className="flex items-center mb-6">
          <button
            onClick={handleGoBack}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">Thanh toán hoa hồng #{payment.id}</h1>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={handlePrintPayment}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
          >
            <Printer size={18} className="mr-2" />
            In thanh toán
          </button>
          <button
            onClick={handleDownloadPayment}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Download size={18} className="mr-2" />
            Tải xuống
          </button>
          <button
            onClick={handleSendNotification}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Mail size={18} className="mr-2" />
            Gửi thông báo
          </button>
          {payment.status === 'pending' && (
            <button
              onClick={handleProcessPayment}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
            >
              <DollarSign size={18} className="mr-2" />
              Xử lý thanh toán
            </button>
          )}
          {payment.status === 'processing' && (
            <button
              onClick={handleMarkAsPaid}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Check size={18} className="mr-2" />
              Đánh dấu đã thanh toán
            </button>
          )}
          {(payment.status === 'pending' || payment.status === 'processing') && (
            <button
              onClick={handleCancelPayment}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <X size={18} className="mr-2" />
              Hủy thanh toán
            </button>
          )}
        </div>

        {/* Payment Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Trạng thái thanh toán</h2>
              <div className="flex flex-wrap gap-2 mb-2">
                {getStatusBadge(payment.status)}
              </div>
              <p className="text-gray-600">Kỳ thanh toán: {getPeriodLabel(payment.period.startDate, payment.period.endDate)}</p>
              <p className="text-gray-600">Ngày tạo: {formatDate(payment.createdAt)}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-600">Tổng thanh toán</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(payment.ownerAmount)}</p>
              <p className="text-sm text-gray-500">Hoa hồng: {formatCurrency(payment.commissionAmount)}</p>
              {payment.status === 'paid' && payment.paymentDate && (
                <p className="text-sm text-gray-500">Thanh toán ngày {formatDate(payment.paymentDate)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Mark as Paid Form */}
        {isEditingPayment && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Đánh dấu đã thanh toán</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phương thức thanh toán
                </label>
                <select
                  value={paymentDetails.paymentMethod}
                  onChange={(e) => setPaymentDetails({...paymentDetails, paymentMethod: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Chọn phương thức thanh toán --</option>
                  <option value="Bank Transfer">Chuyển khoản ngân hàng</option>
                  <option value="Cash">Tiền mặt</option>
                  <option value="Credit Card">Thẻ tín dụng</option>
                  <option value="PayPal">PayPal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã giao dịch
                </label>
                <input
                  type="text"
                  value={paymentDetails.transactionId}
                  onChange={(e) => setPaymentDetails({...paymentDetails, transactionId: e.target.value})}
                  placeholder="Nhập mã giao dịch"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày thanh toán
                </label>
                <input
                  type="date"
                  value={paymentDetails.paymentDate}
                  onChange={(e) => setPaymentDetails({...paymentDetails, paymentDate: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-2">
              <button
                onClick={() => setIsEditingPayment(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSavePaymentDetails}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Save size={18} className="mr-2" />
                Lưu
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Owner Information */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Building size={20} className="mr-2 text-blue-600" />
                Thông tin chủ khách sạn
              </h2>
              <button
                onClick={handleViewOwner}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Xem hồ sơ
              </button>
            </div>
            <div className="space-y-3">
              <p className="font-medium text-gray-900">{payment.ownerName}</p>
              <p className="text-gray-600">{payment.ownerEmail}</p>
              <p className="text-gray-600">{payment.ownerPhone}</p>
              <p className="text-gray-600">{payment.ownerAddress}</p>
              <p className="text-gray-600">Mã số thuế: {payment.ownerTaxId}</p>
            </div>
          </div>

          {/* Bank Information */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <DollarSign size={20} className="mr-2 text-blue-600" />
              Thông tin ngân hàng
            </h2>
            <div className="space-y-3">
              <p className="font-medium text-gray-900">{payment.ownerBankInfo.bankName}</p>
              <p className="text-gray-600">Số tài khoản: {payment.ownerBankInfo.accountNumber}</p>
              <p className="text-gray-600">Tên tài khoản: {payment.ownerBankInfo.accountName}</p>
              {payment.ownerBankInfo.branch && (
                <p className="text-gray-600">Chi nhánh: {payment.ownerBankInfo.branch}</p>
              )}
              {payment.ownerBankInfo.swiftCode && (
                <p className="text-gray-600">Mã SWIFT: {payment.ownerBankInfo.swiftCode}</p>
              )}
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Percent size={20} className="mr-2 text-blue-600" />
            Chi tiết thanh toán
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-gray-600">Tổng số đặt phòng:</p>
              <p className="font-medium">{payment.totalBookings}</p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600">Tổng doanh thu:</p>
              <p className="font-medium">{formatCurrency(payment.totalAmount)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600">Số hóa đơn:</p>
              <p className="font-medium">{payment.invoices.length}</p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600">Hoa hồng:</p>
              <p className="font-medium">{formatCurrency(payment.commissionAmount)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600">Số tiền nền tảng:</p>
              <p className="font-medium">{formatCurrency(payment.platformAmount)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600">Số tiền chủ khách sạn:</p>
              <p className="font-medium">{formatCurrency(payment.ownerAmount)}</p>
            </div>
          </div>
        </div>

        {/* Invoice List */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FileText size={20} className="mr-2 text-blue-600" />
            Danh sách hóa đơn
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã hóa đơn
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã đặt phòng
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách sạn
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số tiền
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hoa hồng
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payment.invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleViewInvoice(invoice.id)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-900"
                      >
                        {invoice.id}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleViewBooking(invoice.bookingId)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-900"
                      >
                        {invoice.bookingId}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleViewProperty(invoice.propertyId)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-900"
                      >
                        {invoice.propertyName}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{invoice.guestName}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(invoice.date)}</div>
                      <div className="text-xs text-gray-500">
                        {formatDate(invoice.checkIn)} - {formatDate(invoice.checkOut)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{formatCurrency(invoice.amount)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(invoice.commissionAmount)}</div>
                      <div className="text-xs text-gray-500">{invoice.commissionRate}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewInvoice(invoice.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <FileText size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-sm font-medium text-right">
                    Tổng cộng:
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {formatCurrency(payment.totalAmount)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {formatCurrency(payment.commissionAmount)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Clock size={20} className="mr-2 text-blue-600" />
            Lịch sử thanh toán
          </h2>
          <div className="space-y-4">
            {payment.history.map((item, index) => (
              <div key={index} className="flex items-start pb-4 border-b border-gray-200 last:border-0">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  {item.action.includes('Tạo') && <FileText size={20} className="text-blue-600" />}
                  {item.action.includes('Gửi') && <Send size={20} className="text-blue-600" />}
                  {item.action.includes('Xử lý') && <DollarSign size={20} className="text-blue-600" />}
                  {item.action.includes('Thanh toán') && <Check size={20} className="text-green-600" />}
                  {item.action.includes('Hủy') && <X size={20} className="text-red-600" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-900">{item.action}</p>
                    <p className="text-sm text-gray-500">{formatDateTime(item.date)}</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Người thực hiện: {item.user}</p>
                  {item.notes && (
                    <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Notes */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Edit size={20} className="mr-2 text-blue-600" />
              Ghi chú nội bộ
            </h2>
            {!isEditingNotes && (
              <button
                onClick={() => setIsEditingNotes(true)}
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <Edit size={16} className="mr-1" />
                Chỉnh sửa
              </button>
            )}
          </div>
          
          {isEditingNotes ? (
            <div>
              <textarea
                value={notes || payment.adminNotes || ''}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                placeholder="Thêm ghi chú về thanh toán này..."
              />
              <div className="flex justify-end mt-3 space-x-2">
                <button
                  onClick={() => setIsEditingNotes(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveNotes}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Save size={16} className="mr-2" />
                  Lưu
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg min-h-[60px]">
              {payment.adminNotes || 'Chưa có ghi chú nào.'}
            </p>
          )}
        </div>
      </div>);
};

export default AdminCommissionPaymentDetail;

