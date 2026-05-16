import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  FiFilter, FiX, FiChevronDown, FiStar, FiGrid, FiList, 
  FiPackage, FiHeart, FiShoppingCart, FiSearch
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';

const AdvancedSearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState([]);
  const [facets, setFacets] = useState({ categories: [], brands: [] });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid | list

  // Filters state
  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page')) || 1,
    sort: searchParams.get('sort') || 'relevance',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    category: searchParams.get('category') ? searchParams.get('category').split(',') : [],
    brand: searchParams.get('brand') ? searchParams.get('brand').split(',') : [],
    rating: searchParams.get('rating') || '',
    inStock: searchParams.get('inStock') === 'true',
    discount: searchParams.get('discount') === 'true'
  });

  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    try {
      // Build query string
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      params.append('page', filters.page);
      params.append('sort', filters.sort);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.category.length) params.append('category', filters.category.join(','));
      if (filters.brand.length) params.append('brand', filters.brand.join(','));
      if (filters.rating) params.append('rating', filters.rating);
      if (filters.inStock) params.append('inStock', 'true');
      if (filters.discount) params.append('discount', 'true');

      const { data } = await api.get(`/search?${params.toString()}`);
      if (data.success) {
        setProducts(data.data.products);
        setFacets(data.data.facets);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to fetch search results');
    } finally {
      setIsLoading(false);
    }
  }, [query, filters]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Sync state to URL when filters change (except page to reset pagination)
  const updateURLParams = (newFilters) => {
    const params = new URLSearchParams(searchParams);
    if (newFilters.sort !== 'relevance') params.set('sort', newFilters.sort);
    else params.delete('sort');
    
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice);
    else params.delete('minPrice');
    
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice);
    else params.delete('maxPrice');
    
    if (newFilters.category.length) params.set('category', newFilters.category.join(','));
    else params.delete('category');
    
    if (newFilters.brand.length) params.set('brand', newFilters.brand.join(','));
    else params.delete('brand');
    
    if (newFilters.rating) params.set('rating', newFilters.rating);
    else params.delete('rating');
    
    if (newFilters.inStock) params.set('inStock', 'true');
    else params.delete('inStock');

    if (newFilters.discount) params.set('discount', 'true');
    else params.delete('discount');

    if (newFilters.page > 1) params.set('page', newFilters.page);
    else params.delete('page');

    setSearchParams(params);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    updateURLParams(newFilters);
  };

  const toggleArrayFilter = (key, value) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    handleFilterChange(key, newArray);
  };

  const clearFilters = () => {
    const defaultFilters = {
      page: 1, sort: 'relevance', minPrice: '', maxPrice: '',
      category: [], brand: [], rating: '', inStock: false, discount: false
    };
    setFilters(defaultFilters);
    updateURLParams(defaultFilters);
  };

  const hasActiveFilters = filters.minPrice || filters.maxPrice || filters.category.length || 
                           filters.brand.length || filters.rating || filters.inStock || filters.discount;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        
        {/* Header Section */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {query ? `Search Results for "${query}"` : 'All Products'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Showing {products.length > 0 ? ((pagination.page - 1) * pagination.limit + 1) : 0} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* View Toggles */}
            <div className="hidden sm:flex bg-white rounded-lg border border-gray-200 p-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex-1 sm:flex-none">
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full sm:w-auto appearance-none bg-white border border-gray-300 text-gray-700 py-2.5 pl-4 pr-10 rounded-xl outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm font-medium"
              >
                {query && <option value="relevance">Sort by Relevance</option>}
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="best_selling">Best Selling</option>
                <option value="rating">Top Rated</option>
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Mobile Filter Toggle */}
            <button 
              onClick={() => setIsMobileFiltersOpen(true)}
              className="md:hidden flex items-center gap-2 bg-white border border-gray-300 py-2.5 px-4 rounded-xl text-sm font-medium text-gray-700"
            >
              <FiFilter className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <div className={`
            fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out
            md:relative md:w-64 md:transform-none md:shadow-none md:bg-transparent md:z-auto overflow-y-auto md:overflow-visible
            ${isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
            <div className="p-6 md:p-0 bg-white md:bg-transparent rounded-none md:rounded-2xl">
              <div className="flex items-center justify-between md:hidden mb-6">
                <h2 className="text-lg font-bold">Filters</h2>
                <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {hasActiveFilters && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900">Applied Filters</h3>
                    <button onClick={clearFilters} className="text-xs text-primary-600 hover:text-primary-700 font-medium">Clear All</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {/* Render active filters tags */}
                    {filters.minPrice || filters.maxPrice ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium border border-primary-100">
                        ${filters.minPrice || '0'} - ${filters.maxPrice || 'Any'}
                        <FiX className="cursor-pointer" onClick={() => { handleFilterChange('minPrice', ''); handleFilterChange('maxPrice', ''); }} />
                      </span>
                    ) : null}
                    {filters.inStock && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium border border-primary-100">
                        In Stock <FiX className="cursor-pointer" onClick={() => handleFilterChange('inStock', false)} />
                      </span>
                    )}
                    {filters.discount && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium border border-primary-100">
                        On Sale <FiX className="cursor-pointer" onClick={() => handleFilterChange('discount', false)} />
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Categories Filter */}
              {facets.categories?.length > 0 && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
                  <div className="space-y-3">
                    {facets.categories.map((cat) => (
                      <label key={cat._id} className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${filters.category.includes(cat._id) ? 'bg-primary-600 border-primary-600' : 'border-gray-300 group-hover:border-primary-500'}`}>
                            {filters.category.includes(cat._id) && <FiX className="w-3 h-3 text-white" style={{ transform: 'rotate(45deg)' }}/>}
                          </div>
                          <span className={`text-sm ${filters.category.includes(cat._id) ? 'font-medium text-gray-900' : 'text-gray-600'}`}>{cat.name}</span>
                        </div>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{cat.count}</span>
                        <input type="checkbox" className="hidden" checked={filters.category.includes(cat._id)} onChange={() => toggleArrayFilter('category', cat._id)} />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Brands Filter */}
              {facets.brands?.length > 0 && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4">Brands</h3>
                  <div className="space-y-3">
                    {facets.brands.map((brand) => (
                      <label key={brand._id} className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${filters.brand.includes(brand._id) ? 'bg-primary-600 border-primary-600' : 'border-gray-300 group-hover:border-primary-500'}`}>
                            {filters.brand.includes(brand._id) && <FiX className="w-3 h-3 text-white" style={{ transform: 'rotate(45deg)' }}/>}
                          </div>
                          <span className={`text-sm ${filters.brand.includes(brand._id) ? 'font-medium text-gray-900' : 'text-gray-600'}`}>{brand._id}</span>
                        </div>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{brand.count}</span>
                        <input type="checkbox" className="hidden" checked={filters.brand.includes(brand._id)} onChange={() => toggleArrayFilter('brand', brand._id)} />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Price Range</h3>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input 
                      type="number" 
                      placeholder="Min" 
                      value={filters.minPrice}
                      onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                      onBlur={() => updateURLParams({...filters, page: 1})}
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-primary-500"
                    />
                  </div>
                  <span className="text-gray-400">-</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input 
                      type="number" 
                      placeholder="Max" 
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                      onBlur={() => updateURLParams({...filters, page: 1})}
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Availability */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Availability</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-10 h-5">
                      <input type="checkbox" className="sr-only peer" checked={filters.inStock} onChange={(e) => handleFilterChange('inStock', e.target.checked)} />
                      <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">In Stock Only</span>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-10 h-5">
                      <input type="checkbox" className="sr-only peer" checked={filters.discount} onChange={(e) => handleFilterChange('discount', e.target.checked)} />
                      <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">On Sale / Discounted</span>
                  </label>
                </div>
              </div>

              {/* Ratings */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4">Customer Rating</h3>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${filters.rating === String(rating) ? 'border-primary-600' : 'border-gray-300 group-hover:border-primary-500'}`}>
                        {filters.rating === String(rating) && <div className="w-2 h-2 rounded-full bg-primary-600" />}
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FiStar key={i} className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                        <span className="text-sm text-gray-600 ml-1">& Up</span>
                      </div>
                      <input type="radio" name="rating" className="hidden" checked={filters.rating === String(rating)} onChange={() => handleFilterChange('rating', String(rating))} />
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Overlay for mobile filters */}
          {isMobileFiltersOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsMobileFiltersOpen(false)}
            />
          )}

          {/* Product Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl animate-pulse">
                    <div className="w-full aspect-square bg-gray-200 rounded-xl mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-8 bg-gray-200 rounded w-8"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                  {products.map((product) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={product._id}
                      className={`bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-primary-200 transition-all duration-300 group ${viewMode === 'list' ? 'flex flex-row' : 'flex flex-col'}`}
                    >
                      <div className={`relative bg-gray-50 overflow-hidden cursor-pointer ${viewMode === 'list' ? 'w-48 shrink-0' : 'w-full aspect-square'}`} onClick={() => navigate(`/product/${product.slug}`)}>
                        <img 
                          src={product.images[0]?.url || 'https://via.placeholder.com/400'} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Discount Badge */}
                        {product.comparePrice > product.price && (
                          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                            -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
                          </div>
                        )}
                        {/* Quick Action Buttons */}
                        <div className={`absolute top-3 right-3 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ${viewMode === 'list' && 'hidden'}`}>
                          <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 hover:bg-red-50 shadow-sm">
                            <FiHeart className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <div className="text-xs text-primary-600 font-medium mb-1">
                          {product.brand || product.category?.name || 'Category'}
                        </div>
                        <h3 
                          className="font-bold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-primary-600 transition-colors"
                          onClick={() => navigate(`/product/${product.slug}`)}
                        >
                          {product.name}
                        </h3>
                        
                        <div className="flex items-center gap-1 mb-3">
                          <FiStar className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-bold text-gray-900">{product.ratings?.average?.toFixed(1) || '0.0'}</span>
                          <span className="text-xs text-gray-500">({product.ratings?.count || 0})</span>
                        </div>

                        {viewMode === 'list' && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-4">{product.description}</p>
                        )}

                        <div className="mt-auto flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
                            {product.comparePrice > product.price && (
                              <span className="ml-2 text-sm text-gray-400 line-through">${product.comparePrice.toFixed(2)}</span>
                            )}
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch(addToCart({ product, quantity: 1 }));
                              toast.success('Added to cart');
                            }}
                            className="w-10 h-10 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors"
                          >
                            <FiShoppingCart className="w-5 h-5 relative -left-[1px]" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="mt-10 flex justify-center">
                    <nav className="flex items-center gap-2">
                      <button 
                        disabled={pagination.page === 1}
                        onClick={() => handleFilterChange('page', pagination.page - 1)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <div className="flex items-center gap-1">
                        {[...Array(pagination.pages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => handleFilterChange('page', i + 1)}
                            className={`w-10 h-10 rounded-lg text-sm font-bold flex items-center justify-center transition-colors ${
                              pagination.page === i + 1 
                                ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20' 
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                      <button 
                        disabled={pagination.page === pagination.pages}
                        onClick={() => handleFilterChange('page', pagination.page + 1)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <FiSearch className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  We couldn't find anything matching "{query}". Try checking your spelling or use more general terms.
                </p>
                <button 
                  onClick={clearFilters}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-500/30"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchPage;
