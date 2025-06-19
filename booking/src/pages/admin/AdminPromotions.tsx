import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash, Calendar, Percent, Tag, Filter, Clock, Check, X, AlertCircle } from 'lucide-react';
import { voucherAPI, hotelAPI } from '../../services/api';
import { VoucherResponse, VoucherStatus, DiscountType, ApplicableScope, VoucherFilterParams } from '../../types/voucher';
import VoucherForm from '../../components/VoucherForm';
import VoucherDeleteConfirmModal from '../../components/VoucherDeleteConfirmModal';

interface AlertState {
  show: boolean;
  type: 'success' | 'error';
  message: string;
}

const AdminPromotions: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<VoucherStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVouchers, setSelectedVouchers] = useState<string[]>([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [vouchers, setVouchers] = useState<VoucherResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<VoucherResponse | null>(null);

  const [alert, setAlert] = useState<AlertState>({ show: false, type: 'success', message: '' });
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    voucher: VoucherResponse | null;
    hasUsageRecords: boolean;
  }>({ isOpen: false, voucher: null, hasUsageRecords: false });

  const itemsPerPage = 10;

  // Load data on component mount
  useEffect(() => {
    loadVouchers();
  }, [currentPage, statusFilter, searchTerm]);

  const loadVouchers = async () => {
    setLoading(true);
    try {
      const params: VoucherFilterParams = {
        pageNumber: currentPage - 1,
        pageSize: itemsPerPage,
        sortBy: 'createdAt'
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter as VoucherStatus;
      }

      if (searchTerm) {
        params.name = searchTerm;
      }

      const response = await voucherAPI.getAllVouchers(params);
      if (response.data.success) {
        setVouchers(response.data.result.content);
        setTotalPages(response.data.result.totalPages);
        setTotalElements(response.data.result.totalElements);
      }
    } catch (error) {
      showAlert('error', 'Không thể tải danh sách voucher');
      console.error('Error loading vouchers:', error);
    } finally {
      setLoading(false);
    }
  };



  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: 'success', message: '' }), 5000);
  };

  const handleCreateVoucher = async (data: any) => {
    setLoading(true);
    try {
      const response = await voucherAPI.createVoucher(data);
      if (response.data.success) {
        showAlert('success', 'Tạo voucher thành công');
        setShowForm(false);
        loadVouchers();
      }
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Không thể tạo voucher');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVoucher = async (data: any) => {
    if (!editingVoucher) return;
    
    setLoading(true);
    try {
      const response = await voucherAPI.updateVoucher(editingVoucher.id, data);
      if (response.data.success) {
        showAlert('success', 'Cập nhật voucher thành công');
        setShowForm(false);
        setEditingVoucher(null);
        loadVouchers();
      }
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Không thể cập nhật voucher');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVoucher = (voucher: VoucherResponse) => {
    setDeleteModal({
      isOpen: true,
      voucher,
      hasUsageRecords: voucher.usageCount > 0
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.voucher) return;

    try {
      const response = await voucherAPI.deleteVoucher(deleteModal.voucher.id);
      if (response.data.success) {
        showAlert('success', 'Xóa voucher thành công');
        loadVouchers();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Không thể xóa voucher';
      if (error.response?.status === 409) { // Conflict - has usage records
        setDeleteModal(prev => ({ ...prev, hasUsageRecords: true }));
        return; // Don't close modal, show disable option
      }
      showAlert('error', errorMessage);
    } finally {
      setDeleteModal({ isOpen: false, voucher: null, hasUsageRecords: false });
    }
  };

  const handleDisableInstead = async () => {
    if (!deleteModal.voucher) return;

    try {
      // Toggle to inactive if currently active
      if (deleteModal.voucher.status === VoucherStatus.ACTIVE) {
        const response = await voucherAPI.toggleVoucherStatus(deleteModal.voucher.id);
        if (response.data.success) {
          showAlert('success', 'Đã tắt voucher thành công');
          loadVouchers();
        }
      } else {
        showAlert('success', 'Voucher đã được tắt');
      }
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Không thể tắt voucher');
    } finally {
      setDeleteModal({ isOpen: false, voucher: null, hasUsageRecords: false });
    }
  };

  const handleToggleStatus = async (voucherId: string) => {
    try {
      const response = await voucherAPI.toggleVoucherStatus(voucherId);
      if (response.data.success) {
        showAlert('success', 'Cập nhật trạng thái thành công');
        loadVouchers();
      }
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const getStatusBadge = (status: VoucherStatus) => {
    const statusConfig = {
      [VoucherStatus.ACTIVE]: { color: 'bg-green-100 text-green-800', icon: Check, text: 'Hoạt động' },
      [VoucherStatus.INACTIVE]: { color: 'bg-gray-100 text-gray-800', icon: X, text: 'Tạm dừng' },
      [VoucherStatus.EXPIRED]: { color: 'bg-red-100 text-red-800', icon: Clock, text: 'Hết hạn' },
      [VoucherStatus.USED_UP]: { color: 'bg-orange-100 text-orange-800', icon: Tag, text: 'Hết lượt' }
    };

    const config = statusConfig[status];
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent size={12} className="mr-1" />
        {config.text}
      </span>
    );
  };

  const getDiscountText = (voucher: VoucherResponse) => {
    if (voucher.discountType === DiscountType.PERCENTAGE) {
      return `${voucher.discountValue}% (tối đa ${formatCurrency(voucher.maxDiscount || 0)})`;
    }
    return formatCurrency(voucher.discountValue);
  };

  const getProgressBarWidth = (used: number, total?: number) => {
    if (!total) return 0;
    return Math.min((used / total) * 100, 100);
  };

  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedVouchers([]);
    } else {
      setSelectedVouchers(vouchers.map(voucher => voucher.id));
    }
    setIsSelectAll(!isSelectAll);
  };

  const handleSelectVoucher = (voucherId: string) => {
    if (selectedVouchers.includes(voucherId)) {
      setSelectedVouchers(selectedVouchers.filter(id => id !== voucherId));
    } else {
      setSelectedVouchers([...selectedVouchers, voucherId]);
    }
  };

  const handleEditVoucher = (voucher: VoucherResponse) => {
    setEditingVoucher(voucher);
    setShowForm(true);
  };

  const handleAddVoucher = () => {
    setEditingVoucher(null);
    setShowForm(true);
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <VoucherForm
          voucher={editingVoucher || undefined}
          onSubmit={editingVoucher ? handleUpdateVoucher : handleCreateVoucher}
          onCancel={() => {
            setShowForm(false);
            setEditingVoucher(null);
          }}
          isLoading={loading}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý Voucher</h1>
              <p className="text-gray-600 mt-1">Tạo và quản lý các voucher giảm giá</p>
            </div>
          <button
              onClick={handleAddVoucher}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus size={20} className="mr-2" />
              Tạo voucher mới
          </button>
          </div>
        </div>
      </div>

      {/* Alert */}
      {alert.show && (
        <div className={`mx-6 mt-4 p-4 rounded-lg flex items-center ${
          alert.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          <AlertCircle size={20} className="mr-2" />
          {alert.message}
        </div>
      )}

      {/* Filters */}
      <div className="px-6 py-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                  placeholder="Tìm kiếm theo tên hoặc mã voucher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as VoucherStatus | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value={VoucherStatus.ACTIVE}>Hoạt động</option>
                <option value={VoucherStatus.INACTIVE}>Tạm dừng</option>
                <option value={VoucherStatus.EXPIRED}>Hết hạn</option>
                <option value={VoucherStatus.USED_UP}>Hết lượt</option>
              </select>
            </div>
          </div>
            </div>
          </div>

      {/* Content */}
      <div className="px-6 pb-6">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                      <input
                        type="checkbox"
                  checked={isSelectAll}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">
                  Đã chọn {selectedVouchers.length} voucher
                      </span>
                    </div>
              <div className="text-sm text-gray-500">
                Tổng: {totalElements} voucher
                  </div>
                  </div>
                </div>

          {/* Table Content */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : vouchers.length === 0 ? (
            <div className="text-center py-12">
              <Tag size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Chưa có voucher nào</p>
                  </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Voucher
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giảm giá
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời gian
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sử dụng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vouchers.map((voucher) => (
                      <tr key={voucher.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedVouchers.includes(voucher.id)}
                              onChange={() => handleSelectVoucher(voucher.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-4"
                            />
                            <div>
                              <div className="flex items-center">
                                <Tag size={16} className="text-blue-600 mr-2" />
                                <span className="font-semibold text-blue-600">{voucher.code}</span>
                              </div>
                              <div className="text-sm font-medium text-gray-900 mt-1">{voucher.name}</div>
                              {voucher.description && (
                                <div className="text-sm text-gray-500 mt-1">{voucher.description}</div>
                      )}
                    </div>
                  </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Percent size={16} className="text-green-600 mr-2" />
                            <span className="text-sm font-medium text-green-600">
                              {getDiscountText(voucher)}
                            </span>
                          </div>
                          {voucher.minBookingValue && (
                            <div className="text-xs text-gray-500 mt-1">
                              Tối thiểu: {formatCurrency(voucher.minBookingValue)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar size={16} className="mr-2" />
                            <div>
                              <div>{formatDate(voucher.startDate)}</div>
                              <div className="text-xs">đến {formatDate(voucher.endDate)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {voucher.usageCount} / {voucher.usageLimit || '∞'}
                          </div>
                          {voucher.usageLimit && (
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${getProgressBarWidth(voucher.usageCount, voucher.usageLimit)}%` }}
                        ></div>
                      </div>
                    )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(voucher.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditVoucher(voucher)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(voucher.id)}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              {voucher.status === VoucherStatus.ACTIVE ? <X size={16} /> : <Check size={16} />}
                            </button>
                            <button
                              onClick={() => handleDeleteVoucher(voucher)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash size={16} />
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
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalElements)} của {totalElements} voucher
                    </div>
                    <div className="flex items-center space-x-2">
                <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                      <span className="text-sm text-gray-700">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Tiếp
                      </button>
                </div>
              </div>
            </div>
          )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <VoucherDeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, voucher: null, hasUsageRecords: false })}
        onConfirmDelete={handleConfirmDelete}
        onDisableInstead={handleDisableInstead}
        voucherCode={deleteModal.voucher?.code || ''}
        hasUsageRecords={deleteModal.hasUsageRecords}
      />
    </div>
  );
};

export default AdminPromotions;

