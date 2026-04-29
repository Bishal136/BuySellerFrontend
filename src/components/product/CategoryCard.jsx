import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CATEGORY_PLACEHOLDER } from '../../utils/placeholder';

const CategoryCard = ({ category }) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.05 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Link to={`/products?category=${category.slug || category._id}`}>
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
          {/* Category Image */}
          <div className="relative h-40 overflow-hidden bg-gray-100">
            <img
              src={category.image || CATEGORY_PLACEHOLDER}
              alt={category.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = CATEGORY_PLACEHOLDER;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>
          
          {/* Category Info */}
          <div className="p-4 text-center">
            {category.icon && (
              <div className="text-3xl mb-2">{category.icon}</div>
            )}
            <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
              {category.name}
            </h3>
            {category.productCount !== undefined && (
              <p className="text-sm text-gray-500 mt-1">
                {category.productCount} Products
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryCard;