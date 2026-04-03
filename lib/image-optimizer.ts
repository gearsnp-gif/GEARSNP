import sharp from 'sharp';

export interface ImageOptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

const DEFAULT_OPTIONS: ImageOptimizeOptions = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 90,
  format: 'webp',
};

/**
 * Optimizes an image by resizing and compressing it
 * Returns a Buffer and the new filename with correct extension
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizeOptions = {}
): Promise<{ buffer: Buffer; fileName: string; contentType: string }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);
  
  // Get original filename without extension
  const originalName = file.name.replace(/\.[^/.]+$/, '');
  
  // Process with sharp
  let sharpInstance = sharp(inputBuffer)
    .rotate(); // Auto-rotate based on EXIF orientation data
  
  // Get metadata to preserve aspect ratio
  const metadata = await sharpInstance.metadata();
  
  // Resize if larger than max dimensions (maintaining aspect ratio)
  if (metadata.width && metadata.height) {
    if (metadata.width > opts.maxWidth! || metadata.height > opts.maxHeight!) {
      sharpInstance = sharpInstance.resize(opts.maxWidth, opts.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }
  }
  
  // Convert to specified format with compression
  let outputBuffer: Buffer;
  let contentType: string;
  let extension: string;
  
  switch (opts.format) {
    case 'webp':
      outputBuffer = await sharpInstance
        .webp({ quality: opts.quality })
        .toBuffer();
      contentType = 'image/webp';
      extension = 'webp';
      break;
    case 'jpeg':
      outputBuffer = await sharpInstance
        .jpeg({ quality: opts.quality, mozjpeg: true })
        .toBuffer();
      contentType = 'image/jpeg';
      extension = 'jpg';
      break;
    case 'png':
      outputBuffer = await sharpInstance
        .png({ quality: opts.quality, compressionLevel: 9 })
        .toBuffer();
      contentType = 'image/png';
      extension = 'png';
      break;
    default:
      outputBuffer = await sharpInstance
        .webp({ quality: opts.quality })
        .toBuffer();
      contentType = 'image/webp';
      extension = 'webp';
  }
  
  const fileName = `${originalName}_${Date.now()}.${extension}`;
  
  return {
    buffer: outputBuffer,
    fileName,
    contentType,
  };
}

/**
 * Preset configurations for different image types
 */
export const IMAGE_PRESETS = {
  // Hero/main product images - high quality, larger size
  hero: {
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 92,
    format: 'webp' as const,
  },
  // Gallery/additional images
  gallery: {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 90,
    format: 'webp' as const,
  },
  // Thumbnails (if needed for any purpose)
  thumbnail: {
    maxWidth: 600,
    maxHeight: 600,
    quality: 85,
    format: 'webp' as const,
  },
  // Team logos - smaller, can be PNG for transparency
  logo: {
    maxWidth: 200,
    maxHeight: 200,
    quality: 90,
    format: 'webp' as const,
  },
  // Event banners - wide format
  banner: {
    maxWidth: 1920,
    maxHeight: 600,
    quality: 80,
    format: 'webp' as const,
  },
};
