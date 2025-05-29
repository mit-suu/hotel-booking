import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash, Eye, Mail, Phone, Calendar, Filter, RefreshCw, Settings, MailCheck, MailX } from 'lucide-react';
import { userAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import UserRoleModal from '../../components/admin/UserRoleModal';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  tel?: string;
  address?: string;
  dob?: string;
  createAt: string;
  updateAt: string;
  roles: Array<{
    id: number;
    name: string;
    description: string;
  }>;
  active: boolean;
  emailVerified: boolean;
}

interface ApiResponse {
  code: number;
  success: boolean;
  message: string;
  result: {
    content: User[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [emailVerificationFilter, setEmailVerificationFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0); // API uses 0-based pagination
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(null);

  const itemsPerPage = 10;

  // Fetch users from API
  const fetchUsers = async (page = 0, size = itemsPerPage, sortBy = 'id') => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers(page, size, sortBy);
      const data = response.data as ApiResponse;
      
      if (data.success) {
        setUsers(data.result.content);
        setTotalPages(data.result.totalPages);
        setTotalElements(data.result.totalElements);
        setCurrentPage(data.result.number);
      } else {
        showToast('error', 'Lỗi', data.message || 'Không thể tải danh sách người dùng');
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      showToast('error', 'Lỗi', 'Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term, role, status, and email verification
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const userRoles = user.roles.map(role => role.name);
    const matchesRole = roleFilter === 'all' || userRoles.includes(roleFilter);
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.active) ||
      (statusFilter === 'inactive' && !user.active);
    const matchesEmailVerification = emailVerificationFilter === 'all' ||
      (emailVerificationFilter === 'verified' && user.emailVerified) ||
      (emailVerificationFilter === 'unverified' && !user.emailVerified);
    
    return matchesSearch && matchesRole && matchesStatus && matchesEmailVerification;
  });

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

  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
    setIsSelectAll(!isSelectAll);
  };

  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleRefresh = () => {
    fetchUsers(currentPage);
    setSelectedUsers([]);
    setIsSelectAll(false);
  };

  const handlePageChange = (newPage: number) => {
    fetchUsers(newPage);
    setSelectedUsers([]);
    setIsSelectAll(false);
  };

  const handleAddUser = () => {
    navigate('/admin/users/add');
  };

  const handleEditUser = (userId: string) => {
    navigate(`/admin/users/edit/${userId}`);
  };

  const handleViewUser = (userId: string) => {
    navigate(`/admin/users/${userId}`);
  };

  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.name}" không?`)) {
      try {
        setActionLoading(userId);
        await userAPI.deleteUser(userId);
        showToast('success', 'Thành công', 'Đã xóa người dùng thành công');
        fetchUsers(currentPage); // Refresh current page
      } catch (error: any) {
        console.error('Error deleting user:', error);
        const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xóa người dùng';
        showToast('error', 'Lỗi', errorMessage);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedUsers.length === 0) return;
    
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedUsers.length} người dùng đã chọn không?`)) {
      try {
        setActionLoading('bulk-delete');
        
        // Delete users one by one (since we don't have bulk delete API)
        const deletePromises = selectedUsers.map(userId => userAPI.deleteUser(userId));
        await Promise.all(deletePromises);
        
        showToast('success', 'Thành công', `Đã xóa ${selectedUsers.length} người dùng thành công`);
        setSelectedUsers([]);
        setIsSelectAll(false);
        fetchUsers(currentPage);
      } catch (error: any) {
        console.error('Error deleting users:', error);
        showToast('error', 'Lỗi', 'Có lỗi xảy ra khi xóa người dùng');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const getStatusBadge = (active: boolean) => {
    return active 
      ? <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Hoạt động</span>
      : <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Vô hiệu</span>;
  };

  const getRoleBadges = (roles: Array<{name: string}>) => {
    return roles.map((role, index) => (
      <span 
        key={index} 
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          role.name === 'ADMIN' 
            ? 'bg-purple-100 text-purple-800' 
            : role.name === 'HOST'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
        }`}
      >
        {role.name === 'ADMIN' ? 'Quản trị viên' : role.name === 'HOST' ? 'Chủ khách sạn' : 'Người dùng'}
      </span>
    ));
  };

  const handleManageRoles = (user: User) => {
    setSelectedUserForRole(user);
    setIsRoleModalOpen(true);
  };

  const handleRoleModalSuccess = () => {
    // Refresh current page after role update
    fetchUsers(currentPage);
    setSelectedUserForRole(null);
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Quản lý người dùng</h1>
          <p className="text-gray-600 mt-1">Tổng cộng {totalElements} người dùng</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center disabled:opacity-50"
          >
            <RefreshCw size={20} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
          <button
            onClick={handleAddUser}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Thêm người dùng
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, username, email..."
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
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="USER">Người dùng</option>
                <option value="HOST">Chủ khách sạn</option>
                <option value="ADMIN">Quản trị viên</option>
              </select>
            </div>
            <div className="flex items-center">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Vô hiệu</option>
              </select>
            </div>
            <div className="flex items-center">
              <select
                value={emailVerificationFilter}
                onChange={(e) => setEmailVerificationFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả email</option>
                <option value="verified">Đã xác thực</option>
                <option value="unverified">Chưa xác thực</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex justify-between items-center">
          <span className="text-blue-700">Đã chọn {selectedUsers.length} người dùng</span>
          <div className="flex gap-2">
            <button
              onClick={handleDeleteSelected}
              disabled={actionLoading === 'bulk-delete'}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
            >
              {actionLoading === 'bulk-delete' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
              ) : (
                <Trash size={16} className="mr-1" />
              )}
              Xóa đã chọn
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
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
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liên hệ
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
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
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Mail className="h-4 w-4 mr-1 text-gray-500" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span>{user.email}</span>
                          {user.emailVerified ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              <MailCheck className="h-3 w-3 mr-0.5" /> 
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                              <MailX className="h-3 w-3 mr-0.5" /> 
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {user.tel && (
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Phone className="h-4 w-4 mr-1 text-gray-500" />
                        {user.tel}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {getRoleBadges(user.roles)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.active)}
                  </td> 
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewUser(user.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleManageRoles(user)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Quản lý vai trò"
                      >
                        <Settings size={18} />
                      </button>
                      <button
                        onClick={() => handleEditUser(user.id)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Chỉnh sửa"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={actionLoading === user.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        title="Xóa"
                      >
                        {actionLoading === user.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash size={18} />
                        )}
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
                onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Trước
              </button>
              <button
                onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === totalPages - 1
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
                  Hiển thị <span className="font-medium">{currentPage * itemsPerPage + 1}</span> đến{' '}
                  <span className="font-medium">
                    {Math.min((currentPage + 1) * itemsPerPage, totalElements)}
                  </span>{' '}
                  trong tổng số <span className="font-medium">{totalElements}</span> người dùng
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === 0
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Trang trước</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
                    const pageNumber = currentPage < 3 ? index : currentPage - 2 + index;
                    if (pageNumber >= totalPages) return null;
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNumber
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber + 1}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === totalPages - 1
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

      {/* Empty State */}
      {filteredUsers.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Search size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy người dùng</h3>
          <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
        </div>
      )}

      {/* Role Management Modal */}
      {selectedUserForRole && (
        <UserRoleModal
          isOpen={isRoleModalOpen}
          onClose={() => {
            setIsRoleModalOpen(false);
            setSelectedUserForRole(null);
          }}
          user={selectedUserForRole}
          onSuccess={handleRoleModalSuccess}
        />
      )}
    </div>
  );
};

export default AdminUsers;

