import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiHeart, 
  FiHome, FiPackage, FiShoppingBag, FiBarChart2, FiSettings, 
  FiPhoneCall, FiMail, FiChevronDown, FiLogOut, FiBell, FiTrendingUp, FiClock
} from 'react-icons/fi';
import { logout } from '../../redux/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from '../common/NotificationBell';
import api from '../../services/api';
import logo from "../../assets/logo.png";

// Custom debounce function
const useDebounce = (func, delay) => {
  const [timer, setTimer] = useState(null);
  
  const debouncedFunction = useCallback((...args) => {
    if (timer) clearTimeout(timer);
    const newTimer = setTimeout(() => {
      func(...args);
    }, delay);
    setTimer(newTimer);
  }, [func, delay, timer]);
  
  return debouncedFunction;
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  // Search Autocomplete State
  const [suggestions, setSuggestions] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch popular searches on mount
  useEffect(() => {
    const fetchPopularSearches = async () => {
      try {
        const { data } = await api.get('/search/analytics');
        if (data.success) {
          setPopularSearches(data.popular || []);
        }
      } catch (error) {
        console.error('Error fetching popular searches', error);
      }
    };
    fetchPopularSearches();
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Search API Call
  const fetchSuggestions = useDebounce(async (query) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const { data } = await api.get(`/search/suggestions?q=${query}`);
      if (data.success) {
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsSearching(false);
    }
  }, 300);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(true);
    fetchSuggestions(value);
  };


  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsMobileSearchOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsMenuOpen(false);
    setActiveDropdown(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
      setIsMobileSearchOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    navigate(`/product/${suggestion.slug}`);
    setShowSuggestions(false);
    setSearchQuery('');
  };

  const handlePopularSearchClick = (query) => {
    setSearchQuery(query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setShowSuggestions(false);
  };

  const cartItemCount = items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  // Navigation items based on user role
  const mainNavLinks = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Shop' },
    
  ];

  const getDashboardLink = () => {
    if (!isAuthenticated) return null;
    switch (user?.role) {
      case 'admin':
        return { path: '/admin/dashboard', label: 'Admin Dashboard', icon: FiBarChart2 };
      case 'seller':
        return { path: '/seller/dashboard', label: 'Seller Dashboard', icon: FiPackage };
      default:
        return null;
    }
  };

  const dashboardLink = getDashboardLink();

  return (
    <>
    

      {/* Main Header */}
      <header className={`sticky top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg py-3' : 'bg-white shadow-sm py-4'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <FiMenu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link to="/" className="shrink-0 flex items-center gap-2">
              <div className="w-10 h-10 bg-linear-to-br  flex items-center justify-center text-white font-bold text-xl ">
                {/* <img 
                src={logo}
                className=' h-full w-full rounded-full'
                 /> */}
              </div>
              
              <span className="text-3xl font-serif font-bold bg-linear-to-r text-[#0B2E33] bg-clip-text ">
                Easilia
              </span>
            </Link>

            {/* Desktop Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-auto" ref={searchRef}>
              <div className="flex w-full relative group">
                <form onSubmit={handleSearch} className="w-full relative">
                  <input
                    type="text"
                    id="desktopSearchInput"
                    name="desktopSearchInput"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Search for products, brands and more..."
                    className="w-full h-12 pl-6 pr-14 border border-gray-300 rounded-full outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm group-hover:border-gray-400"
                    autoComplete="off"
                  />
                  <button 
                    type="submit" 
                    className="absolute right-1 top-1 bottom-1 w-12 bg-[#0b2e33] hover:bg-primary-700 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <FiSearch className="w-5 h-5" />
                  </button>
                </form>

                {/* Autocomplete Dropdown */}
                <AnimatePresence>
                  {showSuggestions && (searchQuery.length >= 2 || popularSearches.length > 0) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-3 z-50 overflow-hidden"
                    >
                      {/* Popular Searches when input is empty */}
                      {!searchQuery.trim() && popularSearches.length > 0 && (
                        <div className="px-4">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <FiTrendingUp /> Popular Searches
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {popularSearches.map((term, i) => (
                              <button
                                key={i}
                                onClick={() => handlePopularSearchClick(term)}
                                className="px-3 py-1.5 bg-gray-50 hover:bg-primary-50 text-gray-700 hover:text-primary-700 text-sm rounded-full transition-colors border border-gray-100 hover:border-primary-200"
                              >
                                {term}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Search Results */}
                      {searchQuery.trim().length >= 2 && (
                        <div className="px-2">
                          {isSearching ? (
                            <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                              Searching...
                            </div>
                          ) : suggestions.length > 0 ? (
                            <div>
                              <h4 className="px-3 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                Products matching "{searchQuery}"
                              </h4>
                              {suggestions.map((item) => (
                                <button
                                  key={item._id}
                                  onClick={() => handleSuggestionClick(item)}
                                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                                >
                                  <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                                    {item.images && item.images[0] ? (
                                      <img src={item.images[0].url} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <FiPackage className="w-5 h-5 m-auto text-gray-400 mt-2.5" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                    <p className="text-xs text-primary-600 font-bold">${item.price}</p>
                                  </div>
                                </button>
                              ))}
                              <div className="mt-2 pt-2 border-t border-gray-100 px-2">
                                <button
                                  onClick={() => handleSearch({ preventDefault: () => {} })}
                                  className="w-full py-2 text-sm text-center text-primary-600 hover:text-primary-800 font-medium transition-colors"
                                >
                                  View all results for "{searchQuery}"
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="px-4 py-4 text-center">
                              <p className="text-gray-500 text-sm">No products found for "{searchQuery}"</p>
                              <div className="mt-2 text-xs text-gray-400">
                                Try checking your spelling or use more general terms
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
              
              {/* Mobile Search Toggle */}
              <button
                className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              >
                <FiSearch className="w-6 h-6" />
              </button>

              {/* Wishlist */}
              {(!isAuthenticated || user?.role === 'customer') && (
                <Link to="/wishlist" className="relative p-2.5 hover:bg-gray-100 rounded-full transition-colors text-gray-700 hidden sm:block group">
                  <FiHeart className="w-6 h-6 group-hover:fill-red-50 group-hover:text-red-500 transition-colors" />
                </Link>
              )}

              {/* Cart */}
              <Link to="/cart" className="relative p-2.5 hover:bg-gray-100 rounded-full transition-colors text-gray-700 group">
                <FiShoppingCart className="w-6 h-6 group-hover:text-primary-600 transition-colors" />
                <AnimatePresence>
                  {cartItemCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute top-1 right-1 bg-primary-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border-2 border-white"
                    >
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* Notifications */}
              {isAuthenticated && (
                <div className="relative p-1">
                  <NotificationBell />
                </div>
              )}

              <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block"></div>

              {/* User Menu */}
              <div className="relative" 
                   onMouseEnter={() => setActiveDropdown('user')}
                   onMouseLeave={() => setActiveDropdown(null)}>
                
                {isAuthenticated ? (
                  <div className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-gray-50 rounded-full transition-colors pl-2 sm:pl-3">
                    <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold border border-primary-200">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden xl:block text-left mr-2">
                      <p className="text-xs text-gray-500 leading-tight">Welcome back</p>
                      <p className="text-sm font-bold text-gray-800 leading-tight truncate max-w-[100px]">{user.name}</p>
                    </div>
                    <FiChevronDown className="w-4 h-4 text-gray-500 hidden xl:block" />
                  </div>
                ) : (
                  <Link to="/login" className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-700">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                      <FiUser className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="hidden xl:block text-left mr-2">
                      <p className="text-xs text-gray-500 leading-tight">Sign In / Join</p>
                      <p className="text-sm font-bold text-gray-800 leading-tight">My Account</p>
                    </div>
                  </Link>
                )}

                {/* User Dropdown */}
                <AnimatePresence>
                  {activeDropdown === 'user' && isAuthenticated && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden"
                    >
                      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                        <p className="font-bold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        <span className="inline-block mt-2 px-2.5 py-0.5 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full capitalize">
                          {user.role}
                        </span>
                      </div>
                      
                      <div className="py-2">
                        {dashboardLink && (
                          <Link to={dashboardLink.path} className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 text-gray-700 hover:text-primary-600 transition-colors">
                            <dashboardLink.icon className="w-5 h-5" />
                            <span className="font-medium">{dashboardLink.label}</span>
                          </Link>
                        )}
                        
                        <Link to="/profile" className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 text-gray-700 hover:text-primary-600 transition-colors">
                          <FiUser className="w-5 h-5" />
                          <span className="font-medium">My Profile</span>
                        </Link>
                        
                        <Link to="/orders" className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 text-gray-700 hover:text-primary-600 transition-colors">
                          <FiPackage className="w-5 h-5" />
                          <span className="font-medium">My Orders</span>
                        </Link>
                        
                        {user?.role === 'customer' && (
                          <Link to="/wishlist" className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 text-gray-700 hover:text-primary-600 transition-colors">
                            <FiHeart className="w-5 h-5" />
                            <span className="font-medium">Wishlist</span>
                          </Link>
                        )}
                        
                        <Link to="/settings" className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 text-gray-700 hover:text-primary-600 transition-colors">
                          <FiSettings className="w-5 h-5" />
                          <span className="font-medium">Account Settings</span>
                        </Link>
                      </div>
                      
                      <div className="border-t border-gray-100 pt-2 pb-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-5 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                          <FiLogOut className="w-5 h-5" />
                          <span className="font-medium">Log Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>

          {/* Bottom Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-8 mt-4 pt-4 border-t border-gray-100">
            {mainNavLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={`font-medium text-sm transition-colors hover:text-primary-600 ${
                  location.pathname === link.path ? 'text-primary-600' : 'text-gray-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Add more specific links or a mega menu trigger here if needed */}
            <div className="flex-1"></div>
            
            <div className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 cursor-pointer transition-colors">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              Flash Sales
            </div>
          </nav>

          {/* Mobile Search Input (Expandable) */}
          <AnimatePresence>
            {isMobileSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden overflow-hidden"
              >
                <form onSubmit={handleSearch} className="py-3 border-t mt-3 border-gray-100 relative">
                  <input
                    type="text"
                    id="mobileSearchInput"
                    name="mobileSearchInput"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full h-10 pl-4 pr-12 border border-gray-300 rounded-lg outline-none focus:border-primary-500 text-sm"
                    autoFocus
                  />
                  <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-primary-600">
                    <FiSearch className="w-5 h-5" />
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Mobile Side Drawer Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-[60] lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Mobile Side Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 w-4/5 max-w-sm h-full bg-white z-[70] shadow-2xl flex flex-col lg:hidden"
          >
            {/* Drawer Header */}
            <div className="p-4 bg-linear-to-r from-primary-600 to-primary-800 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                {isAuthenticated ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg border border-white/30 backdrop-blur-md">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold leading-tight">{user.name}</p>
                      <p className="text-primary-100 text-xs truncate max-w-[150px]">{user.email}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                      <FiUser className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-bold">Welcome Guest</p>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto py-2">
              {!isAuthenticated && (
                <div className="px-4 py-3 grid grid-cols-2 gap-3 border-b border-gray-100">
                  <Link to="/login" className="btn-primary py-2 text-center rounded-lg text-sm font-medium" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                  <Link to="/register" className="btn-secondary py-2 text-center rounded-lg text-sm font-medium" onClick={() => setIsMenuOpen(false)}>Register</Link>
                </div>
              )}

              <div className="px-2 py-2">
                <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Menu</p>
                {mainNavLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-colors font-medium mx-2"
                  >
                    <FiHome className={`w-5 h-5 ${link.label === 'Shop' && 'hidden'}`} />
                    {link.label === 'Shop' && <FiShoppingBag className="w-5 h-5" />}
                    {link.label}
                  </Link>
                ))}
              </div>

              {isAuthenticated && (
                <div className="px-2 py-2 border-t border-gray-100 mt-2">
                  <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">My Account</p>
                  
                  {dashboardLink && (
                    <Link
                      to={dashboardLink.path}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-colors font-medium mx-2"
                    >
                      <dashboardLink.icon className="w-5 h-5" />
                      {dashboardLink.label}
                    </Link>
                  )}
                  
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-colors font-medium mx-2">
                    <FiUser className="w-5 h-5" /> Profile Details
                  </Link>
                  <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-colors font-medium mx-2">
                    <FiPackage className="w-5 h-5" /> Order History
                  </Link>
                  {user?.role === 'customer' && (
                    <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-colors font-medium mx-2">
                      <FiHeart className="w-5 h-5" /> My Wishlist
                    </Link>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="w-[calc(100%-1rem)] flex items-center gap-4 px-4 py-3 mx-2 mt-4 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors font-medium text-left"
                  >
                    <FiLogOut className="w-5 h-5" /> Log Out
                  </button>
                </div>
              )}
            </div>
            
            {/* Drawer Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-500">
              <p>BuySeller © 2026. All rights reserved.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;