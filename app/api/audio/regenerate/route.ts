import { exec } from "child_process";
import { promisify } from "util";
import { NextRequest, NextResponse } from "next/server";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voice = "aura-luna-en" } = body;

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // Build the command
    const command = `node scripts/generate-audio.js "${text.replace(/"/g, '\\"')}" --voice ${voice}`;

    console.log("Executing:", command);

    // Execute the script
    const { stdout, stderr } = await execAsync(command, {
      cwd: process.cwd(),
    });

    if (stderr) {
      console.error("Script stderr:", stderr);
    }

    if (stdout) {
      console.log("Script stdout:", stdout);
    }

    // Generate the expected filename
    const slug = text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    return NextResponse.json({
      success: true,
      message: "Audio regenerated successfully",
      filename: `${slug}.mp3`,
      path: `/audio/words/${slug}.mp3`,
    });
  } catch (error) {
    console.error("Error regenerating audio:", error);

    return NextResponse.json(
      {
        error: "Failed to regenerate audio",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
