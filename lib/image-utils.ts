/**
 * Image URL Utility
 * 
 * Images are optimized at upload time using sharp.
 * This utility provides simple helpers for image URLs.
 */

/**
 * Returns the image URL or a placeholder if not available
 */
export function getOptimizedImageUrl(
  originalUrl: string | null | undefined
): string {
  if (!originalUrl) {
    return '/placeholder.png';
  }
  return originalUrl;
}

/**
 * Helper function for backwards compatibility
 * Since images are already optimized at upload, this just returns the URL
 */
export function getImageBySize(
  url: string | null | undefined,
  _size?: string
): string {
  return getOptimizedImageUrl(url);
}
