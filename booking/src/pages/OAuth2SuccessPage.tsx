import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const OAuth2SuccessPage: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const processOAuth2Callback = () => {
      try {
        // Extract parameters from URL
        const urlParams = new URLSearchParams(location.search);
        const accessToken = urlParams.get('accessToken');
        const refreshToken = urlParams.get('refreshToken');
        const error = urlParams.get('error');
        const errorMessage = urlParams.get('message');
        const type = urlParams.get('type');

        console.log('OAuth2 callback params:', { accessToken: !!accessToken, refreshToken: !!refreshToken, error, type });

        if (error) {
          setStatus('error');
          
          // Handle different error types
          switch (error) {
            case 'account_conflict':
              setMessage('This email is already linked to a different Google account. Please use a different email or contact support.');
              break;
            case 'system_error':
              setMessage('System configuration error. Please try again later or contact support.');
              break;
            case 'missing_user_info':
              setMessage('Unable to retrieve user information from Google. Please try again.');
              break;
            case 'oauth2_failed':
              setMessage(errorMessage || 'Google authentication failed. Please try again.');
              break;
            default:
              setMessage(errorMessage || 'OAuth2 authentication failed');
          }
          
          setTimeout(() => {
            navigate('/login', { 
              state: { 
                message: 'Login failed: ' + (errorMessage || 'Please try again.'),
                type: 'error'
              }
            });
          }, 5000); // Give user more time to read specific error messages
          return;
        }

        if (accessToken && refreshToken) {
          // Use AuthContext login method
          login(accessToken, refreshToken);
          
          setStatus('success');
          setMessage('Login successful! Redirecting to homepage...');
          
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Invalid authentication response');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } catch (error) {
        console.error('Error processing OAuth2 callback:', error);
        setStatus('error');
        setMessage('Error processing authentication');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    processOAuth2Callback();
  }, [location, navigate, login]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === 'loading' && (
              <>
                <Loader className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
                <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                  Processing Authentication
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                  {message}
                </p>
              </>
            )}
            
            {status === 'success' && (
              <>
                <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
                <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                  Login Successful!
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                  {message}
                </p>
              </>
            )}
            
            {status === 'error' && (
              <>
                <XCircle className="mx-auto h-12 w-12 text-red-600" />
                <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                  Authentication Failed
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                  {message}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OAuth2SuccessPage; 