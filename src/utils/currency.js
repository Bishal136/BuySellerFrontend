// Currency formatting utility for Bangladeshi Taka (BDT)

/**
 * Format number to Bangladeshi Taka (BDT)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string (e.g., "৳1,250")
 */
export const formatBDT = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '৳0';
  }
  
  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    currencyDisplay: 'symbol'
  }).format(amount).replace('BDT', '৳');
};

/**
 * Format price with decimal places
 * @param {number} price - The price to format
 * @returns {string} Formatted price (e.g., "৳1,250.50")
 */
export const formatPriceDecimal = (price) => {
  if (price === undefined || price === null || isNaN(price)) {
    return '৳0.00';
  }
  return `৳${price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

/**
 * Format price without decimal (for whole numbers)
 * @param {number} price - The price to format
 * @returns {string} Formatted price (e.g., "৳1,250")
 */
export const formatPriceInteger = (price) => {
  if (price === undefined || price === null || isNaN(price)) {
    return '৳0';
  }
  return `৳${Math.round(price).toLocaleString('en-IN')}`;
};

/**
 * Format large numbers with commas
 * @param {number} num - The number to format
 * @returns {string} Formatted number (e.g., "1,25,000")
 */
export const formatNumber = (num) => {
  if (num === undefined || num === null || isNaN(num)) {
    return '0';
  }
  return num.toLocaleString('en-IN');
};

/**
 * Calculate discount percentage
 * @param {number} originalPrice - Original/MRP price
 * @param {number} sellingPrice - Selling price
 * @returns {number} Discount percentage
 */
export const calculateDiscount = (originalPrice, sellingPrice) => {
  if (!originalPrice || !sellingPrice || originalPrice <= sellingPrice) {
    return 0;
  }
  return Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);
};

/**
 * Calculate savings amount
 * @param {number} originalPrice - Original/MRP price
 * @param {number} sellingPrice - Selling price
 * @returns {string} Formatted savings
 */
export const calculateSavings = (originalPrice, sellingPrice) => {
  if (!originalPrice || !sellingPrice || originalPrice <= sellingPrice) {
    return formatBDT(0);
  }
  return formatBDT(originalPrice - sellingPrice);
};

// Export default object for convenience
export default {
  formatBDT,
  formatPriceDecimal,
  formatPriceInteger,
  formatNumber,
  calculateDiscount,
  calculateSavings
};