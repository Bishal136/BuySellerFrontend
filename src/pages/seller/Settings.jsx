import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiShoppingBag, FiMail, FiPhone, FiMapPin, FiGlobe,
  FiTruck, FiPercent, FiDollarSign, FiCreditCard,
  FiSave, FiRefreshCw, FiInfo, FiPackage, FiSettings
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const SellerSettings = () => {
  const [loading, setLoading] = useState(false);
  const [seller, setSeller] = useState(null);
  const [activeTab, setActiveTab] = useState('store');
  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: '',
    storeLogo: '',
    storeBanner: '',
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
        taxRate: 10,
        isTaxIncluded: false
      },
      returnPolicy: '',
      shippingPolicy: '',
      paymentPreferences: {
        payoutMethod: 'bank',
        payoutDetails: {}
      }
    }
  });

  useEffect(() => {
    fetchSellerProfile();
  }, []);

  const fetchSellerProfile = async () => {
    try {
      const response = await api.get('/seller/profile');
      setSeller(response.data.seller);
      setFormData({
        storeName: response.data.seller.storeName || '',
        storeDescription: response.data.seller.storeDescription || '',
        storeLogo: response.data.seller.storeLogo || '',
        storeBanner: response.data.seller.storeBanner || '',
        businessAddress: response.data.seller.businessAddress || {
          street: '', city: '', state: '', postalCode: '', country: 'Bangladesh'
        },
        settings: response.data.seller.settings || {
          shippingZones: [],
          taxSettings: { taxRate: 10, isTaxIncluded: false },
          returnPolicy: '',
          shippingPolicy: '',
          paymentPreferences: { payoutMethod: 'bank', payoutDetails: {} }
        }
      });
    } catch (error) {
      toast.error('Failed to load settings');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/seller/store-settings', formData);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'store', label: 'Store Profile', icon: FiShoppingBag },
    { id: 'shipping', label: 'Shipping', icon: FiTruck },
    { id: 'tax', label: 'Tax Settings', icon: FiPercent },
    { id: 'payout', label: 'Payout', icon: FiCreditCard }
  ];

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
        <button onClick={handleSave} disabled={loading} className="btn-primary flex items-center gap-2">
          {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FiSave />}
          Save Changes
        </button>
      </div>

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
              <div>
                <label className="block text-sm font-medium mb-2">Store Name</label>
                <input
                  type="text"
                  value={formData.storeName}
                  onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Your store name"
                />
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
              <div>
                <label className="block text-sm font-medium mb-2">Store Logo URL</label>
                <input
                  type="text"
                  value={formData.storeLogo}
                  onChange={(e) => setFormData({...formData, storeLogo: e.target.value})}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://example.com/logo.png"
                />
                {formData.storeLogo && (
                  <div className="mt-2">
                    <img src={formData.storeLogo} alt="Store Logo" className="w-20 h-20 object-cover rounded-lg" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Store Banner URL</label>
                <input
                  type="text"
                  value={formData.storeBanner}
                  onChange={(e) => setFormData({...formData, storeBanner: e.target.value})}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://example.com/banner.jpg"
                />
                {formData.storeBanner && (
                  <div className="mt-2">
                    <img src={formData.storeBanner} alt="Store Banner" className="w-full h-32 object-cover rounded-lg" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold mb-3">Business Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Street"
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
              <div>
                <label className="block text-sm font-medium mb-2">Return Policy</label>
                <textarea
                  rows="4"
                  value={formData.settings.returnPolicy}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: {...formData.settings, returnPolicy: e.target.value}
                  })}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Describe your return policy..."
                />
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <FiInfo className="w-5 h-5 text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    Shipping zones and rates can be configured here. You can set different rates for different regions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tax Tab */}
          {activeTab === 'tax' && (
            <div className="space-y-6">
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
                  className="w-32 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
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
                />
                <span className="text-sm">Include tax in product price</span>
              </label>
            </div>
          )}

          {/* Payout Tab */}
          {activeTab === 'payout' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Payout Method</label>
                <select
                  value={formData.settings.paymentPreferences.payoutMethod}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: {
                      ...formData.settings,
                      paymentPreferences: {...formData.settings.paymentPreferences, payoutMethod: e.target.value}
                    }
                  })}
                  className="w-64 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="bank">Bank Transfer</option>
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>
              
              {formData.settings.paymentPreferences.payoutMethod === 'bank' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Account Holder Name</label>
                    <input
                      type="text"
                      value={formData.settings.paymentPreferences.payoutDetails?.accountHolderName || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          paymentPreferences: {
                            ...formData.settings.paymentPreferences,
                            payoutDetails: {
                              ...formData.settings.paymentPreferences.payoutDetails,
                              accountHolderName: e.target.value
                            }
                          }
                        }
                      })}
                      className="w-full p-2 border border-gray-200 rounded-lg"
                      placeholder="Account holder name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Account Number</label>
                    <input
                      type="text"
                      value={formData.settings.paymentPreferences.payoutDetails?.accountNumber || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          paymentPreferences: {
                            ...formData.settings.paymentPreferences,
                            payoutDetails: {
                              ...formData.settings.paymentPreferences.payoutDetails,
                              accountNumber: e.target.value
                            }
                          }
                        }
                      })}
                      className="w-full p-2 border border-gray-200 rounded-lg"
                      placeholder="Account number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Bank Name</label>
                    <input
                      type="text"
                      value={formData.settings.paymentPreferences.payoutDetails?.bankName || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          paymentPreferences: {
                            ...formData.settings.paymentPreferences,
                            payoutDetails: {
                              ...formData.settings.paymentPreferences.payoutDetails,
                              bankName: e.target.value
                            }
                          }
                        }
                      })}
                      className="w-full p-2 border border-gray-200 rounded-lg"
                      placeholder="Bank name"
                    />
                  </div>
                </div>
              )}

              {formData.settings.paymentPreferences.payoutMethod === 'bkash' && (
                <div>
                  <label className="block text-sm font-medium mb-2">bKash Account Number</label>
                  <input
                    type="text"
                    value={formData.settings.paymentPreferences.payoutDetails?.bkashNumber || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        paymentPreferences: {
                          ...formData.settings.paymentPreferences,
                          payoutDetails: {
                            ...formData.settings.paymentPreferences.payoutDetails,
                            bkashNumber: e.target.value
                          }
                        }
                      }
                    })}
                    className="w-full p-2 border border-gray-200 rounded-lg"
                    placeholder="01XXXXXXXXX"
                  />
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <div className="flex items-start gap-2">
                  <FiInfo className="w-5 h-5 text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    Payouts are processed on the 1st and 15th of every month. Minimum payout amount is $50.
                  </p>
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