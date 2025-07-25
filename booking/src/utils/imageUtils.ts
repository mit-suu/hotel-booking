/**
 * Image utility functions for handling default images
 */

// Default images for different types
export const DEFAULT_IMAGES = {
  hotel: 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg',
  room: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
  property: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg'
} as const;

/**
 * Get image URL with fallback to default image
 * @param imageUrl - The original image URL
 * @param type - Type of image (hotel, room, property)
 * @returns Image URL with fallback
 */
export const getImageUrl = (imageUrl?: string | null, type: keyof typeof DEFAULT_IMAGES = 'hotel'): string => {
  return imageUrl || DEFAULT_IMAGES[type];
};

/**
 * Handle image error by setting fallback image
 * @param event - The error event from img element
 * @param type - Type of image (hotel, room, property)
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>, type: keyof typeof DEFAULT_IMAGES = 'hotel') => {
  const target = event.target as HTMLImageElement;
  target.src = DEFAULT_IMAGES[type];
};

/**
 * Get optimized image props for consistent handling
 * @param imageUrl - The original image URL
 * @param type - Type of image (hotel, room, property)
 * @param alt - Alt text for the image
 * @returns Props object for img element
 */
export const getImageProps = (imageUrl?: string | null, type: keyof typeof DEFAULT_IMAGES = 'hotel', alt: string = '') => {
  return {
    src: getImageUrl(imageUrl, type),
    alt,
    onError: (e: React.SyntheticEvent<HTMLImageElement>) => handleImageError(e, type)
  };
}; 