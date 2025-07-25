import React, { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, Hotel, BookOpen, Star, BarChart2, Tag, Home, 
  FileText, Percent, CreditCard, LogOut, ChevronDown, ChevronRight,
  Menu, X, FolderOpen, DollarSign, Calendar, MessageSquare, BedDouble, TrendingUp
} from 'lucide-react';
import '../styles/dashboard.css';

interface DashboardLayoutProps {
  children: ReactNode;
  type: 'admin' | 'host';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, type }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Management', 'Finance']);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = type === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminMenuItems = [
    { path: '/admin', label: 'Overview', icon: <Home size={20} /> },
    {
      label: 'Management',
      icon: <FolderOpen size={20} />,
      subItems: [
        { path: '/admin/hotels', label: 'Hotels', icon: <Hotel size={20} /> },
        { path: '/admin/room-types', label: 'Room Types', icon: <BedDouble size={20} /> },
        { path: '/admin/bookings', label: 'Bookings', icon: <BookOpen size={20} /> },
        { path: '/admin/users', label: 'Users', icon: <Users size={20} /> },
        { path: '/admin/reviews', label: 'Reviews', icon: <Star size={20} /> },
      ],
    },
    {
      label: 'Finance',
      icon: <DollarSign size={20} />,
      subItems: [
        { path: '/admin/revenue', label: 'Revenue', icon: <TrendingUp size={20} /> },
        { path: '/admin/commissions', label: 'Commissions', icon: <Percent size={20} /> },
        { path: '/admin/withdrawals', label: 'Withdrawals', icon: <CreditCard size={20} /> },
      ],
    },
    { path: '/admin/promotions', label: 'Promotions', icon: <Tag size={20} /> },
  ];

  const hostMenuItems = [
    { path: '/host', label: 'Overview', icon: <Home size={20} /> },
    { path: '/host/hotels', label: 'Hotels', icon: <Hotel size={20} /> },
    { path: '/host/room-types', label: 'Room Types', icon: <BedDouble size={20} /> },
    { path: '/host/bookings', label: 'Bookings', icon: <BookOpen size={20} /> },
    { path: '/host/vouchers', label: 'Vouchers', icon: <Tag size={20} /> },
    { path: '/host/reviews', label: 'Reviews', icon: <Star size={20} /> },
  ];

  const menuItems = isAdmin ? adminMenuItems : hostMenuItems;

  const isActive = (path: string) => {
    // Special handling for Overview pages to avoid matching all sub-paths
    if (path === '/admin' || path === '/host') {
      return location.pathname === path;
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const isParentActive = (subItems: any[]) => {
    return subItems.some(item => isActive(item.path));
  };

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const renderMenuItem = (item: any) => {
    if (item.subItems) {
      const isExpanded = expandedMenus.includes(item.label);
      const hasActiveChild = isParentActive(item.subItems);
      
      return (
        <div key={item.label} className="space-y-1">
          <button
            onClick={() => toggleMenu(item.label)}
            className={`sidebar-item menu-item-hover w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              hasActiveChild
                ? 'bg-gray-700 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <div className="flex items-center">
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </div>
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          {isExpanded && (
            <div className="pl-4 space-y-1 animate-in">
              {item.subItems.map((subItem: any) => (
                <Link
                  key={subItem.path}
                  to={subItem.path}
                  className={`sidebar-item menu-item-hover flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(subItem.path)
                      ? 'bg-gray-900 text-white menu-active-indicator'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="mr-3">{subItem.icon}</span>
                  {subItem.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.path}
        to={item.path}
        className={`sidebar-item menu-item-hover flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          isActive(item.path)
            ? 'bg-gray-900 text-white menu-active-indicator'
            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <span className="mr-3">{item.icon}</span>
        {item.label}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 bg-gray-900 px-4">
        <Link to="/" className="text-xl font-bold text-white">
          {isAdmin ? 'Admin Panel' : 'Host Panel'}
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden text-white hover:text-gray-300"
        >
          <X size={24} />
        </button>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full user-avatar-gradient flex items-center justify-center">
            <span className="text-lg font-medium text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            {user?.roles && user.roles.length > 0 && (
              <div className="flex items-center mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  user.roles[0].name === 'ADMIN' ? 'bg-red-100 text-red-800' :
                  user.roles[0].name === 'HOST' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.roles[0].name === 'ADMIN' ? 'Admin' :
                   user.roles[0].name === 'HOST' ? 'Host' : 'User'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map(renderMenuItem)}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => {
            setIsMobileMenuOpen(false);
            handleLogout();
          }}
          className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
        >
          <LogOut size={20} className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 