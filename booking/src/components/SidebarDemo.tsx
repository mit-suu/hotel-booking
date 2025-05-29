import React, { useState } from 'react';
import DashboardLayout from './DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

const SidebarDemo: React.FC = () => {
  const [currentView, setCurrentView] = useState<'admin' | 'host'>('admin');
  const { user } = useAuth();

  const DemoContent = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Demo Giao Diện Sidebar
        </h1>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn loại dashboard:
          </label>
          <div className="flex space-x-4">
            <button
              onClick={() => setCurrentView('admin')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'admin'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Admin Dashboard
            </button>
            <button
              onClick={() => setCurrentView('host')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'host'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Host Dashboard
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Tính năng mới:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Menu con có thể mở/đóng
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Responsive design cho mobile
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Visual feedback tốt hơn
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Animation mượt mà
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Icon được cải thiện
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Menu hiện tại:</h3>
            <div className="text-sm text-gray-600">
              {currentView === 'admin' ? (
                <ul className="space-y-1">
                  <li>• Tổng quan</li>
                  <li>• Quản lý (Khách sạn, Đặt phòng, Người dùng, Đánh giá)</li>
                  <li>• Tài chính (Hoa hồng, Hóa đơn, Thanh toán)</li>
                  <li>• Khuyến mãi</li>
                  <li>• Thống kê</li>
                  <li>• Cài đặt</li>
                </ul>
              ) : (
                <ul className="space-y-1">
                  <li>• Tổng quan</li>
                  <li>• Bất động sản</li>
                  <li>• Đặt phòng</li>
                  <li>• Lịch đặt phòng</li>
                  <li>• Đánh giá</li>
                  <li>• Tin nhắn</li>
                  <li>• Thống kê</li>
                  <li>• Cài đặt</li>
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Hướng dẫn sử dụng:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Click vào menu "Quản lý" hoặc "Tài chính" để mở/đóng submenu</li>
            <li>• Trên mobile, click vào icon menu ở góc trên bên trái</li>
            <li>• Menu item đang active sẽ có indicator màu xanh bên trái</li>
            <li>• Hover vào menu item để thấy hiệu ứng animation</li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Thông tin người dùng hiện tại
        </h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <p><strong>Tên:</strong> {user?.name || 'Demo User'}</p>
          <p><strong>Email:</strong> {user?.email || 'demo@example.com'}</p>
          <p><strong>Loại dashboard:</strong> {currentView === 'admin' ? 'Admin' : 'Host'}</p>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout type={currentView}>
      <DemoContent />
    </DashboardLayout>
  );
};

export default SidebarDemo; 