import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiSearch, FiArrowLeft, FiHelpCircle } from 'react-icons/fi';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full text-center">
        {/* Animated 404 Number */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="mb-8"
        >
          <h1 className="text-9xl font-extrabold text-primary-600">404</h1>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Oops! Page Not Found
          </h2>
          <p className="text-gray-600">
            The page you are looking for might have been removed, had its name changed,
            or is temporarily unavailable.
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-8"
        >
          <form action="/products" method="GET" className="relative">
            <input
              type="text"
              name="search"
              placeholder="Search for products..."
              className="input pl-12 pr-4 py-3 w-full"
            />
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary py-1 px-4 text-sm"
            >
              Search
            </button>
          </form>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/"
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            <FiHome className="w-4 h-4" />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-secondary inline-flex items-center justify-center gap-2"
          >
            <FiArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <Link
            to="/contact"
            className="btn-outline inline-flex items-center justify-center gap-2"
          >
            <FiHelpCircle className="w-4 h-4" />
            Need Help?
          </Link>
        </motion.div>

        {/* Popular Categories */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-12 pt-8 border-t border-gray-200"
        >
          <h3 className="text-sm font-semibold text-gray-500 mb-4">
            POPULAR CATEGORIES
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link to="/products?category=electronics" className="text-sm text-gray-600 hover:text-primary-600">
              Electronics
            </Link>
            <span className="text-gray-300">•</span>
            <Link to="/products?category=fashion" className="text-sm text-gray-600 hover:text-primary-600">
              Fashion
            </Link>
            <span className="text-gray-300">•</span>
            <Link to="/products?category=home" className="text-sm text-gray-600 hover:text-primary-600">
              Home & Living
            </Link>
            <span className="text-gray-300">•</span>
            <Link to="/products?category=beauty" className="text-sm text-gray-600 hover:text-primary-600">
              Beauty
            </Link>
            <span className="text-gray-300">•</span>
            <Link to="/products?category=sports" className="text-sm text-gray-600 hover:text-primary-600">
              Sports
            </Link>
            <span className="text-gray-300">•</span>
            <Link to="/products?category=books" className="text-sm text-gray-600 hover:text-primary-600">
              Books
            </Link>
          </div>
        </motion.div>

        {/* Funny Illustration */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5, type: 'spring' }}
          className="mt-12"
        >
          <svg
            className="w-48 h-48 mx-auto text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;