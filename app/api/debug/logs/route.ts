import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(req: NextRequest) {
  // Check for admin password
  const { searchParams } = new URL(req.url);
  const password = searchParams.get("password");

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const logPath = join(process.cwd(), "app", "logs", "api.log");
    const logContent = await readFile(logPath, "utf-8");

    // Format logs for readability with newest first
    const lines = logContent.split("\n").filter((line) => line.trim() !== "");
    const reversedLines = lines.reverse();

    // Limit to last 200 lines
    const limitedLines = reversedLines.slice(0, 200);

    return new Response(limitedLines.join("\n"), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error reading logs:", error);
    return NextResponse.json({ error: "Failed to read logs" }, { status: 500 });
  }
}
