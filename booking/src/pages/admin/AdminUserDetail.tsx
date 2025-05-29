import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Trash, Mail, Phone, MapPin, Calendar, 
  User, Shield, Clock, CheckCircle, XCircle, RefreshCw, Settings,
  MailCheck, MailX 
} from 'lucide-react';
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

interface UserResponse {
  code: number;
  success: boolean;
  message: string;
  result: User;
}

const AdminUserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUser(id);
    }
  }, [id]);

  const fetchUser = async (userId: string) => {
    try {
      setLoading(true);
      const response = await userAPI.getUser(userId);
      const data = response.data as UserResponse;
      
      if (data.success) {
        setUser(data.result);
      } else {
        showToast('error', 'Lỗi', data.message || 'Không thể tải thông tin người dùng');
        navigate('/admin/users');
      }
    } catch (error: any) {
      console.error('Error fetching user:', error);
      showToast('error', 'Lỗi', 'Không thể kết nối đến server');
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/admin/users/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!user) return;

    if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.name}" không?`)) {
      try {
        setActionLoading(true);
        await userAPI.deleteUser(user.id);
        showToast('success', 'Thành công', 'Đã xóa người dùng thành công');
        navigate('/admin/users');
      } catch (error: any) {
        console.error('Error deleting user:', error);
        const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xóa người dùng';
        showToast('error', 'Lỗi', errorMessage);
      } finally {
        setActionLoading(false);
      }
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

  const formatDateOfBirth = (dateString?: string) => {
    if (!dateString) return 'Chưa cập nhật';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getRoleBadges = (roles: Array<{name: string, description: string}>) => {
    return roles.map((role, index) => (
      <span 
        key={index} 
        className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
          role.name === 'ADMIN' 
            ? 'bg-purple-100 text-purple-800' 
            : role.name === 'HOST'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
        }`}
      >
        <Shield className="h-4 w-4 mr-1" />
        {role.name === 'ADMIN' ? 'Quản trị viên' : role.name === 'HOST' ? 'Chủ khách sạn' : 'Người dùng'}
      </span>
    ));
  };

  const handleRoleModalSuccess = () => {
    // Refresh user data after role update
    if (id) {
      fetchUser(id);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy người dùng</h2>
        <button
          onClick={() => navigate('/admin/users')}
          className="text-blue-600 hover:text-blue-800"
        >
          Quay lại danh sách người dùng
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} className="mr-2" />
            Quay lại
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Chi tiết người dùng</h1>
            <p className="text-gray-600 mt-1">Thông tin chi tiết của {user.name}</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => fetchUser(user.id)}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center disabled:opacity-50"
          >
            <RefreshCw size={20} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
          
          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
          >
            <Settings size={20} className="mr-2" />
            Quản lý vai trò
          </button>
          
          <button
            onClick={handleEdit}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Edit size={20} className="mr-2" />
            Chỉnh sửa
          </button>
          
          <button
            onClick={handleDelete}
            disabled={actionLoading}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
          >
            {actionLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Trash size={20} className="mr-2" />
            )}
            Xóa
          </button>
        </div>
      </div>

      {/* User Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center space-x-6 mb-6">
              <div className="h-20 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-600">@{user.username}</p>
                <div className="flex items-center mt-2">
                  {user.active ? (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Hoạt động
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                      <XCircle className="h-3 w-3 mr-1" />
                      Vô hiệu
                    </span>
                  )}
                  <span className="ml-2 text-xs text-gray-500">
                    (Có thể thay đổi trong phần chỉnh sửa)
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-900">{user.email}</p>
                      {user.emailVerified ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          <MailCheck className="h-3 w-3 mr-1" /> 
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          <MailX className="h-3 w-3 mr-1" /> 
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {user.tel && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Số điện thoại</p>
                      <p className="text-gray-900">{user.tel}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Ngày sinh</p>
                    <p className="text-gray-900">{formatDateOfBirth(user.dob)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {user.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Địa chỉ</p>
                      <p className="text-gray-900">{user.address}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Ngày tạo</p>
                    <p className="text-gray-900">{formatDate(user.createAt)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Cập nhật gần đây</p>
                    <p className="text-gray-900">{formatDate(user.updateAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Roles & Permissions Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Vai trò & Quyền hạn
              </h3>
              <button
                onClick={() => setIsRoleModalOpen(true)}
                className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center"
              >
                <Settings className="h-4 w-4 mr-1" />
                Chỉnh sửa
              </button>
            </div>
            
            <div className="space-y-3">
              {user.roles.map((role, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    {getRoleBadges([role])}
                  </div>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </div>
              ))}
            </div>

            {user.roles.length === 0 && (
              <p className="text-gray-500 text-center py-4">Chưa có vai trò nào được gán</p>
            )}
          </div>
        </div>
      </div>

      {/* Activity & Statistics */}
      <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê hoạt động</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-blue-600">Đặt phòng</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-green-600">Đánh giá</div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">0</div>
              <div className="text-sm text-yellow-600">Khách sạn</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.floor((new Date().getTime() - new Date(user.createAt).getTime()) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="text-sm text-purple-600">Ngày tham gia</div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Management Modal */}
      {user && (
        <UserRoleModal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          user={user}
          onSuccess={handleRoleModalSuccess}
        />
      )}
    </div>
  );
};

export default AdminUserDetail; 