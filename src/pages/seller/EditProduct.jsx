import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiSave, FiX, FiUpload, FiTrash2, FiStar,
  FiPlus, FiImage, FiAlertCircle, FiCheckCircle
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { PLACEHOLDER_IMAGE } from '../../utils/placeholder';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    comparePrice: '',
    stock: '',
    sku: '',
    category: '',
    brand: '',
    tags: [],
    specifications: {},
    images: [],
    status: 'draft',
    youtubeVideoId: ''
  });

  const [variants, setVariants] = useState([]);
  const [specs, setSpecs] = useState([{ key: '', value: '' }]);
  const [tagInput, setTagInput] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');

  const extractYoutubeId = (url) => {
    if (!url) return '';
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : '';
  };

  const handleVideoUrlChange = (e) => {
    const url = e.target.value;
    setVideoUrlInput(url);
    const id = extractYoutubeId(url);
    if (id || url === '') {
      setFormData(prev => ({ ...prev, youtubeVideoId: id }));
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchCategories();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/seller/products/${id}`);
      const product = response.data.product;

      setFormData({
        name: product.name || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        price: product.price || '',
        comparePrice: product.comparePrice || '',
        stock: product.stock || '',
        sku: product.sku || '',
        category: product.category?._id || '',
        brand: product.brand || '',
        tags: product.tags || [],
        specifications: product.specifications || {},
        images: product.images || [],
        status: product.status || 'draft',
        youtubeVideoId: product.youtubeVideoId || ''
      });
      
      if (product.youtubeVideoId) {
        setVideoUrlInput(`https://www.youtube.com/watch?v=${product.youtubeVideoId}`);
      }

      setVariants(product.variants || []);

      // Convert specifications to array for editing
      if (product.specifications && Object.keys(product.specifications).length > 0) {
        const specsArray = Object.entries(product.specifications).map(([key, value]) => ({ key, value }));
        setSpecs(specsArray);
      }

    } catch (error) {
      toast.error('Failed to load product');
      navigate('/seller/products');
    } finally {
      setFetching(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/seller/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);

    for (const file of files) {
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await api.post('/seller/products/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        setFormData(prev => ({
          ...prev,
          images: [...prev.images, {
            url: response.data.imageUrl,
            publicId: response.data.publicId,
            isPrimary: prev.images.length === 0,
            alt: ''
          }]
        }));

        toast.success('Image uploaded successfully');
      } catch (error) {
        toast.error('Failed to upload image');
      }
    }

    setUploading(false);
    e.target.value = '';
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    if (newImages.length > 0 && !newImages.some(img => img.isPrimary)) {
      newImages[0].isPrimary = true;
    }
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const setPrimaryImage = (index) => {
    const newImages = formData.images.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }));
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const addSpecification = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const updateSpecification = (index, field, value) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);

    // Update specifications object
    const specsObj = {};
    newSpecs.forEach(spec => {
      if (spec.key && spec.value) {
        specsObj[spec.key] = spec.value;
      }
    });
    setFormData(prev => ({ ...prev, specifications: specsObj }));
  };

  const removeSpecification = (index) => {
    const newSpecs = specs.filter((_, i) => i !== index);
    setSpecs(newSpecs);
  };

  const addTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput] }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.stock || !formData.category) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
        stock: parseInt(formData.stock),
        variants
      };

      await api.put(`/seller/products/${id}`, productData);
      toast.success('Product updated successfully');
      navigate('/seller/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading product...</p>
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
            Edit Product
          </h1>
          <p className="text-gray-500 mt-1">Update your product information</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/seller/products')}
            className="btn-secondary flex items-center gap-2"
          >
            <FiX /> Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FiSave />}
            Update Product
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                className="w-full p-2 border border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Brand</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-lg"
                required
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Short Description</label>
            <textarea
              rows="2"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              className="w-full p-2 border border-gray-200 rounded-lg"
              placeholder="Brief description (max 300 characters)"
              maxLength="300"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Full Description *</label>
            <textarea
              rows="6"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border border-gray-200 rounded-lg"
              required
            />
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Product Images</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url || PLACEHOLDER_IMAGE}
                  alt={`Product ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = PLACEHOLDER_IMAGE;
                  }}
                />
                {image.isPrimary && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                    Primary
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPrimaryImage(index)}
                    className="bg-white p-2 rounded-full hover:bg-gray-100"
                    title="Set as primary"
                  >
                    <FiStar className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="bg-white p-2 rounded-full hover:bg-gray-100 text-red-600"
                    title="Remove"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <label className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center h-32 cursor-pointer hover:border-primary-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
              {uploading ? (
                <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Upload Image</span>
                </>
              )}
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Recommended: Upload high-quality images (JPEG, PNG). First image will be the thumbnail.
          </p>
        </div>

        {/* Product Video */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Product Video</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">YouTube Video URL</label>
            <input
              type="text"
              value={videoUrlInput}
              onChange={handleVideoUrlChange}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            />
            {videoUrlInput && !formData.youtubeVideoId && (
              <p className="text-red-500 text-xs mt-1">Invalid YouTube URL. Please enter a valid URL.</p>
            )}
          </div>
          
          {formData.youtubeVideoId && (
            <div className="mt-4 border rounded-lg p-2 bg-gray-50">
              <p className="text-sm font-medium mb-2">Video Preview</p>
              <div className="relative w-full overflow-hidden" style={{ paddingTop: '56.25%' }}>
                <iframe 
                  className="absolute top-0 left-0 w-full h-full rounded"
                  src={`https://www.youtube.com/embed/${formData.youtubeVideoId}`} 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen>
                </iframe>
              </div>
            </div>
          )}
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Pricing & Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Selling Price (৳)</label>
              <input
                type="number"
                step="1"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">MRP (৳)</label>
              <input
                type="number"
                step="1"
                value={formData.comparePrice}
                onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-lg"
                placeholder="Original price"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Stock Quantity *</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-lg"
                required
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Specifications</h2>
            <button
              type="button"
              onClick={addSpecification}
              className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <FiPlus /> Add
            </button>
          </div>
          {specs.map((spec, index) => (
            <div key={index} className="flex gap-3 mb-3">
              <input
                type="text"
                placeholder="Key (e.g., Brand, Material)"
                value={spec.key}
                onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                className="flex-1 p-2 border border-gray-200 rounded-lg"
              />
              <input
                type="text"
                placeholder="Value"
                value={spec.value}
                onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                className="flex-1 p-2 border border-gray-200 rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeSpecification(index)}
                className="text-red-500 hover:text-red-600 p-2"
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Tags</h2>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              className="flex-1 p-2 border border-gray-200 rounded-lg"
              placeholder="Type and press Enter"
            />
            <button type="button" onClick={addTag} className="btn-secondary">
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map(tag => (
              <span key={tag} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="text-gray-500 hover:text-red-500">
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Product Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Product Status</h2>
          <div className="flex gap-4">
            {[
              { value: 'active', label: 'Active (Visible to customers)' },
              { value: 'inactive', label: 'Inactive (Hidden)' },
              { value: 'draft', label: 'Draft (Save as draft)' }
            ].map(option => (
              <label key={option.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  value={option.value}
                  checked={formData.status === option.value}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;