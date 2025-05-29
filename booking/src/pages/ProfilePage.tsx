import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Key, Save, BookOpen, Calendar, Gift, CreditCard, 
  MapPin, Clock, CheckCircle, AlertCircle, Copy, Trash2, Plus,
  Phone, Camera, Edit, Star, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { userAPI, ProfileUpdateRequest, PasswordUpdateRequest } from '../services/api';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const { user, fetchUserInfo } = useAuth();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
    dateOfBirth: '',
    address: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        username: user.username || '',
        phone: user.tel || '',
        dateOfBirth: user.dob || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      showToast('error', 'Lỗi', 'Vui lòng nhập họ và tên');
      return false;
    }
    
    if (!formData.username.trim()) {
      showToast('error', 'Lỗi', 'Vui lòng nhập tên đăng nhập');
      return false;
    }

    return true;
  };

  const validatePasswordForm = (): boolean => {
    if (!passwordData.currentPassword) {
      showToast('error', 'Lỗi', 'Vui lòng nhập mật khẩu hiện tại');
      return false;
    }
    
    if (!passwordData.newPassword) {
      showToast('error', 'Lỗi', 'Vui lòng nhập mật khẩu mới');
      return false;
    }
    
    if (passwordData.newPassword.length < 8) {
      showToast('error', 'Lỗi', 'Mật khẩu mới phải có ít nhất 8 ký tự');
      return false;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('error', 'Lỗi', 'Mật khẩu xác nhận không khớp');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) {
      return;
    }

    setLoading(true);
    
    try {
      const updateData: ProfileUpdateRequest = {
        name: formData.name,
        username: formData.username,
        email: user.email, // Use original email (cannot be changed)
        tel: formData.phone,
        address: formData.address,
        dob: formData.dateOfBirth
      };

      await userAPI.updateMyProfile(updateData);
      
      // Refresh user info
      await fetchUserInfo();
      
      showToast('success', 'Thành công', 'Thông tin đã được cập nhật thành công!');
      setIsEditing(false);
      
    } catch (error: any) {
      console.error('Update profile error:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin';
      showToast('error', 'Lỗi', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm() || !user) {
      return;
    }

    setPasswordLoading(true);
    
    try {
      const passwordUpdateData: PasswordUpdateRequest = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      };

      await userAPI.updateMyPassword(passwordUpdateData);
      
      showToast('success', 'Thành công', 'Mật khẩu đã được thay đổi thành công!');
      
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error: any) {
      console.error('Update password error:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi thay đổi mật khẩu';
      showToast('error', 'Lỗi', errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        username: user.username || '',
        phone: user.tel || '',
        dateOfBirth: user.dob || '',
        address: user.address || ''
      });
    }
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const tabs = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: User },
    { id: 'password', label: 'Đổi mật khẩu', icon: Key },
    { id: 'upcoming', label: 'Đặt phòng sắp tới', icon: Calendar },
    { id: 'history', label: 'Lịch sử đặt phòng', icon: BookOpen },
    { id: 'vouchers', label: 'Mã giảm giá', icon: Gift },
    { id: 'payment', label: 'Phương thức thanh toán', icon: CreditCard }
  ];

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {formData.name.charAt(0).toUpperCase()}
          </div>
          <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border hover:bg-gray-50">
            <Camera size={16} className="text-gray-600" />
          </button>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{formData.name}</h2>
          <p className="text-gray-500">{formData.email}</p>
          {user?.createAt && (
            <p className="text-sm text-gray-400">
              Thành viên từ {formatDate(user.createAt)}
            </p>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Họ và tên *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={true}
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div className="mt-2 flex items-center justify-between">
              {user && (
                <div className="flex items-center text-sm">
                  {user.emailVerified ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Email đã được xác nhận
                    </div>
                  ) : (
                    <div className="flex items-center text-yellow-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Email chưa được xác nhận
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên đăng nhập *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={!isEditing}
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày sinh
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              disabled={!isEditing}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Địa chỉ
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            disabled={!isEditing}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div className="flex justify-end space-x-4">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Lưu thay đổi
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </button>
          )}
        </div>
      </form>
    </div>
  );

  const renderPasswordTab = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Lưu ý bảo mật</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Mật khẩu mới phải có ít nhất 8 ký tự và nên bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handlePasswordSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mật khẩu hiện tại *
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mật khẩu mới *
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Xác nhận mật khẩu mới *
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={passwordLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
          >
            {passwordLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang cập nhật...
              </>
            ) : (
              <>
                <Key className="h-4 w-4 mr-2" />
                Đổi mật khẩu
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderOtherTabs = () => (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <BookOpen size={48} className="mx-auto" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Tính năng đang phát triển</h3>
      <p className="text-gray-500">Tab này sẽ được hoàn thiện trong phiên bản tiếp theo.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tài khoản của tôi</h1>
          <p className="text-gray-600 mt-2">Quản lý thông tin cá nhân và hoạt động của bạn</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'password' && renderPasswordTab()}
            {activeTab !== 'profile' && activeTab !== 'password' && renderOtherTabs()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 