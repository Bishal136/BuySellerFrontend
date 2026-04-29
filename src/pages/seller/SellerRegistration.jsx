import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiShoppingBag, FiMail, FiPhone, FiMapPin, FiFileText, 
  FiUpload, FiCheckCircle, FiAlertCircle, FiArrowRight,
  FiHome, FiUser, FiBriefcase
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const SellerRegistration = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    storeName: '',
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    businessAddress: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Bangladesh'
    },
    taxId: '',
    documents: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    const uploadedDocs = [];
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('document', file);
      
      try {
        // Upload to your server/cloudinary
        // const response = await api.post('/upload/document', formData);
        // uploadedDocs.push({ name: file.name, url: response.data.url });
        uploadedDocs.push({ name: file.name, url: URL.createObjectURL(file) });
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...uploadedDocs]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post('/seller/register', formData);
      toast.success('Registration submitted successfully! Awaiting verification.');
      navigate('/seller/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.storeName || !formData.businessName)) {
      toast.error('Please fill all required fields');
      return;
    }
    if (step === 2 && (!formData.businessEmail || !formData.businessPhone)) {
      toast.error('Please fill all required fields');
      return;
    }
    setStep(step + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Become a Seller</h1>
          <p className="text-gray-600">Start selling your products to millions of customers</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 relative">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    step >= s ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {step > s ? <FiCheckCircle /> : s}
                  </div>
                  <div className="text-xs mt-2 text-gray-500">
                    {s === 1 && 'Store Info'}
                    {s === 2 && 'Business Info'}
                    {s === 3 && 'Documents'}
                  </div>
                </div>
                {s < 3 && (
                  <div className={`absolute top-5 left-1/2 w-full h-0.5 ${
                    step > s ? 'bg-primary-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Store Information</h2>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Store Name *</label>
                  <div className="relative">
                    <FiShoppingBag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="storeName"
                      value={formData.storeName}
                      onChange={handleChange}
                      className="input pl-10"
                      placeholder="My Awesome Store"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Business Name *</label>
                  <div className="relative">
                    <FiBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      className="input pl-10"
                      placeholder="Official Business Name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tax ID (Optional)</label>
                  <div className="relative">
                    <FiFileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleChange}
                      className="input pl-10"
                      placeholder="Tax/VAT Number"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Business Contact</h2>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Business Email *</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="businessEmail"
                      value={formData.businessEmail}
                      onChange={handleChange}
                      className="input pl-10"
                      placeholder="business@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Business Phone *</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="businessPhone"
                      value={formData.businessPhone}
                      onChange={handleChange}
                      className="input pl-10"
                      placeholder="+8801234567890"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Street Address</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="businessAddress.street"
                      value={formData.businessAddress.street}
                      onChange={handleChange}
                      className="input pl-10"
                      placeholder="Street address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input
                      type="text"
                      name="businessAddress.city"
                      value={formData.businessAddress.city}
                      onChange={handleChange}
                      className="input"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State</label>
                    <input
                      type="text"
                      name="businessAddress.state"
                      value={formData.businessAddress.state}
                      onChange={handleChange}
                      className="input"
                      placeholder="State"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Postal Code</label>
                    <input
                      type="text"
                      name="businessAddress.postalCode"
                      value={formData.businessAddress.postalCode}
                      onChange={handleChange}
                      className="input"
                      placeholder="Postal Code"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <input
                      type="text"
                      name="businessAddress.country"
                      value={formData.businessAddress.country}
                      onChange={handleChange}
                      className="input"
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Verification Documents</h2>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="documentUpload"
                  />
                  <label
                    htmlFor="documentUpload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <FiUpload className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-gray-600">Click to upload business documents</p>
                    <p className="text-xs text-gray-500 mt-1">Business license, Tax certificate, etc.</p>
                  </label>
                </div>

                {formData.documents.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium">Uploaded Documents:</h3>
                    {formData.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{doc.name}</span>
                        <FiCheckCircle className="text-green-500" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-lg mt-4">
                  <p className="text-sm text-blue-800 flex items-start gap-2">
                    <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    Your information will be verified within 2-3 business days. You can start listing products after verification.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-6 pt-4 border-t">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="btn-secondary"
                >
                  Back
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary ml-auto"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary ml-auto flex items-center gap-2"
                >
                  {loading ? 'Submitting...' : 'Submit Registration'}
                  <FiArrowRight />
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SellerRegistration;