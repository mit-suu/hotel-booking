import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash, Calendar, Percent, Tag, Filter, Clock, Check, X, AlertCircle, Hotel } from 'lucide-react';
import { voucherAPI, hotelAPI } from '../../services/api';
import { VoucherResponse, VoucherStatus, DiscountType, ApplicableScope, VoucherFilterParams } from '../../types/voucher';
import VoucherForm from '../../components/VoucherForm';
import VoucherDeleteConfirmModal from '../../components/VoucherDeleteConfirmModal';

interface AlertState {
  show: boolean;
  type: 'success' | 'error';
  message: string;
}

const HostVouchers: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<VoucherStatus | 'all'>('all');
  const [hotelFilter, setHotelFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVouchers, setSelectedVouchers] = useState<string[]>([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [vouchers, setVouchers] = useState<VoucherResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<VoucherResponse | null>(null);
  const [hotels, setHotels] = useState<any[]>([]);

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
    loadHotels();
  }, [currentPage, statusFilter, searchTerm, hotelFilter]);

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

      let response;
      if (hotelFilter === 'all') {
        if (searchTerm) {
          response = await voucherAPI.searchHostVouchers(searchTerm, params);
        } else {
          response = await voucherAPI.getHostVouchers(params);
        }
      } else {
        response = await voucherAPI.getHostVouchersByHotel(hotelFilter, params);
      }

      if (response.data.success) {
        setVouchers(response.data.result.content);
        setTotalPages(response.data.result.totalPages);
        setTotalElements(response.data.result.totalElements);
      }
    } catch (error) {
      showAlert('error', 'Unable to load voucher list');
      console.error('Error loading vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHotels = async () => {
    console.log('Loading hotels for host...');
    try {
      const response = await hotelAPI.getMyHotels(0, 100);
      console.log('Hotels response:', response);
      if (response.data.success) {
        console.log('Hotels loaded:', response.data.result.content);
        setHotels(response.data.result.content);
      } else {
        console.error('Failed to load hotels:', response.data.message);
        showAlert('error', response.data.message || 'Unable to load hotel list');
      }
    } catch (error: any) {
      console.error('Error loading hotels:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Unable to load hotel list';
      showAlert('error', errorMessage);
    }
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: 'success', message: '' }), 5000);
  };

  const handleCreateVoucher = async (data: any) => {
    setLoading(true);
    try {
      const response = await voucherAPI.createHostVoucher(data);
      if (response.data.success) {
        showAlert('success', 'Voucher created successfully');
        setShowForm(false);
        loadVouchers();
      }
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Unable to create voucher');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVoucher = async (data: any) => {
    if (!editingVoucher) return;
    
    setLoading(true);
    try {
      const response = await voucherAPI.updateHostVoucher(editingVoucher.id, data);
      if (response.data.success) {
        showAlert('success', 'Voucher updated successfully');
        setShowForm(false);
        setEditingVoucher(null);
        loadVouchers();
      }
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Unable to update voucher');
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
      const response = await voucherAPI.deleteHostVoucher(deleteModal.voucher.id);
      if (response.data.success) {
        showAlert('success', 'Voucher deleted successfully');
        loadVouchers();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Unable to delete voucher';
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
        const response = await voucherAPI.toggleHostVoucherStatus(deleteModal.voucher.id);
        if (response.data.success) {
          showAlert('success', 'Voucher disabled successfully');
          loadVouchers();
        }
      } else {
        showAlert('success', 'Voucher is already disabled');
      }
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Unable to disable voucher');
    } finally {
      setDeleteModal({ isOpen: false, voucher: null, hasUsageRecords: false });
    }
  };

  const handleToggleStatus = async (voucherId: string) => {
    try {
      const response = await voucherAPI.toggleHostVoucherStatus(voucherId);
      if (response.data.success) {
        showAlert('success', 'Status updated successfully');
        loadVouchers();
      }
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Unable to update status');
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
      [VoucherStatus.ACTIVE]: { color: 'bg-green-100 text-green-800', icon: Check, text: 'Active' },
      [VoucherStatus.INACTIVE]: { color: 'bg-gray-100 text-gray-800', icon: X, text: 'Inactive' },
      [VoucherStatus.EXPIRED]: { color: 'bg-red-100 text-red-800', icon: Clock, text: 'Expired' },
      [VoucherStatus.USED_UP]: { color: 'bg-orange-100 text-orange-800', icon: Tag, text: 'Used Up' }
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
      return `${voucher.discountValue}% (max ${formatCurrency(voucher.maxDiscount || 0)})`;
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
          isHostMode={true}
          hostHotels={hotels}
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
              <h1 className="text-2xl font-bold text-gray-900">Voucher Management</h1>
              <p className="text-gray-600 mt-1">Create and manage vouchers for your hotels</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleAddVoucher}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus size={20} className="mr-2" />
                Create New Voucher
              </button>
            </div>
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
                  placeholder="Search by name or voucher code..."
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
                <option value="all">All Status</option>
                <option value={VoucherStatus.ACTIVE}>Active</option>
                <option value={VoucherStatus.INACTIVE}>Inactive</option>
                <option value={VoucherStatus.EXPIRED}>Expired</option>
                <option value={VoucherStatus.USED_UP}>Used Up</option>
              </select>
              <select
                value={hotelFilter}
                onChange={(e) => setHotelFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Hotels</option>
                {hotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.name}
                  </option>
                ))}
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
                  Selected {selectedVouchers.length} vouchers
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Total: {totalElements} vouchers
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Voucher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scope
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
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
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <Percent size={14} className="text-green-600 mr-1" />
                          <span className="font-medium">{getDiscountText(voucher)}</span>
                        </div>
                        {voucher.minBookingValue && (
                          <div className="text-xs text-gray-500 mt-1">
                            Minimum: {formatCurrency(voucher.minBookingValue)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar size={14} className="text-gray-400 mr-1" />
                          <span>{formatDate(voucher.startDate)}</span>
                        </div>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-500">to</span>
                          <span className="ml-1 text-xs">{formatDate(voucher.endDate)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center justify-between">
                          <span>{voucher.usageCount}</span>
                          <span className="text-gray-500">
                            {voucher.usageLimit ? `/${voucher.usageLimit}` : '/∞'}
                          </span>
                        </div>
                        {voucher.usageLimit && (
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${getProgressBarWidth(voucher.usageCount, voucher.usageLimit)}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {voucher.applicableScope === ApplicableScope.ALL_HOTELS ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Hotel size={12} className="mr-1" />
                            All Hotels
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <Hotel size={12} className="mr-1" />
                            Specific Hotel
                          </span>
                        )}
                      </div>
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
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalElements)} to{' '}
                {Math.min(currentPage * itemsPerPage, totalElements)} of {totalElements} vouchers
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm font-medium text-gray-700">
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <VoucherDeleteConfirmModal
        isOpen={deleteModal.isOpen}
        voucherCode={deleteModal.voucher?.code || ''}
        hasUsageRecords={deleteModal.hasUsageRecords}
        onConfirmDelete={handleConfirmDelete}
        onDisableInstead={handleDisableInstead}
        onClose={() => setDeleteModal({ isOpen: false, voucher: null, hasUsageRecords: false })}
      />
    </div>
  );
};

export default HostVouchers; 