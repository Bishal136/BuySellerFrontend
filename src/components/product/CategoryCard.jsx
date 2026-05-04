import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const colorSchemes = [
  'from-orange-100 to-orange-50',
  'from-pink-100 to-pink-50',
  'from-blue-100 to-blue-50',
  'from-purple-100 to-purple-50',
  'from-green-100 to-green-50',
  'from-yellow-100 to-yellow-50'
];

const CategoryCard = ({ category, index = 0 }) => {
  const colorClass = colorSchemes[index % colorSchemes.length];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <Link to={`/products?category=${category.slug || category._id}`}>
        <div className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-3 text-center transition-all hover:-translate-y-1 hover:border-primary-300 hover:shadow-lg bg-white">
          <div
            className={`grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br ${colorClass} text-gray-700 group-hover:scale-110 transition-transform`}
          >
            {category.icon ? (
              <span className="text-2xl">{category.icon}</span>
            ) : (
              <span className="text-lg font-bold">
                {category.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <span className="text-xs font-medium leading-tight text-gray-700">
            {category.name}
          </span>
          {category.productCount !== undefined && (
            <span className="text-xs text-gray-400">
              {category.productCount} items
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryCard;