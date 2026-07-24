/**
 * Helper to ensure image URLs are valid and handle fallbacks for missing/broken images.
 * In production (Render), local /uploads paths are prefixed with the backend URL.
 */

// Production backend URL — used to fix /uploads paths in production
const BACKEND_URL = import.meta.env.VITE_API_URL || '';

export const getImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string' || imagePath.trim() === '') {
    return 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80';
  }

  const path = imagePath.trim();

  // Return as-is if already absolute URL (Cloudinary, http, https) or base64
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  // For local /uploads paths: in production, prepend the backend server URL
  // In dev, Vite proxy handles it so relative path works fine
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (BACKEND_URL) {
    return `${BACKEND_URL}${normalizedPath}`;
  }
  return normalizedPath;
};

export const DEFAULT_PROPERTY_IMAGE =
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80';
