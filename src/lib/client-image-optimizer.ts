/**
 * Client-side image optimization using browser Canvas API
 * Optimizes images before uploading to reduce bandwidth and improve performance
 */

// HEIC support with client-side conversion using heic2any

interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png";
}

// HEIC conversion is now handled by skipping client-side optimization
// and uploading the original HEIC file directly for server-side processing

export async function optimizeImageClient(
  file: File,
  options: OptimizeOptions = {},
): Promise<File> {
  // Only run on client side
  if (typeof window === "undefined") {
    throw new Error("Image optimization only available on client side");
  }

  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85,
    format = "webp",
  } = options;

  // Process the file normally (HEIC files should be caught by validation)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          // Create canvas and draw resized image
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }

          // Enable image smoothing for better quality
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          // Draw the image
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to create blob"));
                return;
              }

              // Create new file with optimized image
              const optimizedFileName = file.name.replace(
                /\.(jpg|jpeg|png)$/i,
                `.${format}`,
              );

              const optimizedFile = new File([blob], optimizedFileName, {
                type: `image/${format}`,
                lastModified: Date.now(),
              });

              resolve(optimizedFile);
            },
            `image/${format}`,
            quality,
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Get file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Only JPG, PNG, and WebP are allowed.",
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${formatFileSize(maxSize)}.`,
    };
  }

  return { valid: true };
}
