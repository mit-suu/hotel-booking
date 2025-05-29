import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Percent, DollarSign, Building, User, Check, Clock, Edit, Save, Plus, Trash } from 'lucide-react';

interface CommissionRate {
  id: string;
  ownerName: string;
  ownerId: string;
  propertyName?: string;
  propertyId?: string;
  rate: number;
  isDefault: boolean;
  effectiveDate: string;
  expiryDate?: string;
  status: 'active' | 'expired' | 'upcoming';
  notes?: string;
}

interface CommissionPayment {
  id: string;
  invoiceId: string;
  bookingId: string;
  ownerName: string;
  ownerId: string;
  propertyName: string;
  propertyId: string;
  amount: number;
  commissionAmount: number;
  commissionRate: number;
  ownerAmount: number;
  platformAmount: number;
  status: 'pending' | 'paid' | 'processing';
  paymentDate?: string;
  dueDate: string;
}

const AdminCommissions: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'rates' | 'payments'>('rates');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddingRate, setIsAddingRate] = useState(false);
  const [editingRateId, setEditingRateId] = useState<string | null>(null);

  // Sample commission rates data
  const commissionRates: CommissionRate[] = [
    {
      id: 'RATE-001',
      ownerName: 'Công ty CP Vinpearl',
      ownerId: 'OWN-001',
      rate: 15,
      isDefault: false,
      effectiveDate: '2023-01-01',
      status: 'active',
      notes: 'Tỷ lệ hoa hồng đặc biệt cho đối tác lớn'
    },
    {
      id: 'RATE-002',
      ownerName: 'Công ty TNHH Metropole',
      ownerId: 'OWN-002',
      rate: 12,
      isDefault: false,
      effectiveDate: '2023-01-01',
      status: 'active'
    },
    {
      id: 'RATE-003',
      ownerName: 'Tập đoàn Mường Thanh',
      ownerId: 'OWN-003',
      rate: 10,
      isDefault: false,
      effectiveDate: '2023-01-01',
      status: 'active'
    },
    {
      id: 'RATE-004',
      ownerName: 'Công ty CP Fusion',
      ownerId: 'OWN-004',
      propertyName: 'Fusion Maia Resort',
      propertyId: 'PROP-004',
      rate: 18,
      isDefault: false,
      effectiveDate: '2023-01-01',
      status: 'active'
    },
    {
      id: 'RATE-005',
      ownerName: 'Tập đoàn Accor',
      ownerId: 'OWN-005',
      rate: 15,
      isDefault: false,
      effectiveDate: '2023-01-01',
      status: 'active'
    },
    {
      id: 'RATE-006',
      ownerName: 'Nguyễn Văn Hùng',
      ownerId: 'OWN-006',
      rate: 10,
      isDefault: false,
      effectiveDate: '2023-01-01',
      status: 'active'
    },
    {
      id: 'RATE-007',
      ownerName: 'Tất cả chủ khách sạn',
      ownerId: 'ALL',
      rate: 20,
      isDefault: true,
      effectiveDate: '2023-01-01',
      status: 'active',
      notes: 'Tỷ lệ hoa hồng mặc định cho tất cả chủ khách sạn'
    },
    {
      id: 'RATE-008',
      ownerName: 'Công ty CP Vinpearl',
      ownerId: 'OWN-001',
      propertyName: 'Vinpearl Resort & Spa Nha Trang',
      propertyId: 'PROP-001',
      rate: 12,
      isDefault: false,
      effectiveDate: '2023-11-01',
      expiryDate: '2023-12-31',
      status: 'upcoming',
      notes: 'Tỷ lệ khuyến mãi cho mùa cao điểm'
    }
  ];

  // Sample commission payments data
  const commissionPayments: CommissionPayment[] = [
    {
      id: 'PAY-001',
      invoiceId: 'INV-001',
      bookingId: 'BK-001',
      ownerName: 'Công ty CP Vinpearl',
      ownerId: 'OWN-001',
      propertyName: 'Vinpearl Resort & Spa',
      propertyId: 'PROP-001',
      amount: 7500000,
      commissionAmount: 1125000,
      commissionRate: 15,
      ownerAmount: 6375000,
      platformAmount: 1125000,
      status: 'paid',
      paymentDate: '2023-09-25',
      dueDate: '2023-09-27'
    },
    {
      id: 'PAY-002',
      invoiceId: 'INV-002',
      bookingId: 'BK-002',
      ownerName: 'Công ty TNHH Metropole',
      ownerId: 'OWN-002',
      propertyName: 'Metropole Hanoi',
      propertyId: 'PROP-002',
      amount: 6400000,
      commissionAmount: 768000,
      commissionRate: 12,
      ownerAmount: 5632000,
      platformAmount: 768000,
      status: 'pending',
      dueDate: '2023-10-15'
    },
    {
      id: 'PAY-003',
      invoiceId: 'INV-003',
      bookingId: 'BK-003',
      ownerName: 'Tập đoàn Mường Thanh',
      ownerId: 'OWN-003',
      propertyName: 'Mường Thanh Luxury',
      propertyId: 'PROP-003',
      amount: 8400000,
      commissionAmount: 840000,
      commissionRate: 10,
      ownerAmount: 7560000,
      platformAmount: 840000,
      status: 'paid',
      paymentDate: '2023-08-20',
      dueDate: '2023-08-22'
    },
    {
      id: 'PAY-004',
      invoiceId: 'INV-004',
      bookingId: 'BK-004',
      ownerName: 'Công ty CP Vinpearl',
      ownerId: 'OWN-001',
      propertyName: 'Vinpearl Resort & Spa',
      propertyId: 'PROP-001',
      amount: 3600000,
      commissionAmount: 540000,
      commissionRate: 15,
      ownerAmount: 3060000,
      platformAmount: 540000,
      status: 'processing',
      dueDate: '2023-10-17'
    },
    {
      id: 'PAY-005',
      invoiceId: 'INV-005',
      bookingId: 'BK-005',
      ownerName: 'Công ty TNHH Metropole',
      ownerId: 'OWN-002',
      propertyName: 'Metropole Hanoi',
      propertyId: 'PROP-002',
      amount: 9600000,
      commissionAmount: 1152000,
      commissionRate: 12,
      ownerAmount: 8448000,
      platformAmount: 1152000,
      status: 'paid',
      paymentDate: '2023-10-10',
      dueDate: '2023-10-12'
    },
    {
      id: 'PAY-006',
      invoiceId: 'INV-006',
      bookingId: 'BK-006',
      ownerName: 'Công ty CP Fusion',
      ownerId: 'OWN-004',
      propertyName: 'Fusion Maia Resort',
      propertyId: 'PROP-004',
      amount: 12500000,
      commissionAmount: 2250000,
      commissionRate: 18,
      ownerAmount: 10250000,
      platformAmount: 2250000,
      status: 'paid',
      paymentDate: '2023-10-15',
      dueDate: '2023-10-19'
    },
    {
      id: 'PAY-007',
      invoiceId: 'INV-007',
      bookingId: 'BK-007',
      ownerName: 'Tập đoàn Accor',
      ownerId: 'OWN-005',
      propertyName: 'Pullman Saigon',
      propertyId: 'PROP-005',
      amount: 8400000,
      commissionAmount: 1260000,
      commissionRate: 15,
      ownerAmount: 7140000,
      platformAmount: 1260000,
      status: 'pending',
      dueDate: '2023-10-22'
    },
    {
      id: 'PAY-008',
      invoiceId: 'INV-008',
      bookingId: 'BK-008',
      ownerName: 'Nguyễn Văn Hùng',
      ownerId: 'OWN-006',
      propertyName: 'Sapa Homestay',
      propertyId: 'PROP-006',
      amount: 2400000,
      commissionAmount: 240000,
      commissionRate: 10,
      ownerAmount: 2160000,
      platformAmount: 240000,
      status: 'pending',
      dueDate: '2023-10-25'
    }
  ];

  const itemsPerPage = 5;

  // Filter commission rates based on search term and status
  const filteredRates = commissionRates.filter(rate => {
    const matchesSearch = 
      rate.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rate.propertyName && rate.propertyName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || rate.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Filter commission payments based on search term and status
  const filteredPayments = commissionPayments.filter(payment => {
    const matchesSearch = 
      payment.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.bookingId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(
    (activeTab === 'rates' ? filteredRates : filteredPayments).length / itemsPerPage
  );
  
  const paginatedItems = (activeTab === 'rates' ? filteredRates : filteredPayments).slice(
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

  const handleViewOwner = (ownerId: string) => {
    navigate(`/admin/users/${ownerId}`);
  };

  const handleViewProperty = (propertyId: string) => {
    navigate(`/admin/hotels/${propertyId}`);
  };

  const handleAddRate = () => {
    setIsAddingRate(true);
  };

  const handleEditRate = (rateId: string) => {
    setEditingRateId(rateId);
  };

  const handleDeleteRate = (rateId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tỷ lệ hoa hồng này không?')) {
      // Delete rate logic would go here
      alert(`Đã xóa tỷ lệ hoa hồng có ID: ${rateId}`);
    }
  };

  const handleSaveRate = () => {
    // Save rate logic would go here
    alert('Đã lưu tỷ lệ hoa hồng');
    setIsAddingRate(false);
    setEditingRateId(null);
  };

  const handleCancelEdit = () => {
    setIsAddingRate(false);
    setEditingRateId(null);
  };

  const handleMarkAsPaid = (paymentId: string) => {
    // Mark payment as paid logic would go here
    alert(`Đã đánh dấu thanh toán có ID: ${paymentId} là đã thanh toán`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Đang áp dụng</span>;
      case 'expired':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Đã hết hạn</span>;
      case 'upcoming':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Sắp áp dụng</span>;
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
          <h1 className="text-xl sm:text-2xl font-bold">Quản lý hoa hồng</h1>
          {activeTab === 'rates' && (
            <button
              onClick={handleAddRate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Thêm tỷ lệ hoa hồng mới
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'rates'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => {
              setActiveTab('rates');
              setCurrentPage(1);
              setStatusFilter('all');
            }}
          >
            Tỷ lệ hoa hồng
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'payments'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => {
              setActiveTab('payments');
              setCurrentPage(1);
              setStatusFilter('all');
            }}
          >
            Thanh toán hoa hồng
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={
                  activeTab === 'rates'
                    ? "Tìm kiếm theo tên chủ khách sạn, khách sạn..."
                    : "Tìm kiếm theo mã hóa đơn, đặt phòng, chủ khách sạn..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                {activeTab === 'rates' ? (
                  <>
                    <option value="active">Đang áp dụng</option>
                    <option value="expired">Đã hết hạn</option>
                    <option value="upcoming">Sắp áp dụng</option>
                  </>
                ) : (
                  <>
                    <option value="paid">Đã thanh toán</option>
                    <option value="pending">Chờ thanh toán</option>
                    <option value="processing">Đang xử lý</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Add/Edit Commission Rate Form */}
        {(isAddingRate || editingRateId) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              {isAddingRate ? 'Thêm tỷ lệ hoa hồng mới' : 'Chỉnh sửa tỷ lệ hoa hồng'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chủ khách sạn
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  defaultValue={editingRateId ? commissionRates.find(r => r.id === editingRateId)?.ownerId : ''}
                >
                  <option value="">-- Chọn chủ khách sạn --</option>
                  <option value="ALL">Tất cả chủ khách sạn (Mặc định)</option>
                  <option value="OWN-001">Công ty CP Vinpearl</option>
                  <option value="OWN-002">Công ty TNHH Metropole</option>
                  <option value="OWN-003">Tập đoàn Mường Thanh</option>
                  <option value="OWN-004">Công ty CP Fusion</option>
                  <option value="OWN-005">Tập đoàn Accor</option>
                  <option value="OWN-006">Nguyễn Văn Hùng</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khách sạn (tùy chọn)
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  defaultValue={editingRateId ? commissionRates.find(r => r.id === editingRateId)?.propertyId : ''}
                >
                  <option value="">-- Tất cả khách sạn --</option>
                  <option value="PROP-001">Vinpearl Resort & Spa Nha Trang</option>
                  <option value="PROP-002">Metropole Hanoi</option>
                  <option value="PROP-003">Mường Thanh Luxury Đà Nẵng</option>
                  <option value="PROP-004">Fusion Maia Resort</option>
                  <option value="PROP-005">Pullman Saigon</option>
                  <option value="PROP-006">Sapa Homestay</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tỷ lệ hoa hồng (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  defaultValue={editingRateId ? commissionRates.find(r => r.id === editingRateId)?.rate : 20}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày bắt đầu áp dụng
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  defaultValue={editingRateId ? commissionRates.find(r => r.id === editingRateId)?.effectiveDate : new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày hết hạn (tùy chọn)
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  defaultValue={editingRateId && commissionRates.find(r => r.id === editingRateId)?.expiryDate ? commissionRates.find(r => r.id === editingRateId)?.expiryDate : ''}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  defaultValue={editingRateId ? commissionRates.find(r => r.id === editingRateId)?.notes : ''}
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-2">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveRate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Save size={18} className="mr-2" />
                Lưu
              </button>
            </div>
          </div>
        )}

        {/* Commission Rates Table */}
        {activeTab === 'rates' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chủ khách sạn
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách sạn
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tỷ lệ
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian áp dụng
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
                  {paginatedItems.map((rate: any) => (
                    <tr key={rate.id} className={`hover:bg-gray-50 ${rate.isDefault ? 'bg-blue-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {rate.ownerId === 'ALL' ? (
                          <div className="flex items-center">
                            <Building className="h-5 w-5 text-blue-500 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{rate.ownerName}</div>
                              <div className="text-xs text-blue-600">Tỷ lệ mặc định</div>
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleViewOwner(rate.ownerId)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Building size={14} className="mr-1" />
                            {rate.ownerName}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {rate.propertyName ? (
                          <button 
                            onClick={() => handleViewProperty(rate.propertyId!)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-900"
                          >
                            {rate.propertyName}
                          </button>
                        ) : (
                          <span className="text-sm text-gray-500">Tất cả khách sạn</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Percent size={16} className="text-gray-500 mr-1" />
                          <span className="text-sm font-medium text-gray-900">{rate.rate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Từ: {formatDate(rate.effectiveDate)}</div>
                        {rate.expiryDate && (
                          <div className="text-sm text-gray-500">Đến: {formatDate(rate.expiryDate)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(rate.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditRate(rate.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Chỉnh sửa"
                          >
                            <Edit size={18} />
                          </button>
                          {!rate.isDefault && (
                            <button
                              onClick={() => handleDeleteRate(rate.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Xóa"
                            >
                              <Trash size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Commission Payments Table */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã thanh toán
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chủ khách sạn
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách sạn
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
                  {paginatedItems.map((payment: any) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payment.id}</div>
                        <div className="flex space-x-2 text-xs text-gray-500">
                          <button 
                            onClick={() => handleViewInvoice(payment.invoiceId)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {payment.invoiceId}
                          </button>
                          <span>|</span>
                          <button 
                            onClick={() => handleViewBooking(payment.bookingId)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {payment.bookingId}
                          </button>
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => handleViewProperty(payment.propertyId)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-900"
                        >
                          {payment.propertyName}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(payment.amount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(payment.commissionAmount)} ({payment.commissionRate}%)</div>
                        <div className="text-xs text-gray-500">
                          Nền tảng: {formatCurrency(payment.platformAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="mb-1">{getStatusBadge(payment.status)}</div>
                        {payment.status === 'pending' ? (
                          <div className="text-xs text-gray-500">
                            Hạn: {formatDate(payment.dueDate)}
                          </div>
                        ) : payment.paymentDate ? (
                          <div className="text-xs text-gray-500">
                            Ngày TT: {formatDate(payment.paymentDate)}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {payment.status === 'pending' && (
                            <button
                              onClick={() => handleMarkAsPaid(payment.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Đánh dấu đã thanh toán"
                            >
                              <Check size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleViewInvoice(payment.invoiceId)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Xem hóa đơn"
                          >
                            <FileText size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
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
                    {Math.min(currentPage * itemsPerPage, (activeTab === 'rates' ? filteredRates : filteredPayments).length)}
                  </span>{' '}
                  trong tổng số <span className="font-medium">{(activeTab === 'rates' ? filteredRates : filteredPayments).length}</span>{' '}
                  {activeTab === 'rates' ? 'tỷ lệ hoa hồng' : 'thanh toán hoa hồng'}
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

        {paginatedItems.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {activeTab === 'rates' 
                ? 'Không tìm thấy tỷ lệ hoa hồng nào' 
                : 'Không tìm thấy thanh toán hoa hồng nào'}
            </h3>
            <p className="text-gray-600">
              {activeTab === 'rates'
                ? 'Không có tỷ lệ hoa hồng nào phù hợp với tiêu chí tìm kiếm của bạn.'
                : 'Không có thanh toán hoa hồng nào phù hợp với tiêu chí tìm kiếm của bạn.'}
            </p>
            {activeTab === 'rates' && (
              <button
                onClick={handleAddRate}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
              >
                <Plus size={20} className="mr-2" />
                Thêm tỷ lệ hoa hồng mới
              </button>
            )}
          </div>
        )}
      </div>);
};

export default AdminCommissions;

