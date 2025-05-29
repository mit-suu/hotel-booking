import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash, Calendar, Percent, Tag, Filter, Clock, Check, X } from 'lucide-react';

interface Promotion {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  minBookingValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  applicableHotels: 'all' | 'specific';
  hotelIds?: string[];
  status: 'active' | 'scheduled' | 'expired' | 'disabled';
}

const AdminPromotions: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPromotions, setSelectedPromotions] = useState<string[]>([]);
  const [isSelectAll, setIsSelectAll] = useState(false);

  // Sample promotions data
  const promotions: Promotion[] = [
    {
      id: '1',
      code: 'SUMMER2023',
      name: 'Khuyến mãi hè 2023',
      description: 'Giảm giá 20% cho tất cả các đặt phòng trong mùa hè',
      discountType: 'percentage',
      discountValue: 20,
      startDate: '2023-06-01',
      endDate: '2023-08-31',
      minBookingValue: 1000000,
      maxDiscount: 2000000,
      usageLimit: 1000,
      usageCount: 568,
      applicableHotels: 'all',
      status: 'active'
    },
    {
      id: '2',
      code: 'WELCOME500K',
      name: 'Chào mừng thành viên mới',
      description: 'Giảm 500.000đ cho đặt phòng đầu tiên của thành viên mới',
      discountType: 'fixed',
      discountValue: 500000,
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      minBookingValue: 2000000,
      usageLimit: 500,
      usageCount: 342,
      applicableHotels: 'all',
      status: 'active'
    },
    {
      id: '3',
      code: 'WEEKEND25',
      name: 'Giảm giá cuối tuần',
      description: 'Giảm 25% cho đặt phòng vào cuối tuần',
      discountType: 'percentage',
      discountValue: 25,
      startDate: '2023-09-01',
      endDate: '2023-12-31',
      minBookingValue: 1500000,
      maxDiscount: 1000000,
      usageLimit: 800,
      usageCount: 125,
      applicableHotels: 'all',
      status: 'active'
    },
    {
      id: '4',
      code: 'NEWYEAR2024',
      name: 'Chào năm mới 2024',
      description: 'Giảm 30% cho đặt phòng dịp năm mới',
      discountType: 'percentage',
      discountValue: 30,
      startDate: '2023-12-15',
      endDate: '2024-01-15',
      minBookingValue: 2000000,
      maxDiscount: 3000000,
      usageLimit: 500,
      usageCount: 0,
      applicableHotels: 'all',
      status: 'scheduled'
    },
    {
      id: '5',
      code: 'FLASH1M',
      name: 'Flash Sale - Giảm 1 triệu',
      description: 'Giảm ngay 1 triệu đồng cho đặt phòng từ 3 triệu',
      discountType: 'fixed',
      discountValue: 1000000,
      startDate: '2023-10-10',
      endDate: '2023-10-12',
      minBookingValue: 3000000,
      usageLimit: 100,
      usageCount: 100,
      applicableHotels: 'all',
      status: 'expired'
    },
    {
      id: '6',
      code: 'LUXURY15',
      name: 'Khách sạn cao cấp',
      description: 'Giảm 15% cho các khách sạn 5 sao',
      discountType: 'percentage',
      discountValue: 15,
      startDate: '2023-09-01',
      endDate: '2023-11-30',
      minBookingValue: 5000000,
      maxDiscount: 2000000,
      usageLimit: 300,
      usageCount: 87,
      applicableHotels: 'specific',
      hotelIds: ['1', '2', '4', '7'],
      status: 'active'
    },
    {
      id: '7',
      code: 'EARLYBIRD',
      name: 'Đặt sớm giảm giá',
      description: 'Giảm 10% khi đặt phòng trước 30 ngày',
      discountType: 'percentage',
      discountValue: 10,
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      minBookingValue: 1000000,
      maxDiscount: 1000000,
      usageLimit: 1000,
      usageCount: 456,
      applicableHotels: 'all',
      status: 'active'
    },
    {
      id: '8',
      code: 'MEMBER10',
      name: 'Ưu đãi thành viên',
      description: 'Giảm 10% cho thành viên VIP',
      discountType: 'percentage',
      discountValue: 10,
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      usageCount: 789,
      applicableHotels: 'all',
      status: 'disabled'
    }
  ];

  const itemsPerPage = 5;

  // Filter promotions based on search term and status
  const filteredPromotions = promotions.filter(promotion => {
    const matchesSearch = 
      promotion.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promotion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promotion.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || promotion.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);
  const paginatedPromotions = filteredPromotions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedPromotions([]);
    } else {
      setSelectedPromotions(paginatedPromotions.map(promotion => promotion.id));
    }
    setIsSelectAll(!isSelectAll);
  };

  const handleSelectPromotion = (promotionId: string) => {
    if (selectedPromotions.includes(promotionId)) {
      setSelectedPromotions(selectedPromotions.filter(id => id !== promotionId));
    } else {
      setSelectedPromotions([...selectedPromotions, promotionId]);
    }
  };

  const handleAddPromotion = () => {
    navigate('/admin/promotions/add');
  };

  const handleEditPromotion = (promotionId: string) => {
    navigate(`/admin/promotions/edit/${promotionId}`);
  };

  const handleDeletePromotion = (promotionId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mã khuyến mãi này không?')) {
      // Delete promotion logic would go here
      alert(`Đã xóa mã khuyến mãi có ID: ${promotionId}`);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedPromotions.length === 0) return;
    
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedPromotions.length} mã khuyến mãi đã chọn không?`)) {
      // Delete selected promotions logic would go here
      alert(`Đã xóa ${selectedPromotions.length} mã khuyến mãi`);
      setSelectedPromotions([]);
    }
  };

  const handleActivatePromotion = (promotionId: string) => {
    // Activate promotion logic would go here
    alert(`Đã kích hoạt mã khuyến mãi có ID: ${promotionId}`);
  };

  const handleDeactivatePromotion = (promotionId: string) => {
    // Deactivate promotion logic would go here
    alert(`Đã vô hiệu hóa mã khuyến mãi có ID: ${promotionId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Đang hoạt động</span>;
      case 'scheduled':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Lên lịch</span>;
      case 'expired':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Đã hết hạn</span>;
      case 'disabled':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Đã vô hiệu</span>;
      default:
        return null;
    }
  };

  const getDiscountText = (promotion: Promotion) => {
    if (promotion.discountType === 'percentage') {
      return `${promotion.discountValue}%`;
    } else {
      return formatCurrency(promotion.discountValue);
    }
  };

  const getProgressBarWidth = (used: number, total?: number) => {
    if (!total) return '0%';
    const percentage = (used / total) * 100;
    return `${Math.min(percentage, 100)}%`;
  };

  return (<div className="w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
          <h1 className="text-xl sm:text-2xl font-bold">Quản lý khuyến mãi</h1>
          <button
            onClick={handleAddPromotion}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Thêm khuyến mãi mới
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Tìm kiếm theo mã, tên, mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="scheduled">Lên lịch</option>
                <option value="expired">Đã hết hạn</option>
                <option value="disabled">Đã vô hiệu</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedPromotions.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex justify-between items-center">
            <span className="text-blue-700">Đã chọn {selectedPromotions.length} khuyến mãi</span>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteSelected}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors flex items-center"
              >
                <Trash size={16} className="mr-1" />
                Xóa đã chọn
              </button>
            </div>
          </div>
        )}

        {/* Promotions List */}
        <div className="space-y-4">
          {paginatedPromotions.map((promotion) => (
            <div key={promotion.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="w-full">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={selectedPromotions.includes(promotion.id)}
                        onChange={() => handleSelectPromotion(promotion.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                      />
                      <h3 className="text-lg font-semibold text-gray-900">{promotion.name}</h3>
                      <span className="ml-3 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        {promotion.code}
                      </span>
                      <span className="ml-2">
                        {getStatusBadge(promotion.status)}
                      </span>
                    </div>
                    <p className="text-gray-600">{promotion.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditPromotion(promotion.id)}
                      className="px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors flex items-center"
                    >
                      <Edit size={16} className="mr-1" />
                      Sửa
                    </button>
                    {promotion.status === 'active' || promotion.status === 'scheduled' ? (
                      <button
                        onClick={() => handleDeactivatePromotion(promotion.id)}
                        className="px-3 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors flex items-center"
                      >
                        <X size={16} className="mr-1" />
                        Vô hiệu
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivatePromotion(promotion.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                      >
                        <Check size={16} className="mr-1" />
                        Kích hoạt
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePromotion(promotion.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                    >
                      <Trash size={16} className="mr-1" />
                      Xóa
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Discount Info */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700 flex items-center">
                      <Percent size={16} className="mr-2" />
                      Thông tin giảm giá
                    </h4>
                    <p className="text-gray-900 font-medium text-lg">
                      {getDiscountText(promotion)}
                    </p>
                    {promotion.minBookingValue && (
                      <p className="text-gray-600 text-sm">
                        Giá trị đơn tối thiểu: {formatCurrency(promotion.minBookingValue)}
                      </p>
                    )}
                    {promotion.maxDiscount && (
                      <p className="text-gray-600 text-sm">
                        Giảm tối đa: {formatCurrency(promotion.maxDiscount)}
                      </p>
                    )}
                    <p className="text-gray-600 text-sm">
                      Áp dụng cho: {promotion.applicableHotels === 'all' ? 'Tất cả khách sạn' : 'Khách sạn được chọn'}
                    </p>
                  </div>

                  {/* Date Info */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700 flex items-center">
                      <Calendar size={16} className="mr-2" />
                      Thời gian áp dụng
                    </h4>
                    <p className="text-gray-600">
                      Bắt đầu: <span className="text-gray-900">{formatDate(promotion.startDate)}</span>
                    </p>
                    <p className="text-gray-600">
                      Kết thúc: <span className="text-gray-900">{formatDate(promotion.endDate)}</span>
                    </p>
                    <div className="flex items-center text-sm">
                      <Clock size={14} className="mr-1 text-gray-500" />
                      {new Date(promotion.startDate) > new Date() ? (
                        <span className="text-blue-600">Sắp bắt đầu</span>
                      ) : new Date(promotion.endDate) < new Date() ? (
                        <span className="text-gray-600">Đã kết thúc</span>
                      ) : (
                        <span className="text-green-600">Đang diễn ra</span>
                      )}
                    </div>
                  </div>

                  {/* Usage Info */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700 flex items-center">
                      <Tag size={16} className="mr-2" />
                      Thông tin sử dụng
                    </h4>
                    <p className="text-gray-600">
                      Đã sử dụng: <span className="text-gray-900">{promotion.usageCount}</span>
                      {promotion.usageLimit && (
                        <span className="text-gray-600"> / {promotion.usageLimit}</span>
                      )}
                    </p>
                    {promotion.usageLimit && (
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: getProgressBarWidth(promotion.usageCount, promotion.usageLimit) }}
                        ></div>
                      </div>
                    )}
                    {promotion.usageLimit && promotion.usageCount >= promotion.usageLimit && (
                      <p className="text-red-600 text-sm">Đã đạt giới hạn sử dụng</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Trước
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === totalPages
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
                    Hiển thị <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> đến{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, filteredPromotions.length)}
                    </span>{' '}
                    trong tổng số <span className="font-medium">{filteredPromotions.length}</span> khuyến mãi
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Trang trước</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === index + 1
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages
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

          {paginatedPromotions.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h3 className="text-xl font-medium text-gray-900 mb-2">Không tìm thấy khuyến mãi nào</h3>
              <p className="text-gray-600 mb-6">Không có khuyến mãi nào phù hợp với tiêu chí tìm kiếm của bạn.</p>
              <button
                onClick={handleAddPromotion}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <Plus size={20} className="mr-2" />
                Thêm khuyến mãi mới
              </button>
            </div>
          )}
        </div>
      </div>);
};

export default AdminPromotions;

