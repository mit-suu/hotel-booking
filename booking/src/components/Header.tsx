import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, Heart, Calendar, Search, LogIn, MapPin } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <h1 className={`text-2xl font-bold ${isScrolled ? 'text-blue-600' : 'text-white'}`}>
            FBooking
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <NavLink icon={<Search size={18} />} text="Search Hotels" isScrolled={isScrolled} />
            <NavLink icon={<MapPin size={18} />} text="Destinations" isScrolled={isScrolled} />
            <NavLink icon={<Calendar size={18} />} text="Book Now" isScrolled={isScrolled} />
            <NavLink icon={<Heart size={18} />} text="Favorites" isScrolled={isScrolled} />
            <NavLink icon={<User size={18} />} text="Account" isScrolled={isScrolled} />
          </nav>

          {/* Login Button */}
          <div className="hidden md:flex space-x-4">
            <Link
              to="/register"
              className={`px-4 py-2 rounded-full transition-colors ${
                isScrolled 
                  ? 'text-gray-700 hover:text-blue-600' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              Register
            </Link>
            <Link
              to="/login"
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                isScrolled 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30'
              }`}
            >
              <LogIn size={18} />
              <span>Login</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X size={24} className={isScrolled ? 'text-gray-800' : 'text-white'} />
            ) : (
              <Menu size={24} className={isScrolled ? 'text-gray-800' : 'text-white'} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 bg-white rounded-lg shadow-lg">
            <div className="flex flex-col space-y-4 px-4">
              <MobileNavLink icon={<Search size={18} />} text="Search Hotels" />
              <MobileNavLink icon={<MapPin size={18} />} text="Destinations" />
              <MobileNavLink icon={<Calendar size={18} />} text="Book Now" />
              <MobileNavLink icon={<Heart size={18} />} text="Favorites" />
              <MobileNavLink icon={<User size={18} />} text="Account" />
              <Link
                to="/register"
                className="w-full px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <LogIn size={18} />
                <span>Login</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

interface NavLinkProps {
  icon: React.ReactNode;
  text: string;
  isScrolled: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ icon, text, isScrolled }) => (
  <Link to="#" className={`flex items-center space-x-1 hover:text-blue-500 transition-colors ${
    isScrolled ? 'text-gray-700' : 'text-white'
  }`}>
    {icon}
    <span>{text}</span>
  </Link>
);

interface MobileNavLinkProps {
  icon: React.ReactNode;
  text: string;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ icon, text }) => (
  <Link to="#" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors">
    {icon}
    <span>{text}</span>
  </Link>
);

export default Header;
