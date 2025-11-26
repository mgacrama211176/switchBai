"use client";

import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { Game } from "@/app/types/games";
import { validateGameForm } from "@/lib/game-validation";
import {
  optimizeImageClient,
  validateImageFile,
  formatFileSize,
} from "@/lib/client-image-optimizer";
import { HiUpload } from "react-icons/hi";
import Toast from "./Toast";
import Image from "next/image";

interface GameFormProps {
  mode: "create" | "edit";
  initialData?: Game;
  onSuccess: (game: Game) => void;
  onCancel?: () => void;
}

const CATEGORIES = [
  "RPG",
  "Platformer",
  "Action-Adventure",
  "Racing",
  "Simulation",
  "Fighting",
  "Shooter",
  "Strategy",
  "Action",
  "Sports",
];

const RATINGS = ["E", "E10+", "T", "M"];
const PLATFORMS = ["Nintendo Switch", "Nintendo Switch 2", "PS4", "PS5"];
const CLASSES = ["custom", "low", "mid", "high"];

export default function GameForm({
  mode,
  initialData,
  onSuccess,
  onCancel,
}: GameFormProps) {
  const [formData, setFormData] = useState({
    gameTitle: initialData?.gameTitle || "",
    gamePlatform: Array.isArray(initialData?.gamePlatform)
      ? initialData.gamePlatform
      : initialData?.gamePlatform
        ? [initialData.gamePlatform]
        : [],
    gameRatings: initialData?.gameRatings || "",
    gameBarcode: initialData?.gameBarcode || "",
    gameDescription: initialData?.gameDescription || "",
    gameImageURL: initialData?.gameImageURL || "",
    gameAvailableStocks: initialData?.gameAvailableStocks || 0,
    stockWithCase:
      initialData?.stockWithCase ?? (initialData?.gameAvailableStocks || 0),
    stockCartridgeOnly: initialData?.stockCartridgeOnly || 0,
    gamePrice: initialData?.gamePrice || 0,
    gameCategory: initialData?.gameCategory || "",
    gameReleaseDate: initialData?.gameReleaseDate || "",
    class: initialData?.class || "",
    numberOfSold: initialData?.numberOfSold || 0,
    tradable: initialData?.tradable ?? true,
    rentalAvailable: initialData?.rentalAvailable || false,
    rentalWeeklyRate: initialData?.rentalWeeklyRate || 0,
    isOnSale: initialData?.isOnSale || false,
    salePrice: initialData?.salePrice || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(
    initialData?.gameImageURL || "",
  );
  const [uploadingImage, setUploadingImage] = useState(false);
  // Set initial optimized file size for existing images
  const [optimizedFileSize, setOptimizedFileSize] = useState<string>(
    initialData?.gameImageURL ? "Existing image" : "",
  );
  // Store selected file for upload on form submission
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  function handleInputChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }

  function handlePlatformChange(platform: string) {
    setFormData((prev) => {
      const platforms = prev.gamePlatform as string[];
      if (platforms.includes(platform)) {
        return {
          ...prev,
          gamePlatform: platforms.filter((p) => p !== platform),
        };
      } else {
        return {
          ...prev,
          gamePlatform: [...platforms, platform],
        };
      }
    });
  }

  function handleImageSelection(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setToast({
        message: validation.error || "Invalid file",
        type: "error",
      });
      return;
    }

    // Store the file for later upload
    setSelectedImageFile(file);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);
    setImagePreview(previewUrl);

    // Show file size info
    const fileSize = formatFileSize(file.size);
    setOptimizedFileSize(fileSize);

    // Update form data to indicate an image is selected (for validation)
    // We'll use a placeholder that indicates a file is selected
    setFormData((prev) => ({ ...prev, gameImageURL: "file://selected" }));

    // Show different message for HEIC files
    if (file.type === "image/heic" || file.type === "image/heif") {
      setToast({
        message:
          "HEIC image selected. It will be converted to WebP when you submit the form.",
        type: "success",
      });
    } else {
      setToast({
        message:
          "Image selected. It will be uploaded when you submit the form.",
        type: "success",
      });
    }
  }

  async function uploadImageFile(file: File): Promise<string> {
    setUploadingImage(true);
    try {
      // Get original file size
      const originalSize = formatFileSize(file.size);

      // Optimize image on client-side before upload
      const optimizedFile = await optimizeImageClient(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85,
        format: "webp",
      });

      // Get optimized file size
      const optimizedSize = formatFileSize(optimizedFile.size);
      const reduction = Math.round(
        ((file.size - optimizedFile.size) / file.size) * 100,
      );

      // Set optimized file size for display
      setOptimizedFileSize(optimizedSize);

      // Upload optimized image
      const formData = new FormData();
      formData.append("file", optimizedFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setToast({
          message: `Image uploaded! Reduced ${originalSize} → ${optimizedSize} (${reduction}% smaller)`,
          type: "success",
        });
        return data.url;
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Validate form
    const validation = validateGameForm(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      setToast({ message: "Please fix the errors in the form", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      let finalFormData = { ...formData };

      // Compute gameAvailableStocks from variant stocks
      finalFormData.gameAvailableStocks =
        (finalFormData.stockWithCase || 0) +
        (finalFormData.stockCartridgeOnly || 0);

      // Upload image if a new one was selected
      if (selectedImageFile) {
        if (
          selectedImageFile.type === "image/heic" ||
          selectedImageFile.type === "image/heif"
        ) {
          setToast({
            message: "Converting HEIC image to WebP...",
            type: "success",
          });
        } else {
          setToast({ message: "Uploading image...", type: "success" });
        }
        const imageUrl = await uploadImageFile(selectedImageFile);
        finalFormData.gameImageURL = imageUrl;

        // Clean up the preview URL
        if (imagePreviewUrl) {
          URL.revokeObjectURL(imagePreviewUrl);
          setImagePreviewUrl("");
        }
      }

      const url =
        mode === "create"
          ? "/api/games"
          : `/api/games/${initialData?.gameBarcode}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalFormData),
      });

      const data = await response.json();

      if (response.ok) {
        setToast({
          message: `Game ${mode === "create" ? "added" : "updated"} successfully!`,
          type: "success",
        });
        setTimeout(() => {
          onSuccess(data.game);
        }, 1000);
      } else {
        setToast({ message: data.error || "Operation failed", type: "error" });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setToast({ message: "An error occurred", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Game Image *
          </label>
          <div className="flex items-start space-x-4">
            {imagePreview && (
              <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-gray-200">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
                {optimizedFileSize && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center">
                    {optimizedFileSize}
                  </div>
                )}
                {selectedImageFile && (
                  <div className="absolute top-1 right-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImageFile(null);
                        setImagePreview(initialData?.gameImageURL || "");
                        setImagePreviewUrl("");
                        setOptimizedFileSize(
                          initialData?.gameImageURL ? "Existing image" : "",
                        );
                        setFormData((prev) => ({
                          ...prev,
                          gameImageURL: initialData?.gameImageURL || "",
                        }));
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 text-xs"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            )}
            <div className="flex-1">
              <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl border-2 border-gray-300 transition-colors duration-300">
                <HiUpload className="w-5 h-5 text-black" />
                <span className="font-medium text-black">
                  {uploadingImage
                    ? "Uploading..."
                    : selectedImageFile
                      ? "Change Image"
                      : "Select Image"}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageSelection}
                  className="hidden"
                  disabled={isLoading || uploadingImage}
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">
                <strong>Accepted formats:</strong> JPG, PNG, WebP only. Max 5MB.
                <br />
                <span className="text-orange-600 font-medium">
                  Note: HEIC files from iPhone/iPad are not supported. Please
                  convert to JPEG or PNG before uploading.
                </span>
                <br />
                Images will be automatically optimized to WebP format when you
                submit the form.
              </p>
            </div>
          </div>
          {errors.gameImageURL && (
            <p className="text-sm text-lameRed mt-1">{errors.gameImageURL}</p>
          )}
        </div>

        {/* Game Title */}
        <div>
          <label
            htmlFor="gameTitle"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Game Title *
          </label>
          <input
            id="gameTitle"
            name="gameTitle"
            type="text"
            value={formData.gameTitle}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-xl border-2 ${
              errors.gameTitle ? "border-lameRed" : "border-gray-200"
            } focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all duration-300 text-black`}
            placeholder="Super Mario Odyssey"
          />
          {errors.gameTitle && (
            <p className="text-sm text-lameRed mt-1">{errors.gameTitle}</p>
          )}
        </div>

        {/* Platform (Multi-select Checkboxes) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Platform *
          </label>
          <div className="space-y-2">
            {PLATFORMS.map((platform) => (
              <label
                key={platform}
                className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-colors duration-300"
              >
                <input
                  type="checkbox"
                  checked={(formData.gamePlatform as string[]).includes(
                    platform,
                  )}
                  onChange={() => handlePlatformChange(platform)}
                  className="w-5 h-5 text-funBlue rounded focus:ring-2 focus:ring-funBlue/20 "
                />
                <span className="font-medium text-gray-700">{platform}</span>
              </label>
            ))}
          </div>
          {errors.gamePlatform && (
            <p className="text-sm text-lameRed mt-1">{errors.gamePlatform}</p>
          )}
        </div>

        {/* Grid for Ratings, Category, Class */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Rating */}
          <div>
            <label
              htmlFor="gameRatings"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Rating *
            </label>
            <select
              id="gameRatings"
              name="gameRatings"
              value={formData.gameRatings}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-xl border-2 ${
                errors.gameRatings ? "border-lameRed" : "border-gray-200"
              } focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all duration-300 text-black`}
            >
              <option value="">Select rating</option>
              {RATINGS.map((rating) => (
                <option key={rating} value={rating}>
                  {rating}
                </option>
              ))}
            </select>
            {errors.gameRatings && (
              <p className="text-sm text-lameRed mt-1">{errors.gameRatings}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="gameCategory"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Category *
            </label>
            <select
              id="gameCategory"
              name="gameCategory"
              value={formData.gameCategory}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-xl border-2 ${
                errors.gameCategory ? "border-lameRed" : "border-gray-200"
              } focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all duration-300 text-black`}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.gameCategory && (
              <p className="text-sm text-lameRed mt-1">{errors.gameCategory}</p>
            )}
          </div>

          {/* Class (Optional) */}
          <div>
            <label
              htmlFor="class"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Class
            </label>
            <select
              id="class"
              name="class"
              value={formData.class}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all duration-300 text-black"
            >
              <option value="">None</option>
              {CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Barcode */}
        <div>
          <label
            htmlFor="gameBarcode"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Barcode * (10-13 digits)
          </label>
          <input
            id="gameBarcode"
            name="gameBarcode"
            type="text"
            value={formData.gameBarcode}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-xl border-2 ${
              errors.gameBarcode ? "border-lameRed" : "border-gray-200"
            } focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all duration-300 text-black`}
            placeholder="045496590745"
            maxLength={13}
          />
          {errors.gameBarcode && (
            <p className="text-sm text-lameRed mt-1">{errors.gameBarcode}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="gameDescription"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Description *
          </label>
          <textarea
            id="gameDescription"
            name="gameDescription"
            value={formData.gameDescription}
            onChange={handleInputChange}
            rows={4}
            className={`w-full px-4 py-3 rounded-xl border-2 ${
              errors.gameDescription ? "border-lameRed" : "border-gray-200"
            } focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all duration-300 text-black`}
            placeholder="Enter game description..."
          />
          {errors.gameDescription && (
            <p className="text-sm text-lameRed mt-1">
              {errors.gameDescription}
            </p>
          )}
        </div>

        {/* Grid for Price, Release Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Price */}
          <div>
            <label
              htmlFor="gamePrice"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Original Price (₱) *
            </label>
            <input
              id="gamePrice"
              name="gamePrice"
              type="number"
              value={formData.gamePrice}
              onChange={handleInputChange}
              min="0"
              step="1"
              className={`w-full px-4 py-3 rounded-xl border-2 ${
                errors.gamePrice ? "border-lameRed" : "border-gray-200"
              } focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all duration-300 text-black`}
              placeholder="2899"
            />
            {errors.gamePrice && (
              <p className="text-sm text-lameRed mt-1">{errors.gamePrice}</p>
            )}
          </div>

          {/* Stock Variants */}
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Stock Management *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Stock With Case */}
              <div>
                <label
                  htmlFor="stockWithCase"
                  className="block text-xs font-medium text-gray-600 mb-1"
                >
                  Stock (With Case) *
                </label>
                <input
                  id="stockWithCase"
                  name="stockWithCase"
                  type="number"
                  value={formData.stockWithCase}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.stockWithCase ? "border-lameRed" : "border-gray-200"
                  } focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all duration-300 text-black`}
                  placeholder="0"
                />
                {errors.stockWithCase && (
                  <p className="text-sm text-lameRed mt-1">
                    {errors.stockWithCase}
                  </p>
                )}
              </div>

              {/* Stock Cartridge Only */}
              <div>
                <label
                  htmlFor="stockCartridgeOnly"
                  className="block text-xs font-medium text-gray-600 mb-1"
                >
                  Stock (Cartridge Only) *
                </label>
                <input
                  id="stockCartridgeOnly"
                  name="stockCartridgeOnly"
                  type="number"
                  value={formData.stockCartridgeOnly}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.stockCartridgeOnly
                      ? "border-lameRed"
                      : "border-gray-200"
                  } focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all duration-300 text-black`}
                  placeholder="0"
                />
                {errors.stockCartridgeOnly && (
                  <p className="text-sm text-lameRed mt-1">
                    {errors.stockCartridgeOnly}
                  </p>
                )}
              </div>
            </div>

            {/* Combined Total and Cartridge Price Display */}
            <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Total Stock:</span>
                <span className="font-bold text-gray-900">
                  {formData.stockWithCase + formData.stockCartridgeOnly} units
                </span>
              </div>
              {formData.gamePrice > 0 && (
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    Cartridge Only Price:
                  </span>
                  <span className="font-bold text-funBlue">
                    ₱{(formData.gamePrice - 100).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Release Date */}
          <div>
            <label
              htmlFor="gameReleaseDate"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Release Date *
            </label>
            <input
              id="gameReleaseDate"
              name="gameReleaseDate"
              type="date"
              value={formData.gameReleaseDate}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-xl border-2 ${
                errors.gameReleaseDate ? "border-lameRed" : "border-gray-200"
              } focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all duration-300 text-black`}
            />
            {errors.gameReleaseDate && (
              <p className="text-sm text-lameRed mt-1">
                {errors.gameReleaseDate}
              </p>
            )}
          </div>
        </div>

        {/* Sale Section */}
        <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50">
          <div className="flex items-center space-x-3 mb-4">
            <input
              type="checkbox"
              name="isOnSale"
              checked={formData.isOnSale}
              onChange={handleInputChange}
              className="w-5 h-5 text-funBlue rounded focus:ring-2 focus:ring-funBlue/20"
            />
            <label
              htmlFor="isOnSale"
              className="text-lg font-bold text-gray-900 cursor-pointer"
            >
              Put this game on sale
            </label>
          </div>
          {formData.isOnSale && (
            <div className="mt-4 pl-8 border-l-4 border-funBlue">
              <div>
                <label
                  htmlFor="salePrice"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Sale Price (₱) *
                </label>
                <input
                  id="salePrice"
                  name="salePrice"
                  type="number"
                  value={formData.salePrice}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  className={`w-full max-w-md px-4 py-3 rounded-xl border-2 ${
                    errors.salePrice ? "border-lameRed" : "border-gray-200"
                  } focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all duration-300 text-black`}
                  placeholder="2399"
                />
                {errors.salePrice && (
                  <p className="text-sm text-lameRed mt-1">
                    {errors.salePrice}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Sale price must be less than the original price (₱
                  {formData.gamePrice.toLocaleString()})
                </p>
                {formData.salePrice > 0 && formData.gamePrice > 0 && (
                  <p className="text-sm text-green-600 font-semibold mt-2">
                    Savings: ₱
                    {(formData.gamePrice - formData.salePrice).toLocaleString()}{" "}
                    (
                    {Math.round(
                      ((formData.gamePrice - formData.salePrice) /
                        formData.gamePrice) *
                        100,
                    )}
                    % off)
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Optional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Number of Sold */}
          <div>
            <label
              htmlFor="numberOfSold"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Number of Sold (Optional)
            </label>
            <input
              id="numberOfSold"
              name="numberOfSold"
              type="number"
              value={formData.numberOfSold}
              onChange={handleInputChange}
              min="0"
              step="1"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all duration-300 text-black"
              placeholder="0"
            />
          </div>

          {/* Tradable Checkbox */}
          <div className="flex items-center h-full pt-8">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="tradable"
                checked={formData.tradable}
                onChange={handleInputChange}
                className="w-5 h-5 text-funBlue rounded focus:ring-2 focus:ring-funBlue/20"
              />
              <span className="font-medium text-gray-700">Tradable</span>
            </label>
          </div>
        </div>

        {/* Rental Options */}
        <div className="border-t-2 border-gray-200 pt-6">
          <div className="flex items-center space-x-3 mb-4">
            <input
              type="checkbox"
              name="rentalAvailable"
              checked={formData.rentalAvailable}
              onChange={handleInputChange}
              className="w-5 h-5 text-funBlue rounded focus:ring-2 focus:ring-funBlue/20"
            />
            <label className="font-semibold text-gray-700">
              Available for Rental
            </label>
          </div>

          {formData.rentalAvailable && (
            <div>
              <label
                htmlFor="rentalWeeklyRate"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Weekly Rental Rate (₱) *
              </label>
              <input
                id="rentalWeeklyRate"
                name="rentalWeeklyRate"
                type="number"
                value={formData.rentalWeeklyRate}
                onChange={handleInputChange}
                min="0"
                step="1"
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.rentalWeeklyRate ? "border-lameRed" : "border-gray-200"
                } focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all duration-300 text-black`}
                placeholder="300"
              />
              {errors.rentalWeeklyRate && (
                <p className="text-sm text-lameRed mt-1">
                  {errors.rentalWeeklyRate}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t-2 border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-xl border-2 border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition-colors duration-300"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || uploadingImage}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-funBlue to-blue-500 text-white font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? "Saving..."
              : mode === "create"
                ? "Add Game"
                : "Update Game"}
          </button>
        </div>
      </form>
    </div>
  );
}
