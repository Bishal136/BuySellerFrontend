// Generate SVG placeholder images locally (no external dependencies)

/**
 * Generate a simple SVG placeholder with text
 * @param {string} text - Text to display on placeholder
 * @param {number} width - Width of placeholder
 * @param {number} height - Height of placeholder
 * @param {string} bgColor - Background color (hex without #)
 * @param {string} textColor - Text color (hex without #)
 * @returns {string} Data URL of SVG placeholder
 */
export const generatePlaceholder = (text = 'No Image', width = 300, height = 300, bgColor = 'f3f4f6', textColor = '9ca3af') => {
  const displayText = text.length > 20 ? text.substring(0, 17) + '...' : text;
  const fontSize = Math.floor(width / 10);
  
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='%23${bgColor}'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23${textColor}' font-size='${fontSize}' font-family='Arial, sans-serif'%3E${encodeURIComponent(displayText)}%3C/text%3E%3C/svg%3E`;
};

// Pre-defined placeholders for different use cases
export const PLACEHOLDER_IMAGE = generatePlaceholder('No Image', 400, 400);
export const PRODUCT_PLACEHOLDER = generatePlaceholder('Product', 400, 400);
export const CATEGORY_PLACEHOLDER = generatePlaceholder('Category', 300, 200);
export const AVATAR_PLACEHOLDER = generatePlaceholder('User', 100, 100, 'e5e7eb', '6b7280');
export const BANNER_PLACEHOLDER = generatePlaceholder('Banner', 1200, 400, 'dbeafe', '3b82f6');

// Base64 encoded 1x1 transparent pixel (fallback for extreme cases)
export const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// Product image placeholder with shopping icon
export const PRODUCT_PLACEHOLDER_ICON = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='2' y='7' width='20' height='14' rx='2' ry='2'%3E%3C/rect%3E%3Cpath d='M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16'%3E%3C/path%3E%3C/svg%3E`;

// Default profile avatar
export const DEFAULT_AVATAR = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E`;

// Export default object for convenience
export default {
  generatePlaceholder,
  PLACEHOLDER_IMAGE,
  PRODUCT_PLACEHOLDER,
  CATEGORY_PLACEHOLDER,
  AVATAR_PLACEHOLDER,
  BANNER_PLACEHOLDER,
  TRANSPARENT_PIXEL,
  PRODUCT_PLACEHOLDER_ICON,
  DEFAULT_AVATAR
};