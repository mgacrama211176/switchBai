import { initializeApp, getApps } from "firebase/app";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const storage = getStorage(app);

/**
 * Upload an image file to Firebase Storage
 * @param file - File buffer or Blob
 * @param filename - Name for the file in storage
 * @param folder - Folder path in storage (default: "games")
 * @returns Promise with download URL
 */
export async function uploadImageToFirebase(
  file: Buffer | Blob,
  filename: string,
  folder: string = "games",
): Promise<string> {
  try {
    const storageRef = ref(storage, `${folder}/${filename}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading to Firebase Storage:", error);
    throw new Error("Failed to upload image to Firebase Storage");
  }
}

/**
 * Delete an image from Firebase Storage
 * @param url - Full download URL of the image
 * @returns Promise<void>
 */
export async function deleteImageFromFirebase(url: string): Promise<void> {
  try {
    // Extract the file path from the URL
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/o\/(.+)\?/);

    if (!pathMatch) {
      throw new Error("Invalid Firebase Storage URL");
    }

    const filePath = decodeURIComponent(pathMatch[1]);
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
  } catch (error) {
    console.error("Error deleting from Firebase Storage:", error);
    throw new Error("Failed to delete image from Firebase Storage");
  }
}

/**
 * Get download URL for a file in Firebase Storage
 * @param path - Path to the file in storage
 * @returns Promise with download URL
 */
export async function getImageDownloadURL(path: string): Promise<string> {
  try {
    const fileRef = ref(storage, path);
    return await getDownloadURL(fileRef);
  } catch (error) {
    console.error("Error getting download URL:", error);
    throw new Error("Failed to get download URL from Firebase Storage");
  }
}

/**
 * Extract file path from Firebase Storage URL
 * @param url - Full download URL
 * @returns File path in storage
 */
export function extractFilePathFromURL(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/o\/(.+)\?/);
    return pathMatch ? decodeURIComponent(pathMatch[1]) : null;
  } catch (error) {
    console.error("Error extracting file path from URL:", error);
    return null;
  }
}

export default storage;
