import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiArrowRight, FiTruck, FiShield, FiHeadphones, FiStar, 
  FiZap, FiClock, FiTrendingUp, FiPackage
} from 'react-icons/fi';
import ProductCard from '../components/product/ProductCard';
import CategoryCard from '../components/product/CategoryCard';
import HeroSlider from '../components/home/HeroSlider';
import Newsletter from '../components/home/Newsletter';
import api from '../services/api';
import { formatBDT } from '../utils/currency';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    fetchHomeData();
    startCountdown();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [featuredRes, newRes, bestRes, categoriesRes, flashRes] = await Promise.all([
        api.get('/products?isFeatured=true&limit=8'),
        api.get('/products?sort=newest&limit=8'),
        api.get('/products?sort=popularity&limit=8'),
        api.get('/categories'),
        api.get('/products?isFlashSale=true&limit=4')
      ]);

      setFeaturedProducts(featuredRes.data.products);
      setNewArrivals(newRes.data.products);
      setBestSellers(bestRes.data.products);
      setCategories(categoriesRes.data.categories);
      setFlashSaleProducts(flashRes.data.products || []);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
    const target = new Date();
    target.setHours(23, 59, 59, 999);
    
    const updateCountdown = () => {
      const now = new Date();
      const diff = Math.max(0, target.getTime() - now.getTime());
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setCountdown({ hours, minutes, seconds });
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  };

  const padNumber = (num) => String(num).padStart(2, '0');

  const features = [
    { icon: FiTruck, title: 'Free Shipping', description: 'On orders over ৳5,000', color: 'bg-blue-100', iconColor: 'text-blue-600' },
    { icon: FiShield, title: 'Secure Payment', description: '100% secure transactions', color: 'bg-green-100', iconColor: 'text-green-600' },
    { icon: FiHeadphones, title: '24/7 Support', description: 'Dedicated customer support', color: 'bg-purple-100', iconColor: 'text-purple-600' },
    { icon: FiStar, title: 'Quality Guarantee', description: 'Best quality products', color: 'bg-yellow-100', iconColor: 'text-yellow-600' }
  ];

  const categoriesToShow = categories.slice(0, 12);
  const categoriesToShowGrid = categories.slice(0, 6);

  return (
    <div className=" min-h-screen bg-gray-50">
      {/* Hero Slider */}
      <HeroSlider />
    


      {/* New Arrivals */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-800">Our Products</h2>
            <p className="text-sm text-gray-500 mt-1">Fresh from the market</p>
          </div>
          <Link to="/products?sort=newest" className="text-sm font-medium text-primary-600 hover:underline flex items-center gap-1">
            View All <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Best Sellers */}
      <section className="container mx-auto px-4 py-8 bg-white rounded-xl mx-4 md:mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-800">Best Sellers</h2>
            <p className="text-sm text-gray-500 mt-1">Most popular this month</p>
          </div>
          <Link to="/products?sort=popularity" className="text-sm font-medium text-primary-600 hover:underline flex items-center gap-1">
            View All <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-xl shadow-sm p-4 animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Newsletter */}
      <Newsletter />

        {/* Features Strip */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${feature.color}`}>
                <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-gray-800">{feature.title}</div>
                <div className="truncate text-xs text-gray-500">{feature.description}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>


    </div>
  );
};

export default HomePage;