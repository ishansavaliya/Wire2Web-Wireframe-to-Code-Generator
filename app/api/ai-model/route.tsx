import Constants from "@/data/Constants";
import { NextRequest } from "next/server";
import OpenAI from "openai";
import { join } from "path";
import { appendFile, readFile } from "fs/promises";
import { stat, mkdir } from "fs/promises";
import fs from "fs";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_AI_API_KEY,
});

export const maxDuration = 300;

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
  const logEntry = `[${timestamp}] [AI-MODEL] ${message}\n`;

  try {
    // Ensure the logs directory exists
    await ensureDir(join(process.cwd(), "app", "logs"));
    await appendFile(logPath, logEntry);
  } catch (error) {
    console.error("Failed to write to log file:", error);
  }

  console.log(`[AI-MODEL] ${message}`);
}

// Helper function to check if an image URL is accessible
async function isImageAccessible(url: string): Promise<boolean> {
  try {
    // If it's a local file path starting with /uploads/
    if (url.includes("/uploads/")) {
      const filePath = join(process.cwd(), "public", url);
      await logMessage(`Checking if local file exists: ${filePath}`);
      return fs.existsSync(filePath);
    }

    // Otherwise, try to fetch the image
    await logMessage(`Fetching remote URL to check accessibility: ${url}`);
    const response = await fetch(url, {
      method: "HEAD",
      headers: {
        Origin: "https://openrouter.ai",
      },
    });
    const success = response.ok;
    await logMessage(
      `Fetch result for ${url}: ${success ? "Accessible" : "Not Accessible"}`
    );
    return success;
  } catch (error) {
    await logMessage(`Error checking image accessibility for ${url}: ${error}`);
    return false;
  }
}

// Convert local file to base64
async function convertLocalImageToBase64(
  imagePath: string
): Promise<string | null> {
  try {
    const fullPath = join(process.cwd(), "public", imagePath);
    await logMessage(`Converting local image to base64: ${fullPath}`);

    if (!fs.existsSync(fullPath)) {
      await logMessage(`File does not exist: ${fullPath}`);
      return null;
    }

    const imageBuffer = await readFile(fullPath);
    const base64Image = imageBuffer.toString("base64");

    // Determine mime type based on file extension
    const extension = fullPath.split(".").pop()?.toLowerCase() || "";
    let mimeType = "image/jpeg"; // default

    if (extension === "png") mimeType = "image/png";
    else if (extension === "webp") mimeType = "image/webp";
    else if (extension === "gif") mimeType = "image/gif";

    return `data:${mimeType};base64,${base64Image}`;
  } catch (error) {
    await logMessage(`Error converting image to base64: ${error}`);
    return null;
  }
}

// Fetch and convert remote image to base64
async function fetchAndConvertToBase64(url: string): Promise<string | null> {
  try {
    await logMessage(`Fetching remote image for base64 conversion: ${url}`);
    const response = await fetch(url, {
      headers: {
        Origin: "https://openrouter.ai",
      },
    });

    if (!response.ok) {
      await logMessage(
        `Failed to fetch image: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    // Get content type from response headers
    const contentType = response.headers.get("content-type") || "image/jpeg";

    await logMessage(
      `Successfully converted remote image to base64 (${contentType})`
    );
    return `data:${contentType};base64,${base64Image}`;
  } catch (error) {
    await logMessage(`Error fetching and converting image: ${error}`);
    return null;
  }
}

export async function POST(req: NextRequest) {
  await logMessage(`Received AI model request from ${req.url}`);

  const { model, description, imageUrl } = await req.json();
  await logMessage(`Request params - Model: ${model}, Image URL: ${imageUrl}`);

  // Check if the image exists and is accessible
  const imageExists = await isImageAccessible(imageUrl);
  if (!imageExists) {
    await logMessage(`WARNING: Image at ${imageUrl} is not accessible!`);
  } else {
    await logMessage(`Image at ${imageUrl} is accessible`);
  }

  // Convert relative URL to absolute URL if it's a local image
  const absoluteImageUrl = imageUrl.startsWith("/")
    ? `${req.nextUrl.origin}${imageUrl}`
    : imageUrl;

  await logMessage(`Using absolute image URL: ${absoluteImageUrl}`);

  // Check if the absolute URL is accessible
  const absoluteImageExists = await isImageAccessible(absoluteImageUrl);
  if (!absoluteImageExists) {
    await logMessage(
      `WARNING: Absolute image URL at ${absoluteImageUrl} is not accessible!`
    );
  }

  // Determine the final image URL to use
  let finalImageUrl = absoluteImageUrl;

  // If the image is not accessible via URL, try to use base64 encoding
  if (!absoluteImageExists) {
    await logMessage(`Attempting to use base64 encoding instead of URL`);

    let base64Image = null;

    // Check if it's a local image
    if (imageUrl.startsWith("/")) {
      base64Image = await convertLocalImageToBase64(imageUrl);
    } else {
      // Try fetching the remote image
      base64Image = await fetchAndConvertToBase64(absoluteImageUrl);
    }

    if (base64Image) {
      finalImageUrl = base64Image;
      await logMessage(`Successfully switched to base64 encoded image`);
    } else {
      await logMessage(
        `CRITICAL: Could not access image via URL or base64 conversion!`
      );
    }
  }

  const ModelObj = Constants.AiModelList.find((item) => item.name == model);
  const modelName = ModelObj?.modelName;
  await logMessage(
    `Using model: ${modelName || "google/gemini-2.0-pro-exp-02-05:free"}`
  );

  try {
    const response = await openai.chat.completions.create({
      model: modelName ?? "google/gemini-2.0-pro-exp-02-05:free",
      stream: true,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: description,
            },
            {
              type: "image_url",
              image_url: {
                url: finalImageUrl,
              },
            },
          ],
        },
      ],
    });

    await logMessage(
      "OpenRouter API request successful, streaming response..."
    );

    // Create a readable stream to send data in real-time
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.choices?.[0]?.delta?.content || "";
            controller.enqueue(new TextEncoder().encode(text)); // Send data chunk
          }
          controller.close(); // End stream
          await logMessage("Stream completed successfully");
        } catch (error) {
          await logMessage(`Error during streaming: ${error}`);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    await logMessage(`Error making OpenRouter API call: ${error}`);
    return new Response(
      JSON.stringify({ error: `Failed to process request: ${error}` }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
