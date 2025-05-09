import { NextRequest, NextResponse } from "next/server";
import { writeFile, appendFile } from "fs/promises";
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

// Helper function to log messages
async function logMessage(message: string) {
  const logPath = join(process.cwd(), "app", "logs", "api.log");
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [UPLOAD] ${message}\n`;

  try {
    await appendFile(logPath, logEntry);
  } catch (error) {
    console.error("Failed to write to log file:", error);
  }

  console.log(`[UPLOAD] ${message}`);
}

export async function POST(request: NextRequest) {
  await logMessage(`Received image upload request from ${request.url}`);

  const data = await request.formData();
  const file: File | null = data.get("file") as unknown as File;

  if (!file) {
    await logMessage("Error: No file provided in the request");
    return NextResponse.json(
      { success: false, error: "No file provided." },
      { status: 400 }
    );
  }

  await logMessage(
    `Processing file: ${file.name}, size: ${file.size}, type: ${file.type}`
  );

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate a unique filename
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;

  // Define the path to the public/uploads directory
  const uploadsDir = join(process.cwd(), "public", "uploads");
  const path = join(uploadsDir, filename);

  try {
    // Ensure the uploads directory exists
    await ensureDir(uploadsDir);
    await logMessage(`Uploads directory ensured at: ${uploadsDir}`);

    // Write the file to the public/uploads directory
    await writeFile(path, buffer);
    await logMessage(`File uploaded successfully to ${path}`);

    // Construct the public URL for the image
    const imageUrl = `/uploads/${filename}`;
    const fullUrl = `${request.nextUrl.origin}${imageUrl}`;

    await logMessage(`Generated image URL: ${imageUrl}`);
    await logMessage(`Full absolute URL: ${fullUrl}`);

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      fullUrl: fullUrl,
    });
  } catch (error) {
    await logMessage(`Error uploading file: ${error}`);
    // Attempt to clean up the partially written file if an error occurs
    try {
      await rm(path);
      await logMessage(`Cleaned up partial file at ${path}`);
    } catch (cleanupError) {
      await logMessage(`Error cleaning up file: ${cleanupError}`);
    }
    return NextResponse.json(
      { success: false, error: "Failed to upload file." },
      { status: 500 }
    );
  }
}
