import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiHeart, FiHome, FiPackage, FiShoppingBag, FiBarChart2, FiSettings } from 'react-icons/fi';
import { logout } from '../../redux/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from '../common/NotificationBell';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
      setSearchQuery('');
      setIsMobileSearchOpen(false);
    }
  };

  const cartItemCount = items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  // Navigation items based on user role
  const getNavItems = () => {
    const commonItems = [
      { path: '/', label: 'Home', icon: FiHome },
      { path: '/products', label: 'Shop', icon: FiShoppingBag }
    ];

    if (!isAuthenticated) {
      return commonItems;
    }

    switch (user?.role) {
      case 'admin':
        return [
          ...commonItems,
          { path: '/admin/dashboard', label: 'Admin Panel', icon: FiBarChart2 }
        ];
      case 'seller':
        return [
          ...commonItems,
          { path: '/seller/dashboard', label: 'Seller Dashboard', icon: FiPackage }
        ];
      default:
        return commonItems;
    }
  };

  const navItems = getNavItems();

  // Get dashboard link for mobile menu
  const getDashboardLink = () => {
    if (!isAuthenticated) return null;
    switch (user?.role) {
      case 'admin':
        return { path: '/admin/dashboard', label: 'Admin Dashboard' };
      case 'seller':
        return { path: '/seller/dashboard', label: 'Seller Dashboard' };
      default:
        return null;
    }
  };

  const dashboardLink = getDashboardLink();

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md py-2' : 'bg-white/95 shadow-sm py-4'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary-600">
            ShopHub
          </Link>

          {/* Desktop Navigation - Role based */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="hover:text-primary-600 transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Icons: Search, Wishlist, Cart, Notifications, User Menu */}
          <div className="flex items-center space-x-4">
            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="hidden md:flex relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="input py-2 px-4 text-sm w-64 pr-10"
              />
              <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <FiSearch className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            </form>

            {/* Mobile Search Toggle */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            >
              <FiSearch className="w-5 h-5" />
            </button>

            {/* Wishlist - Only for customers */}
            {isAuthenticated && user?.role === 'customer' && (
              <Link to="/wishlist" className="hidden sm:block p-2 hover:bg-gray-100 rounded-full transition-colors">
                <FiHeart className="w-5 h-5" />
              </Link>
            )}

            {/* Cart - Everyone can see */}
            <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <FiShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </Link>

            {/* Notification Bell - Only for authenticated users */}
            {isAuthenticated && <NotificationBell />}

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiUser className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50"
                  >
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-3 border-b">
                          <p className="font-semibold text-gray-800">{user?.name}</p>
                          <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                          <p className="text-xs text-primary-600 mt-1 capitalize">{user?.role}</p>
                        </div>
                        
                        {/* Role-specific dashboard link */}
                        {dashboardLink && (
                          <Link
                            to={dashboardLink.path}
                            className="block px-4 py-2 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            📊 {dashboardLink.label}
                          </Link>
                        )}
                        
                        {/* Common links for all authenticated users */}
                        <Link
                          to="/profile"
                          className="block px-4 py-2 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          👤 My Profile
                        </Link>
                        <Link
                          to="/orders"
                          className="block px-4 py-2 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          📦 My Orders
                        </Link>
                        
                        {/* Wishlist - Only for customers */}
                        {user?.role === 'customer' && (
                          <Link
                            to="/wishlist"
                            className="block px-4 py-2 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            ❤️ Wishlist
                          </Link>
                        )}
                        
                        <Link
                          to="/notifications"
                          className="block px-4 py-2 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          🔔 Notifications
                        </Link>
                        
                        <div className="border-t my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-red-600"
                        >
                          🚪 Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          className="block px-4 py-2 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          🔐 Login
                        </Link>
                        <Link
                          to="/register"
                          className="block px-4 py-2 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          📝 Register
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar - Expandable */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden mt-3 overflow-hidden"
            >
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="input py-2 px-4 text-sm w-full pr-10"
                  autoFocus
                />
                <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <FiSearch className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden mt-4 overflow-hidden border-t pt-4"
            >
              <div className="flex flex-col space-y-3">
                {/* Mobile nav items based on role */}
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="hover:text-primary-600 transition-colors py-2 flex items-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                ))}
                
                {isAuthenticated && (
                  <>
                    {dashboardLink && (
                      <Link
                        to={dashboardLink.path}
                        className="hover:text-primary-600 transition-colors py-2 flex items-center gap-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        📊 {dashboardLink.label}
                      </Link>
                    )}
                    
                    <Link
                      to="/profile"
                      className="hover:text-primary-600 transition-colors py-2 flex items-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      👤 My Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="hover:text-primary-600 transition-colors py-2 flex items-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      📦 My Orders
                    </Link>
                    
                    {user?.role === 'customer' && (
                      <Link
                        to="/wishlist"
                        className="hover:text-primary-600 transition-colors py-2 flex items-center gap-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        ❤️ Wishlist
                      </Link>
                    )}
                    
                    <Link
                      to="/notifications"
                      className="hover:text-primary-600 transition-colors py-2 flex items-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      🔔 Notifications
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="text-left text-red-600 hover:text-red-700 py-2 flex items-center gap-2"
                    >
                      🚪 Logout
                    </button>
                  </>
                )}
                
                {!isAuthenticated && (
                  <>
                    <Link
                      to="/login"
                      className="hover:text-primary-600 transition-colors py-2 flex items-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      🔐 Login
                    </Link>
                    <Link
                      to="/register"
                      className="hover:text-primary-600 transition-colors py-2 flex items-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      📝 Register
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;