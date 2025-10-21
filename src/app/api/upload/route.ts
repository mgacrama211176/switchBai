import { NextRequest, NextResponse } from "next/server";
import { optimizeUploadedImage } from "@/lib/image-optimizer";
import { uploadImageToFirebase } from "@/lib/firebase";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, and WebP are allowed" },
        { status: 400 },
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400 },
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Optimize and convert to WebP (server-side optimization)
    const tempDir = "/tmp";
    const { filePath } = await optimizeUploadedImage(
      buffer,
      file.name,
      tempDir,
      {
        quality: 85,
        maxWidth: 1920,
        maxHeight: 1080,
      },
    );

    // Upload optimized image to Firebase Storage
    const timestamp = Date.now();
    const baseName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${baseName}-${timestamp}.webp`;

    const firebaseUrl = await uploadImageToFirebase(buffer, filename, "games");

    return NextResponse.json({
      success: true,
      url: firebaseUrl,
      filename,
      optimized: true,
      format: "webp",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload and optimize file" },
      { status: 500 },
    );
  }
}
