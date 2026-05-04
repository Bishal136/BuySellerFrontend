
// import { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { Link } from 'react-router-dom';
// import { FiArrowRight, FiTruck, FiShield, FiHeadphones, FiStar } from 'react-icons/fi';
// import ProductCard from '../components/product/ProductCard';
// import CategoryCard from '../components/product/CategoryCard';
// import HeroSlider from '../components/home/HeroSlider';
// import Newsletter from '../components/home/Newsletter';
// import api from '../services/api';

// const HomePage = () => {
//     const [featuredProducts, setFeaturedProducts] = useState([]);
//     const [newArrivals, setNewArrivals] = useState([]);
//     const [bestSellers, setBestSellers] = useState([]);
//     const [categories, setCategories] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         fetchHomeData();
//     }, []);

//     const fetchHomeData = async () => {
//         try {
//             const [featuredRes, newRes, bestRes, categoriesRes] = await Promise.all([
//                 api.get('/products?isFeatured=true&limit=8'),
//                 api.get('/products?sort=newest&limit=8'),
//                 api.get('/products?sort=popularity&limit=8'),
//                 api.get('/categories')
//             ]);

//             setFeaturedProducts(featuredRes.data.products);
//             setNewArrivals(newRes.data.products);
//             setBestSellers(bestRes.data.products);
//             setCategories(categoriesRes.data.categories);
//         } catch (error) {
//             console.error('Error fetching home data:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const features = [
//         { icon: FiTruck, title: 'Free Shipping', description: 'On orders over $50', color: 'bg-blue-100', iconColor: 'text-blue-600' },
//         { icon: FiShield, title: 'Secure Payment', description: '100% secure transactions', color: 'bg-green-100', iconColor: 'text-green-600' },
//         { icon: FiHeadphones, title: '24/7 Support', description: 'Dedicated customer support', color: 'bg-purple-100', iconColor: 'text-purple-600' },
//         { icon: FiStar, title: 'Quality Guarantee', description: 'Best quality products', color: 'bg-yellow-100', iconColor: 'text-yellow-600' },
//     ];

//     return (
//         <div>
//             {/* Hero Slider */}
//             <HeroSlider />

//             {/* Features Section */}
//             <section className="py-12 bg-white border-b">
//                 <div className="container mx-auto px-4">
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                         {features.map((feature, index) => (
//                             <motion.div
//                                 key={index}
//                                 initial={{ opacity: 0, y: 20 }}
//                                 animate={{ opacity: 1, y: 0 }}
//                                 transition={{ delay: index * 0.1 }}
//                                 className="flex items-center space-x-4 p-4 rounded-lg hover:shadow-lg transition-shadow"
//                             >
//                                 <div className={`${feature.color} p-3 rounded-full`}>
//                                     <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
//                                 </div>
//                                 <div>
//                                     <h3 className="font-semibold text-gray-800">{feature.title}</h3>
//                                     <p className="text-sm text-gray-500">{feature.description}</p>
//                                 </div>
//                             </motion.div>
//                         ))}
//                     </div>
//                 </div>
//             </section>

//             {/* Categories Section */}
//             <section className="py-16 bg-gray-50">
//                 <div className="container mx-auto px-4">
//                     <div className="text-center mb-12">
//                         <h2 className="text-3xl font-bold mb-4">Shop by Categories</h2>
//                         <p className="text-gray-600">Find exactly what you're looking for</p>
//                     </div>
//                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//                         {categories.slice(0, 6).map((category) => (
//                             <CategoryCard key={category._id} category={category} />
//                         ))}
//                     </div>
//                 </div>
//             </section>

//             {/* Featured Products */}
//             <section className="py-16">
//                 <div className="container mx-auto px-4">
//                     <div className="flex justify-between items-center mb-8">
//                         <div>
//                             <h2 className="text-3xl font-bold">Featured Products</h2>
//                             <p className="text-gray-600 mt-1">Hand-picked just for you</p>
//                         </div>
//                         <Link to="/products?featured=true" className="text-primary-600 hover:text-primary-700 font-semibold flex items-center">
//                             View All <FiArrowRight className="ml-2" />
//                         </Link>
//                     </div>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//                         {featuredProducts.map((product) => (
//                             <ProductCard key={product._id} product={product} />
//                         ))}
//                     </div>
//                 </div>
//             </section>

//             {/* Banner */}
//             <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
//                 <div className="container mx-auto px-4 text-center">
//                     <h2 className="text-3xl font-bold mb-4">Summer Sale 2024</h2>
//                     <p className="text-xl mb-6">Up to 50% off on selected items</p>
//                     <Link to="/products" className="inline-flex items-center bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
//                         Shop Now <FiArrowRight className="ml-2" />
//                     </Link>
//                 </div>
//             </section>

//             {/* New Arrivals */}
//             <section className="py-16 bg-gray-50">
//                 <div className="container mx-auto px-4">
//                     <div className="flex justify-between items-center mb-8">
//                         <div>
//                             <h2 className="text-3xl font-bold">New Arrivals</h2>
//                             <p className="text-gray-600 mt-1">Fresh from the market</p>
//                         </div>
//                         <Link to="/products?sort=newest" className="text-primary-600 hover:text-primary-700 font-semibold flex items-center">
//                             View All <FiArrowRight className="ml-2" />
//                         </Link>
//                     </div>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//                         {newArrivals.map((product) => (
//                             <ProductCard key={product._id} product={product} />
//                         ))}
//                     </div>
//                 </div>
//             </section>

//             {/* Best Sellers */}
//             <section className="py-16">
//                 <div className="container mx-auto px-4">
//                     <div className="flex justify-between items-center mb-8">
//                         <div>
//                             <h2 className="text-3xl font-bold">Best Sellers</h2>
//                             <p className="text-gray-600 mt-1">Most popular this month</p>
//                         </div>
//                         <Link to="/products?sort=popularity" className="text-primary-600 hover:text-primary-700 font-semibold flex items-center">
//                             View All <FiArrowRight className="ml-2" />
//                         </Link>
//                     </div>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//                         {bestSellers.map((product) => (
//                             <ProductCard key={product._id} product={product} />
//                         ))}
//                     </div>
//                 </div>
//             </section>

//             {/* Newsletter */}
//             <Newsletter />
//         </div>
//     );
// };

// export default HomePage;

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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Features Strip */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-4 shadow-sm">
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

      {/* Flash Sale Section */}
      {flashSaleProducts.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <div className="rounded-xl overflow-hidden shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-red-600 to-red-700 px-5 py-3 text-white">
              <div className="flex items-center gap-2">
                <FiZap className="h-6 w-6 fill-yellow-300 text-yellow-300" />
                <h2 className="text-lg font-extrabold uppercase tracking-wide md:text-xl">
                  Flash Sale
                </h2>
                <span className="hidden text-sm opacity-90 md:inline">
                  On sale now. Grab 'em before they're gone!
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden text-xs font-medium md:inline">Ends in</span>
                <div className="flex gap-1">
                  <span className="rounded-md bg-black/30 px-2 py-1 font-mono text-sm font-bold tabular-nums">
                    {padNumber(countdown.hours)}
                  </span>
                  <span className="text-white font-bold">:</span>
                  <span className="rounded-md bg-black/30 px-2 py-1 font-mono text-sm font-bold tabular-nums">
                    {padNumber(countdown.minutes)}
                  </span>
                  <span className="text-white font-bold">:</span>
                  <span className="rounded-md bg-black/30 px-2 py-1 font-mono text-sm font-bold tabular-nums">
                    {padNumber(countdown.seconds)}
                  </span>
                </div>
                <Link
                  to="/products?flashSale=true"
                  className="ml-2 hidden rounded-md bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur transition-colors hover:bg-white/25 sm:inline"
                >
                  See All →
                </Link>
              </div>
            </div>
            <div className="bg-white p-4">
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {flashSaleProducts.map((product) => (
                  <ProductCard key={product._id} product={product} featured />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories Section - Grid View */}
      <section className="container mx-auto px-4 py-8">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-xl font-extrabold text-gray-800 md:text-2xl">
            Shop by Category
          </h2>
          <Link to="/products" className="text-sm font-medium text-primary-600 hover:underline">
            See all
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {categoriesToShowGrid.map((category, index) => (
            <CategoryCard key={category._id} category={category} index={index} />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-800">Featured Products</h2>
            <p className="text-sm text-gray-500 mt-1">Hand-picked just for you</p>
          </div>
          <Link to="/products?featured=true" className="text-sm font-medium text-primary-600 hover:underline flex items-center gap-1">
            View All <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} featured />
            ))}
          </div>
        )}
      </section>

      {/* Banner / Promo Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 to-primary-800 p-8 md:p-12">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white mb-3">
              Limited Time Offer
            </span>
            <h2 className="text-3xl font-extrabold text-white md:text-4xl mb-3">
              Summer Sale 2024
            </h2>
            <p className="text-white/90 mb-6">
              Up to 50% off on selected items. Don't miss out on these amazing deals!
            </p>
            <Link 
              to="/products?sort=discount" 
              className="inline-flex items-center gap-2 bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all hover:scale-105"
            >
              Shop Now <FiArrowRight />
            </Link>
          </div>
          {/* Decorative circles */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute right-20 bottom-0 w-32 h-32 bg-white/5 rounded-full"></div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-800">New Arrivals</h2>
            <p className="text-sm text-gray-500 mt-1">Fresh from the market</p>
          </div>
          <Link to="/products?sort=newest" className="text-sm font-medium text-primary-600 hover:underline flex items-center gap-1">
            View All <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-xl shadow-sm p-4 animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
};

export default HomePage;