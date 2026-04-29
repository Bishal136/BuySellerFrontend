import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSliders, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import api from '../../services/api';

const ProductFilter = ({ filters, onClose, onApply }) => {
    const [localFilters, setLocalFilters] = useState(filters);
    const [brands, setBrands] = useState([]);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
    const [expandedSections, setExpandedSections] = useState({
        categories: true,
        price: true,
        brands: true,
        ratings: true
    });

    useEffect(() => {
        fetchFilterData();
    }, []);

    const fetchFilterData = async () => {
        try {
            const response = await api.get('/products');
            setBrands(response.data.brands || []);
            if (response.data.priceRange) {
                setPriceRange(response.data.priceRange);
                if (!localFilters.minPrice && !localFilters.maxPrice) {
                    setLocalFilters({
                        ...localFilters,
                        minPrice: response.data.priceRange.minPrice,
                        maxPrice: response.data.priceRange.maxPrice
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching filter data:', error);
        }
    };

    const toggleSection = (section) => {
        setExpandedSections({
            ...expandedSections,
            [section]: !expandedSections[section]
        });
    };

    const handlePriceChange = (type, value) => {
        setLocalFilters({
            ...localFilters,
            [type]: parseInt(value)
        });
    };

    const handleBrandToggle = (brand) => {
        const currentBrands = localFilters.brand ? localFilters.brand.split(',') : [];
        let newBrands;

        if (currentBrands.includes(brand)) {
            newBrands = currentBrands.filter(b => b !== brand);
        } else {
            newBrands = [...currentBrands, brand];
        }

        setLocalFilters({
            ...localFilters,
            brand: newBrands.join(',')
        });
    };

    const handleRatingChange = (rating) => {
        setLocalFilters({
            ...localFilters,
            rating: localFilters.rating === rating ? '' : rating
        });
    };

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const handleReset = () => {
        setLocalFilters({
            category: '',
            minPrice: priceRange.minPrice,
            maxPrice: priceRange.maxPrice,
            rating: '',
            sort: 'newest',
            search: ''
        });
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 overflow-hidden">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50"
                    onClick={onClose}
                />

                {/* Filter Panel */}
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'tween' }}
                    className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto"
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center">
                            <FiSliders className="w-5 h-5 mr-2" />
                            <h2 className="text-xl font-semibold">Filter Products</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Filter Content */}
                    <div className="p-6 space-y-6">
                        {/* Price Range */}
                        <div className="border-b pb-4">
                            <button
                                onClick={() => toggleSection('price')}
                                className="flex justify-between items-center w-full mb-3"
                            >
                                <h3 className="font-semibold text-lg">Price Range</h3>
                                {expandedSections.price ? <FiChevronUp /> : <FiChevronDown />}
                            </button>

                            {expandedSections.price && (
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="text-sm text-gray-600 block mb-1">Min ($)</label>
                                            <input
                                                type="number"
                                                value={localFilters.minPrice}
                                                onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                                                min={priceRange.minPrice}
                                                max={localFilters.maxPrice}
                                                className="input"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-sm text-gray-600 block mb-1">Max ($)</label>
                                            <input
                                                type="number"
                                                value={localFilters.maxPrice}
                                                onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                                                min={localFilters.minPrice}
                                                max={priceRange.maxPrice}
                                                className="input"
                                            />
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min={priceRange.minPrice}
                                        max={priceRange.maxPrice}
                                        value={localFilters.maxPrice}
                                        onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Brands */}
                        {brands.length > 0 && (
                            <div className="border-b pb-4">
                                <button
                                    onClick={() => toggleSection('brands')}
                                    className="flex justify-between items-center w-full mb-3"
                                >
                                    <h3 className="font-semibold text-lg">Brands</h3>
                                    {expandedSections.brands ? <FiChevronUp /> : <FiChevronDown />}
                                </button>

                                {expandedSections.brands && (
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {brands.map((brand) => (
                                            <label key={brand} className="flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={localFilters.brand?.split(',').includes(brand)}
                                                    onChange={() => handleBrandToggle(brand)}
                                                    className="mr-3"
                                                />
                                                <span className="text-gray-700">{brand}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Ratings */}
                        <div className="border-b pb-4">
                            <button
                                onClick={() => toggleSection('ratings')}
                                className="flex justify-between items-center w-full mb-3"
                            >
                                <h3 className="font-semibold text-lg">Customer Ratings</h3>
                                {expandedSections.ratings ? <FiChevronUp /> : <FiChevronDown />}
                            </button>

                            {expandedSections.ratings && (
                                <div className="space-y-2">
                                    {[4, 3, 2, 1].map((rating) => (
                                        <label key={rating} className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                checked={localFilters.rating === rating.toString()}
                                                onChange={() => handleRatingChange(rating.toString())}
                                                className="mr-3"
                                            />
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <FiStar
                                                        key={i}
                                                        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                                <span className="ml-2 text-gray-700">& Up</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="sticky bottom-0 bg-white border-t p-6 flex gap-4">
                        <button onClick={handleReset} className="btn-secondary flex-1">
                            Reset
                        </button>
                        <button onClick={handleApply} className="btn-primary flex-1">
                            Apply Filters
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ProductFilter;