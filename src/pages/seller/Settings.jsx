import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FiShoppingBag, FiMail, FiPhone, FiMapPin, FiGlobe,
  FiTruck, FiPercent, FiDollarSign, FiCreditCard,
  FiSave, FiRefreshCw, FiInfo, FiPackage, FiSettings,
  FiAlertCircle, FiCheckCircle, FiShield, FiClock,
  FiRotateCcw, FiUpload, FiX, FiImage
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const SellerSettings = () => {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [seller, setSeller] = useState(null);
  const [activeTab, setActiveTab] = useState('store');
  const [savedSuccess, setSavedSuccess] = useState(false);
  
  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: '',
    storeLogo: '',
    storeBanner: '',
    contactEmail: '',
    contactPhone: '',
    businessAddress: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Bangladesh'
    },
    settings: {
      shippingZones: [],
      taxSettings: {
        taxRate: 0,
        isTaxIncluded: false,
        taxId: ''
      },
      returnPolicy: '',
      shippingPolicy: '',
      returnWindow: 7,
      paymentPreferences: {
        payoutMethod: 'bank',
        payoutDetails: {},
        minimumPayout: 500,
        payoutSchedule: 'twice_monthly'
      },
      shippingCost: {
        insideDhaka: 60,
        outsideDhaka: 120,
        freeShippingThreshold: 2000
      }
    }
  });

  useEffect(() => {
    fetchSellerProfile();
  }, []);

  const fetchSellerProfile = async () => {
    setFetchLoading(true);
    try {
      const response = await api.get('/seller/profile');
      const sellerData = response.data.seller;
      setSeller(sellerData);
      
      setFormData({
        storeName: sellerData.storeName || '',
        storeDescription: sellerData.storeDescription || '',
        storeLogo: sellerData.storeLogo || '',
        storeBanner: sellerData.storeBanner || '',
        contactEmail: sellerData.email || '',
        contactPhone: sellerData.phone || '',
        businessAddress: sellerData.businessAddress || {
          street: '', city: '', state: '', postalCode: '', country: 'Bangladesh'
        },
        settings: {
          shippingZones: sellerData.settings?.shippingZones || [],
          taxSettings: {
            taxRate: sellerData.settings?.taxSettings?.taxRate || 0,
            isTaxIncluded: sellerData.settings?.taxSettings?.isTaxIncluded || false,
            taxId: sellerData.settings?.taxSettings?.taxId || ''
          },
          returnPolicy: sellerData.settings?.returnPolicy || '',
          shippingPolicy: sellerData.settings?.shippingPolicy || '',
          returnWindow: sellerData.settings?.returnWindow || 7,
          paymentPreferences: {
            payoutMethod: sellerData.settings?.paymentPreferences?.payoutMethod || 'bank',
            payoutDetails: sellerData.settings?.paymentPreferences?.payoutDetails || {},
            minimumPayout: sellerData.settings?.paymentPreferences?.minimumPayout || 500,
            payoutSchedule: sellerData.settings?.paymentPreferences?.payoutSchedule || 'twice_monthly'
          },
          shippingCost: {
            insideDhaka: sellerData.settings?.shippingCost?.insideDhaka || 60,
            outsideDhaka: sellerData.settings?.shippingCost?.outsideDhaka || 120,
            freeShippingThreshold: sellerData.settings?.shippingCost?.freeShippingThreshold || 2000
          }
        }
      });
    } catch (error) {
      toast.error('Failed to load seller profile');
      console.error('Error fetching profile:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  // Image upload handler
  const handleImageUpload = async (file, type) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, GIF, and WEBP images are allowed');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const uploadFunction = type === 'logo' ? setUploadingLogo : setUploadingBanner;
    uploadFunction(true);

    try {
      const formDataImg = new FormData();
      formDataImg.append('image', file);

      const response = await api.post('/seller/products/upload-image', formDataImg, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success && response.data.imageUrl) {
        const imageUrl = response.data.imageUrl;
        
        if (type === 'logo') {
          setFormData({ ...formData, storeLogo: imageUrl });
          toast.success('Store logo uploaded successfully');
        } else {
          setFormData({ ...formData, storeBanner: imageUrl });
          toast.success('Store banner uploaded successfully');
        }
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      uploadFunction(false);
    }
  };

  // Remove image handler
  const handleRemoveImage = (type) => {
    if (type === 'logo') {
      setFormData({ ...formData, storeLogo: '' });
      toast.success('Store logo removed');
    } else {
      setFormData({ ...formData, storeBanner: '' });
      toast.success('Store banner removed');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setSavedSuccess(false);
    try {
      const updateData = {
        storeName: formData.storeName,
        storeDescription: formData.storeDescription,
        storeLogo: formData.storeLogo,
        storeBanner: formData.storeBanner,
        phone: formData.contactPhone,
        businessAddress: formData.businessAddress,
        settings: formData.settings
      };
      
      const response = await api.put('/seller/profile', updateData);
      
      toast.success('Settings saved successfully');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      
      await fetchSellerProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save settings');
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBDT = (amount) => {
    return `৳${amount?.toFixed(2) || '0.00'}`;
  };

  const tabs = [
    { id: 'store', label: 'Store Profile', icon: FiShoppingBag },
    { id: 'shipping', label: 'Shipping', icon: FiTruck },
    { id: 'returns', label: 'Returns Policy', icon: FiRotateCcw },
    { id: 'tax', label: 'Tax Settings', icon: FiPercent },
    { id: 'payout', label: 'Payout', icon: FiCreditCard }
  ];

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Store Settings
          </h1>
          <p className="text-gray-500 mt-1">Manage your store configuration and preferences</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchSellerProfile} 
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-2"
            disabled={fetchLoading}
          >
            <FiRefreshCw className={`w-4 h-4 ${fetchLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={handleSave} 
            disabled={loading} 
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 
              <FiSave />
            }
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {savedSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3"
        >
          <FiCheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800">All settings have been saved successfully!</p>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex overflow-x-auto border-b">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Store Profile Tab */}
          {activeTab === 'store' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Store Name *</label>
                  <input
                    type="text"
                    value={formData.storeName}
                    onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Your store name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Email *</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    disabled
                    className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
                    placeholder="contact@yourstore.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed. Contact support for assistance.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="+8801XXXXXXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Store Description</label>
                <textarea
                  rows="4"
                  value={formData.storeDescription}
                  onChange={(e) => setFormData({...formData, storeDescription: e.target.value})}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Describe your store..."
                />
              </div>

              {/* Store Logo Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Store Logo</label>
                <div className="flex items-start gap-4">
                  {/* Image Preview */}
                  {formData.storeLogo ? (
                    <div className="relative">
                      <img 
                        src={formData.storeLogo} 
                        alt="Store Logo" 
                        className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        onClick={() => handleRemoveImage('logo')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <FiImage className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <div>
                    <input
                      type="file"
                      ref={logoInputRef}
                      onChange={(e) => handleImageUpload(e.target.files[0], 'logo')}
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {uploadingLogo ? (
                        <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <FiUpload className="w-4 h-4" />
                      )}
                      {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      Recommended: Square image, minimum 200x200px. Max 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Store Banner Upload - Fixed */}
              <div>
                <label className="block text-sm font-medium mb-2">Store Banner</label>
                <div className="space-y-3">
                  {/* Banner Preview */}
                  {formData.storeBanner && (
                    <div className="relative">
                      <img 
                        src={formData.storeBanner} 
                        alt="Store Banner" 
                        className="w-full h-40 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() => handleRemoveImage('banner')}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  {/* Upload Area */}
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      formData.storeBanner ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-primary-400'
                    }`}
                  >
                    <input
                      type="file"
                      ref={bannerInputRef}
                      onChange={(e) => handleImageUpload(e.target.files[0], 'banner')}
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      className="hidden"
                    />
                    <FiUpload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      {formData.storeBanner ? 'Click to change banner' : 'Click to upload banner'}
                    </p>
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      disabled={uploadingBanner}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm disabled:opacity-50"
                    >
                      {uploadingBanner ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Uploading...
                        </div>
                      ) : (
                        formData.storeBanner ? 'Change Banner' : 'Select Banner'
                      )}
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      Recommended: 1200x400px rectangle. Max 5MB. JPG, PNG, GIF, WEBP.
                    </p>
                  </div>
                </div>
              </div>

              {/* Business Address */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FiMapPin className="w-4 h-4" />
                  Business Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={formData.businessAddress.street}
                    onChange={(e) => setFormData({
                      ...formData,
                      businessAddress: {...formData.businessAddress, street: e.target.value}
                    })}
                    className="p-2 border border-gray-200 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.businessAddress.city}
                    onChange={(e) => setFormData({
                      ...formData,
                      businessAddress: {...formData.businessAddress, city: e.target.value}
                    })}
                    className="p-2 border border-gray-200 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={formData.businessAddress.state}
                    onChange={(e) => setFormData({
                      ...formData,
                      businessAddress: {...formData.businessAddress, state: e.target.value}
                    })}
                    className="p-2 border border-gray-200 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Postal Code"
                    value={formData.businessAddress.postalCode}
                    onChange={(e) => setFormData({
                      ...formData,
                      businessAddress: {...formData.businessAddress, postalCode: e.target.value}
                    })}
                    className="p-2 border border-gray-200 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={formData.businessAddress.country}
                    onChange={(e) => setFormData({
                      ...formData,
                      businessAddress: {...formData.businessAddress, country: e.target.value}
                    })}
                    className="p-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Shipping Tab */}
          {activeTab === 'shipping' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Shipping Policy</label>
                <textarea
                  rows="4"
                  value={formData.settings.shippingPolicy}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: {...formData.settings, shippingPolicy: e.target.value}
                  })}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Describe your shipping policy..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Shipping Cost (Inside Dhaka)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">৳</span>
                    <input
                      type="number"
                      value={formData.settings.shippingCost?.insideDhaka || 60}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          shippingCost: {
                            ...formData.settings.shippingCost,
                            insideDhaka: parseFloat(e.target.value)
                          }
                        }
                      })}
                      className="w-full pl-8 p-2 border border-gray-200 rounded-lg"
                      placeholder="60"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Shipping Cost (Outside Dhaka)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">৳</span>
                    <input
                      type="number"
                      value={formData.settings.shippingCost?.outsideDhaka || 120}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          shippingCost: {
                            ...formData.settings.shippingCost,
                            outsideDhaka: parseFloat(e.target.value)
                          }
                        }
                      })}
                      className="w-full pl-8 p-2 border border-gray-200 rounded-lg"
                      placeholder="120"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Free Shipping Threshold</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">৳</span>
                    <input
                      type="number"
                      value={formData.settings.shippingCost?.freeShippingThreshold || 2000}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          shippingCost: {
                            ...formData.settings.shippingCost,
                            freeShippingThreshold: parseFloat(e.target.value)
                          }
                        }
                      })}
                      className="w-full pl-8 p-2 border border-gray-200 rounded-lg"
                      placeholder="2000"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Orders above this amount get free shipping</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <FiInfo className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Shipping Information:</p>
                    <p>• Inside Dhaka: {formatBDT(formData.settings.shippingCost?.insideDhaka || 60)}</p>
                    <p>• Outside Dhaka: {formatBDT(formData.settings.shippingCost?.outsideDhaka || 120)}</p>
                    {formData.settings.shippingCost?.freeShippingThreshold && (
                      <p>• Free shipping on orders over {formatBDT(formData.settings.shippingCost.freeShippingThreshold)}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Returns Policy Tab */}
          {activeTab === 'returns' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Return Window (Days)</label>
                <input
                  type="number"
                  value={formData.settings.returnWindow || 7}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: {...formData.settings, returnWindow: parseInt(e.target.value)}
                  })}
                  className="w-32 p-2 border border-gray-200 rounded-lg"
                  min="1"
                  max="30"
                />
                <p className="text-xs text-gray-500 mt-1">Customers can return items within this many days</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Return Policy</label>
                <textarea
                  rows="6"
                  value={formData.settings.returnPolicy}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: {...formData.settings, returnPolicy: e.target.value}
                  })}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Describe your return policy in detail..."
                />
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <FiShield className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Recommended Return Policy Points:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Items must be unused and in original packaging</li>
                      <li>Customer pays for return shipping unless item is defective</li>
                      <li>Refunds processed within 5-7 business days after receiving return</li>
                      <li>Sale items may not be eligible for return</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tax Tab */}
          {activeTab === 'tax' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.settings.taxSettings.taxRate}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        taxSettings: {...formData.settings.taxSettings, taxRate: parseFloat(e.target.value)}
                      }
                    })}
                    className="w-32 p-2 border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tax ID / BIN Number</label>
                  <input
                    type="text"
                    value={formData.settings.taxSettings.taxId || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        taxSettings: {...formData.settings.taxSettings, taxId: e.target.value}
                      }
                    })}
                    className="w-full p-2 border border-gray-200 rounded-lg"
                    placeholder="e.g., 123456789"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.settings.taxSettings.isTaxIncluded}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: {
                      ...formData.settings,
                      taxSettings: {...formData.settings.taxSettings, isTaxIncluded: e.target.checked}
                    }
                  })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Include tax in product price (VAT inclusive pricing)</span>
              </label>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <FiPercent className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium mb-1">Tax Calculation:</p>
                    {formData.settings.taxSettings.isTaxIncluded ? (
                      <p>Tax is included in product prices. Final price = Product price</p>
                    ) : (
                      <p>Tax is added at checkout. Final price = Product price + {formData.settings.taxSettings.taxRate}% tax</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payout Tab - Keep existing code */}
          {activeTab === 'payout' && (
            // ... (keep existing payout tab code)
            <div className="space-y-6">
              {/* Payout content from previous version */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <FiInfo className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Payout Information:</p>
                    <p>• Minimum payout amount: {formatBDT(formData.settings.paymentPreferences.minimumPayout || 500)}</p>
                    <p>• Payouts are processed on the 1st and 15th of every month</p>
                    <p>• Processing time: 2-3 business days after payout initiation</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerSettings;