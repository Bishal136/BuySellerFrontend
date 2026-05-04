import { formatBDT, calculateDiscount } from '../../utils/currency';

const Price = ({ price, comparePrice, size = 'default', showDiscount = true, className = '' }) => {
  const sizes = {
    small: 'text-sm',
    default: 'text-base',
    large: 'text-xl',
    xlarge: 'text-2xl'
  };

  const discount = calculateDiscount(comparePrice, price);

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`font-bold text-primary-600 ${sizes[size]}`}>
          {formatBDT(price)}
        </span>
        {comparePrice && comparePrice > price && (
          <span className={`text-gray-400 line-through ${sizes.small}`}>
            {formatBDT(comparePrice)}
          </span>
        )}
        {showDiscount && discount > 0 && (
          <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-semibold">
            -{discount}%
          </span>
        )}
      </div>
      {comparePrice && comparePrice > price && (
        <div className="text-xs text-green-600 mt-1">
          You save: {formatBDT(comparePrice - price)}
        </div>
      )}
    </div>
  );
};

export default Price;