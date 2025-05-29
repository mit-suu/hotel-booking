import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Building, Search, Plus, Trash, Save, X } from 'lucide-react';

interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

interface Invoice {
  id: string;
  bookingId: string;
  propertyName: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  amount: number;
  commissionAmount: number;
  commissionRate: number;
  date: string;
  selected?: boolean;
}

const AdminCommissionPaymentCreate: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [period, setPeriod] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [ownerSearchTerm, setOwnerSearchTerm] = useState('');
  const [selectedInvoices, setSelectedInvoices] = useState<Invoice[]>([]);
  const [notes, setNotes] = useState('');
  const [isSelectAllInvoices, setIsSelectAllInvoices] = useState(false);

  // Sample owners data
  const owners: Owner[] = [
    {
      id: 'OWN-001',
      name: 'Công ty CP Vinpearl',
      email: 'finance@vinpearl.com',
      phone: '1900 2345',
      bankInfo: {
        bankName: 'Vietcombank',
        accountNumber: '1234567890',
        accountName: 'CÔNG TY CỔ PHẦN VINPEARL'
      }
    },
    {
      id: 'OWN-002',
      name: 'Công ty TNHH Metropole',
      email: 'finance@metropole.com',
      phone: '024 3826 6919',
      bankInfo: {
        bankName: 'BIDV',
        accountNumber: '0987654321',
        accountName: 'CÔNG TY TNHH METROPOLE'
      }
    },
    {
      id: 'OWN-003',
      name: 'Tập đoàn Mường Thanh',
      email: 'finance@muongthanh.com',
      phone: '1800 1234',
      bankInfo: {
        bankName: 'Techcombank',
        accountNumber: '9876543210',
        accountName: 'TẬP ĐOÀN MƯỜNG THANH'
      }
    },
    {
      id: 'OWN-004',
      name: 'Công ty CP Fusion',
      email: 'finance@fusion.com',
      phone: '028 3822 9999',
      bankInfo: {
        bankName: 'VPBank',
        accountNumber: '1122334455',
        accountName: 'CÔNG TY CỔ PHẦN FUSION'
      }
    },
    {
      id: 'OWN-005',
      name: 'Tập đoàn Accor',
      email: 'finance@accor.com',
      phone: '028 3520 9999',
      bankInfo: {
        bankName: 'HSBC',
        accountNumber: '5544332211',
        accountName: 'ACCOR VIETNAM COMPANY LIMITED'
      }
    }
  ];

  // Sample invoices data
  const availableInvoices: Invoice[] = [
    {
      id: 'INV-001',
      bookingId: 'BK-001',
      propertyName: 'Vinpearl Resort & Spa Nha Trang',
      propertyId: 'PROP-001',
      checkIn: '2023-09-15',
      checkOut: '2023-09-18',
      guestName: 'Nguyễn Văn An',
      amount: 7500000,
      commissionAmount: 1125000,
      commissionRate: 15,
      date: '2023-09-20'
    },
    {
      id: 'INV-004',
      bookingId: 'BK-004',
      propertyName: 'Vinpearl Resort & Spa Nha Trang',
      propertyId: 'PROP-001',
      checkIn: '2023-09-10',
      checkOut: '2023-09-12',
      guestName: 'Phạm Thị Dung',
      amount: 3600000,
      commissionAmount: 540000,
      commissionRate: 15,
      date: '2023-09-12'
    },
    {
      id: 'INV-009',
      bookingId: 'BK-009',
      propertyName: 'Vinpearl Resort & Spa Đà Nẵng',
      propertyId: 'PROP-002',
      checkIn: '2023-09-12',
      checkOut: '2023-09-15',
      guestName: 'Trần Văn Bình',
      amount: 5400000,
      commissionAmount: 810000,
      commissionRate: 15,
      date: '2023-09-15'
    },
    {
      id: 'INV-002',
      bookingId: 'BK-002',
      propertyName: 'Metropole Hanoi',
      propertyId: 'PROP-003',
      checkIn: '2023-09-05',
      checkOut: '2023-09-08',
      guestName: 'Trần Thị Bình',
      amount: 6400000,
      commissionAmount: 768000,
      commissionRate: 12,
      date: '2023-09-10'
    },
    {
      id: 'INV-005',
      bookingId: 'BK-005',
      propertyName: 'Metropole Hanoi',
      propertyId: 'PROP-003',
      checkIn: '2023-09-15',
      checkOut: '2023-09-18',
      guestName: 'Hoàng Văn Em',
      amount: 9600000,
      commissionAmount: 1152000,
      commissionRate: 12,
      date: '2023-09-18'
    }
  ];

  const filteredOwners = owners.filter(owner => 
    owner.name.toLowerCase().includes(ownerSearchTerm.toLowerCase()) ||
    owner.email.toLowerCase().includes(ownerSearchTerm.toLowerCase())
  );

  const filteredInvoices = selectedOwner 
    ? availableInvoices.filter(invoice => 
        (invoice.propertyName.includes('Vinpearl') && selectedOwner.id === 'OWN-001') ||
        (invoice.propertyName.includes('Metropole') && selectedOwner.id === 'OWN-002') ||
        (invoice.propertyName.includes('Mường Thanh') && selectedOwner.id === 'OWN-003') ||
        (invoice.propertyName.includes('Fusion') && selectedOwner.id === 'OWN-004') ||
        (invoice.propertyName.includes('Pullman') && selectedOwner.id === 'OWN-005')
      )
    : [];

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const handleGoBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/admin/commission-payments');
    }
  };

  const handleSelectOwner = (owner: Owner) => {
    setSelectedOwner(owner);
  };

  const handleNextStep = () => {
    if (step === 1 && !selectedOwner) {
      alert('Vui lòng chọn chủ khách sạn');
      return;
    }
    
    if (step === 2 && selectedInvoices.length === 0) {
      alert('Vui lòng chọn ít nhất một hóa đơn');
      return;
    }
    
    setStep(step + 1);
  };

  const handleToggleSelectInvoice = (invoiceId: string) => {
    setSelectedInvoices(prevSelected => {
      const isAlreadySelected = prevSelected.some(inv => inv.id === invoiceId);
      
      if (isAlreadySelected) {
        return prevSelected.filter(inv => inv.id !== invoiceId);
      } else {
        const invoiceToAdd = filteredInvoices.find(inv => inv.id === invoiceId);
        if (invoiceToAdd) {
          return [...prevSelected, invoiceToAdd];
        }
        return prevSelected;
      }
    });
  };

  const handleSelectAllInvoices = () => {
    if (isSelectAllInvoices) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices([...filteredInvoices]);
    }
    setIsSelectAllInvoices(!isSelectAllInvoices);
  };

  const handleRemoveSelectedInvoice = (invoiceId: string) => {
    setSelectedInvoices(prevSelected => prevSelected.filter(inv => inv.id !== invoiceId));
  };

  const calculateTotals = () => {
    let totalAmount = 0;
    let totalCommission = 0;
    
    selectedInvoices.forEach(invoice => {
      totalAmount += invoice.amount;
      totalCommission += invoice.commissionAmount;
    });
    
    return {
      totalAmount,
      totalCommission,
      ownerAmount: totalAmount - totalCommission
    };
  };

  const handleCreatePayment = () => {
    const totals = calculateTotals();
    
    // Create payment logic would go here
    alert(`Đã tạo thanh toán hoa hồng cho ${selectedOwner?.name} với tổng số tiền ${formatCurrency(totals.ownerAmount)}`);
    
    // Navigate to the payment list
    navigate('/admin/commission-payments');
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4">Bước 1: Chọn kỳ thanh toán và chủ khách sạn</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kỳ thanh toán
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Từ ngày</label>
                  <input
                    type="date"
                    value={period.startDate}
                    onChange={(e) => setPeriod({...period, startDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Đến ngày</label>
                  <input
                    type="date"
                    value={period.endDate}
                    onChange={(e) => setPeriod({...period, endDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn chủ khách sạn
              </label>
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, email..."
                  value={ownerSearchTerm}
                  onChange={(e) => setOwnerSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {filteredOwners.map(owner => (
                  <div 
                    key={owner.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedOwner?.id === owner.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => handleSelectOwner(owner)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{owner.name}</h3>
                        <p className="text-sm text-gray-600">{owner.email}</p>
                        <p className="text-sm text-gray-600">{owner.phone}</p>
                      </div>
                      <div className="flex items-center h-full">
                        {selectedOwner?.id === owner.id && (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredOwners.length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    Không tìm thấy chủ khách sạn nào phù hợp
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4">Bước 2: Chọn hóa đơn</h2>
            
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Hóa đơn khả dụng</h3>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isSelectAllInvoices}
                    onChange={handleSelectAllInvoices}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                  />
                  <span className="text-sm text-gray-700">Chọn tất cả</span>
                </div>
              </div>
              
              <div className="mt-2 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Chọn
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mã hóa đơn
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Khách sạn
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số tiền
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hoa hồng
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedInvoices.some(inv => inv.id === invoice.id)}
                            onChange={() => handleToggleSelectInvoice(invoice.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{invoice.id}</div>
                          <div className="text-xs text-gray-500">{invoice.bookingId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{invoice.propertyName}</div>
                          <div className="text-xs text-gray-500">{invoice.guestName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(invoice.date)}</div>
                          <div className="text-xs text-gray-500">
                            {formatDate(invoice.checkIn)} - {formatDate(invoice.checkOut)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{formatCurrency(invoice.amount)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCurrency(invoice.commissionAmount)}</div>
                          <div className="text-xs text-gray-500">{invoice.commissionRate}%</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredInvoices.length === 0 && (
                <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-lg mt-2">
                  Không có hóa đơn nào khả dụng cho chủ khách sạn này trong kỳ thanh toán đã chọn
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-2">Hóa đơn đã chọn ({selectedInvoices.length})</h3>
              
              {selectedInvoices.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedInvoices.map(invoice => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-sm font-medium">{invoice.id} - {invoice.propertyName}</div>
                        <div className="text-xs text-gray-500">{formatDate(invoice.date)} - {formatCurrency(invoice.amount)}</div>
                      </div>
                      <button
                        onClick={() => handleRemoveSelectedInvoice(invoice.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-lg">
                  Chưa có hóa đơn nào được chọn
                </div>
              )}
            </div>
          </div>
        );
        
      case 3:
        const totals = calculateTotals();
        
        return (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4">Bước 3: Xác nhận thanh toán</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Thông tin chủ khách sạn</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">{selectedOwner?.name}</p>
                  <p className="text-sm text-gray-600">{selectedOwner?.email}</p>
                  <p className="text-sm text-gray-600">{selectedOwner?.phone}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Thông tin ngân hàng</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">{selectedOwner?.bankInfo.bankName}</p>
                  <p className="text-sm text-gray-600">Số tài khoản: {selectedOwner?.bankInfo.accountNumber}</p>
                  <p className="text-sm text-gray-600">Tên tài khoản: {selectedOwner?.bankInfo.accountName}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Kỳ thanh toán</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">
                  {formatDate(period.startDate)} - {formatDate(period.endDate)}
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Tổng quan thanh toán</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Tổng số hóa đơn:</p>
                    <p className="font-medium text-gray-900">{selectedInvoices.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tổng doanh thu:</p>
                    <p className="font-medium text-gray-900">{formatCurrency(totals.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tổng hoa hồng:</p>
                    <p className="font-medium text-gray-900">{formatCurrency(totals.totalCommission)}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-medium text-gray-900">Số tiền thanh toán cho chủ khách sạn:</p>
                    <p className="text-xl font-bold text-blue-600">{formatCurrency(totals.ownerAmount)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                rows={3}
                placeholder="Thêm ghi chú về thanh toán này..."
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (<div className="w-full">
        <div className="flex items-center mb-6">
          <button
            onClick={handleGoBack}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">Tạo thanh toán hoa hồng mới</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-6">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              step >= 2 ? 'bg-blue-600' : 'bg-gray-200'
            }`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              step >= 3 ? 'bg-blue-600' : 'bg-gray-200'
            }`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              3
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <div className="text-center w-10">
              <span className={`text-xs ${step >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>
                Chọn chủ KS
              </span>
            </div>
            <div className="text-center w-10">
              <span className={`text-xs ${step >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>
                Chọn hóa đơn
              </span>
            </div>
            <div className="text-center w-10">
              <span className={`text-xs ${step >= 3 ? 'text-blue-600' : 'text-gray-500'}`}>
                Xác nhận
              </span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={handleGoBack}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <ArrowLeft size={18} className="mr-2" />
            {step > 1 ? 'Quay lại' : 'Hủy'}
          </button>
          
          {step < 3 ? (
            <button
              onClick={handleNextStep}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tiếp theo
            </button>
          ) : (
            <div className="space-x-2">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Chỉnh sửa hóa đơn
              </button>
              <button
                onClick={handleCreatePayment}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Save size={18} className="mr-2" />
                Tạo thanh toán
              </button>
            </div>
          )}
        </div>
      </div>);
};

export default AdminCommissionPaymentCreate;

