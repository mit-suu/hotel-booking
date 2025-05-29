import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Printer, Download, Mail, User, Building, 
  Calendar, DollarSign, Percent, Check, X, Clock, Edit, Save
} from 'lucide-react';

interface InvoiceDetail {
  id: string;
  bookingId: string;
  guestName: string;
  guestId: string;
  guestEmail: string;
  guestPhone: string;
  guestAddress?: string;
  propertyName: string;
  propertyId: string;
  propertyAddress: string;
  ownerName: string;
  ownerId: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerAddress: string;
  ownerTaxId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: {
    adults: number;
    children: number;
  };
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  commission: {
    rate: number;
    amount: number;
    ownerAmount: number;
    platformAmount: number;
    status: 'pending' | 'paid' | 'processing';
    paidDate?: string;
  };
  status: 'paid' | 'pending' | 'cancelled' | 'refunded';
  paymentMethod: string;
  paymentDate?: string;
  issueDate: string;
  dueDate: string;
  notes?: string;
}

const AdminInvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');

  // Sample invoice data - in a real app, you would fetch this from an API
  const invoice: InvoiceDetail = {
    id: 'INV-001',
    bookingId: 'BK-001',
    guestName: 'Nguyễn Văn An',
    guestId: 'USER-001',
    guestEmail: 'nguyenvanan@example.com',
    guestPhone: '0901234567',
    guestAddress: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    propertyName: 'Vinpearl Resort & Spa',
    propertyId: 'PROP-001',
    propertyAddress: 'Vinpearl Resort, Nha Trang, Khánh Hòa',
    ownerName: 'Công ty CP Vinpearl',
    ownerId: 'OWN-001',
    ownerEmail: 'contact@vinpearl.com',
    ownerPhone: '1900 2345',
    ownerAddress: '7 Đường Trường Sa, Vĩnh Hòa, Nha Trang, Khánh Hòa',
    ownerTaxId: '0123456789',
    roomName: 'Deluxe Ocean View',
    checkIn: '2023-10-15',
    checkOut: '2023-10-18',
    nights: 3,
    guests: {
      adults: 2,
      children: 0
    },
    items: [
      {
        description: 'Deluxe Ocean View - 3 đêm',
        quantity: 3,
        unitPrice: 2300000,
        amount: 6900000
      },
      {
        description: 'Phí dịch vụ',
        quantity: 1,
        unitPrice: 300000,
        amount: 300000
      },
      {
        description: 'Thuế VAT (10%)',
        quantity: 1,
        unitPrice: 300000,
        amount: 300000
      }
    ],
    subtotal: 7200000,
    taxRate: 10,
    taxAmount: 300000,
    totalAmount: 7500000,
    commission: {
      rate: 15,
      amount: 1125000,
      ownerAmount: 6375000,
      platformAmount: 1125000,
      status: 'paid',
      paidDate: '2023-09-25'
    },
    status: 'paid',
    paymentMethod: 'Credit Card',
    paymentDate: '2023-09-20',
    issueDate: '2023-09-20',
    dueDate: '2023-09-27',
    notes: 'Khách hàng VIP, đã ở nhiều lần tại khách sạn.'
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const handleGoBack = () => {
    navigate('/admin/invoices');
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleDownloadInvoice = () => {
    // Download invoice logic would go here
    alert(`Đã tải xuống hóa đơn có ID: ${id}`);
  };

  const handleSendInvoice = () => {
    // Send invoice logic would go here
    alert(`Đã gửi hóa đơn đến khách hàng: ${invoice.guestEmail}`);
  };

  const handleViewBooking = () => {
    navigate(`/admin/bookings/${invoice.bookingId}`);
  };

  const handleViewGuest = () => {
    navigate(`/admin/users/${invoice.guestId}`);
  };

  const handleViewProperty = () => {
    navigate(`/admin/hotels/${invoice.propertyId}`);
  };

  const handleViewOwner = () => {
    navigate(`/admin/users/${invoice.ownerId}`);
  };

  const handleSaveNotes = () => {
    // Save notes logic would go here
    alert('Đã lưu ghi chú');
    setIsEditingNotes(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Đã thanh toán</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Chờ thanh toán</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Đã hủy</span>;
      case 'refunded':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Đã hoàn tiền</span>;
      default:
        return null;
    }
  };

  const getCommissionStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Đã thanh toán</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Chờ thanh toán</span>;
      case 'processing':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Đang xử lý</span>;
      default:
        return null;
    }
  };

  return (<div className="w-full">
        <div className="flex items-center mb-6">
          <button
            onClick={handleGoBack}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">Hóa đơn #{invoice.id}</h1>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={handlePrintInvoice}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
          >
            <Printer size={18} className="mr-2" />
            In hóa đơn
          </button>
          <button
            onClick={handleDownloadInvoice}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Download size={18} className="mr-2" />
            Tải hóa đơn
          </button>
          <button
            onClick={handleSendInvoice}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Mail size={18} className="mr-2" />
            Gửi hóa đơn
          </button>
          <button
            onClick={handleViewBooking}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
          >
            <FileText size={18} className="mr-2" />
            Xem đặt phòng
          </button>
        </div>

        {/* Invoice Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Trạng thái hóa đơn</h2>
              <div className="flex flex-wrap gap-2 mb-2">
                {getStatusBadge(invoice.status)}
              </div>
              <p className="text-gray-600">Ngày phát hành: {formatDate(invoice.issueDate)}</p>
              <p className="text-gray-600">Hạn thanh toán: {formatDate(invoice.dueDate)}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-600">Tổng thanh toán</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(invoice.totalAmount)}</p>
              {invoice.status === 'paid' && invoice.paymentDate && (
                <p className="text-sm text-gray-500">Thanh toán ngày {formatDate(invoice.paymentDate)}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Guest Information */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <User size={20} className="mr-2 text-blue-600" />
                Thông tin khách hàng
              </h2>
              <button
                onClick={handleViewGuest}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Xem hồ sơ
              </button>
            </div>
            <div className="space-y-3">
              <p className="font-medium text-gray-900">{invoice.guestName}</p>
              <p className="text-gray-600">{invoice.guestEmail}</p>
              <p className="text-gray-600">{invoice.guestPhone}</p>
              {invoice.guestAddress && (
                <p className="text-gray-600">{invoice.guestAddress}</p>
              )}
            </div>
          </div>

          {/* Property Information */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Building size={20} className="mr-2 text-blue-600" />
                Thông tin khách sạn
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={handleViewProperty}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Xem khách sạn
                </button>
                <button
                  onClick={handleViewOwner}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Xem chủ sở hữu
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <p className="font-medium text-gray-900">{invoice.propertyName}</p>
              <p className="text-gray-600">{invoice.propertyAddress}</p>
              <p className="text-gray-600">Chủ sở hữu: {invoice.ownerName}</p>
              <p className="text-gray-600">Mã số thuế: {invoice.ownerTaxId}</p>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Calendar size={20} className="mr-2 text-blue-600" />
            Chi tiết đặt phòng
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-gray-600">Mã đặt phòng:</p>
              <p className="font-medium">{invoice.bookingId}</p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600">Phòng:</p>
              <p className="font-medium">{invoice.roomName}</p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600">Số khách:</p>
              <p className="font-medium">{invoice.guests.adults} người lớn, {invoice.guests.children} trẻ em</p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600">Ngày nhận phòng:</p>
              <p className="font-medium">{formatDate(invoice.checkIn)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600">Ngày trả phòng:</p>
              <p className="font-medium">{formatDate(invoice.checkOut)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600">Số đêm:</p>
              <p className="font-medium">{invoice.nights} đêm</p>
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FileText size={20} className="mr-2 text-blue-600" />
            Chi tiết hóa đơn
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mô tả
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số lượng
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đơn giá
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thành tiền
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                    Tổng cộng:
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                    {formatCurrency(invoice.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Commission Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Percent size={20} className="mr-2 text-blue-600" />
            Chi tiết hoa hồng
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <div className="space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Tỷ lệ hoa hồng:</span>
                  <span className="font-medium">{invoice.commission.rate}%</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Số tiền hoa hồng:</span>
                  <span className="font-medium">{formatCurrency(invoice.commission.amount)}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Số tiền chủ khách sạn nhận:</span>
                  <span className="font-medium">{formatCurrency(invoice.commission.ownerAmount)}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Số tiền nền tảng nhận:</span>
                  <span className="font-medium">{formatCurrency(invoice.commission.platformAmount)}</span>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Trạng thái thanh toán hoa hồng</h3>
                <div className="flex items-center mb-2">
                  <Clock size={16} className="mr-2 text-gray-500" />
                  <span className="mr-2">Trạng thái:</span>
                  {getCommissionStatusBadge(invoice.commission.status)}
                </div>
                {invoice.commission.paidDate && (
                  <p className="text-gray-600">
                    Ngày thanh toán: {formatDate(invoice.commission.paidDate)}
                  </p>
                )}
                {invoice.commission.status === 'pending' && (
                  <div className="mt-4">
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center">
                      <Check size={16} className="mr-2" />
                      Đánh dấu đã thanh toán
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <DollarSign size={20} className="mr-2 text-blue-600" />
            Thông tin thanh toán
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <div className="space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Phương thức thanh toán:</span>
                  <span className="font-medium">{invoice.paymentMethod}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Trạng thái thanh toán:</span>
                  <span>{getStatusBadge(invoice.status)}</span>
                </div>
                {invoice.paymentDate && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Ngày thanh toán:</span>
                    <span className="font-medium">{formatDate(invoice.paymentDate)}</span>
                  </div>
                )}
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Hạn thanh toán:</span>
                  <span className="font-medium">{formatDate(invoice.dueDate)}</span>
                </div>
              </div>
            </div>
            <div>
              {invoice.status === 'pending' && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-medium text-yellow-800 mb-2">Hóa đơn chưa thanh toán</h3>
                  <p className="text-yellow-700 mb-4">
                    Hóa đơn này đang chờ thanh toán. Hạn thanh toán là {formatDate(invoice.dueDate)}.
                  </p>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center">
                      <Check size={16} className="mr-2" />
                      Đánh dấu đã thanh toán
                    </button>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center">
                      <X size={16} className="mr-2" />
                      Hủy hóa đơn
                    </button>
                  </div>
                </div>
              )}
              {invoice.status === 'paid' && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">Hóa đơn đã thanh toán</h3>
                  <p className="text-green-700">
                    Hóa đơn này đã được thanh toán đầy đủ vào ngày {formatDate(invoice.paymentDate || '')}.
                  </p>
                </div>
              )}
              {invoice.status === 'cancelled' && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-medium text-red-800 mb-2">Hóa đơn đã hủy</h3>
                  <p className="text-red-700">
                    Hóa đơn này đã bị hủy.
                  </p>
                </div>
              )}
              {invoice.status === 'refunded' && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">Hóa đơn đã hoàn tiền</h3>
                  <p className="text-gray-700">
                    Hóa đơn này đã được hoàn tiền.
                  </p>
                </div>
              )}
            </div>
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
                value={notes || invoice.notes || ''}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                placeholder="Thêm ghi chú về hóa đơn này..."
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
              {invoice.notes || 'Chưa có ghi chú nào.'}
            </p>
          )}
        </div>
      </div>);
};

export default AdminInvoiceDetail;

