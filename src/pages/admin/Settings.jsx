import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiSave, FiRefreshCw, FiGlobe, FiMail, FiShield,
  FiCreditCard, FiBell, FiFacebook, FiTwitter,
  FiInstagram, FiGithub, FiMapPin, FiPhone, FiMail as FiMailIcon
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      siteName: 'ShopHub',
      siteDescription: 'Multi-vendor Ecommerce Platform',
      contactEmail: 'support@shophub.com',
      contactPhone: '+8801234567890',
      address: '123 Business Street, Dhaka, Bangladesh'
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: '587',
      smtpUser: '',
      smtpPassword: '',
      fromEmail: 'noreply@shophub.com',
      fromName: 'ShopHub'
    },
    payment: {
      currency: 'USD',
      currencySymbol: '$',
      stripePublicKey: '',
      stripeSecretKey: '',
      bKashNumber: '',
      nagadNumber: ''
    },
    social: {
      facebook: '',
      twitter: '',
      instagram: '',
      github: ''
    },
    security: {
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      twoFactorAuth: false,
      recaptchaEnabled: false,
      recaptchaSiteKey: '',
      recaptchaSecretKey: ''
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // Fetch settings from API
      const response = await api.get('/admin/settings');
      if (response.data.settings) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings', settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: FiGlobe },
    { id: 'email', label: 'Email', icon: FiMail },
    { id: 'payment', label: 'Payment', icon: FiCreditCard },
    { id: 'social', label: 'Social Media', icon: FiFacebook },
    { id: 'security', label: 'Security', icon: FiShield }
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Platform Settings
          </h1>
          <p className="text-gray-500 mt-1">Configure your platform settings and preferences</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchSettings} className="btn-secondary flex items-center gap-2">
            <FiRefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FiSave />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Site Name</label>
                <input
                  type="text"
                  value={settings.general.siteName}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, siteName: e.target.value }
                  })}
                  className="w-full p-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Site Description</label>
                <textarea
                  rows="3"
                  value={settings.general.siteDescription}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, siteDescription: e.target.value }
                  })}
                  className="w-full p-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Email</label>
                  <div className="relative">
                    <FiMailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={settings.general.contactEmail}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, contactEmail: e.target.value }
                      })}
                      className="w-full pl-10 p-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Phone</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={settings.general.contactPhone}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, contactPhone: e.target.value }
                      })}
                      className="w-full pl-10 p-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={settings.general.address}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, address: e.target.value }
                    })}
                    className="w-full pl-10 p-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">SMTP Host</label>
                  <input
                    type="text"
                    value={settings.email.smtpHost}
                    onChange={(e) => setSettings({
                      ...settings,
                      email: { ...settings.email, smtpHost: e.target.value }
                    })}
                    className="w-full p-2 border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">SMTP Port</label>
                  <input
                    type="text"
                    value={settings.email.smtpPort}
                    onChange={(e) => setSettings({
                      ...settings,
                      email: { ...settings.email, smtpPort: e.target.value }
                    })}
                    className="w-full p-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">SMTP Username</label>
                  <input
                    type="text"
                    value={settings.email.smtpUser}
                    onChange={(e) => setSettings({
                      ...settings,
                      email: { ...settings.email, smtpUser: e.target.value }
                    })}
                    className="w-full p-2 border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">SMTP Password</label>
                  <input
                    type="password"
                    value={settings.email.smtpPassword}
                    onChange={(e) => setSettings({
                      ...settings,
                      email: { ...settings.email, smtpPassword: e.target.value }
                    })}
                    className="w-full p-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">From Email</label>
                  <input
                    type="email"
                    value={settings.email.fromEmail}
                    onChange={(e) => setSettings({
                      ...settings,
                      email: { ...settings.email, fromEmail: e.target.value }
                    })}
                    className="w-full p-2 border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">From Name</label>
                  <input
                    type="text"
                    value={settings.email.fromName}
                    onChange={(e) => setSettings({
                      ...settings,
                      email: { ...settings.email, fromName: e.target.value }
                    })}
                    className="w-full p-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Settings */}
          {activeTab === 'payment' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Currency</label>
                  <select
                    value={settings.payment.currency}
                    onChange={(e) => setSettings({
                      ...settings,
                      payment: { ...settings.payment, currency: e.target.value }
                    })}
                    className="w-full p-2 border border-gray-200 rounded-lg"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="BDT">BDT - Bangladeshi Taka</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Currency Symbol</label>
                  <input
                    type="text"
                    value={settings.payment.currencySymbol}
                    onChange={(e) => setSettings({
                      ...settings,
                      payment: { ...settings.payment, currencySymbol: e.target.value }
                    })}
                    className="w-full p-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Stripe Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Public Key</label>
                    <input
                      type="text"
                      value={settings.payment.stripePublicKey}
                      onChange={(e) => setSettings({
                        ...settings,
                        payment: { ...settings.payment, stripePublicKey: e.target.value }
                      })}
                      className="w-full p-2 border border-gray-200 rounded-lg"
                      placeholder="pk_test_..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Secret Key</label>
                    <input
                      type="password"
                      value={settings.payment.stripeSecretKey}
                      onChange={(e) => setSettings({
                        ...settings,
                        payment: { ...settings.payment, stripeSecretKey: e.target.value }
                      })}
                      className="w-full p-2 border border-gray-200 rounded-lg"
                      placeholder="sk_test_..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Media Settings */}
          {activeTab === 'social' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Facebook URL</label>
                <div className="relative">
                  <FiFacebook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600" />
                  <input
                    type="url"
                    value={settings.social.facebook}
                    onChange={(e) => setSettings({
                      ...settings,
                      social: { ...settings.social, facebook: e.target.value }
                    })}
                    className="w-full pl-10 p-2 border border-gray-200 rounded-lg"
                    placeholder="https://facebook.com/yourstore"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Twitter URL</label>
                <div className="relative">
                  <FiTwitter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
                  <input
                    type="url"
                    value={settings.social.twitter}
                    onChange={(e) => setSettings({
                      ...settings,
                      social: { ...settings.social, twitter: e.target.value }
                    })}
                    className="w-full pl-10 p-2 border border-gray-200 rounded-lg"
                    placeholder="https://twitter.com/yourstore"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Instagram URL</label>
                <div className="relative">
                  <FiInstagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-600" />
                  <input
                    type="url"
                    value={settings.social.instagram}
                    onChange={(e) => setSettings({
                      ...settings,
                      social: { ...settings.social, instagram: e.target.value }
                    })}
                    className="w-full pl-10 p-2 border border-gray-200 rounded-lg"
                    placeholder="https://instagram.com/yourstore"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">GitHub URL</label>
                <div className="relative">
                  <FiGithub className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800" />
                  <input
                    type="url"
                    value={settings.social.github}
                    onChange={(e) => setSettings({
                      ...settings,
                      social: { ...settings.social, github: e.target.value }
                    })}
                    className="w-full pl-10 p-2 border border-gray-200 rounded-lg"
                    placeholder="https://github.com/yourstore"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                    })}
                    className="w-full p-2 border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Max Login Attempts</label>
                  <input
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, maxLoginAttempts: parseInt(e.target.value) }
                    })}
                    className="w-full p-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.security.twoFactorAuth}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, twoFactorAuth: e.target.checked }
                    })}
                  />
                  <span>Enable Two-Factor Authentication for Admins</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.security.recaptchaEnabled}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, recaptchaEnabled: e.target.checked }
                    })}
                  />
                  <span>Enable reCAPTCHA on Login/Registration</span>
                </label>
              </div>
              {settings.security.recaptchaEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-sm font-medium mb-2">reCAPTCHA Site Key</label>
                    <input
                      type="text"
                      value={settings.security.recaptchaSiteKey}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, recaptchaSiteKey: e.target.value }
                      })}
                      className="w-full p-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">reCAPTCHA Secret Key</label>
                    <input
                      type="password"
                      value={settings.security.recaptchaSecretKey}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, recaptchaSecretKey: e.target.value }
                      })}
                      className="w-full p-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
