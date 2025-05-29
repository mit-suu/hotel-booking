import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, DollarSign, Calendar, Building, User, Check, Clock, Download, FileText, ChevronDown, ChevronUp, Plus, Send } from 'lucide-react';

interface CommissionPayment {
  id: string;
  period: {
    startDate: string;
    endDate: string;
  };
  ownerName: string;
  ownerId: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerBankInfo: {
    bankName: string;
    accountNumber: string;
    accountName: string;
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
  createdAt: string;
  updatedAt: string;
  invoices: {
    id: string;
    bookingId: string;
    propertyName: string;
    amount: number;
    commissionAmount: number;
    commissionRate: number;
    date: string;
  }[];
}

const AdminCommissionPayments: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [isSelectAll, setIsSelectAll] = useState(false);

  // Sample commission payments data
  const commissionPayments: CommissionPayment[] = [
    {
      id: 'CP-001',
      period: {
        startDate: '2023-09-01',
        endDate: '2023-09-30'
      },
      ownerName: 'Công ty CP Vinpearl',
      ownerId: 'OWN-001',
      ownerEmail: 'finance@vinpearl.com',
      ownerPhone: '1900 2345',
      ownerBankInfo: {
        bankName: 'Vietcombank',
        accountNumber: '1234567890',
        accountName: 'CÔNG TY CỔ PHẦN VINPEARL'
      },
      totalBookings: 45,
      totalAmount: 112500000,
      commissionAmount: 16875000,
      ownerAmount: 95625000,
      platformAmount: 16875000,
      status: 'paid',
      paymentDate: '2023-10-05',
      paymentMethod: 'Bank Transfer',
      transactionId: 'TRX-12345678',
      createdAt: '2023-10-01',
      updatedAt: '2023-10-05',
      invoices: [
        {
          id: 'INV-001',
          bookingId: 'BK-001',
          propertyName: 'Vinpearl Resort & Spa Nha Trang',
          amount: 7500000,
          commissionAmount: 1125000,
          commissionRate: 15,
          date: '2023-09-20'
        },
        {
          id: 'INV-004',
          bookingId: 'BK-004',
          propertyName: 'Vinpearl Resort & Spa Nha Trang',
          amount: 3600000,
          commissionAmount: 540000,
          commissionRate: 15,
          date: '2023-09-12'
        },
        {
          id: 'INV-009',
          bookingId: 'BK-009',
          propertyName: 'Vinpearl Resort & Spa Đà Nẵng',
          amount: 5400000,
          commissionAmount: 810000,
          commissionRate: 15,
          date: '2023-09-15'
        }
      ]
    },
    {
      id: 'CP-002',
      period: {
        startDate: '2023-09-01',
        endDate: '2023-09-30'
      },
      ownerName: 'Công ty TNHH Metropole',
      ownerId: 'OWN-002',
      ownerEmail: 'finance@metropole.com',
      ownerPhone: '024 3826 6919',
      ownerBankInfo: {
        bankName: 'BIDV',
        accountNumber: '0987654321',
        accountName: 'CÔNG TY TNHH METROPOLE'
      },
      totalBookings: 38,
      totalAmount: 96000000,
      commissionAmount: 11520000,
      ownerAmount: 84480000,
      platformAmount: 11520000,
      status: 'pending',
      createdAt: '2023-10-01',
      updatedAt: '2023-10-01',
      invoices: [
        {
          id: 'INV-002',
          bookingId: 'BK-002',
          propertyName: 'Metropole Hanoi',
          amount: 6400000,
          commissionAmount: 768000,
          commissionRate: 12,
          date: '2023-09-10'
        },
        {
          id: 'INV-005',
          bookingId: 'BK-005',
          propertyName: 'Metropole Hanoi',
          amount: 9600000,
          commissionAmount: 1152000,
          commissionRate: 12,
          date: '2023-09-18'
        }
      ]
    },
    {
      id: 'CP-003',
      period: {
        startDate: '2023-09-01',
        endDate: '2023-09-30'
      },
      ownerName: 'Tập đoàn Mường Thanh',
      ownerId: 'OWN-003',
      ownerEmail: 'finance@muongthanh.com',
      ownerPhone: '1800 1234',
      ownerBankInfo: {
        bankName: 'Techcombank',
        accountNumber: '9876543210',
        accountName: 'TẬP ĐOÀN MƯỜNG THANH'
      },
      totalBookings: 52,
      totalAmount: 126000000,
      commissionAmount: 12600000,
      ownerAmount: 113400000,
      platformAmount: 12600000,
      status: 'processing',
      createdAt: '2023-10-01',
      updatedAt: '2023-10-03',
      notes: 'Đang chờ xác nhận từ ngân hàng',
      invoices: [
        {
          id: 'INV-003',
          bookingId: 'BK-003',
          propertyName: 'Mường Thanh Luxury Đà Nẵng',
          amount: 8400000,
          commissionAmount: 840000,
          commissionRate: 10,
          date: '2023-09-15'
        },
        {
          id: 'INV-010',
          bookingId: 'BK-010',
          propertyName: 'Mường Thanh Grand Hà Nội',
          amount: 6200000,
          commissionAmount: 620000,
          commissionRate: 10,
          date: '2023-09-22'
        }
      ]
    },
    {
      id: 'CP-004',
      period: {
        startDate: '2023-09-01',
        endDate: '2023-09-30'
      },
      ownerName: 'Công ty CP Fusion',
      ownerId: 'OWN-004',
      ownerEmail: 'finance@fusion.com',
      ownerPhone: '028 3822 9999',
      ownerBankInfo: {
        bankName: 'VPBank',
        accountNumber: '1122334455',
        accountName: 'CÔNG TY CỔ PHẦN FUSION'
      },
      totalBookings: 32,
      totalAmount: 87500000,
      commissionAmount: 15750000,
      ownerAmount: 71750000,
      platformAmount: 15750000,
      status: 'paid',
      paymentDate: '2023-10-04',
      paymentMethod: 'Bank Transfer',
      transactionId: 'TRX-87654321',
      createdAt: '2023-10-01',
      updatedAt: '2023-10-04',
      invoices: [
        {
          id: 'INV-006',
          bookingId: 'BK-006',
          propertyName: 'Fusion Maia Resort',
          amount: 12500000,
          commissionAmount: 2250000,
          commissionRate: 18,
          date: '2023-09-13'
        }
      ]
    },
    {
      id: 'CP-005',
      period: {
        startDate: '2023-09-01',
        endDate: '2023-09-30'
      },
      ownerName: 'Tập đoàn Accor',
      ownerId: 'OWN-005',
      ownerEmail: 'finance@accor.com',
      ownerPhone: '028 3520 9999',
      ownerBankInfo: {
        bankName: 'HSBC',
        accountNumber: '5544332211',
        accountName: 'ACCOR VIETNAM COMPANY LIMITED'
      },
      totalBookings: 41,
      totalAmount: 102900000,
      commissionAmount: 15435000,
      ownerAmount: 87465000,
      platformAmount: 15435000,
      status: 'failed',
      createdAt: '2023-10-01',
      updatedAt: '2023-10-06',
      notes: 'Thông tin tài khoản không chính xác, cần liên hệ lại',
      invoices: [
        {
          id: 'INV-007',
          bookingId: 'BK-007',
          propertyName: 'Pullman Saigon',
          amount: 8400000,
          commissionAmount: 1260000,
          commissionRate: 15,
          date: '2023-09-15'
        },
        {
          id: 'INV-011',
          bookingId: 'BK-011',
          propertyName: 'Novotel Nha Trang',
          amount: 5500000,
          commissionAmount: 825000,
          commissionRate: 15,
          date: '2023-09-18'
        }
      ]
    },
    {
      id: 'CP-006',
      period: {
        startDate: '2023-08-01',
        endDate: '2023-08-31'
      },
      ownerName: 'Công ty CP Vinpearl',
      ownerId: 'OWN-001',
      ownerEmail: 'finance@vinpearl.com',
      ownerPhone: '1900 2345',
      ownerBankInfo: {
        bankName: 'Vietcombank',
        accountNumber: '1234567890',
        accountName: 'CÔNG TY CỔ PHẦN VINPEARL'
      },
      totalBookings: 38,
      totalAmount: 95000000,
      commissionAmount: 14250000,
      ownerAmount: 80750000,
      platformAmount: 14250000,
      status: 'paid',
      paymentDate: '2023-09-05',
      paymentMethod: 'Bank Transfer',
      transactionId: 'TRX-23456789',
      createdAt: '2023-09-01',
      updatedAt: '2023-09-05',
      invoices: [
        {
          id: 'INV-012',
          bookingId: 'BK-012',
          propertyName: 'Vinpearl Resort & Spa Nha Trang',
          amount: 6800000,
          commissionAmount: 1020000,
          commissionRate: 15,
          date: '2023-08-10'
        },
        {
          id: 'INV-013',
          bookingId: 'BK-013',
          propertyName: 'Vinpearl Resort & Spa Đà Nẵng',
          amount: 7200000,
          commissionAmount: 1080000,
          commissionRate: 15,
          date: '2023-08-15'
        }
      ]
    },
    {
      id: 'CP-007',
      period: {
        startDate: '2023-08-01',
        endDate: '2023-08-31'
      },
      ownerName: 'Công ty TNHH Metropole',
      ownerId: 'OWN-002',
      ownerEmail: 'finance@metropole.com',
      ownerPhone: '024 3826 6919',
      ownerBankInfo: {
        bankName: 'BIDV',
        accountNumber: '0987654321',
        accountName: 'CÔNG TY TNHH METROPOLE'
      },
      totalBookings: 32,
      totalAmount: 80000000,
      commissionAmount: 9600000,
      ownerAmount: 70400000,
      platformAmount: 9600000,
      status: 'paid',
      paymentDate: '2023-09-04',
      paymentMethod: 'Bank Transfer',
      transactionId: 'TRX-34567890',
      createdAt: '2023-09-01',
      updatedAt: '2023-09-04',
      invoices: [
        {
          id: 'INV-014',
          bookingId: 'BK-014',
          propertyName: 'Metropole Hanoi',
          amount: 8800000,
          commissionAmount: 1056000,
          commissionRate: 12,
          date: '2023-08-12'
        }
      ]
    },
    {
      id: 'CP-008',
      period: {
        startDate: '2023-10-01',
        endDate: '2023-10-31'
      },
      ownerName: 'Công ty CP Vinpearl',
      ownerId: 'OWN-001',
      ownerEmail: 'finance@vinpearl.com',
      ownerPhone: '1900 2345',
      ownerBankInfo: {
        bankName: 'Vietcombank',
        accountNumber: '1234567890',
        accountName: 'CÔNG TY CỔ PHẦN VINPEARL'
      },
      totalBookings: 12,
      totalAmount: 30000000,
      commissionAmount: 4500000,
      ownerAmount: 25500000,
      platformAmount: 4500000,
      status: 'pending',
      createdAt: '2023-10-15',
      updatedAt: '2023-10-15',
      notes: 'Thanh toán tạm tính giữa tháng',
      invoices: [
        {
          id: 'INV-015',
          bookingId: 'BK-015',
          propertyName: 'Vinpearl Resort & Spa Nha Trang',
          amount: 8500000,
          commissionAmount: 1275000,
          commissionRate: 15,
          date: '2023-10-05'
        },
        {
          id: 'INV-016',
          bookingId: 'BK-016',
          propertyName: 'Vinpearl Resort & Spa Phú Quốc',
          amount: 9200000,
          commissionAmount: 1380000,
          commissionRate: 15,
          date: '2023-10-08'
        }
      ]
    }
  ];

  const itemsPerPage = 5;

  // Filter commission payments based on search term, status, and period
  const filteredPayments = commissionPayments.filter(payment => {
    const matchesSearch = 
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.transactionId && payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    // Period filtering logic
    let matchesPeriod = true;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const paymentStartDate = new Date(payment.period.startDate);
    const paymentEndDate = new Date(payment.period.endDate);
    
    if (periodFilter === 'currentMonth') {
      matchesPeriod = 
        paymentStartDate.getMonth() === currentMonth && 
        paymentStartDate.getFullYear() === currentYear;
    } else if (periodFilter === 'lastMonth') {
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      matchesPeriod = 
        paymentStartDate.getMonth() === lastMonth && 
        paymentStartDate.getFullYear() === lastMonthYear;
    } else if (periodFilter === 'last3Months') {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      matchesPeriod = paymentStartDate >= threeMonthsAgo;
    }
    
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
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

  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(paginatedPayments.map(payment => payment.id));
    }
    setIsSelectAll(!isSelectAll);
  };

  const handleSelectPayment = (paymentId: string) => {
    if (selectedPayments.includes(paymentId)) {
      setSelectedPayments(selectedPayments.filter(id => id !== paymentId));
    } else {
      setSelectedPayments([...selectedPayments, paymentId]);
    }
  };

  const handleToggleExpand = (paymentId: string) => {
    if (expandedPayment === paymentId) {
      setExpandedPayment(null);
    } else {
      setExpandedPayment(paymentId);
    }
  };

  const handleCreatePayment = () => {
    navigate('/admin/commission-payments/create');
  };

  const handleViewPaymentDetail = (paymentId: string) => {
    navigate(`/admin/commission-payments/${paymentId}`);
  };

  const handleViewOwner = (ownerId: string) => {
    navigate(`/admin/users/${ownerId}`);
  };

  const handleViewInvoice = (invoiceId: string) => {
    navigate(`/admin/invoices/${invoiceId}`);
  };

  const handleViewBooking = (bookingId: string) => {
    navigate(`/admin/bookings/${bookingId}`);
  };

  const handleProcessPayment = (paymentId: string) => {
    // Process payment logic would go here
    alert(`Đã bắt đầu xử lý thanh toán có ID: ${paymentId}`);
  };

  const handleMarkAsPaid = (paymentId: string) => {
    // Mark payment as paid logic would go here
    alert(`Đã đánh dấu thanh toán có ID: ${paymentId} là đã thanh toán`);
  };

  const handleRetryPayment = (paymentId: string) => {
    // Retry payment logic would go here
    alert(`Đã thử lại thanh toán có ID: ${paymentId}`);
  };

  const handleSendReminder = (paymentId: string) => {
    // Send reminder logic would go here
    alert(`Đã gửi nhắc nhở cho thanh toán có ID: ${paymentId}`);
  };

  const handleExportPayments = () => {
    // Export payments logic would go here
    alert('Đã xuất danh sách thanh toán hoa hồng');
  };

  const handleBulkProcess = () => {
    if (selectedPayments.length === 0) return;
    
    // Bulk process logic would go here
    alert(`Đã bắt đầu xử lý ${selectedPayments.length} thanh toán đã chọn`);
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
          <h1 className="text-xl sm:text-2xl font-bold">Thanh toán hoa hồng</h1>
          <div className="flex space-x-2">
            <button
              onClick={handleExportPayments}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Download size={20} className="mr-2" />
              Xuất dữ liệu
            </button>
            <button
              onClick={handleCreatePayment}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Tạo thanh toán mới
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Tìm kiếm theo mã thanh toán, chủ khách sạn, email..."
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
                  <option value="pending">Chờ thanh toán</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="paid">Đã thanh toán</option>
                  <option value="failed">Thất bại</option>
                </select>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <select
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tất cả thời gian</option>
                  <option value="currentMonth">Tháng hiện tại</option>
                  <option value="lastMonth">Tháng trước</option>
                  <option value="last3Months">3 tháng gần đây</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedPayments.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex justify-between items-center">
            <span className="text-blue-700">Đã chọn {selectedPayments.length} thanh toán</span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkProcess}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors flex items-center"
              >
                <DollarSign size={16} className="mr-1" />
                Xử lý hàng loạt
              </button>
            </div>
          </div>
        )}

        {/* Commission Payments List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isSelectAll}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                      />
                      Mã thanh toán
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kỳ thanh toán
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chủ khách sạn
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số lượng
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
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
                {paginatedPayments.map((payment) => (
                  <React.Fragment key={payment.id}>
                    <tr className={`hover:bg-gray-50 ${expandedPayment === payment.id ? 'bg-blue-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedPayments.includes(payment.id)}
                            onChange={() => handleSelectPayment(payment.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                          />
                          <button 
                            onClick={() => handleToggleExpand(payment.id)}
                            className="flex items-center text-blue-600 hover:text-blue-900"
                          >
                            {expandedPayment === payment.id ? (
                              <ChevronUp size={16} className="mr-1" />
                            ) : (
                              <ChevronDown size={16} className="mr-1" />
                            )}
                            {payment.id}
                          </button>
                        </div>
                        <div className="ml-7 text-xs text-gray-500 mt-1">
                          Tạo: {formatDate(payment.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getPeriodLabel(payment.period.startDate, payment.period.endDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => handleViewOwner(payment.ownerId)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <Building size={14} className="mr-1" />
                          {payment.ownerName}
                        </button>
                        <div className="text-xs text-gray-500 mt-1">
                          {payment.ownerEmail}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payment.totalBookings} đặt phòng
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {payment.invoices.length} hóa đơn
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(payment.totalAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(payment.commissionAmount)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Chủ KS: {formatCurrency(payment.ownerAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="mb-1">{getStatusBadge(payment.status)}</div>
                        {payment.status === 'paid' && payment.paymentDate && (
                          <div className="text-xs text-gray-500">
                            Ngày TT: {formatDate(payment.paymentDate)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {payment.status === 'pending' && (
                            <button
                              onClick={() => handleProcessPayment(payment.id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Xử lý thanh toán"
                            >
                              <DollarSign size={18} />
                            </button>
                          )}
                          {payment.status === 'processing' && (
                            <button
                              onClick={() => handleMarkAsPaid(payment.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Đánh dấu đã thanh toán"
                            >
                              <Check size={18} />
                            </button>
                          )}
                          {payment.status === 'failed' && (
                            <button
                              onClick={() => handleRetryPayment(payment.id)}
                              className="text-orange-600 hover:text-orange-900"
                              title="Thử lại"
                            >
                              <Clock size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleViewPaymentDetail(payment.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Xem chi tiết"
                          >
                            <FileText size={18} />
                          </button>
                          {payment.status === 'pending' && (
                            <button
                              onClick={() => handleSendReminder(payment.id)}
                              className="text-purple-600 hover:text-purple-900"
                              title="Gửi nhắc nhở"
                            >
                              <Send size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedPayment === payment.id && (
                      <tr className="bg-blue-50">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-2">Thông tin thanh toán</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-sm text-gray-600">Thông tin ngân hàng:</p>
                                <p className="text-sm font-medium">{payment.ownerBankInfo.bankName}</p>
                                <p className="text-sm font-medium">{payment.ownerBankInfo.accountNumber}</p>
                                <p className="text-sm font-medium">{payment.ownerBankInfo.accountName}</p>
                              </div>
                              {payment.status === 'paid' && (
                                <div>
                                  <p className="text-sm text-gray-600">Phương thức thanh toán:</p>
                                  <p className="text-sm font-medium">{payment.paymentMethod}</p>
                                  {payment.transactionId && (
                                    <p className="text-sm font-medium">Mã giao dịch: {payment.transactionId}</p>
                                  )}
                                </div>
                              )}
                              {payment.notes && (
                                <div>
                                  <p className="text-sm text-gray-600">Ghi chú:</p>
                                  <p className="text-sm">{payment.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <h4 className="font-medium text-gray-900 mb-2">Danh sách hóa đơn</h4>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mã hóa đơn
                                  </th>
                                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mã đặt phòng
                                  </th>
                                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Khách sạn
                                  </th>
                                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày
                                  </th>
                                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Số tiền
                                  </th>
                                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Hoa hồng
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {payment.invoices.map((invoice) => (
                                  <tr key={invoice.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                      <button 
                                        onClick={() => handleViewInvoice(invoice.id)}
                                        className="text-blue-600 hover:text-blue-900"
                                      >
                                        {invoice.id}
                                      </button>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                      <button 
                                        onClick={() => handleViewBooking(invoice.bookingId)}
                                        className="text-blue-600 hover:text-blue-900"
                                      >
                                        {invoice.bookingId}
                                      </button>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                      {invoice.propertyName}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                      {formatDate(invoice.date)}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                      {formatCurrency(invoice.amount)}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                      {formatCurrency(invoice.commissionAmount)} ({invoice.commissionRate}%)
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="bg-gray-50">
                                <tr>
                                  <td colSpan={4} className="px-4 py-2 text-sm font-medium text-right">
                                    Tổng cộng:
                                  </td>
                                  <td className="px-4 py-2 text-sm font-medium">
                                    {formatCurrency(payment.totalAmount)}
                                  </td>
                                  <td className="px-4 py-2 text-sm font-medium">
                                    {formatCurrency(payment.commissionAmount)}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
                      {Math.min(currentPage * itemsPerPage, filteredPayments.length)}
                    </span>{' '}
                    trong tổng số <span className="font-medium">{filteredPayments.length}</span> thanh toán
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

        {paginatedPayments.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-xl font-medium text-gray-900 mb-2">Không tìm thấy thanh toán hoa hồng nào</h3>
            <p className="text-gray-600 mb-6">Không có thanh toán hoa hồng nào phù hợp với tiêu chí tìm kiếm của bạn.</p>
            <button
              onClick={handleCreatePayment}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Tạo thanh toán mới
            </button>
          </div>
        )}
      </div>);
};

export default AdminCommissionPayments;

