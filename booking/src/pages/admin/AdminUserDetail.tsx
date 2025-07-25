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
        showToast('error', 'Error', data.message || 'Unable to load user information');
        navigate('/admin/users');
      }
    } catch (error: any) {
      console.error('Error fetching user:', error);
              showToast('error', 'Error', 'Unable to connect to server');
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
    
    // Bảo vệ tài khoản admin chính
    if (user.username === 'adminadmin') {
      showToast('warning', 'Protected Account', 'Cannot delete the main admin account');
      return;
    }

          if (window.confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      try {
        setActionLoading(true);
        await userAPI.deleteUser(user.id);
                  showToast('success', 'Success', 'User deleted successfully');
        navigate('/admin/users');
      } catch (error: any) {
        console.error('Error deleting user:', error);
                  const errorMessage = error.response?.data?.message || 'An error occurred while deleting user';
        showToast('error', 'Error', errorMessage);
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
          if (!dateString) return 'Not updated';
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
        {role.name === 'ADMIN' ? 'Administrator' : role.name === 'HOST' ? 'Hotel Owner' : 'User'}
      </span>
    ));
  };

  const handleRoleModalSuccess = () => {
    // Refresh user data after role update
    if (id) {
      fetchUser(id);
    }
  };
  
  const handleOpenRoleModal = () => {
    // Bảo vệ tài khoản admin chính
    if (user && user.username === 'adminadmin') {
      showToast('warning', 'Protected Account', 'Cannot modify roles for the main admin account');
      return;
    }
    setIsRoleModalOpen(true);
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
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">User Not Found</h2>
        <button
          onClick={() => navigate('/admin/users')}
          className="text-blue-600 hover:text-blue-800"
        >
                      Back to User List
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
              Back
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">User Details</h1>
            <p className="text-gray-600 mt-1">Detailed information for {user.name}</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => fetchUser(user.id)}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center disabled:opacity-50"
          >
            <RefreshCw size={20} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                          Refresh
          </button>
          
          <button
            onClick={handleOpenRoleModal}
            disabled={user.username === 'adminadmin'}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
              user.username === 'adminadmin'
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-50'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
            title={user.username === 'adminadmin' ? 'Cannot modify roles for main admin account' : ''}
          >
            <Settings size={20} className="mr-2" />
                          Role Management
          </button>
          
          <button
            onClick={handleEdit}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Edit size={20} className="mr-2" />
            Edit
          </button>
          
          {/* Ẩn button delete cho tài khoản admin chính */}
          {user.username !== 'adminadmin' && (
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
              Delete
            </button>
          )}
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
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactive
                    </span>
                  )}
                  <span className="ml-2 text-xs text-gray-500">
                    (Can be changed in the edit section)
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
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-gray-900">{user.tel}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                    <p className="text-gray-900">{formatDateOfBirth(user.dob)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {user.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Address</p>
                      <p className="text-gray-900">{user.address}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created Date</p>
                    <p className="text-gray-900">{formatDate(user.createAt)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Updated</p>
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
                Roles & Permissions
              </h3>
              <button
                onClick={handleOpenRoleModal}
                disabled={user.username === 'adminadmin'}
                className={`text-sm font-medium flex items-center ${
                  user.username === 'adminadmin'
                    ? 'text-gray-400 cursor-not-allowed opacity-50'
                    : 'text-purple-600 hover:text-purple-800'
                }`}
                title={user.username === 'adminadmin' ? 'Cannot modify roles for main admin account' : ''}
              >
                <Settings className="h-4 w-4 mr-1" />
                {user.username === 'adminadmin' ? 'Protected' : 'Edit'}
              </button>
            </div>
            
            <div className="space-y-3">
              {user.roles.length > 0 ? (
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    {getRoleBadges([user.roles[0]])}
                  </div>
                  <p className="text-sm text-gray-600">{user.roles[0].description}</p>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No role assigned yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activity & Statistics */}
      <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Statistics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-blue-600">Booking</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-green-600">Review</div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">0</div>
                  <div className="text-sm text-yellow-600">Hotel</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.floor((new Date().getTime() - new Date(user.createAt).getTime()) / (1000 * 60 * 60 * 24))}
              </div>
                              <div className="text-sm text-purple-600">Join Date</div>
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

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Current Role
        </h3>
        <div className="flex flex-wrap gap-2">
          {user.roles.length > 0 ? (
            <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
              user.roles[0].name === 'ADMIN' 
                ? 'bg-purple-100 text-purple-800' 
                : user.roles[0].name === 'HOST'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
            }`}>
              <Shield className="h-4 w-4 mr-1" />
              {user.roles[0].name === 'ADMIN' ? 'Administrator' : 
               user.roles[0].name === 'HOST' ? 'Hotel Owner' : 'User'}
            </span>
          ) : (
            <span className="text-gray-500 text-sm">No role assigned</span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          To change role, please use the role management button above.
        </p>
      </div>
    </div>
  );
};

export default AdminUserDetail; 