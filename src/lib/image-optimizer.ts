import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

interface OptimizeImageOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Optimizes an image by converting it to WebP format
 * @param inputPath - Path to the input image
 * @param outputPath - Path where the optimized image will be saved (should end in .webp)
 * @param options - Optimization options
 * @returns Path to the optimized image
 */
export async function optimizeImage(
  inputPath: string,
  outputPath: string,
  options: OptimizeImageOptions = {},
): Promise<string> {
  const { quality = 85, maxWidth = 1920, maxHeight = 1080 } = options;

  try {
    // Ensure output path ends with .webp
    if (!outputPath.endsWith(".webp")) {
      outputPath = outputPath.replace(/\.[^/.]+$/, ".webp");
    }

    // Read and process the image
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Calculate dimensions while maintaining aspect ratio
    let width = metadata.width || maxWidth;
    let height = metadata.height || maxHeight;

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    // Convert to WebP with optimization
    await image
      .resize(width, height, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality })
      .toFile(outputPath);

    // Delete the original file if it's different from output
    if (inputPath !== outputPath) {
      await fs.unlink(inputPath).catch(() => {
        // Ignore errors if file doesn't exist
      });
    }

    return outputPath;
  } catch (error) {
    console.error("Error optimizing image:", error);
    throw new Error("Failed to optimize image");
  }
}

/**
 * Converts uploaded file buffer to optimized WebP
 * @param buffer - Image file buffer
 * @param filename - Original filename (will be converted to .webp)
 * @param outputDir - Directory to save the optimized image
 * @param options - Optimization options
 * @returns Object with the file path and public URL
 */
export async function optimizeUploadedImage(
  buffer: Buffer,
  filename: string,
  outputDir: string,
  options: OptimizeImageOptions = {},
): Promise<{ filePath: string; publicUrl: string }> {
  const { quality = 85, maxWidth = 1920, maxHeight = 1080 } = options;

  try {
    // Generate WebP filename
    const timestamp = Date.now();
    const sanitizedName = filename
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "-");
    const webpFilename = `${sanitizedName}-${timestamp}.webp`;
    const outputPath = path.join(outputDir, webpFilename);

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Process and save the image
    const image = sharp(buffer);
    const metadata = await image.metadata();

    // Calculate dimensions while maintaining aspect ratio
    let width = metadata.width || maxWidth;
    let height = metadata.height || maxHeight;

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    // Convert to WebP with optimization
    await image
      .resize(width, height, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality })
      .toFile(outputPath);

    // Generate public URL (assuming /public/games/ maps to /games/)
    const publicUrl = `/games/${webpFilename}`;

    return {
      filePath: outputPath,
      publicUrl,
    };
  } catch (error) {
    console.error("Error optimizing uploaded image:", error);
    throw new Error("Failed to optimize uploaded image");
  }
}

/**
 * Batch optimize multiple images in a directory
 * @param inputDir - Directory containing images to optimize
 * @param outputDir - Directory to save optimized images
 * @param options - Optimization options
 */
export async function batchOptimizeImages(
  inputDir: string,
  outputDir: string,
  options: OptimizeImageOptions = {},
): Promise<{ success: string[]; failed: string[] }> {
  const success: string[] = [];
  const failed: string[] = [];

  try {
    const files = await fs.readdir(inputDir);
    const imageFiles = files.filter((file) =>
      /\.(jpg|jpeg|png|gif)$/i.test(file),
    );

    await fs.mkdir(outputDir, { recursive: true });

    for (const file of imageFiles) {
      try {
        const inputPath = path.join(inputDir, file);
        const outputFilename = file.replace(/\.[^/.]+$/, ".webp");
        const outputPath = path.join(outputDir, outputFilename);

        await optimizeImage(inputPath, outputPath, options);
        success.push(file);
      } catch (error) {
        console.error(`Failed to optimize ${file}:`, error);
        failed.push(file);
      }
    }

    return { success, failed };
  } catch (error) {
    console.error("Error in batch optimization:", error);
    throw new Error("Failed to batch optimize images");
  }
}
