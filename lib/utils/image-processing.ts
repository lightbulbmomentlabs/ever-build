/**
 * Image Processing Utilities
 *
 * Functions for cropping, resizing, and compressing images client-side
 */

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Create an image element from a URL or File
 */
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

/**
 * Get the cropped image from a source image and crop area
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: CropArea
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Set canvas size to crop size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      'image/jpeg',
      0.85 // 85% quality
    );
  });
}

/**
 * Resize and compress an image
 */
export async function resizeAndCompressImage(
  blob: Blob,
  maxWidth: number = 500
): Promise<Blob> {
  const image = await createImage(URL.createObjectURL(blob));

  // Calculate new dimensions maintaining aspect ratio
  let width = image.width;
  let height = image.height;

  if (width > maxWidth || height > maxWidth) {
    if (width > height) {
      height = (height / width) * maxWidth;
      width = maxWidth;
    } else {
      width = (width / height) * maxWidth;
      height = maxWidth;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Draw resized image
  ctx.drawImage(image, 0, 0, width, height);

  // Convert to JPEG blob with compression
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      'image/jpeg',
      0.85 // 85% quality
    );
  });
}

/**
 * Complete image processing pipeline:
 * 1. Crop to specified area
 * 2. Resize to max width
 * 3. Compress to JPEG
 */
export async function processImage(
  imageSrc: string,
  pixelCrop: CropArea,
  maxWidth: number = 500
): Promise<{ file: File; originalSize: number; optimizedSize: number }> {
  // Get original size
  const response = await fetch(imageSrc);
  const originalBlob = await response.blob();
  const originalSize = originalBlob.size;

  // Crop the image
  const croppedBlob = await getCroppedImg(imageSrc, pixelCrop);

  // Resize and compress
  const optimizedBlob = await resizeAndCompressImage(croppedBlob, maxWidth);

  // Convert to File object
  const file = new File([optimizedBlob], 'image.jpg', {
    type: 'image/jpeg',
  });

  return {
    file,
    originalSize,
    optimizedSize: file.size,
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Calculate percentage reduction
 */
export function calculateReduction(original: number, optimized: number): number {
  return Math.round(((original - optimized) / original) * 100);
}
