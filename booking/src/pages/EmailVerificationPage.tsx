import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';
import { authAPI, ConfirmEmailRequest, ResendCodeRequest } from '../services/api';

const EmailVerificationPage: React.FC = () => {
  const [formData, setFormData] = useState<ConfirmEmailRequest>({
    email: '',
    code: ''
  });
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Lấy email từ state hoặc localStorage
  useEffect(() => {
    const email = location.state?.email || localStorage.getItem('verificationEmail') || '';
    setFormData(prev => ({ ...prev, email }));
    if (email) {
      localStorage.setItem('verificationEmail', email);
    }
  }, [location.state]);

  // Countdown timer cho resend code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return; // Chỉ cho phép 1 ký tự
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    
    // Cập nhật formData
    setFormData(prev => ({ ...prev, code: newCode.join('') }));
    
    // Tự động focus vào ô tiếp theo
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Xử lý phím Backspace
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = async () => {
    if (!formData.email || countdown > 0) return;
    
    setResendLoading(true);
    setError('');
    
    try {
      const resendData: ResendCodeRequest = { email: formData.email };
      await authAPI.resendCode(resendData);
      setSuccess('Mã xác nhận mới đã được gửi đến email của bạn.');
      setCountdown(60); // 60 giây countdown
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể gửi lại mã. Vui lòng thử lại.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Kiểm tra mã xác nhận
    if (formData.code.length !== 6) {
      setError('Vui lòng nhập đầy đủ mã xác nhận 6 ký tự.');
      return;
    }

    setLoading(true);

    try {
      await authAPI.confirmEmail(formData);
      setSuccess('Xác nhận email thành công!');
      setIsVerified(true);
      
      // Xóa email khỏi localStorage
      localStorage.removeItem('verificationEmail');
      
      // Chuyển hướng đến trang đăng nhập sau 3 giây
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Email đã được xác nhận thành công. Vui lòng đăng nhập.' }
        });
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mã xác nhận không đúng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipVerification = () => {
    localStorage.removeItem('verificationEmail');
    navigate('/login', { 
      state: { message: 'Bạn có thể xác nhận email sau trong phần cài đặt tài khoản.' }
    });
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Xác nhận thành công!
            </h2>
            <p className="text-gray-600 mb-4">
              Email của bạn đã được xác nhận thành công.
            </p>
            <p className="text-sm text-gray-500">
              Đang chuyển hướng đến trang đăng nhập...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center mb-6">
          <Link 
            to="/register" 
            className="flex items-center text-blue-600 hover:text-blue-500 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Quay lại đăng ký
          </Link>
        </div>
        
        <div className="text-center mb-6">
          <Mail className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">
            Xác nhận email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Nhập mã xác nhận 6 ký tự đã được gửi đến email của bạn
          </p>
          {formData.email && (
            <p className="mt-1 text-xs text-gray-500">
              Mã đã được gửi đến: <span className="font-medium">{formData.email}</span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Mã xác nhận 6 ký tự */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                Mã xác nhận
              </label>
              <div className="flex space-x-2 justify-center">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                ))}
              </div>
              
              {/* Resend code button */}
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={countdown > 0 || resendLoading}
                  className="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${resendLoading ? 'animate-spin' : ''}`} />
                  {countdown > 0 
                    ? `Gửi lại sau ${countdown}s` 
                    : resendLoading 
                      ? 'Đang gửi...' 
                      : 'Gửi lại mã'
                  }
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang xác nhận...' : 'Xác nhận email'}
              </button>
               
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Không nhận được email? Kiểm tra thư mục spam hoặc{' '}
              <button 
                onClick={handleResendCode}
                disabled={countdown > 0 || resendLoading}
                className="text-blue-600 hover:text-blue-500 disabled:text-gray-400"
              >
                gửi lại mã
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage; 