import React, { useState, useEffect } from 'react';
import { X, Shield, Check, AlertCircle, Save } from 'lucide-react';
import { userAPI, RoleUpdateRequest, roleAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface UserRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    username: string;
    roles: Array<{
      id: number;
      name: string;
      description: string;
    }>;
  };
  onSuccess: () => void;
}

interface Role {
  id: number;
  name: string;
  description: string;
}

const UserRoleModal: React.FC<UserRoleModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess
}) => {
  const { showToast } = useToast();
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  // Fetch available roles from API
  const fetchAvailableRoles = async () => {
    try {
      setLoadingRoles(true);
      const response = await roleAPI.getAllRoles();
      
      if (response.data.success) {
        const roles = response.data.result.content;
        setAvailableRoles(roles);
        console.log('Fetched roles from API:', roles);
      } else {
        throw new Error(response.data.message || 'Failed to fetch roles');
      }
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      
      // Fallback to predefined roles if API fails
      const fallbackRoles = [
        { id: 1, name: 'USER', description: 'Người dùng thông thường có thể đặt phòng' },
        { id: 2, name: 'HOST', description: 'Chủ khách sạn có thể quản lý tài sản' },
        { id: 3, name: 'ADMIN', description: 'Quản trị viên hệ thống với toàn quyền' }
      ];
      
      setAvailableRoles(fallbackRoles);
      console.log('Using fallback roles:', fallbackRoles);
      
      showToast('warning', 'Cảnh báo', 'Không thể tải danh sách vai trò từ server. Sử dụng danh sách mặc định.');
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      console.log('=== INITIALIZING ROLE MODAL ===');
      console.log('User:', user);
      console.log('User roles:', user.roles);
      
      // Fetch available roles first
      fetchAvailableRoles();
      
      // Set current user role IDs
      const currentRoleIds = user.roles.map(role => role.id);
      console.log('Current user role IDs:', currentRoleIds);
      setSelectedRoleIds(currentRoleIds);
    }
  }, [isOpen, user]);

  const handleRoleToggle = (roleId: number) => {
    console.log('Toggling role:', roleId);
    setSelectedRoleIds(prev => {
      const newRoleIds = prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId];
      console.log('New selected role IDs:', newRoleIds);
      return newRoleIds;
    });
  };

  const handleSave = async () => {
    if (selectedRoleIds.length === 0) {
      showToast('warning', 'Cảnh báo', 'Vui lòng chọn ít nhất một vai trò');
      return;
    }

    try {
      setSaving(true);
      
      // Ensure unique role IDs
      const uniqueRoleIds = [...new Set(selectedRoleIds)];
      
      const updateData: RoleUpdateRequest = {
        roleIds: uniqueRoleIds
      };

      console.log('=== ROLE UPDATE DEBUG ===');
      console.log('User ID:', user.id);
      console.log('Current Role IDs:', user.roles.map(r => r.id));
      console.log('Selected Role IDs:', uniqueRoleIds);
      console.log('Request Data:', updateData);
      
      const response = await userAPI.updateUserRoles(user.id, updateData);
      console.log('Update response:', response.data);
      
      showToast('success', 'Thành công', 'Đã cập nhật vai trò người dùng thành công');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('=== ERROR UPDATING ROLES ===');
      console.error('Error:', error);
      console.error('Response:', error.response?.data);
      
      let errorMessage = 'Có lỗi xảy ra khi cập nhật vai trò';
      
      if (error.response?.status === 403) {
        errorMessage = 'Bạn không có quyền cập nhật vai trò người dùng';
      } else if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy người dùng hoặc vai trò';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Dữ liệu không hợp lệ';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      showToast('error', 'Lỗi', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const getRoleDisplayName = (roleName: string) => {
    switch (roleName) {
      case 'ADMIN':
        return 'Quản trị viên';
      case 'HOST':
        return 'Chủ khách sạn';
      case 'USER':
        return 'Người dùng';
      default:
        return roleName;
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'HOST':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'USER':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const hasChanges = () => {
    const currentRoleIds = user.roles.map(role => role.id).sort((a, b) => a - b);
    const newRoleIds = [...selectedRoleIds].sort((a, b) => a - b);
    
    return JSON.stringify(currentRoleIds) !== JSON.stringify(newRoleIds);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Quản lý vai trò</h2>
              <p className="text-sm text-gray-600">{user.name} (@{user.username})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Chọn vai trò cho người dùng
              </h3>
              <p className="text-sm text-gray-600">
                Chọn một hoặc nhiều vai trò để gán cho người dùng này. Mỗi vai trò sẽ cung cấp các quyền hạn khác nhau trong hệ thống.
              </p>
            </div>

            

            {/* Loading Roles */}
            {loadingRoles && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Available Roles */}
            {!loadingRoles && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Tất cả vai trò có sẵn:</h4>
                {availableRoles.map((role) => {
                  const isSelected = selectedRoleIds.includes(role.id);
                  const isCurrentRole = user.roles.some(userRole => userRole.id === role.id);
                  return (
                    <div
                      key={role.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => handleRoleToggle(role.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {isSelected && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getRoleColor(role.name)}`}>
                                <Shield className="h-3 w-3 mr-1" />
                                {getRoleDisplayName(role.name)}
                              </span>
                              {isCurrentRole && (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
                                  Hiện tại
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Warning for no roles selected */}
            {selectedRoleIds.length === 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Cảnh báo</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Người dùng phải có ít nhất một vai trò để có thể truy cập hệ thống.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Debug Information */}
            <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
              <p><strong>Debug Info:</strong></p>
              <p>User ID: {user.id}</p>
              <p>Current Role IDs: [{user.roles.map(r => r.id).join(', ')}]</p>
              <p>Current Role Names: [{user.roles.map(r => r.name).join(', ')}]</p>
              <p>Selected Role IDs: [{selectedRoleIds.join(', ')}]</p>
              <p>Available Roles: [{availableRoles.map(r => `${r.id}:${r.name}`).join(', ')}]</p>
              <p>Has Changes: {hasChanges() ? 'Yes' : 'No'}</p>
            </div>

            {/* Changes indicator */}
            {hasChanges() && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Có thay đổi</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Bạn đã thay đổi vai trò của người dùng. Nhấn "Lưu thay đổi" để áp dụng.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges() || selectedRoleIds.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
          >
            {saving ? (
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
        </div>
      </div>
    </div>
  );
};

export default UserRoleModal; 