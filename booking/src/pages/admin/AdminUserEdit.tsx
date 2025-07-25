import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, User, Mail, Phone, MapPin, Calendar, 
  Shield, Eye, EyeOff, AlertCircle, MailCheck, MailX 
} from 'lucide-react';
import { userAPI, UserUpdateRequest, AdminPasswordUpdateRequest } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

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

const AdminUserEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    tel: '',
    address: '',
    dob: '',
    password: '',
    confirmPassword: '',
    changePassword: false,
    active: true,
    emailVerified: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
        setFormData({
          name: data.result.name,
          username: data.result.username,
          email: data.result.email,
          tel: data.result.tel || '',
          address: data.result.address || '',
          dob: data.result.dob || '',
          password: '',
          confirmPassword: '',
          changePassword: false,
          active: data.result.active,
          emailVerified: data.result.emailVerified
        });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
              newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
    }

    // Phone validation (optional)
    if (formData.tel && formData.tel.trim()) {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(formData.tel.replace(/\s/g, ''))) {
        newErrors.tel = 'Invalid phone number (10-11 digits)';
      }
    }

    // Password validation (if changing password)
    if (formData.changePassword) {
      if (!formData.password) {
        newErrors.password = 'New password is required';
      } else if (formData.password.length < 8) {
                  newErrors.password = 'Password must be at least 8 characters';
      }

      if (formData.password !== formData.confirmPassword) {
                  newErrors.confirmPassword = 'Password confirmation does not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) {
      return;
    }

    setSaving(true);
    
    try {
      // First, update user profile information
      const updateData: UserUpdateRequest = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        tel: formData.tel || undefined,
        address: formData.address || undefined,
        dob: formData.dob || undefined,
        // Bảo vệ tài khoản admin - không cho phép thay đổi status
        active: formData.username === 'adminadmin' ? user.active : formData.active,
        emailVerified: formData.username === 'adminadmin' ? user.emailVerified : formData.emailVerified
      };

      await userAPI.updateUser(user.id, updateData);
      
      // Handle password update separately if requested
      if (formData.changePassword && formData.password) {
        // For admin, we'll use a special admin password update endpoint
        // Note: Admin doesn't need current password verification
        const passwordUpdateData: AdminPasswordUpdateRequest = {
          newPassword: formData.password
        };
        
        try {
          await userAPI.adminUpdatePassword(user.id, passwordUpdateData);
        } catch (passwordError: any) {
          // If password update fails, still show success for profile update
          console.error('Password update error:', passwordError);
          showToast('warning', 'Warning', 'Information updated but there was an error changing the password');
        }
      }
      
              let successMessage = 'User information has been updated successfully!';
      // Chỉ hiển thị thông báo thay đổi status cho non-admin users
      if (formData.username !== 'adminadmin') {
        if (updateData.active !== user.active) {
                    const statusText = updateData.active ? 'activated' : 'deactivated';
            successMessage += ` Account status has been ${statusText}.`;
        }
        if (updateData.emailVerified !== user.emailVerified) {
                    const verificationText = updateData.emailVerified ? 'has been verified' : 'has been unverified';
          successMessage += ` Email ${verificationText}.`;
        }
      }
      if (formData.changePassword && formData.password) {
                  successMessage += ' Password has been changed.';
      }
      
      showToast('success', 'Success', successMessage);
      navigate(`/admin/users/${user.id}`);
      
    } catch (error: any) {
      console.error('Update user error:', error);
              const errorMessage = error.response?.data?.message || 'An error occurred while updating user information';
      showToast('error', 'Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/admin/users/${id}`);
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
                          Back to user list
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
            onClick={() => navigate(`/admin/users/${id}`)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Edit User</h1>
            <p className="text-gray-600 mt-1">Update information for {user.name}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* User Avatar & Basic Info */}
          <div className="flex items-center space-x-6 pb-6 border-b border-gray-200">
            <div className="h-20 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {formData.name.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
                          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            <p className="text-gray-600">Update user's personal information</p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter full name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.username ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter username"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.username}
                </p>
              )}
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
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter email address"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  name="tel"
                  value={formData.tel}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.tel ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter phone number"
                />
              </div>
              {errors.tel && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.tel}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter address"
              />
            </div>
          </div>

          {/* Password Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="changePassword"
                name="changePassword"
                checked={formData.changePassword}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="changePassword" className="ml-2 block text-sm font-medium text-gray-700">
                Change Password
              </label>
            </div>

            {formData.changePassword && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password *
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-10 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-10 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Current Role Display */}
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
              To change role, please contact a higher-level administrator.
            </p>
          </div>

          {/* User Status Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Account Status
            </h3>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">Activate Account</h4>
                <p className="text-sm text-gray-500">
                  {formData.active 
                                  ? 'Account is active and can login normally'
              : 'Account is disabled and cannot login'
                  }
                </p>
              </div>
              
              <div className="flex items-center ml-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, active: !prev.active }))}
                  disabled={formData.username === 'adminadmin'}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    formData.username === 'adminadmin' 
                      ? 'cursor-not-allowed opacity-50 bg-gray-300' 
                      : `cursor-pointer ${formData.active ? 'bg-green-600' : 'bg-gray-200'}`
                  }`}
                  title={formData.username === 'adminadmin' ? 'Cannot change admin account status' : ''}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      formData.active ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className={`ml-3 text-sm font-medium ${
                  formData.username === 'adminadmin' ? 'text-gray-400' : 
                  formData.active ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {formData.active ? 'Active' : 'Inactive'}
                  {formData.username === 'adminadmin' && (
                    <span className="text-xs text-gray-500 block">Protected</span>
                  )}
                </span>
              </div>
            </div>

            {!formData.active && formData.username !== 'adminadmin' && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Disabling the account will prevent users from logging into the system. They will not be able to access any features until the account is reactivated.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Admin Protection Notice */}
            {formData.username === 'adminadmin' && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5v3a.75.75 0 001.5 0v-3A.75.75 0 009 9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Admin Account Protection</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>This is the main admin account and its status cannot be changed for security reasons.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Email Verification Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MailCheck className="h-5 w-5 mr-2" />
              Email Verification Status
            </h3>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">Email Verified</h4>
                <p className="text-sm text-gray-500">
                  {formData.emailVerified 
                                        ? 'User email has been verified and can receive notifications'
                    : 'Email not verified, user may not receive notifications'
                  }
                </p>
              </div>
              
              <div className="flex items-center ml-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, emailVerified: !prev.emailVerified }))}
                  disabled={formData.username === 'adminadmin'}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    formData.username === 'adminadmin' 
                      ? 'cursor-not-allowed opacity-50 bg-gray-300' 
                      : `cursor-pointer ${formData.emailVerified ? 'bg-green-600' : 'bg-gray-200'}`
                  }`}
                  title={formData.username === 'adminadmin' ? 'Cannot change admin email verification status' : ''}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      formData.emailVerified ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className={`ml-3 text-sm font-medium ${
                  formData.username === 'adminadmin' ? 'text-gray-400' : 
                  formData.emailVerified ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {formData.emailVerified ? 'Verified' : 'Unverified'}
                  {formData.username === 'adminadmin' && (
                    <span className="text-xs text-gray-500 block">Protected</span>
                  )}
                </span>
              </div>
            </div>

            {formData.emailVerified !== user?.emailVerified && formData.username !== 'adminadmin' && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Change Verification Status</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                                        You are {formData.emailVerified ? 'marking email as verified' : 'unverifying email'}.
                This change will take effect after saving.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Admin Email Verification Protection Notice */}
            {formData.username === 'adminadmin' && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5v3a.75.75 0 001.5 0v-3A.75.75 0 009 9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Admin Email Protection</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Admin email verification status is protected and cannot be modified.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminUserEdit; 