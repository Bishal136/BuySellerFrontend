import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const SearchAutocomplete = ({ onClose, isOpen }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        // Load recent searches from localStorage
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }, []);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (query.length >= 2) {
                fetchSuggestions();
            } else {
                setSuggestions([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [query]);

    const fetchSuggestions = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/products/suggestions?q=${query}`);
            setSuggestions(response.data.suggestions);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (query.trim()) {
            // Save to recent searches
            const newRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
            setRecentSearches(newRecent);
            localStorage.setItem('recentSearches', JSON.stringify(newRecent));

            window.location.href = `/products?search=${encodeURIComponent(query)}`;
            onClose();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const clearRecent = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 bg-black/50">
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="bg-white"
                    >
                        <div className="container mx-auto px-4 py-4">
                            <div className="flex items-center gap-4">
                                <div className="flex-1 relative">
                                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Search products, brands, categories..."
                                        className="input pl-10 pr-10"
                                    />
                                    {query && (
                                        <button
                                            onClick={() => setQuery('')}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                        >
                                            <FiX className="text-gray-400 hover:text-gray-600" />
                                        </button>
                                    )}
                                </div>
                                <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                                    Cancel
                                </button>
                            </div>

                            {/* Suggestions */}
                            {query.length >= 2 && (
                                <div className="mt-6">
                                    <h3 className="text-sm font-semibold text-gray-500 mb-3">Suggestions</h3>
                                    {loading ? (
                                        <div className="flex justify-center py-8">
                                            <div className="w-8 h-8 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {suggestions.map((product) => (
                                                <Link
                                                    key={product._id}
                                                    to={`/product/${product.slug}`}
                                                    onClick={onClose}
                                                    className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                                >
                                                    <img
                                                        src={product.images?.[0]?.url || 'https://via.placeholder.com/60'}
                                                        alt={product.name}
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                    <div className="flex-1">
                                                        <h4 className="font-medium">{product.name}</h4>
                                                        <p className="text-sm text-gray-500">${product.price}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Recent Searches */}
                            {!query && recentSearches.length > 0 && (
                                <div className="mt-6">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-sm font-semibold text-gray-500">Recent Searches</h3>
                                        <button onClick={clearRecent} className="text-xs text-red-500 hover:text-red-600">
                                            Clear All
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {recentSearches.map((term, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    setQuery(term);
                                                    handleSearch();
                                                }}
                                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
                                            >
                                                {term}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SearchAutocomplete;