#!/usr/bin/env node

/**
 * Generate audio files from text using Deepgram TTS API
 *
 * Usage:
 *   node scripts/generate-audio.js "text to speak"
 *   node scripts/generate-audio.js "text to speak" --voice aura-asteria-en
 *
 * The audio file will be saved to public/audio/words/ with a slugified filename
 * Example: "One two three" -> public/audio/words/one-two-three.mp3
 */

import { config } from "dotenv";
import { createClient } from "@deepgram/sdk";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Load environment variables from .env file
config();

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const DEFAULT_VOICE = "aura-2-thalia-en";
const OUTPUT_DIR = join(__dirname, "..", "public", "audio", "words");

/**
 * Slugify text for use as a filename
 * Example: "One two three" -> "one-two-three"
 */
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-")      // Replace spaces with hyphens
    .replace(/-+/g, "-");       // Replace multiple hyphens with single hyphen
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Error: No text provided");
    console.error("Usage: node scripts/generate-audio.js \"text to speak\" [--voice model-name]");
    process.exit(1);
  }

  let text = args[0];
  let voice = DEFAULT_VOICE;

  // Check for --voice flag
  const voiceIndex = args.indexOf("--voice");
  if (voiceIndex !== -1 && args[voiceIndex + 1]) {
    voice = args[voiceIndex + 1];
  }

  return { text, voice };
}

/**
 * Generate audio file using Deepgram TTS
 */
async function generateAudio(text, voice) {
  // Check for API key
  if (!process.env.DEEPGRAM_API_KEY) {
    console.error("Error: DEEPGRAM_API_KEY not found in environment");
    console.error("Make sure your .env file contains DEEPGRAM_API_KEY");
    process.exit(1);
  }

  // Initialize Deepgram client
  const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

  // Create output directory if it doesn't exist
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`Created directory: ${OUTPUT_DIR}`);
  }

  // Generate filename
  const slug = slugify(text);
  const filename = `${slug}.mp3`;
  const outputPath = join(OUTPUT_DIR, filename);

  console.log(`Generating audio for: "${text}"`);
  console.log(`Voice model: ${voice}`);
  console.log(`Output file: ${filename}`);

  try {
    // Request TTS from Deepgram
    const response = await deepgram.speak.request(
      { text },
      {
        model: voice,
      }
    );

    // Get the audio stream
    const stream = await response.getStream();

    if (!stream) {
      throw new Error("No audio stream returned from Deepgram");
    }

    // Collect audio data
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    // Combine chunks into a single buffer
    const buffer = Buffer.concat(chunks);

    // Write to file
    await writeFile(outputPath, buffer);

    console.log(`✓ Audio file generated successfully: ${outputPath}`);
    console.log(`  File size: ${(buffer.length / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error("Error generating audio:");
    console.error(error.message);
    if (error.response) {
      console.error("API Response:", error.response);
    }
    process.exit(1);
  }
}

// Main execution
const { text, voice } = parseArgs();
await generateAudio(text, voice);
