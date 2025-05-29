import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Filter, Check, X, Trash, Eye, Calendar, MessageSquare, Flag, User, Hotel } from 'lucide-react';

interface Review {
  id: string;
  propertyName: string;
  propertyId: string;
  roomName: string;
  guestName: string;
  guestId: string;
  rating: number;
  comment: string;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
  reported: boolean;
  reportReason?: string;
  response?: {
    text: string;
    date: string;
  };
}

const AdminReviews: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [reportedFilter, setReportedFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [isSelectAll, setIsSelectAll] = useState(false);

  // Sample reviews data
  const reviews: Review[] = [
    {
      id: '1',
      propertyName: 'Vinpearl Resort & Spa',
      propertyId: '1',
      roomName: 'Deluxe Ocean View',
      guestName: 'Nguyễn Văn An',
      guestId: '1',
      rating: 5,
      comment: 'Kỳ nghỉ tuyệt vời! Phòng sạch sẽ, nhân viên thân thiện và view biển đẹp tuyệt vời. Tôi sẽ quay lại vào năm sau.',
      date: '2023-10-20',
      status: 'approved',
      reported: false
    },
    {
      id: '2',
      propertyName: 'Metropole Hanoi',
      propertyId: '2',
      roomName: 'Premium Suite',
      guestName: 'Trần Thị Bình',
      guestId: '2',
      rating: 4,
      comment: 'Khách sạn có vị trí tuyệt vời, gần các điểm tham quan. Phòng hơi nhỏ nhưng trang trí đẹp. Bữa sáng ngon.',
      date: '2023-10-18',
      status: 'approved',
      reported: false,
      response: {
        text: 'Cảm ơn quý khách đã đánh giá. Chúng tôi rất vui khi quý khách đã có trải nghiệm tốt tại khách sạn.',
        date: '2023-10-19'
      }
    },
    {
      id: '3',
      propertyName: 'Mường Thanh Luxury',
      propertyId: '3',
      roomName: 'Family Room',
      guestName: 'Lê Văn Cường',
      guestId: '3',
      rating: 2,
      comment: 'Dịch vụ kém, phòng không được dọn dẹp đúng giờ. Nhân viên không nhiệt tình. Thất vọng với giá tiền đã trả.',
      date: '2023-10-15',
      status: 'pending',
      reported: true,
      reportReason: 'Đánh giá không chính xác, khách hàng đã được nâng cấp phòng miễn phí.'
    },
    {
      id: '4',
      propertyName: 'Fusion Maia Resort',
      propertyId: '4',
      roomName: 'Pool Villa',
      guestName: 'Phạm Thị Dung',
      guestId: '4',
      rating: 5,
      comment: 'Khu nghỉ dưỡng tuyệt vời với hồ bơi riêng. Spa miễn phí là một điểm cộng lớn. Nhân viên chuyên nghiệp và thân thiện.',
      date: '2023-10-12',
      status: 'approved',
      reported: false
    },
    {
      id: '5',
      propertyName: 'Pullman Saigon',
      propertyId: '5',
      roomName: 'Executive Suite',
      guestName: 'Hoàng Văn Em',
      guestId: '5',
      rating: 1,
      comment: 'Tệ nhất từng trải qua. Phòng bẩn, ồn ào và dịch vụ kém. Sẽ không bao giờ quay lại và khuyên mọi người tránh xa.',
      date: '2023-10-10',
      status: 'rejected',
      reported: true,
      reportReason: 'Ngôn từ không phù hợp và thông tin sai lệch.'
    },
    {
      id: '6',
      propertyName: 'Sapa Homestay',
      propertyId: '6',
      roomName: 'Mountain View Room',
      guestName: 'Ngô Thị Phương',
      guestId: '6',
      rating: 4,
      comment: 'Trải nghiệm văn hóa tuyệt vời với gia đình địa phương. Phong cảnh đẹp, đồ ăn ngon. Phòng hơi lạnh vào buổi tối.',
      date: '2023-10-08',
      status: 'approved',
      reported: false
    },
    {
      id: '7',
      propertyName: 'Amanoi Resort',
      propertyId: '7',
      roomName: 'Ocean Pool Villa',
      guestName: 'Đỗ Văn Giang',
      guestId: '7',
      rating: 5,
      comment: 'Thiên đường nghỉ dưỡng! Dịch vụ 5 sao, nhân viên chu đáo, phòng sang trọng và view biển tuyệt đẹp. Đáng giá từng đồng.',
      date: '2023-10-05',
      status: 'pending',
      reported: false
    },
    {
      id: '8',
      propertyName: 'Mia Resort Nha Trang',
      propertyId: '8',
      roomName: 'Beachfront Villa',
      guestName: 'Vũ Thị Hương',
      guestId: '8',
      rating: 3,
      comment: 'Resort đẹp nhưng hơi xa trung tâm. Bãi biển riêng sạch sẽ. Đồ ăn ngon nhưng đắt. Nhân viên thân thiện.',
      date: '2023-10-02',
      status: 'approved',
      reported: false
    }
  ];

  const itemsPerPage = 5;

  // Filter reviews based on search term, status, rating, and reported flag
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    
    const matchesRating = ratingFilter === 'all' || 
      (ratingFilter === '5' && review.rating === 5) ||
      (ratingFilter === '4' && review.rating === 4) ||
      (ratingFilter === '3' && review.rating === 3) ||
      (ratingFilter === '2' && review.rating === 2) ||
      (ratingFilter === '1' && review.rating === 1) ||
      (ratingFilter === 'low' && review.rating <= 3);
    
    const matchesReported = !reportedFilter || review.reported;
    
    return matchesSearch && matchesStatus && matchesRating && matchesReported;
  });

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(paginatedReviews.map(review => review.id));
    }
    setIsSelectAll(!isSelectAll);
  };

  const handleSelectReview = (reviewId: string) => {
    if (selectedReviews.includes(reviewId)) {
      setSelectedReviews(selectedReviews.filter(id => id !== reviewId));
    } else {
      setSelectedReviews([...selectedReviews, reviewId]);
    }
  };

  const handleViewProperty = (propertyId: string) => {
    navigate(`/admin/hotels/${propertyId}`);
  };

  const handleViewUser = (userId: string) => {
    navigate(`/admin/users/${userId}`);
  };

  const handleApproveReview = (reviewId: string) => {
    // Approve review logic would go here
    alert(`Đã phê duyệt đánh giá có ID: ${reviewId}`);
  };

  const handleRejectReview = (reviewId: string) => {
    // Reject review logic would go here
    alert(`Đã từ chối đánh giá có ID: ${reviewId}`);
  };

  const handleDeleteReview = (reviewId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này không?')) {
      // Delete review logic would go here
      alert(`Đã xóa đánh giá có ID: ${reviewId}`);
    }
  };

  const handleApproveSelected = () => {
    if (selectedReviews.length === 0) return;
    
    if (window.confirm(`Bạn có chắc chắn muốn phê duyệt ${selectedReviews.length} đánh giá đã chọn không?`)) {
      // Approve selected reviews logic would go here
      alert(`Đã phê duyệt ${selectedReviews.length} đánh giá`);
      setSelectedReviews([]);
    }
  };

  const handleRejectSelected = () => {
    if (selectedReviews.length === 0) return;
    
    if (window.confirm(`Bạn có chắc chắn muốn từ chối ${selectedReviews.length} đánh giá đã chọn không?`)) {
      // Reject selected reviews logic would go here
      alert(`Đã từ chối ${selectedReviews.length} đánh giá`);
      setSelectedReviews([]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedReviews.length === 0) return;
    
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedReviews.length} đánh giá đã chọn không?`)) {
      // Delete selected reviews logic would go here
      alert(`Đã xóa ${selectedReviews.length} đánh giá`);
      setSelectedReviews([]);
    }
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, index) => (
      <Star 
        key={index} 
        size={16} 
        className={`${index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Đã duyệt</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Chờ duyệt</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Đã từ chối</span>;
      default:
        return null;
    }
  };

  return (<div className="w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
          <h1 className="text-xl sm:text-2xl font-bold">Quản lý đánh giá</h1>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Tìm kiếm theo khách sạn, người dùng, nội dung..."
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
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="approved">Đã duyệt</option>
                  <option value="pending">Chờ duyệt</option>
                  <option value="rejected">Đã từ chối</option>
                </select>
              </div>
              <div className="flex items-center">
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tất cả đánh giá</option>
                  <option value="5">5 sao</option>
                  <option value="4">4 sao</option>
                  <option value="3">3 sao</option>
                  <option value="2">2 sao</option>
                  <option value="1">1 sao</option>
                  <option value="low">Đánh giá thấp (≤ 3 sao)</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={reportedFilter}
                    onChange={(e) => setReportedFilter(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-700">Chỉ hiện đánh giá bị báo cáo</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedReviews.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex justify-between items-center">
            <span className="text-blue-700">Đã chọn {selectedReviews.length} đánh giá</span>
            <div className="flex gap-2">
              <button
                onClick={handleApproveSelected}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors flex items-center"
              >
                <Check size={16} className="mr-1" />
                Duyệt đã chọn
              </button>
              <button
                onClick={handleRejectSelected}
                className="bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700 transition-colors flex items-center"
              >
                <X size={16} className="mr-1" />
                Từ chối đã chọn
              </button>
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

        {/* Reviews List */}
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
                    Đánh giá
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách sạn
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người đánh giá
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày đánh giá
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
                {paginatedReviews.map((review) => (
                  <tr key={review.id} className={`hover:bg-gray-50 ${review.reported ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedReviews.includes(review.id)}
                          onChange={() => handleSelectReview(review.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center mb-2">
                        <div className="flex mr-2">
                          {renderStars(review.rating)}
                        </div>
                        {review.reported && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 flex items-center">
                            <Flag size={12} className="mr-1" />
                            Bị báo cáo
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-900">{review.comment}</p>
                      {review.reported && review.reportReason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                          <span className="font-semibold">Lý do báo cáo:</span> {review.reportReason}
                        </div>
                      )}
                      {review.response && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                          <div className="font-semibold text-blue-700 mb-1 flex items-center">
                            <MessageSquare size={12} className="mr-1" />
                            Phản hồi từ chủ khách sạn ({formatDate(review.response.date)})
                          </div>
                          <p className="text-gray-700">{review.response.text}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleViewProperty(review.propertyId)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Hotel size={14} className="mr-1" />
                        {review.propertyName}
                      </button>
                      <p className="text-xs text-gray-500 mt-1">{review.roomName}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleViewUser(review.guestId)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <User size={14} className="mr-1" />
                        {review.guestName}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                        {formatDate(review.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(review.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {review.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveReview(review.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Phê duyệt"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={() => handleRejectReview(review.id)}
                              className="text-orange-600 hover:text-orange-900"
                              title="Từ chối"
                            >
                              <X size={18} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                        >
                          <Trash size={18} />
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
                      {Math.min(currentPage * itemsPerPage, filteredReviews.length)}
                    </span>{' '}
                    trong tổng số <span className="font-medium">{filteredReviews.length}</span> đánh giá
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
        </div>

        {paginatedReviews.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-xl font-medium text-gray-900 mb-2">Không tìm thấy đánh giá nào</h3>
            <p className="text-gray-600">Không có đánh giá nào phù hợp với tiêu chí tìm kiếm của bạn.</p>
          </div>
        )}
      </div>);
};

export default AdminReviews;

