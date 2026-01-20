#!/usr/bin/env node

/**
 * Generate audio files for all CVC words using Deepgram TTS API
 *
 * This script reads the CVC_WORDS array and generates an audio file for each word
 * using the default voice settings from generate-audio.js
 *
 * Usage:
 *   node scripts/generate-all-words.js
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

// Import CVC words - we'll read from the TypeScript file
// Since we can't import TypeScript directly, we'll define them here
const CVC_WORDS = [
  // Original words
  ["C", "A", "T"],
  ["D", "O", "G"],
  ["B", "A", "T"],
  ["R", "A", "T"],
  ["P", "I", "G"],
  ["B", "U", "G"],
  ["S", "U", "N"],
  ["R", "U", "N"],
  ["P", "E", "N"],
  ["H", "E", "N"],

  // Additional phonetic CVC words
  ["B", "E", "D"],
  ["R", "E", "D"],
  ["W", "E", "B"],
  ["P", "E", "T"],
  ["N", "E", "T"],
  ["J", "E", "T"],
  ["V", "E", "T"],
  ["M", "E", "N"],
  ["T", "E", "N"],
  ["B", "I", "G"],
  ["D", "I", "G"],
  ["F", "I", "G"],
  ["W", "I", "G"],
  ["B", "I", "N"],
  ["F", "I", "N"],
  ["P", "I", "N"],
  ["T", "I", "N"],
  ["W", "I", "N"],
  ["D", "I", "P"],
  ["H", "I", "P"],
  ["L", "I", "P"],
  ["R", "I", "P"],
  ["T", "I", "P"],
  ["Z", "I", "P"],
  ["B", "I", "T"],
  ["F", "I", "T"],
  ["H", "I", "T"],
  ["K", "I", "T"],
  ["P", "I", "T"],
  ["S", "I", "T"],
  ["B", "O", "X"],
  ["F", "O", "X"],
  ["C", "O", "T"],
  ["D", "O", "T"],
  ["G", "O", "T"],
  ["H", "O", "T"],
  ["L", "O", "T"],
  ["N", "O", "T"],
  ["P", "O", "T"],
  ["B", "O", "B"],
  ["C", "O", "B"],
  ["M", "O", "B"],
  ["S", "O", "B"],
  ["H", "O", "P"],
  ["M", "O", "P"],
  ["P", "O", "P"],
  ["T", "O", "P"],
  ["B", "U", "S"],
  ["G", "U", "S"],
  ["C", "U", "B"],
  ["H", "U", "B"],
  ["R", "U", "B"],
  ["T", "U", "B"],
  ["C", "U", "P"],
  ["P", "U", "P"],
  ["B", "U", "D"],
  ["M", "U", "D"],
  ["C", "U", "T"],
  ["G", "U", "T"],
  ["H", "U", "T"],
  ["N", "U", "T"],
  ["P", "U", "T"],
  ["R", "U", "T"],
  ["B", "U", "N"],
  ["F", "U", "N"],
  ["G", "U", "N"],
  ["M", "A", "D"],
  ["P", "A", "D"],
  ["S", "A", "D"],
  ["B", "A", "G"],
  ["G", "A", "G"],
  ["R", "A", "G"],
  ["T", "A", "G"],
  ["W", "A", "G"],
  ["C", "A", "B"],
  ["D", "A", "B"],
  ["G", "A", "B"],
  ["J", "A", "B"],
  ["N", "A", "B"],
  ["T", "A", "B"],
  ["C", "A", "M"],
  ["D", "A", "M"],
  ["H", "A", "M"],
  ["J", "A", "M"],
  ["R", "A", "M"],
  ["C", "A", "N"],
  ["F", "A", "N"],
  ["M", "A", "N"],
  ["P", "A", "N"],
  ["R", "A", "N"],
  ["T", "A", "N"],
  ["V", "A", "N"],
  ["C", "A", "P"],
  ["G", "A", "P"],
  ["L", "A", "P"],
  ["M", "A", "P"],
  ["N", "A", "P"],
  ["R", "A", "P"],
  ["S", "A", "P"],
  ["T", "A", "P"],
  ["Z", "A", "P"],
  ["F", "A", "T"],
  ["H", "A", "T"],
  ["M", "A", "T"],
  ["P", "A", "T"],
  ["S", "A", "T"],
  ["V", "A", "T"],
];

/**
 * Slugify text for use as a filename
 */
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Generate audio file using Deepgram TTS
 */
async function generateAudio(text, voice, index, total) {
  // Initialize Deepgram client
  const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

  // Generate filename
  const slug = slugify(text);
  const filename = `${slug}.mp3`;
  const outputPath = join(OUTPUT_DIR, filename);

  // Check if file already exists
  if (existsSync(outputPath)) {
    console.log(`[${index}/${total}] ⊘ Skipping "${text}" - file already exists`);
    return;
  }

  console.log(`[${index}/${total}] Generating audio for: "${text}"`);

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

    console.log(`[${index}/${total}] ✓ ${filename} (${(buffer.length / 1024).toFixed(2)} KB)`);
  } catch (error) {
    console.error(`[${index}/${total}] ✗ Error generating "${text}":`, error.message);
  }
}

/**
 * Main execution
 */
async function main() {
  // Check for API key
  if (!process.env.DEEPGRAM_API_KEY) {
    console.error("Error: DEEPGRAM_API_KEY not found in environment");
    console.error("Make sure your .env file contains DEEPGRAM_API_KEY");
    process.exit(1);
  }

  // Create output directory if it doesn't exist
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`Created directory: ${OUTPUT_DIR}\n`);
  }

  const voice = DEFAULT_VOICE;
  const total = CVC_WORDS.length;

  console.log(`Generating audio for ${total} words...`);
  console.log(`Voice model: ${voice}\n`);

  // Generate audio for each word
  for (let i = 0; i < CVC_WORDS.length; i++) {
    const word = CVC_WORDS[i].join("");
    await generateAudio(word, voice, i + 1, total);

    // Small delay to avoid rate limiting
    if (i < CVC_WORDS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log("\n✓ All audio files generated successfully!");
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
