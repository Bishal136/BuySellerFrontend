import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGrid, FiList, FiFilter, FiX, FiSliders } from 'react-icons/fi';
import ProductCard from '../components/product/ProductCard';
import ProductListItem from '../components/product/ProductListItem';
import ProductFilter from '../components/product/ProductFilter';
import Pagination from '../components/common/Pagination';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import api from '../services/api';

const ProductListingPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // grid or list
    const [showFilters, setShowFilters] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0,
        limit: 12,
    });
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        rating: searchParams.get('rating') || '',
        sort: searchParams.get('sort') || 'newest',
        search: searchParams.get('search') || '',
    });

    useEffect(() => {
        fetchProducts();
    }, [filters, pagination.page]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...(filters.category && { category: filters.category }),
                ...(filters.minPrice && { minPrice: filters.minPrice }),
                ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
                ...(filters.rating && { rating: filters.rating }),
                ...(filters.sort && { sort: filters.sort }),
                ...(filters.search && { search: filters.search }),
            });

            const response = await api.get(`/products?${queryParams}`);
            setProducts(response.data.products);
            setPagination({
                ...pagination,
                pages: response.data.pagination.pages,
                total: response.data.pagination.total,
            });
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters({ ...filters, ...newFilters });
        setPagination({ ...pagination, page: 1 });
        setShowFilters(false);

        // Update URL params
        const params = {};
        Object.keys({ ...filters, ...newFilters }).forEach(key => {
            if (newFilters[key]) params[key] = newFilters[key];
        });
        setSearchParams(params);
    };

    const clearFilters = () => {
        setFilters({
            category: '',
            minPrice: '',
            maxPrice: '',
            rating: '',
            sort: 'newest',
            search: '',
        });
        setPagination({ ...pagination, page: 1 });
        setSearchParams({});
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <h1 className="text-3xl font-bold mb-4 md:mb-0">
                    {filters.search ? `Search Results for "${filters.search}"` : 'All Products'}
                </h1>

                <div className="flex space-x-4">
                    {/* View Toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-md' : ''}`}
                        >
                            <FiGrid />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-md' : ''}`}
                        >
                            <FiList />
                        </button>
                    </div>

                    {/* Filter Button */}
                    <button
                        onClick={() => setShowFilters(true)}
                        className="btn-secondary flex items-center"
                    >
                        <FiFilter className="mr-2" />
                        Filters
                    </button>
                </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex justify-end mb-6">
                <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange({ sort: e.target.value })}
                    className="input w-48"
                >
                    <option value="newest">Newest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="popularity">Popularity</option>
                    <option value="rating">Highest Rated</option>
                </select>
            </div>

            {/* Active Filters */}
            {(filters.category || filters.minPrice || filters.maxPrice || filters.rating) && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {filters.category && (
                        <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center">
                            Category: {filters.category}
                            <button onClick={() => handleFilterChange({ category: '' })} className="ml-2">
                                <FiX />
                            </button>
                        </span>
                    )}
                    {(filters.minPrice || filters.maxPrice) && (
                        <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center">
                            Price: ${filters.minPrice || 0} - ${filters.maxPrice || '∞'}
                            <button onClick={() => handleFilterChange({ minPrice: '', maxPrice: '' })} className="ml-2">
                                <FiX />
                            </button>
                        </span>
                    )}
                    {filters.rating && (
                        <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center">
                            Rating: {filters.rating}+ Stars
                            <button onClick={() => handleFilterChange({ rating: '' })} className="ml-2">
                                <FiX />
                            </button>
                        </span>
                    )}
                    <button onClick={clearFilters} className="text-red-600 text-sm hover:underline">
                        Clear All
                    </button>
                </div>
            )}

            {/* Products Grid/List */}
            {loading ? (
                <LoadingSkeleton />
            ) : products.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No products found</p>
                    <button onClick={clearFilters} className="btn-primary mt-4">
                        Clear Filters
                    </button>
                </div>
            ) : (
                <div className={viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'space-y-4'
                }>
                    <AnimatePresence>
                        {products.map((product) => (
                            <motion.div
                                key={product._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {viewMode === 'grid' ? (
                                    <ProductCard product={product} />
                                ) : (
                                    <ProductListItem product={product} />
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="mt-8">
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.pages}
                        onPageChange={(page) => setPagination({ ...pagination, page })}
                    />
                </div>
            )}

            {/* Filter Modal */}
            {showFilters && (
                <ProductFilter
                    filters={filters}
                    onClose={() => setShowFilters(false)}
                    onApply={handleFilterChange}
                />
            )}
        </div>
    );
};

export default ProductListingPage;