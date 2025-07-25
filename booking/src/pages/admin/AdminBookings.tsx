import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, RefreshCw, Eye, Check, X, ChevronUp, ChevronDown,
  User, Mail, Phone, Building, Calendar, CreditCard, FileSpreadsheet, AlertTriangle,
  Trash2, DollarSign, MoreHorizontal, Edit
} from 'lucide-react';
import { bookingAPI, BookingResponse, BookingFilterParams, BookingUpdateRequest } from '../../services/api';
import BookingStatusBadge, { PaymentStatusBadge } from '../../components/booking/BookingStatusBadge';

interface BookingListState {
  bookings: BookingResponse[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  totalElements: number;
  currentPage: number;
}

const AdminBookings: React.FC = () => {
  const navigate = useNavigate();
  
  // State management
  const [state, setState] = useState<BookingListState>({
    bookings: [],
    loading: false,
    error: null,
    totalPages: 0,
    totalElements: 0,
    currentPage: 0
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // UI states
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{x: number, y: number} | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);
  
  // Pagination
  const [pageSize] = useState(10);

  // Load bookings from API
  const loadBookings = async (page: number = 0) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const params: BookingFilterParams = {
        pageNumber: page,
        pageSize,
        sortBy: sortBy // Backend chỉ nhận field name, không nhận direction
      };

      // Add filters if selected
      if (statusFilter !== 'all') {
        params.status = statusFilter as any;
      }
      if (paymentFilter !== 'all') {
        params.paymentStatus = paymentFilter as any;
      }

      // Handle date filters
      if (dateFilter !== 'all') {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        switch (dateFilter) {
          case 'today':
            params.checkInDate = todayStr;
            break;
          case 'thisWeek':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            params.checkInDate = weekStart.toISOString().split('T')[0];
            break;
          case 'thisMonth':
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            params.checkInDate = monthStart.toISOString().split('T')[0];
            break;
        }
      }

      let response;
      if (searchTerm.trim()) {
        response = await bookingAPI.searchBookings(searchTerm, params);
      } else {
        response = await bookingAPI.getAllBookings(params);
      }

      if (response.data.success) {
        const result = response.data.result;
        
        // Sort data ở frontend vì backend không hỗ trợ sort direction
        const sortedBookings = [...result.content].sort((a, b) => {
          let aValue: any = a[sortBy as keyof BookingResponse];
          let bValue: any = b[sortBy as keyof BookingResponse];
          
          // Handle date sorting
          if (sortBy.includes('Date') || sortBy === 'createdAt' || sortBy === 'updatedAt') {
            aValue = new Date(aValue).getTime();
            bValue = new Date(bValue).getTime();
          }
          
          // Handle number sorting
          if (sortBy === 'totalAmount' || sortBy === 'guests') {
            aValue = Number(aValue) || 0;
            bValue = Number(bValue) || 0;
          }
          
          // Handle string sorting
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }
          
          if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
          } else {
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
          }
        });
        
        setState(prev => ({
          ...prev,
          bookings: sortedBookings,
          totalPages: result.totalPages,
          totalElements: result.totalElements,
          currentPage: result.pageNumber,
          loading: false
        }));
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.response?.data?.message || 'Error occurred while loading data',
        loading: false
      }));
    }
  };

  // Effects
  useEffect(() => {
    loadBookings(0);
  }, [statusFilter, paymentFilter, dateFilter, sortBy]);
  
  // Effect riêng cho sortOrder để re-sort data đã có
  useEffect(() => {
    if (state.bookings.length > 0) {
      const sortedBookings = [...state.bookings].sort((a, b) => {
        let aValue: any = a[sortBy as keyof BookingResponse];
        let bValue: any = b[sortBy as keyof BookingResponse];
        
        // Handle date sorting
        if (sortBy.includes('Date') || sortBy === 'createdAt' || sortBy === 'updatedAt') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }
        
        // Handle number sorting
        if (sortBy === 'totalAmount' || sortBy === 'guests') {
          aValue = Number(aValue) || 0;
          bValue = Number(bValue) || 0;
        }
        
        // Handle string sorting
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
      });
      
      setState(prev => ({ ...prev, bookings: sortedBookings }));
    }
  }, [sortOrder]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm !== '') {
        loadBookings(0);
      } else {
        loadBookings(0);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  useEffect(() => {
    loadBookings(state.currentPage);
  }, [searchTerm, statusFilter, paymentFilter, dateFilter, sortBy, sortOrder]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showDropdown && !target.closest('[data-dropdown-container]') && !target.closest('.fixed')) {
        setShowDropdown(null);
        setDropdownPosition(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Event handlers
  const handlePageChange = (page: number) => {
    loadBookings(page);
  };

  const handleRefresh = () => {
    loadBookings(state.currentPage);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleSelectBooking = (bookingId: string) => {
    setSelectedBookings(prev => 
      prev.includes(bookingId) 
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBookings.length === state.bookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(state.bookings.map(b => b.id));
    }
  };

  const handleViewBooking = (bookingId: string) => {
    navigate(`/admin/bookings/${bookingId}`);
  };

  const handleConfirmBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to confirm this booking?')) {
      return;
    }
    
    try {
      await bookingAPI.confirmBooking(bookingId);
      await loadBookings(state.currentPage);
      alert('Booking confirmed successfully!');
    } catch (error: any) {
      console.error('Error confirming booking:', error);
      alert(error.response?.data?.message || 'Error occurred while confirming booking');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    const reason = prompt('Please enter cancellation reason:');
    if (!reason) return;
    
    if (!window.confirm(`Are you sure you want to cancel this booking?\nReason: ${reason}`)) {
      return;
    }
    
    try {
      await bookingAPI.cancelBooking(bookingId, reason);
      await loadBookings(state.currentPage);
      alert('Booking cancelled successfully!');
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      alert(error.response?.data?.message || 'Error occurred while cancelling booking');
    }
  };

  const handleConfirmPayment = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to confirm this payment? This action cannot be undone.')) {
      return;
    }
    
    try {
      await bookingAPI.adminConfirmPayment(bookingId);
      await loadBookings(state.currentPage);
      alert('Payment confirmed successfully!');
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      alert(error.response?.data?.message || 'Error occurred while confirming payment');
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to DELETE this booking? This action cannot be undone and will permanently remove all booking data.')) {
      return;
    }
    
    try {
      await bookingAPI.deleteBooking(bookingId);
      await loadBookings(state.currentPage);
      alert('Booking deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting booking:', error);
      alert(error.response?.data?.message || 'Error occurred while deleting booking');
    }
    setShowDropdown(null);
    setDropdownPosition(null);
  };

  const handleEditBooking = (bookingId: string) => {
    const booking = state.bookings.find(b => b.id === bookingId);
    if (booking) {
      setSelectedBooking(booking);
      setShowEditModal(true);
      setShowDropdown(null);
      setDropdownPosition(null);
    }
  };

  const handleBulkAction = async (action: 'confirm' | 'cancel' | 'delete') => {
    if (selectedBookings.length === 0) {
      alert('Please select at least one booking');
      return;
    }

    if (!window.confirm(`Are you sure you want to ${action} ${selectedBookings.length} selected bookings?`)) {
      return;
    }

    setBulkActionLoading(true);
    try {
      const promises = selectedBookings.map(id => {
        switch (action) {
          case 'confirm':
            return bookingAPI.confirmBooking(id);
          case 'cancel':
            return bookingAPI.cancelBooking(id, 'Bulk cancel by admin');
          case 'delete':
            return bookingAPI.deleteBooking(id);
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);
      setSelectedBookings([]);
      await loadBookings(state.currentPage);
    } catch (error: any) {
      alert(error.response?.data?.message || `Error occurred while ${action}ing bookings`);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleExportBookings = async () => {
    try {
      // This would typically call a backend export API
      const allBookings = await bookingAPI.getAllBookings({ pageSize: 1000 });
      const csvContent = convertToCSV(allBookings.data.result.content);
      downloadCSV(csvContent, `bookings_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error: any) {
      alert('Error occurred while exporting data');
    }
  };

  // Utility functions
  const convertToCSV = (bookings: BookingResponse[]): string => {
    const headers = [
      'ID', 'Reference', 'Guest Name', 'Guest Email', 'Guest Phone',
      'Hotel Name', 'Room Type', 'Check In', 'Check Out', 'Guests',
      'Total Amount', 'Status', 'Payment Status', 'Created At'
    ];

    const rows = bookings.map(booking => [
      booking.id,
      booking.bookingReference,
      booking.guestName,
      booking.guestEmail,
      booking.guestPhone,
      booking.hotelName,
      booking.roomTypeName,
      booking.checkInDate,
      booking.checkOutDate,
      booking.guests,
      booking.totalAmount,
      booking.status,
      booking.paymentStatus,
      booking.createdAt
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    return <BookingStatusBadge status={status as any} size="sm" />;
  };

  const getPaymentStatusBadge = (status: string) => {
    return <PaymentStatusBadge status={status as any} size="sm" />;
  };

  // Edit Modal Component
  const EditBookingModal = () => {
    const [formData, setFormData] = useState<BookingUpdateRequest>({});
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
      if (selectedBooking) {
        setFormData({
          guestName: selectedBooking.guestName,
          guestEmail: selectedBooking.guestEmail,
          guestPhone: selectedBooking.guestPhone,
          checkInDate: selectedBooking.checkInDate,
          checkOutDate: selectedBooking.checkOutDate,
          guests: selectedBooking.guests,
          totalAmount: selectedBooking.totalAmount,
          status: selectedBooking.status,
          paymentStatus: selectedBooking.paymentStatus,
          paymentMethod: selectedBooking.paymentMethod,
          specialRequests: selectedBooking.specialRequests || ''
        });
      }
    }, [selectedBooking]);

    const handleInputChange = (field: keyof BookingUpdateRequest, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedBooking) return;

      setLoading(true);
      try {
        await bookingAPI.updateBooking(selectedBooking.id, formData);
        await loadBookings(state.currentPage);
        setShowEditModal(false);
        setSelectedBooking(null);
        alert('Booking updated successfully!');
      } catch (error: any) {
        console.error('Error updating booking:', error);
        alert(error.response?.data?.message || 'Error occurred while updating booking');
      } finally {
        setLoading(false);
      }
    };

    if (!showEditModal || !selectedBooking) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001] p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Edit Booking - {selectedBooking.bookingReference}
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedBooking(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Guest Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Guest Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guest Name
                  </label>
                  <input
                    type="text"
                    value={formData.guestName || ''}
                    onChange={(e) => handleInputChange('guestName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.guestEmail || ''}
                    onChange={(e) => handleInputChange('guestEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.guestPhone || ''}
                    onChange={(e) => handleInputChange('guestPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guests
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.guests || 1}
                    onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={formData.checkInDate || ''}
                    onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={formData.checkOutDate || ''}
                    onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.totalAmount || 0}
                    onChange={(e) => handleInputChange('totalAmount', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <input
                    type="text"
                    value={formData.paymentMethod || ''}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="CASH_ON_CHECKIN, CREDIT_CARD, etc."
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Booking Status
                  </label>
                  <select
                    value={formData.status || 'PENDING'}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="CANCELLED_BY_GUEST">Cancelled by Guest</option>
                    <option value="CANCELLED_BY_HOST">Cancelled by Host</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="NO_SHOW">No Show</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={formData.paymentStatus || 'PENDING'}
                    onChange={(e) => handleInputChange('paymentStatus', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                    <option value="PARTIALLY_REFUNDED">Partially Refunded</option>
                    <option value="REFUND_PENDING">Refund Pending</option>
                    <option value="NO_PAYMENT">No Payment</option>
                    <option value="CANCELLED">No Refund</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Requests
              </label>
              <textarea
                value={formData.specialRequests || ''}
                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter any special requests..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedBooking(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  'Update Booking'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (state.loading && state.bookings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading data...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            {state.totalElements} bookings • Page {state.currentPage + 1} / {state.totalPages}
          </p>
        </div>
        {/* <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={state.loading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <RefreshCw size={16} className={`mr-2 ${state.loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExportBookings}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <FileSpreadsheet size={16} className="mr-2" />
            Export Excel
          </button>
        </div> */}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 relative"> 
            <input
              type="text"
              placeholder="Search by booking code, guest name, email, hotel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {showFilters ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="CANCELLED_BY_GUEST">Cancelled by Guest</option>
                  <option value="CANCELLED_BY_HOST">Cancelled by Host</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="NO_SHOW">No Show</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment</label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Payment</option>
                  <option value="PENDING">Pending Payment</option>
                  <option value="PAID">Paid</option>
                  <option value="FAILED">Failed</option>
                  <option value="REFUNDED">Refunded</option>
                  <option value="PARTIALLY_REFUNDED">Partially Refunded</option>
                  <option value="REFUND_PENDING">Refund Pending</option>
                  <option value="NO_PAYMENT">No Payment</option>
                  <option value="CANCELLED">No Refund</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="thisWeek">This Week</option>
                  <option value="thisMonth">This Month</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort</label>
                <div className="flex space-x-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="createdAt">Created Date</option>
                    <option value="checkInDate">Check-in Date</option>
                    <option value="checkOutDate">Check-out Date</option>
                    <option value="totalAmount">Amount</option>
                    <option value="guestName">Guest Name</option>
                    <option value="hotelName">Hotel Name</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                    title={sortOrder === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
                  >
                    {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedBookings.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              {selectedBookings.length} bookings selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('confirm')}
                disabled={bulkActionLoading}
                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
              >
                <Check size={14} className="mr-1" />
                Confirm
              </button>
              <button
                onClick={() => handleBulkAction('cancel')}
                disabled={bulkActionLoading}
                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
              >
                <X size={14} className="mr-1" />
                Cancel
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                disabled={bulkActionLoading}
                className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center"
              >
                <Trash2 size={14} className="mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-800">{state.error}</p>
          </div>
        </div>
      )}

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedBookings.length === state.bookings.length && state.bookings.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" 
                    onClick={() => handleSort('bookingReference')}>
                  <div className="flex items-center">
                    Booking Code
                    {sortBy === 'bookingReference' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('guestName')}>
                  <div className="flex items-center">
                    Guest Info
                    {sortBy === 'guestName' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('hotelName')}>
                  <div className="flex items-center">
                    Hotel & Room
                    {sortBy === 'hotelName' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('checkInDate')}>
                  <div className="flex items-center">
                    Dates
                    {sortBy === 'checkInDate' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('totalAmount')}>
                  <div className="flex items-center">
                    Amount
                    {sortBy === 'totalAmount' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {state.bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedBookings.includes(booking.id)}
                      onChange={() => handleSelectBooking(booking.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{booking.bookingReference}</div>
                    <div className="text-sm text-gray-500">{formatDate(booking.createdAt)}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{booking.guestName}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {booking.guestEmail}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {booking.guestPhone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.hotelName}</div>
                        <div className="text-sm text-gray-500">{booking.roomTypeName}</div>
                        <div className="text-sm text-gray-500">{booking.guests} guests</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        {formatDate(booking.checkInDate)}
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        {formatDate(booking.checkOutDate)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {booking.numberOfNights} nights
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(booking.totalAmount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(booking.pricePerNight)}/night
                    </div>
                    <div className="flex items-center mt-1">
                      <CreditCard className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">{booking.paymentMethod || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {getStatusBadge(booking.status)}
                      {getPaymentStatusBadge(booking.paymentStatus)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {booking.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleConfirmBooking(booking.id)}
                            className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-full transition-colors"
                            title="Confirm"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-full transition-colors"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                      {booking.paymentStatus === 'PENDING' && (
                        <button
                          onClick={() => handleConfirmPayment(booking.id)}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-full transition-colors"
                          title="Confirm Payment"
                        >
                          <DollarSign size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleViewBooking(booking.id)}
                        className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-full transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <div className="relative" data-dropdown-container>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            const rect = e.currentTarget.getBoundingClientRect();
                            setDropdownPosition({ 
                              x: rect.right - 160, 
                              y: rect.bottom + 4 
                            });
                            setShowDropdown(showDropdown === booking.id ? null : booking.id);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                          title="More actions"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {state.bookings.length === 0 && !state.loading && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' 
                ? 'No bookings match your current filters.'
                : 'No bookings in the system yet.'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {state.totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(Math.max(0, state.currentPage - 1))}
                  disabled={state.currentPage === 0}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    state.currentPage === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(Math.min(state.totalPages - 1, state.currentPage + 1))}
                  disabled={state.currentPage === state.totalPages - 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    state.currentPage === state.totalPages - 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{state.currentPage * pageSize + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min((state.currentPage + 1) * pageSize, state.totalElements)}
                    </span>{' '}
                    of <span className="font-medium">{state.totalElements}</span> bookings
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(Math.max(0, state.currentPage - 1))}
                      disabled={state.currentPage === 0}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        state.currentPage === 0
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous page</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, state.totalPages) }).map((_, index) => {
                      const pageNumber = Math.max(0, Math.min(state.totalPages - 5, state.currentPage - 2)) + index;
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            state.currentPage === pageNumber
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber + 1}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(Math.min(state.totalPages - 1, state.currentPage + 1))}
                      disabled={state.currentPage === state.totalPages - 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        state.currentPage === state.totalPages - 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next page</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Position Dropdown */}
      {showDropdown && dropdownPosition && (
        <div 
          className="fixed bg-white rounded-lg shadow-2xl z-[1000] border border-gray-200 py-1 min-w-max"
          style={{
            left: `${dropdownPosition.x}px`,
            top: `${dropdownPosition.y}px`
          }}
        >
          <button
            onClick={() => handleEditBooking(showDropdown)}
            className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center transition-colors whitespace-nowrap"
          >
            <Edit size={14} className="mr-2" />
            Edit Booking
          </button>
          <button
            onClick={() => handleDeleteBooking(showDropdown)}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors whitespace-nowrap"
          >
            <Trash2 size={14} className="mr-2" />
            Delete Booking
          </button>
        </div>
      )}

      {/* Edit Modal */}
      <EditBookingModal />
    </div>
  );
};

export default AdminBookings;

