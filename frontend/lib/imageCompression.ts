export const MAX_IMAGE_SOURCE_BYTES = 10 * 1024 * 1024;
export const TARGET_IMAGE_BYTES = 900 * 1024;

const MAX_IMAGE_DIMENSION = 2560;
const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export interface OptimizedImageResult {
  file: File;
  originalSize: number;
  optimized: boolean;
}

export interface ImageOptimizationOptions {
  maxDimension?: number;
  targetBytes?: number;
}

interface DecodedImage {
  source: CanvasImageSource;
  width: number;
  height: number;
  cleanup: () => void;
}

function outputFilename(filename: string, mimeType: string): string {
  const basename = filename.replace(/\.[^.]+$/, "") || "image";
  const extension =
    mimeType === "image/webp" ? "webp" : mimeType === "image/png" ? "png" : "jpg";
  return `${basename}-optimized.${extension}`;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("The browser could not encode this image."));
      },
      mimeType,
      quality
    );
  });
}

async function decodeImage(file: File): Promise<DecodedImage> {
  if ("createImageBitmap" in window) {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    return {
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      cleanup: () => bitmap.close(),
    };
  }

  const objectUrl = URL.createObjectURL(file);
  const image = new Image();

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("The selected image could not be decoded."));
      image.src = objectUrl;
    });

    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      cleanup: () => URL.revokeObjectURL(objectUrl),
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}

/**
 * Optimizes large admin images before FormData is created. Small files stay untouched;
 * larger files become high-quality WebP and are resized only as much as necessary.
 */
export async function optimizeImageForUpload(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageResult> {
  if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Choose a JPEG, PNG, or WebP image.");
  }

  if (file.size > MAX_IMAGE_SOURCE_BYTES) {
    throw new Error("The selected image must be 10 MB or smaller.");
  }

  const targetBytes = Math.max(32 * 1024, options.targetBytes ?? TARGET_IMAGE_BYTES);
  const maxDimension = Math.max(64, options.maxDimension ?? MAX_IMAGE_DIMENSION);

  if (file.size <= targetBytes) {
    return { file, originalSize: file.size, optimized: false };
  }

  const decoded = await decodeImage(file);

  try {
    const initialScale = Math.min(
      1,
      maxDimension / Math.max(decoded.width, decoded.height)
    );
    let width = Math.max(1, Math.round(decoded.width * initialScale));
    let height = Math.max(1, Math.round(decoded.height * initialScale));
    let quality = 0.92;
    let smallestBlob: Blob | null = null;

    for (let attempt = 0; attempt < 14; attempt += 1) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { alpha: true });

      if (!context) throw new Error("Image optimization is unavailable in this browser.");

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(decoded.source, 0, 0, width, height);

      const blob = await canvasToBlob(canvas, "image/webp", quality);
      if (!smallestBlob || blob.size < smallestBlob.size) smallestBlob = blob;
      if (blob.size <= targetBytes) break;

      if (quality > 0.8) {
        quality = Math.max(0.8, quality - 0.04);
      } else {
        const resizeScale = Math.min(
          0.84,
          Math.sqrt(targetBytes / blob.size) * 0.95
        );
        width = Math.max(1, Math.round(width * resizeScale));
        height = Math.max(1, Math.round(height * resizeScale));
        quality = 0.88;
      }
    }

    if (!smallestBlob) throw new Error("The selected image could not be optimized.");

    if (smallestBlob.size >= file.size) {
      return { file, originalSize: file.size, optimized: false };
    }

    return {
      file: new File([smallestBlob], outputFilename(file.name, smallestBlob.type), {
        type: smallestBlob.type,
        lastModified: Date.now(),
      }),
      originalSize: file.size,
      optimized: true,
    };
  } finally {
    decoded.cleanup();
  }
}
