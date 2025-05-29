import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Download, Filter, FileText, Calendar, DollarSign, User, Building, Check, X, Clock } from 'lucide-react';

interface Invoice {
  id: string;
  bookingId: string;
  guestName: string;
  guestId: string;
  propertyName: string;
  propertyId: string;
  ownerName: string;
  ownerId: string;
  amount: number;
  commission: {
    rate: number;
    amount: number;
    ownerAmount: number;
    platformAmount: number;
    status: 'pending' | 'paid' | 'processing';
  };
  status: 'paid' | 'pending' | 'cancelled' | 'refunded';
  paymentMethod: string;
  paymentDate?: string;
  issueDate: string;
  dueDate: string;
}

const AdminInvoices: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Sample invoices data
  const invoices: Invoice[] = [
    {
      id: 'INV-001',
      bookingId: 'BK-001',
      guestName: 'Nguyễn Văn An',
      guestId: 'USER-001',
      propertyName: 'Vinpearl Resort & Spa',
      propertyId: 'PROP-001',
      ownerName: 'Công ty CP Vinpearl',
      ownerId: 'OWN-001',
      amount: 7500000,
      commission: {
        rate: 15,
        amount: 1125000,
        ownerAmount: 6375000,
        platformAmount: 1125000,
        status: 'paid'
      },
      status: 'paid',
      paymentMethod: 'Credit Card',
      paymentDate: '2023-09-20',
      issueDate: '2023-09-20',
      dueDate: '2023-09-27'
    },
    {
      id: 'INV-002',
      bookingId: 'BK-002',
      guestName: 'Trần Thị Bình',
      guestId: 'USER-002',
      propertyName: 'Metropole Hanoi',
      propertyId: 'PROP-002',
      ownerName: 'Công ty TNHH Metropole',
      ownerId: 'OWN-002',
      amount: 6400000,
      commission: {
        rate: 12,
        amount: 768000,
        ownerAmount: 5632000,
        platformAmount: 768000,
        status: 'pending'
      },
      status: 'pending',
      paymentMethod: 'Bank Transfer',
      issueDate: '2023-10-01',
      dueDate: '2023-10-08'
    },
    {
      id: 'INV-003',
      bookingId: 'BK-003',
      guestName: 'Lê Văn Cường',
      guestId: 'USER-003',
      propertyName: 'Mường Thanh Luxury',
      propertyId: 'PROP-003',
      ownerName: 'Tập đoàn Mường Thanh',
      ownerId: 'OWN-003',
      amount: 8400000,
      commission: {
        rate: 10,
        amount: 840000,
        ownerAmount: 7560000,
        platformAmount: 840000,
        status: 'paid'
      },
      status: 'paid',
      paymentMethod: 'Credit Card',
      paymentDate: '2023-08-15',
      issueDate: '2023-08-15',
      dueDate: '2023-08-22'
    },
    {
      id: 'INV-004',
      bookingId: 'BK-004',
      guestName: 'Phạm Thị Dung',
      guestId: 'USER-004',
      propertyName: 'Vinpearl Resort & Spa',
      propertyId: 'PROP-001',
      ownerName: 'Công ty CP Vinpearl',
      ownerId: 'OWN-001',
      amount: 3600000,
      commission: {
        rate: 15,
        amount: 540000,
        ownerAmount: 3060000,
        platformAmount: 540000,
        status: 'processing'
      },
      status: 'refunded',
      paymentMethod: 'Credit Card',
      paymentDate: '2023-10-12',
      issueDate: '2023-10-10',
      dueDate: '2023-10-17'
    },
    {
      id: 'INV-005',
      bookingId: 'BK-005',
      guestName: 'Hoàng Văn Em',
      guestId: 'USER-005',
      propertyName: 'Metropole Hanoi',
      propertyId: 'PROP-002',
      ownerName: 'Công ty TNHH Metropole',
      ownerId: 'OWN-002',
      amount: 9600000,
      commission: {
        rate: 12,
        amount: 1152000,
        ownerAmount: 8448000,
        platformAmount: 1152000,
        status: 'paid'
      },
      status: 'paid',
      paymentMethod: 'Bank Transfer',
      paymentDate: '2023-10-06',
      issueDate: '2023-10-05',
      dueDate: '2023-10-12'
    },
    {
      id: 'INV-006',
      bookingId: 'BK-006',
      guestName: 'Ngô Thị Phương',
      guestId: 'USER-006',
      propertyName: 'Fusion Maia Resort',
      propertyId: 'PROP-004',
      ownerName: 'Công ty CP Fusion',
      ownerId: 'OWN-004',
      amount: 12500000,
      commission: {
        rate: 18,
        amount: 2250000,
        ownerAmount: 10250000,
        platformAmount: 2250000,
        status: 'paid'
      },
      status: 'paid',
      paymentMethod: 'Credit Card',
      paymentDate: '2023-10-13',
      issueDate: '2023-10-12',
      dueDate: '2023-10-19'
    },
    {
      id: 'INV-007',
      bookingId: 'BK-007',
      guestName: 'Đỗ Văn Giang',
      guestId: 'USER-007',
      propertyName: 'Pullman Saigon',
      propertyId: 'PROP-005',
      ownerName: 'Tập đoàn Accor',
      ownerId: 'OWN-005',
      amount: 8400000,
      commission: {
        rate: 15,
        amount: 1260000,
        ownerAmount: 7140000,
        platformAmount: 1260000,
        status: 'pending'
      },
      status: 'pending',
      paymentMethod: 'Bank Transfer',
      issueDate: '2023-10-15',
      dueDate: '2023-10-22'
    },
    {
      id: 'INV-008',
      bookingId: 'BK-008',
      guestName: 'Vũ Thị Hương',
      guestId: 'USER-008',
      propertyName: 'Sapa Homestay',
      propertyId: 'PROP-006',
      ownerName: 'Nguyễn Văn Hùng',
      ownerId: 'OWN-006',
      amount: 2400000,
      commission: {
        rate: 10,
        amount: 240000,
        ownerAmount: 2160000,
        platformAmount: 240000,
        status: 'pending'
      },
      status: 'paid',
      paymentMethod: 'Credit Card',
      paymentDate: '2023-10-19',
      issueDate: '2023-10-18',
      dueDate: '2023-10-25'
    }
  ];

  const itemsPerPage = 5;

  // Filter invoices based on search term, status, and date
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    // Date filtering logic
    let matchesDate = true;
    const today = new Date();
    const issueDateObj = new Date(invoice.issueDate);
    const dueDateObj = new Date(invoice.dueDate);
    
    if (dateFilter === 'thisMonth') {
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      matchesDate = issueDateObj.getMonth() === currentMonth && issueDateObj.getFullYear() === currentYear;
    } else if (dateFilter === 'lastMonth') {
      const lastMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
      const lastMonthYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
      matchesDate = issueDateObj.getMonth() === lastMonth && issueDateObj.getFullYear() === lastMonthYear;
    } else if (dateFilter === 'overdue') {
      matchesDate = dueDateObj < today && invoice.status === 'pending';
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const handleViewInvoice = (invoiceId: string) => {
    navigate(`/admin/invoices/${invoiceId}`);
  };

  const handleViewBooking = (bookingId: string) => {
    navigate(`/admin/bookings/${bookingId}`);
  };

  const handleViewGuest = (guestId: string) => {
    navigate(`/admin/users/${guestId}`);
  };

  const handleViewProperty = (propertyId: string) => {
    navigate(`/admin/hotels/${propertyId}`);
  };

  const handleViewOwner = (ownerId: string) => {
    navigate(`/admin/users/${ownerId}`);
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    // Download invoice logic would go here
    alert(`Đã tải xuống hóa đơn có ID: ${invoiceId}`);
  };

  const handleExportInvoices = () => {
    // Export invoices logic would go here
    alert('Đã xuất danh sách hóa đơn');
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
          <h1 className="text-xl sm:text-2xl font-bold">Quản lý hóa đơn</h1>
          <button
            onClick={handleExportInvoices}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Download size={20} className="mr-2" />
            Xuất dữ liệu
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Tìm kiếm theo mã hóa đơn, đặt phòng, tên khách, khách sạn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-gray-400 mr-2" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="paid">Đã thanh toán</option>
                  <option value="pending">Chờ thanh toán</option>
                  <option value="cancelled">Đã hủy</option>
                  <option value="refunded">Đã hoàn tiền</option>
                </select>
              </div>
              <div className="flex items-center">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tất cả thời gian</option>
                  <option value="thisMonth">Tháng này</option>
                  <option value="lastMonth">Tháng trước</option>
                  <option value="overdue">Quá hạn</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hóa đơn
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách sạn
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chủ khách sạn
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số tiền
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hoa hồng
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-500 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{invoice.id}</div>
                          <button 
                            onClick={() => handleViewBooking(invoice.bookingId)}
                            className="text-xs text-blue-600 hover:text-blue-900"
                          >
                            {invoice.bookingId}
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Ngày: {formatDate(invoice.issueDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleViewGuest(invoice.guestId)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <User size={14} className="mr-1" />
                        {invoice.guestName}
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
                      <button 
                        onClick={() => handleViewOwner(invoice.ownerId)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Building size={14} className="mr-1" />
                        {invoice.ownerName}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(invoice.amount)}</div>
                      <div className="text-xs text-gray-500">
                        {invoice.paymentMethod}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(invoice.commission.amount)} ({invoice.commission.rate}%)</div>
                      <div className="flex items-center mt-1">
                        <Clock size={14} className="mr-1 text-gray-500" />
                        {getCommissionStatusBadge(invoice.commission.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="mb-1">{getStatusBadge(invoice.status)}</div>
                      <div className="text-xs text-gray-500">
                        Hạn: {formatDate(invoice.dueDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewInvoice(invoice.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Tải xuống"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Trước
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Sau
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Hiển thị <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> đến{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, filteredInvoices.length)}
                    </span>{' '}
                    trong tổng số <span className="font-medium">{filteredInvoices.length}</span> hóa đơn
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Trang trước</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === index + 1
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Trang sau</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {paginatedInvoices.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-xl font-medium text-gray-900 mb-2">Không tìm thấy hóa đơn nào</h3>
            <p className="text-gray-600">Không có hóa đơn nào phù hợp với tiêu chí tìm kiếm của bạn.</p>
          </div>
        )}
      </div>);
};

export default AdminInvoices;

