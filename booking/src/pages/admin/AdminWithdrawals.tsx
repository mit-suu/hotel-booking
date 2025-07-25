import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface WalletTransaction {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  transactionType: 'REFUND' | 'WITHDRAWAL';
  amount: number;
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  note?: string;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  referenceId?: string;
}

interface DataResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  isLastPage: boolean;
}

export default function AdminWithdrawals() {
  const { showToast } = useToast();
  const [withdrawals, setWithdrawals] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showPendingOnly, setShowPendingOnly] = useState(true);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const endpoint = showPendingOnly 
        ? `/admin/withdrawal-requests/pending?pageNumber=${currentPage}&pageSize=10`
        : `/admin/withdrawal-requests?pageNumber=${currentPage}&pageSize=10${statusFilter ? `&status=${statusFilter}` : ''}`;
      
      const response = await api.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data: DataResponse<WalletTransaction> = response.data.result;
      setWithdrawals(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      showToast('error', 'Failed to fetch withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [currentPage, statusFilter, showPendingOnly]);

  const handleApprove = async (transactionId: string) => {
    const note = prompt('Enter approval note (optional):');
    
    try {
      setProcessing(transactionId);
      const token = localStorage.getItem('token');
      await api.post(`/admin/withdrawal-requests/${transactionId}/approve`, null, {
        headers: { Authorization: `Bearer ${token}` },
        params: note ? { note } : {}
      });

      showToast('success', 'Withdrawal request approved successfully');
      fetchWithdrawals();
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      showToast('error', 'Failed to approve withdrawal request');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (transactionId: string) => {
    const note = prompt('Enter rejection reason:');
    if (!note) {
      showToast('error', 'Rejection reason is required');
      return;
    }

    try {
      setProcessing(transactionId);
      const token = localStorage.getItem('token');
      await api.post(`/admin/withdrawal-requests/${transactionId}/reject`, null, {
        headers: { Authorization: `Bearer ${token}` },
        params: { note }
      });

      showToast('success', 'Withdrawal request rejected successfully');
      fetchWithdrawals();
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      showToast('error', 'Failed to reject withdrawal request');
    } finally {
      setProcessing(null);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status as keyof typeof statusClasses]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Withdrawal Requests Management</h1>
          </div>
          
          {/* Filters */}
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="pendingOnly"
                checked={showPendingOnly}
                onChange={(e) => setShowPendingOnly(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="pendingOnly" className="ml-2 text-sm text-gray-700">
                Show pending only
              </label>
            </div>
            
            {!showPendingOnly && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All statuses</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No withdrawal requests found
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {withdrawal.userName || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {withdrawal.userEmail || withdrawal.userId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-red-600">
                        {formatAmount(withdrawal.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {withdrawal.description}
                      </div>
                      {withdrawal.note && (
                        <div className="text-xs text-gray-500 mt-1">
                          Note: {withdrawal.note}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(withdrawal.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(withdrawal.createdAt)}
                      {withdrawal.processedAt && (
                        <div className="text-xs text-gray-400">
                          Processed: {formatDate(withdrawal.processedAt)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {withdrawal.status === 'PENDING' ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(withdrawal.id)}
                            disabled={processing === withdrawal.id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            {processing === withdrawal.id ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleReject(withdrawal.id)}
                            disabled={processing === withdrawal.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            {processing === withdrawal.id ? 'Processing...' : 'Reject'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400">
                          {withdrawal.status === 'COMPLETED' ? 'Approved' : 
                           withdrawal.status === 'FAILED' ? 'Rejected' : 'N/A'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Page {currentPage + 1} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 