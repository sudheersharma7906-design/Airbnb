/**
 * Helper to ensure image URLs are valid and handle fallbacks for missing/broken images
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string' || imagePath.trim() === '') {
    return 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80';
  }
  
  const path = imagePath.trim();

  // Return as-is if absolute URL or base64 data URI
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  // Ensure leading slash for local upload paths
  return path.startsWith('/') ? path : `/${path}`;
};

export const DEFAULT_PROPERTY_IMAGE =
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80';
