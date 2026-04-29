import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, FiMail, FiPhone, FiCamera, FiSave, 
  FiLock, FiMapPin, FiHeart, FiClock, FiEdit2,
  FiTrash2, FiPlus, FiStar, FiShoppingBag, FiCheck,
  FiX, FiLoader, FiUpload
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { updateUserProfile, uploadAvatar, deleteAvatar } from '../redux/slices/authSlice';
import api from '../services/api';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [avatarKey, setAvatarKey] = useState(Date.now()); // Force re-render for avatar
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    wishlistCount: 0
  });

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [addressForm, setAddressForm] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Bangladesh',
    phone: '',
    isDefault: false
  });

  // Sync profileData with user from Redux
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        profileImage: user.profileImage || ''
      });
    }
  }, [user]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const [addressRes, wishlistRes, viewedRes] = await Promise.all([
        api.get('/users/addresses'),
        api.get('/users/wishlist'),
        api.get('/users/recently-viewed')
      ]);
      
      setAddresses(addressRes.data.addresses || []);
      setWishlist(wishlistRes.data.wishlist || []);
      setRecentlyViewed(viewedRes.data.recentlyViewed || []);
      setStats({
        totalOrders: 0,
        totalSpent: 0,
        wishlistCount: wishlistRes.data.wishlist?.length || 0
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(updateUserProfile(profileData)).unwrap();
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, or WEBP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
    setShowAvatarModal(true);
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('avatar', selectedFile);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const result = await dispatch(uploadAvatar(formData)).unwrap();
      console.log('Upload result:', result);
      
      // Update profileData with new image URL
      setProfileData(prev => ({
        ...prev,
        profileImage: result.profileImage
      }));
      
      // Force avatar re-render
      setAvatarKey(Date.now());
      
      setUploadProgress(100);
      setTimeout(() => {
        setShowAvatarModal(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadProgress(0);
        clearInterval(interval);
        fetchUserData();
        toast.success('Avatar uploaded successfully');
      }, 500);
    } catch (error) {
      clearInterval(interval);
      setUploadProgress(0);
      toast.error('Failed to upload avatar');
    }
  };

  const handleDeleteAvatar = async () => {
    if (window.confirm('Are you sure you want to remove your profile picture?')) {
      try {
        const result = await dispatch(deleteAvatar()).unwrap();
        setProfileData(prev => ({
          ...prev,
          profileImage: result.profileImage
        }));
        setAvatarKey(Date.now());
        fetchUserData();
        toast.success('Avatar removed successfully');
      } catch (error) {
        toast.error('Failed to delete avatar');
      }
    }
  };

  const handleAddAddress = async () => {
    if (!addressForm.name || !addressForm.street || !addressForm.city || 
        !addressForm.state || !addressForm.postalCode || !addressForm.phone) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      if (editingAddress) {
        await api.put(`/users/addresses/${editingAddress._id}`, addressForm);
        toast.success('Address updated successfully');
      } else {
        await api.post('/users/addresses', addressForm);
        toast.success('Address added successfully');
      }
      await fetchUserData();
      setShowAddressModal(false);
      setEditingAddress(null);
      setAddressForm({
        name: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Bangladesh',
        phone: '',
        isDefault: false
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      setLoading(true);
      try {
        await api.delete(`/users/addresses/${addressId}`);
        toast.success('Address deleted successfully');
        await fetchUserData();
      } catch (error) {
        toast.error('Failed to delete address');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    setLoading(true);
    try {
      await api.put(`/users/addresses/${addressId}`, { isDefault: true });
      toast.success('Default address updated');
      await fetchUserData();
    } catch (error) {
      toast.error('Failed to update default address');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    setLoading(true);
    try {
      await api.delete(`/users/wishlist/${productId}`);
      toast.success('Removed from wishlist');
      await fetchUserData();
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const getAvatarUrl = () => {
    if (profileData.profileImage && profileData.profileImage.includes('http')) {
      return `${profileData.profileImage}?t=${avatarKey}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=3b82f6&color=fff&rounded=true&size=200`;
  };

  const tabs = [
    { id: 'profile', label: 'Profile Info', icon: FiUser },
    { id: 'addresses', label: 'Addresses', icon: FiMapPin, count: addresses.length },
    { id: 'wishlist', label: 'Wishlist', icon: FiHeart, count: wishlist.length },
    { id: 'recent', label: 'Recently Viewed', icon: FiClock, count: recentlyViewed.length },
    { id: 'security', label: 'Security', icon: FiLock }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Account</h1>
          <p className="text-gray-600">Manage your profile and preferences</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <FiShoppingBag className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Spent</p>
                <p className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FiStar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Wishlist Items</p>
                <p className="text-2xl font-bold">{stats.wishlistCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FiHeart className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-24">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg mb-2 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
                  
                  {/* Avatar Section - Fixed */}
                  <div className="flex justify-center mb-8">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg">
                        <img
                          key={avatarKey}
                          src={getAvatarUrl()}
                          alt={profileData.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Image failed to load, using fallback');
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=3b82f6&color=fff&rounded=true&size=200`;
                          }}
                        />
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="absolute -bottom-2 -right-2 flex gap-2">
                        {profileData.profileImage && (
                          <button
                            onClick={handleDeleteAvatar}
                            disabled={isLoading}
                            className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                            title="Remove avatar"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => document.getElementById('avatarInput').click()}
                          disabled={isLoading}
                          className="bg-primary-600 text-white p-2 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
                          title="Upload new avatar"
                        >
                          <FiCamera className="w-4 h-4" />
                        </button>
                        <input
                          id="avatarInput"
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Full Name</label>
                        <div className="relative">
                          <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={profileData.name}
                            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                            className="input pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Email Address</label>
                        <div className="relative">
                          <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            value={profileData.email}
                            disabled
                            className="input pl-10 bg-gray-50"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Phone Number</label>
                        <div className="relative">
                          <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                            className="input pl-10"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                        {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FiSave />}
                        Save Changes
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <motion.div
                  key="addresses"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Saved Addresses</h2>
                    <button
                      onClick={() => {
                        setEditingAddress(null);
                        setAddressForm({
                          name: user?.name || '',
                          street: '',
                          city: '',
                          state: '',
                          postalCode: '',
                          country: 'Bangladesh',
                          phone: user?.phone || '',
                          isDefault: addresses.length === 0
                        });
                        setShowAddressModal(true);
                      }}
                      className="btn-primary flex items-center gap-2"
                    >
                      <FiPlus /> Add Address
                    </button>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="text-center py-12">
                      <FiMapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No addresses saved</h3>
                      <p className="text-gray-600 mb-4">Add your first shipping address</p>
                      <button
                        onClick={() => setShowAddressModal(true)}
                        className="btn-primary"
                      >
                        Add Address
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {addresses.map((address) => (
                        <div key={address._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{address.name}</h3>
                                {address.isDefault && (
                                  <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">Default</span>
                                )}
                              </div>
                              <p className="text-gray-600 text-sm">{address.street}</p>
                              <p className="text-gray-600 text-sm">{address.city}, {address.state} {address.postalCode}</p>
                              <p className="text-gray-600 text-sm">{address.country}</p>
                              <p className="text-gray-600 text-sm">Phone: {address.phone}</p>
                            </div>
                            <div className="flex gap-2">
                              {!address.isDefault && (
                                <button
                                  onClick={() => handleSetDefaultAddress(address._id)}
                                  className="text-green-600 hover:text-green-700 p-1"
                                  title="Set as default"
                                >
                                  <FiCheck className="w-5 h-5" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setEditingAddress(address);
                                  setAddressForm(address);
                                  setShowAddressModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-700 p-1"
                              >
                                <FiEdit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(address._id)}
                                className="text-red-600 hover:text-red-700 p-1"
                              >
                                <FiTrash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <motion.div
                  key="wishlist"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <h2 className="text-xl font-semibold mb-6">My Wishlist ({wishlist.length})</h2>
                  {wishlist.length === 0 ? (
                    <div className="text-center py-12">
                      <FiHeart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
                      <p className="text-gray-600 mb-4">Save items you love to your wishlist</p>
                      <Link to="/products" className="btn-primary inline-block">
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {wishlist.map((product) => (
                        <div key={product._id} className="border rounded-lg p-4 flex gap-4 hover:shadow-md transition-shadow">
                          <img
                            src={product.images?.[0]?.url || 'https://via.placeholder.com/80'}
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <div className="flex-1">
                            <Link to={`/product/${product.slug || product._id}`} className="font-semibold hover:text-primary-600 line-clamp-2">
                              {product.name}
                            </Link>
                            <p className="text-primary-600 font-bold mt-1">${product.price?.toFixed(2)}</p>
                            {product.stock > 0 ? (
                              <span className="text-green-600 text-xs">In Stock</span>
                            ) : (
                              <span className="text-red-600 text-xs">Out of Stock</span>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveFromWishlist(product._id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Recently Viewed Tab */}
              {activeTab === 'recent' && (
                <motion.div
                  key="recent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Recently Viewed ({recentlyViewed.length})</h2>
                    {recentlyViewed.length > 0 && (
                      <button
                        onClick={async () => {
                          if (window.confirm('Clear all recently viewed items?')) {
                            await api.delete('/users/recently-viewed');
                            await fetchUserData();
                            toast.success('Cleared recently viewed');
                          }
                        }}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  {recentlyViewed.length === 0 ? (
                    <div className="text-center py-12">
                      <FiClock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No recently viewed items</h3>
                      <p className="text-gray-600">Products you view will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentlyViewed.map((item) => (
                        <div key={item._id} className="border rounded-lg p-3 flex gap-3 hover:shadow-md transition-shadow">
                          <img
                            src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/60'}
                            alt={item.product?.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <Link to={`/product/${item.product?.slug || item.product?._id}`} className="font-medium hover:text-primary-600">
                              {item.product?.name}
                            </Link>
                            <p className="text-primary-600 font-semibold">${item.product?.price?.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">Viewed: {new Date(item.viewedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <h2 className="text-xl font-semibold mb-6">Change Password</h2>
                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium mb-1">Current Password</label>
                      <div className="relative">
                        <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          className="input pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">New Password</label>
                      <div className="relative">
                        <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className="input pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                      <div className="relative">
                        <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className="input pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Address Modal */}
        {showAddressModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-xl font-bold mb-4">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={addressForm.name}
                  onChange={(e) => setAddressForm({...addressForm, name: e.target.value})}
                  className="input"
                  required
                />
                <input
                  type="text"
                  placeholder="Street Address"
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({...addressForm, street: e.target.value})}
                  className="input"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                    className="input"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                    className="input"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Postal Code"
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({...addressForm, postalCode: e.target.value})}
                    className="input"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                    className="input"
                    required
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                  className="input"
                  required
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                  />
                  <span className="text-sm">Set as default address</span>
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleAddAddress} className="btn-primary flex-1" disabled={loading}>
                  {loading ? 'Saving...' : (editingAddress ? 'Update' : 'Save')}
                </button>
                <button
                  onClick={() => {
                    setShowAddressModal(false);
                    setEditingAddress(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Avatar Upload Modal */}
        {showAvatarModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg max-w-md w-full p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Upload Profile Picture</h2>
                <button
                  onClick={() => {
                    setShowAvatarModal(false);
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setUploadProgress(0);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Preview */}
              <div className="flex justify-center mb-6">
                <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-100 shadow-lg">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiUser className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* File Info */}
              {selectedFile && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}

              {/* Upload Progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mb-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="h-full bg-primary-600 rounded-full"
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-1">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleUploadAvatar}
                  disabled={!selectedFile || loading || uploadProgress > 0}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {loading || uploadProgress > 0 ? (
                    <FiLoader className="w-4 h-4 animate-spin" />
                  ) : (
                    <FiUpload className="w-4 h-4" />
                  )}
                  Upload
                </button>
                <button
                  onClick={() => {
                    setShowAvatarModal(false);
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setUploadProgress(0);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>

              {/* Tips */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Tips:</strong>
                  <br />
                  • Recommended size: 300x300 pixels
                  <br />
                  • Maximum file size: 5MB
                  <br />
                  • Supported formats: JPEG, PNG, GIF, WEBP
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;