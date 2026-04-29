// Generate SVG placeholder images locally (no external dependencies)
export const generatePlaceholder = (text, width = 300, height = 200, bgColor = 'f3f4f6', textColor = '9ca3af') => {
  const displayText = text.length > 20 ? text.substring(0, 17) + '...' : text;
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='%23${bgColor}'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23${textColor}' font-size='${Math.floor(width / 12)}' font-family='Arial'%3E${encodeURIComponent(displayText)}%3C/text%3E%3C/svg%3E`;
};

export const PLACEHOLDER_IMAGE = generatePlaceholder('No Image', 300, 200);
export const PRODUCT_PLACEHOLDER = generatePlaceholder('Product', 300, 200);
export const CATEGORY_PLACEHOLDER = generatePlaceholder('Category', 300, 200);
export const AVATAR_PLACEHOLDER = generatePlaceholder('User', 100, 100, 'e5e7eb', '6b7280');