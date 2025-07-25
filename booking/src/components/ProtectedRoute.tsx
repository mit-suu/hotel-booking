import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string; // 'ADMIN', 'HOST', 'USER'
  requireAuth?: boolean; // Default true
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  requireAuth = true 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Debug logging
  console.log('ProtectedRoute Debug:', {
    path: location.pathname,
    requiredRole,
    user: user ? {
      id: user.id,
      email: user.email,
      roles: user.roles
    } : null,
    loading
  });

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking access permissions...</p>
        </div>
      </div>
    );
  }

  // Check if authentication is required
  if (requireAuth && !user) {
    console.log('ProtectedRoute: No user, redirecting to login');
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if specific role is required
  if (requiredRole && user) {
    // Get user's current role
    const userRole = user.roles && user.roles.length > 0 ? user.roles[0].name : null;
    
    console.log('ProtectedRoute: Role check', {
      userRole,
      requiredRole,
      userRoles: user.roles
    });
    
    // Check hierarchical permissions
    const hasPermission = () => {
      if (!userRole) return false;
      
      // ADMIN has all permissions
      if (userRole === 'ADMIN') return true;
      
      // HOST has HOST and USER permissions
      if (userRole === 'HOST' && (requiredRole === 'HOST' || requiredRole === 'USER')) return true;
      
      // USER has only USER permissions
      if (userRole === 'USER' && requiredRole === 'USER') return true;
      
      return false;
    };
    
    const permission = hasPermission();
    console.log('ProtectedRoute: Permission result', permission);
    
    if (!permission) {
      // User doesn't have required role
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-500 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You do not have permission to access this page. This page requires <strong>{requiredRole}</strong> role.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Your current role: {userRole || 'No role assigned'}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => window.history.back()}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Go Back
              </button>
              <Navigate to="/" replace />
            </div>
          </div>
        </div>
      );
    }
  }

  console.log('ProtectedRoute: Access granted, rendering children');
  // User is authenticated and has required role (if any)
  return <>{children}</>;
};

export default ProtectedRoute; 