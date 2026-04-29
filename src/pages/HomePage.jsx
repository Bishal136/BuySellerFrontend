import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiTruck, FiShield, FiHeadphones, FiStar } from 'react-icons/fi';
import ProductCard from '../components/product/ProductCard';
import CategoryCard from '../components/product/CategoryCard';
import HeroSlider from '../components/home/HeroSlider';
import Newsletter from '../components/home/Newsletter';
import api from '../services/api';

const HomePage = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHomeData();
    }, []);

    const fetchHomeData = async () => {
        try {
            const [featuredRes, newRes, bestRes, categoriesRes] = await Promise.all([
                api.get('/products?isFeatured=true&limit=8'),
                api.get('/products?sort=newest&limit=8'),
                api.get('/products?sort=popularity&limit=8'),
                api.get('/categories')
            ]);

            setFeaturedProducts(featuredRes.data.products);
            setNewArrivals(newRes.data.products);
            setBestSellers(bestRes.data.products);
            setCategories(categoriesRes.data.categories);
        } catch (error) {
            console.error('Error fetching home data:', error);
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: FiTruck, title: 'Free Shipping', description: 'On orders over $50', color: 'bg-blue-100', iconColor: 'text-blue-600' },
        { icon: FiShield, title: 'Secure Payment', description: '100% secure transactions', color: 'bg-green-100', iconColor: 'text-green-600' },
        { icon: FiHeadphones, title: '24/7 Support', description: 'Dedicated customer support', color: 'bg-purple-100', iconColor: 'text-purple-600' },
        { icon: FiStar, title: 'Quality Guarantee', description: 'Best quality products', color: 'bg-yellow-100', iconColor: 'text-yellow-600' },
    ];

    return (
        <div>
            {/* Hero Slider */}
            <HeroSlider />

            {/* Features Section */}
            <section className="py-12 bg-white border-b">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center space-x-4 p-4 rounded-lg hover:shadow-lg transition-shadow"
                            >
                                <div className={`${feature.color} p-3 rounded-full`}>
                                    <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">{feature.title}</h3>
                                    <p className="text-sm text-gray-500">{feature.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Shop by Categories</h2>
                        <p className="text-gray-600">Find exactly what you're looking for</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {categories.slice(0, 6).map((category) => (
                            <CategoryCard key={category._id} category={category} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-3xl font-bold">Featured Products</h2>
                            <p className="text-gray-600 mt-1">Hand-picked just for you</p>
                        </div>
                        <Link to="/products?featured=true" className="text-primary-600 hover:text-primary-700 font-semibold flex items-center">
                            View All <FiArrowRight className="ml-2" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Banner */}
            <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Summer Sale 2024</h2>
                    <p className="text-xl mb-6">Up to 50% off on selected items</p>
                    <Link to="/products" className="inline-flex items-center bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                        Shop Now <FiArrowRight className="ml-2" />
                    </Link>
                </div>
            </section>

            {/* New Arrivals */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-3xl font-bold">New Arrivals</h2>
                            <p className="text-gray-600 mt-1">Fresh from the market</p>
                        </div>
                        <Link to="/products?sort=newest" className="text-primary-600 hover:text-primary-700 font-semibold flex items-center">
                            View All <FiArrowRight className="ml-2" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {newArrivals.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Best Sellers */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-3xl font-bold">Best Sellers</h2>
                            <p className="text-gray-600 mt-1">Most popular this month</p>
                        </div>
                        <Link to="/products?sort=popularity" className="text-primary-600 hover:text-primary-700 font-semibold flex items-center">
                            View All <FiArrowRight className="ml-2" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {bestSellers.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter */}
            <Newsletter />
        </div>
    );
};

export default HomePage;