import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Menu, X, Search as SearchIcon, User, LogOut, LayoutDashboard, AlertCircle, CheckCircle, Bell, History, MessageSquare } from 'lucide-react';

export default function Navbar({ isLoggedIn = false, onLogout }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isPublicPage = ['/', '/login', '/signup'].includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const publicNavLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '#about' },
    { label: 'Why It Works', href: '#why-it-works' },
    { label: 'More Info', href: '#more-info' },
    { label: 'Contact', href: '#contact' },
  ];

  const dashboardNavItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      color: 'blue',
      shortLabel: 'Home',
    },
    {
      label: 'Report Lost',
      icon: AlertCircle,
      path: '/dashboard/report-lost',
      color: 'red',
    },
    {
      label: 'Report Found',
      icon: CheckCircle,
      path: '/dashboard/report-found',
      color: 'green',
    },
    {
      label: 'Notifications',
      icon: Bell,
      path: '/dashboard/notifications',
      color: 'yellow',
    },
    {
      label: 'History',
      icon: History,
      path: '/dashboard/history',
      color: 'purple',
    },
    {
      label: 'Chatbot',
      icon: MessageSquare,
      path: '/dashboard/chatbot',
      color: 'indigo',
    },
  ];

  const handleNavClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setIsMobileMenuOpen(false);
      }
    }
  };

  const handleDashboardClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || !isPublicPage
          ? 'bg-white shadow-lg'
          : 'bg-white/90 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={isLoggedIn ? '/dashboard' : '/'}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <SearchIcon className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
              </div>
              <span className="hidden xs:inline font-bold text-lg sm:text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
                Lost & Found
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          {isPublicPage && !isLoggedIn && (
            <div className="hidden md:flex items-center gap-8">
              {publicNavLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}
            </div>
          )}

          {/* Desktop Auth Buttons */}
          {isPublicPage && !isLoggedIn && (
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Login
                </motion.button>
              </Link>
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:shadow-xl transition-shadow"
                >
                  Sign Up
                </motion.button>
              </Link>
            </div>
          )}

          {/* Logged In User Menu - Desktop */}
          {isLoggedIn && (() => {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const getInitials = () => {
              if (!user.name) return 'User';
              const names = user.name.trim().split(' ');
              const firstName = names[0] || '';
              const lastInitial = names.length > 1 ? names[names.length - 1][0].toUpperCase() : '';
              return `${firstName}${lastInitial ? ' ' + lastInitial : ''}`;
            };
            return (
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{getInitials()}</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </motion.button>
            </div>
            );
          })()}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{
          height: isMobileMenuOpen ? 'auto' : 0,
          opacity: isMobileMenuOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="md:hidden overflow-hidden bg-white border-t max-h-[80vh] overflow-y-auto"
      >
        <div className="px-4 py-4 space-y-3">
          {isPublicPage && !isLoggedIn && (
            <>
              {publicNavLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="block py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 space-y-2 border-t">
                <Link to="/login" className="block">
                  <button className="w-full py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors">
                    Login
                  </button>
                </Link>
                <Link to="/signup" className="block">
                  <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg">
                    Sign Up
                  </button>
                </Link>
              </div>
            </>
          )}
          
          {isLoggedIn && (() => {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const getInitials = () => {
              if (!user.name) return 'User';
              const names = user.name.trim().split(' ');
              const firstName = names[0] || '';
              const lastInitial = names.length > 1 ? names[names.length - 1][0].toUpperCase() : '';
              return `${firstName}${lastInitial ? ' ' + lastInitial : ''}`;
            };
            return (
            <>
              {/* Dashboard Navigation */}
              <div className="border-b pb-4 mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Navigation</p>
                <div className="space-y-2">
                  {dashboardNavItems.map((item) => {
                    const isActive = location.pathname === item.path || 
                                   (item.path === '/dashboard' && location.pathname.startsWith('/dashboard'));
                    const IconComponent = item.icon;
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={handleDashboardClick}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all font-medium text-sm ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <IconComponent className="w-4 h-4 flex-shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* User Section */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{getInitials()}</span>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </>
            );
          })()}
        </div>
      </motion.div>
    </motion.nav>
  );
}
