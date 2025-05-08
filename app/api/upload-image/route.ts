import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { stat, mkdir, rm } from "fs/promises";

// Helper function to ensure a directory exists
async function ensureDir(dirPath: string) {
  try {
    await stat(dirPath);
  } catch (e: any) {
    if (e.code === "ENOENT") {
      await mkdir(dirPath, { recursive: true });
    } else {
      throw e;
    }
  }
}

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get("file") as unknown as File;

  if (!file) {
    return NextResponse.json(
      { success: false, error: "No file provided." },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate a unique filename
  const filename = `${Date.now()}-${file.name.replace(/\\s+/g, "_")}`;

  // Define the path to the public/uploads directory
  const uploadsDir = join(process.cwd(), "public", "uploads");
  const path = join(uploadsDir, filename);

  try {
    // Ensure the uploads directory exists
    await ensureDir(uploadsDir);

    // Write the file to the public/uploads directory
    await writeFile(path, buffer);
    console.log(`File uploaded to ${path}`);

    // Construct the public URL for the image
    const imageUrl = `/uploads/${filename}`;

    return NextResponse.json({ success: true, imageUrl: imageUrl });
  } catch (error) {
    console.error("Error uploading file:", error);
    // Attempt to clean up the partially written file if an error occurs
    try {
      await rm(path);
    } catch (cleanupError) {
      console.error("Error cleaning up file:", cleanupError);
    }
    return NextResponse.json(
      { success: false, error: "Failed to upload file." },
      { status: 500 }
    );
  }
}
