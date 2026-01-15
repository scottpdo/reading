import { readdir } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const audioDir = join(process.cwd(), "public", "audio", "words");

    // Read all files in the directory
    const files = await readdir(audioDir);

    // Filter for audio files only
    const audioFiles = files
      .filter(file => file.endsWith(".mp3") || file.endsWith(".wav"))
      .map(file => ({
        name: file,
        path: `/audio/words/${file}`,
        // Remove extension and convert slug back to readable text
        displayName: file
          .replace(/\.(mp3|wav)$/, "")
          .replace(/-/g, " "),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ files: audioFiles });
  } catch (error) {
    // Directory might not exist yet
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({ files: [] });
    }

    console.error("Error listing audio files:", error);
    return NextResponse.json(
      { error: "Failed to list audio files" },
      { status: 500 }
    );
  }
}
