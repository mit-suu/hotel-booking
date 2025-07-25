import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Key, Save, BookOpen, 
   Clock, CheckCircle, AlertCircle, 
  Phone, Camera, Edit,  Eye, EyeOff, Shield, Crown, Wallet,
   ArrowDownLeft, ArrowUpRight, Send, Receipt
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { userAPI, ProfileUpdateRequest, PasswordUpdateRequest, walletAPI, BankAccountRequest, WithdrawalRequest, WalletResponse, WalletTransactionResponse } from '../services/api';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [hostRequestLoading, setHostRequestLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
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

  // Wallet related state
  const [walletData, setWalletData] = useState<WalletResponse>({
    balance: 0,
    bankAccount: undefined
  });
  const [transactions, setTransactions] = useState<WalletTransactionResponse[]>([]);

  const [withdrawalData, setWithdrawalData] = useState({
    amount: '',
    note: ''
  });

  const [isEditingBank, setIsEditingBank] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  
  // Temporary bank account data for editing
  const [tempBankAccount, setTempBankAccount] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
    branch: ''
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

  // Load wallet data when activeTab is wallet
  useEffect(() => {
    if (activeTab === 'wallet') {
      fetchWalletData();
    }
  }, [activeTab]);

  const fetchWalletData = async () => {
    try {
      setWalletLoading(true);
      
      // Fetch wallet info
      const walletResponse = await walletAPI.getWalletInfo();
      setWalletData(walletResponse.result);
      
      // Fetch transaction history
      try {
        const transactionResponse = await walletAPI.getTransactionHistory(0, 10);
        console.log('Transaction API response:', transactionResponse);
        console.log('Transaction data:', transactionResponse.result.content);
        setTransactions(transactionResponse.result.content || []);
      } catch (transactionError) {
        console.error('Failed to fetch transaction history:', transactionError);
        setTransactions([]); // Set empty array on error
      }
      
    } catch (error: any) {
      console.error('Failed to fetch wallet data:', error);
      showToast('error', 'Error', 'Failed to load wallet information');
      // Set default values on error
      setTransactions([]);
    } finally {
      setWalletLoading(false);
    }
  };

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
      showToast('error', 'Error', 'Please enter your full name');
      return false;
    }
    
    if (!formData.username.trim()) {
      showToast('error', 'Error', 'Please enter your username');
      return false;
    }

    return true;
  };

  const validatePasswordForm = (): boolean => {
    if (!passwordData.currentPassword) {
      showToast('error', 'Error', 'Please enter current password');
      return false;
    }
    
    if (!passwordData.newPassword) {
      showToast('error', 'Error', 'Please enter new password');
      return false;
    }
    
    if (passwordData.newPassword.length < 8) {
      showToast('error', 'Error', 'New password must be at least 8 characters');
      return false;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('error', 'Error', 'Password confirmation does not match');
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
      
      showToast('success', 'Success', 'Information has been updated successfully!');
      setIsEditing(false);
      
    } catch (error: any) {
      console.error('Update profile error:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred while updating information';
      showToast('error', 'Error', errorMessage);
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
      
      showToast('success', 'Success', 'Password has been changed successfully!');
      
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error: any) {
      console.error('Update password error:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred while changing password';
      showToast('error', 'Error', errorMessage);
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

  const handleHostRequest = async () => {
    if (!user) return;

    setHostRequestLoading(true);
    try {
      await userAPI.requestHost();
      await fetchUserInfo(); // Refresh user info
              showToast('success', 'Success', 'Host request has been sent successfully!');
    } catch (error: any) {
      console.error('Host request error:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred while sending request';
      showToast('error', 'Error', errorMessage);
    } finally {
      setHostRequestLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const tabs = [
    { id: 'profile', label: 'Personal Information', icon: User },
    { id: 'password', label: 'Change Password', icon: Key }, 
    { id: 'wallet', label: 'Wallet Balance', icon: Wallet },
    { id: 'roles', label: 'Role Management', icon: Shield }, 
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
              Member since {formatDate(user.createAt)}
            </p>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
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
                      Email verified
                    </div>
                  ) : (
                    <div className="flex items-center text-yellow-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Email not verified
                    </div>
                  )}
                </div>
              )}
            </div>
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
                disabled={!isEditing}
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
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
              Date of Birth
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
            Address
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
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
              >
                {loading ? (
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
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
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
            <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
            <p className="text-sm text-yellow-700 mt-1">
              New password must be at least 8 characters and should include uppercase, lowercase, numbers and special characters.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handlePasswordSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password *
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
            New Password *
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
            Confirm New Password *
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
                Updating...
              </>
            ) : (
              <>
                <Key className="h-4 w-4 mr-2" />
                Change Password
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderWalletTab = () => {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND',
        minimumFractionDigits: 0
      }).format(amount);
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const handleBankAccountSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setWalletLoading(true);
      
      try {
        const bankAccountData: BankAccountRequest = {
          bankName: tempBankAccount.bankName,
          accountNumber: tempBankAccount.accountNumber,
          accountName: tempBankAccount.accountName,
          branch: tempBankAccount.branch
        };
        
        await walletAPI.saveBankAccount(bankAccountData);
        await fetchWalletData(); // Refresh wallet data
        
        showToast('success', 'Success', 'Bank account information has been saved');
        setIsEditingBank(false);
      } catch (error: any) {
        console.error('Save bank account error:', error);
        showToast('error', 'Error', 'Unable to save bank account information');
      } finally {
        setWalletLoading(false);
      }
    };

    const handleWithdrawSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!withdrawalData.amount || parseFloat(withdrawalData.amount) <= 0) {
        showToast('error', 'Error', 'Please enter a valid amount');
        return;
      }
      
      if (parseFloat(withdrawalData.amount) > walletData.balance) {
        showToast('error', 'Error', 'Insufficient balance for this transaction');
        return;
      }

      if (!walletData.bankAccount?.accountNumber) {
        showToast('error', 'Error', 'Please add bank account information first');
        return;
      }

      setWithdrawLoading(true);
      
      try {
        const withdrawalRequest: WithdrawalRequest = {
          amount: parseFloat(withdrawalData.amount),
          note: withdrawalData.note
        };
        
        await walletAPI.requestWithdrawal(withdrawalRequest);
        await fetchWalletData(); // Refresh wallet data
        
        showToast('success', 'Success', 'Withdrawal request has been sent');
        setShowWithdrawForm(false);
        setWithdrawalData({ amount: '', note: '' });
      } catch (error: any) {
        console.error('Withdrawal request error:', error);
        showToast('error', 'Error', 'Unable to send withdrawal request');
      } finally {
        setWithdrawLoading(false);
      }
    };

    // Use real transaction data from state
    // transactions is already defined in state
    console.log('renderWalletTab - transactions state:', transactions);
    console.log('renderWalletTab - transactions length:', transactions?.length);

    return (
      <div className="space-y-6">
        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Current Balance</p>
                <p className="text-3xl font-bold">{formatCurrency(walletData.balance)}</p>
                <p className="text-blue-100 text-xs mt-1">Available: {formatCurrency(walletData.balance)}</p>
              </div>
              <div className="p-3 bg-blue-400 bg-opacity-30 rounded-full">
                <Wallet size={32} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
              <button
                onClick={() => {
                  setTempBankAccount({
                    bankName: walletData.bankAccount?.bankName || '',
                    accountNumber: walletData.bankAccount?.accountNumber || '',
                    accountName: walletData.bankAccount?.accountName || '',
                    branch: walletData.bankAccount?.branch || ''
                  });
                  setIsEditingBank(true);
                }}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                <Edit size={16} />
              </button>
            </div>
            
            {walletData.bankAccount?.accountNumber ? (
              <div className="space-y-2">
                <p className="text-sm"><strong>Bank:</strong> {walletData.bankAccount.bankName}</p>
                <p className="text-sm"><strong>Account Number:</strong> {walletData.bankAccount.accountNumber}</p>
                <p className="text-sm"><strong>Account Holder:</strong> {walletData.bankAccount.accountName}</p>
                <p className="text-sm"><strong>Branch:</strong> {walletData.bankAccount.branch}</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm mb-3">No bank account information</p>
                <button
                  onClick={() => {
                    setTempBankAccount({
                      bankName: '',
                      accountNumber: '',
                      accountName: '',
                      branch: ''
                    });
                    setIsEditingBank(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                >
                  Add Account
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setShowWithdrawForm(true)}
            disabled={!walletData.bankAccount?.accountNumber || walletData.balance === 0}
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Send size={20} className="mr-2" />
            Request Withdrawal
          </button>
        </div>

        {/* Bank Account Form Modal */}
        {isEditingBank && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Bank Account Information</h3>
              <form onSubmit={handleBankAccountSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <select
                    value={tempBankAccount.bankName}
                    onChange={(e) => setTempBankAccount(prev => ({ ...prev, bankName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                                          <option value="">Select Bank</option>
                    <option value="Vietcombank">Vietcombank</option>
                    <option value="BIDV">BIDV</option>
                    <option value="VietinBank">VietinBank</option>
                    <option value="Agribank">Agribank</option>
                    <option value="Techcombank">Techcombank</option>
                    <option value="MB Bank">MB Bank</option>
                    <option value="VPBank">VPBank</option>
                    <option value="ACB">ACB</option>
                    <option value="Sacombank">Sacombank</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={tempBankAccount.accountNumber}
                    onChange={(e) => setTempBankAccount(prev => ({ ...prev, accountNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    value={tempBankAccount.accountName}
                    onChange={(e) => setTempBankAccount(prev => ({ ...prev, accountName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                  <input
                    type="text"
                    value={tempBankAccount.branch}
                    onChange={(e) => setTempBankAccount(prev => ({ ...prev, branch: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditingBank(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={walletLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {walletLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Withdrawal Form Modal */}
        {showWithdrawForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Request Withdrawal</h3>
              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Withdrawal Amount</label>
                  <input
                    type="number"
                    value={withdrawalData.amount}
                    onChange={(e) => setWithdrawalData(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter amount"
                    min="10000"
                    max={walletData.balance}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available balance: {formatCurrency(walletData.balance)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (tùy chọn)</label>
                  <textarea
                    value={withdrawalData.note}
                    onChange={(e) => setWithdrawalData(prev => ({ ...prev, note: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Enter note..."
                  />
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Bank account information:</strong><br/>
                    {walletData.bankAccount?.bankName || 'No bank selected'} - {walletData.bankAccount?.accountNumber || 'No account'}<br/>
                    {walletData.bankAccount?.accountName || user?.name || 'No account name'}
                  </p>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={withdrawLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {withdrawLoading ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Receipt size={20} className="mr-2" />
            Transaction History
          </h3>
          
          <div className="space-y-3">
            {transactions && transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    transaction.transactionType === 'REFUND' ? 'bg-green-100' : 
                    transaction.transactionType === 'WITHDRAWAL' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {transaction.transactionType === 'REFUND' ? (
                      <ArrowDownLeft size={16} className="text-green-600" />
                    ) : transaction.transactionType === 'WITHDRAWAL' ? (
                      <ArrowUpRight size={16} className="text-blue-600" />
                    ) : (
                      <ArrowUpRight size={16} className="text-gray-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.transactionType === 'REFUND' ? 'text-green-600' : 
                    transaction.transactionType === 'WITHDRAWAL' ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {transaction.transactionType === 'WITHDRAWAL' ? '-' : 
                     transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                  </p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.status === 'COMPLETED' 
                      ? 'bg-green-100 text-green-800' 
                      : transaction.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.status === 'COMPLETED' ? 'Completed' : 
                     transaction.status === 'PENDING' ? 'Pending' : 
                     transaction.status === 'FAILED' ? 'Failed' : 'Cancelled'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {(!transactions || transactions.length === 0) && (
            <div className="text-center py-8">
              <Receipt size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No transaction history</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRolesTab = () => {
    // Get user's current role
    const userRole = user?.roles && user.roles.length > 0 ? user.roles[0].name : null;
    const hasHostRole = userRole === 'HOST';
    const hasAdminRole = userRole === 'ADMIN';
    
    return (
      <div className="space-y-6">
        {/* Current Roles */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-600" />
            Current Role
          </h3>
          
          <div className="space-y-3">
            {user?.roles && user.roles.length > 0 ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    user.roles[0].name === 'ADMIN' ? 'bg-red-500' :
                    user.roles[0].name === 'HOST' ? 'bg-green-500' : 'bg-blue-500'
                  }`}></div>
                  <div>
                    <span className="font-medium text-gray-900">
                      {user.roles[0].name === 'ADMIN' ? 'Administrator' :
                       user.roles[0].name === 'HOST' ? 'Hotel Owner' :
                       user.roles[0].name === 'USER' ? 'User' : user.roles[0].name}
                    </span>
                    <p className="text-sm text-gray-500">{user.roles[0].description}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.roles[0].name === 'ADMIN' ? 'bg-red-100 text-red-800' :
                  user.roles[0].name === 'HOST' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  Activated
                </span>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No roles assigned yet</p>
            )}
          </div>
        </div>

        {/* Role Permissions Info */}
        {userRole && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600" />
              Role Permissions for {userRole}
            </h3>
            
            <div className="space-y-3">
              {userRole === 'ADMIN' && (
                <div className="text-gray-700">
                  <h4 className="font-medium mb-2 text-red-600">Administrator (Full Access):</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Manage all users and permissions</li>
                    <li>Manage all hotels and rooms</li>
                    <li>View and manage all bookings</li>
                    <li>Manage system and settings</li>
                    <li>View and manage all reports and statistics</li>
                    <li>All permissions of HOST and USER</li>
                  </ul>
                </div>
              )}
              
              {userRole === 'HOST' && (
                <div className="text-gray-700">
                  <h4 className="font-medium mb-2 text-green-600">Hotel Owner:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Upload and manage your own hotels</li>
                    <li>Create and manage different room types</li>
                    <li>Receive and manage bookings from customers</li>
                    <li>View detailed revenue and reporting</li>
                    <li>Receive commission from each successful booking</li>
                    <li>All permissions of USER</li>
                  </ul>
                </div>
              )}
              
              {userRole === 'USER' && (
                <div className="text-gray-700">
                  <h4 className="font-medium mb-2 text-blue-600">User:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Search and book hotels</li>
                    <li>Manage personal bookings</li>
                    <li>Write and manage reviews</li>
                    <li>Update personal information</li>
                    <li>Use vouchers</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Host Request Section */}
        {!hasHostRole && !hasAdminRole && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Crown className="h-5 w-5 mr-2 text-amber-600" />
              Become a Host
            </h3>
            
            <div className="space-y-4">
              <div className="text-gray-700">
                <h4 className="font-medium mb-2">Benefits of becoming a Host:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Upload and manage your own hotels</li>
                  <li>Receive and manage bookings from customers</li>
                  <li>Create and manage different room types</li>
                  <li>View detailed revenue and reporting</li>
                  <li>Receive commission from each successful booking</li>
                </ul>
              </div>

              <div className="border-t border-blue-200 pt-4">
                {user?.hostRequested ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-amber-600">
                      <Clock className="h-5 w-5 mr-2" />
                      <span className="font-medium">Request is pending approval</span>
                    </div>
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                      Pending approval
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={handleHostRequest}
                    disabled={hostRequestLoading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                  >
                    {hostRequestLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending request...
                      </>
                    ) : (
                      <>
                        <Crown className="h-5 w-5 mr-2" />
                        Send Host Request
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Admin Role Info */}
        {hasAdminRole && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-red-600" />
                  Administrator (Full Access)
            </h3>
            <p className="text-gray-700">
              You have full access to the system. Please use this role responsibly.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderOtherTabs = () => (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <BookOpen size={48} className="mx-auto" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Feature in Development</h3>
      <p className="text-gray-500">This tab will be completed in the next version.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
                      <p className="text-gray-600 mt-2">Manage your personal information and activities</p>
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
            {activeTab === 'wallet' && renderWalletTab()}
            {activeTab === 'roles' && renderRolesTab()}
            {activeTab !== 'profile' && activeTab !== 'password' && activeTab !== 'wallet' && activeTab !== 'roles' && renderOtherTabs()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 