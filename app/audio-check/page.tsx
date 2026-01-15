"use client";

import { useEffect, useState, useRef } from "react";

interface AudioFile {
  name: string;
  path: string;
  displayName: string;
}

const VOICE_MODELS = [
  "aura-2-amalthea-en",
  "aura-2-andromeda-en",
  "aura-2-apollo-en",
  "aura-2-arcas-en",
  "aura-2-aries-en",
  "aura-2-asteria-en",
  "aura-2-athena-en",
  "aura-2-atlas-en",
  "aura-2-aurora-en",
  "aura-2-callista-en",
  "aura-2-cordelia-en",
  "aura-2-cora-en",
  "aura-2-delia-en",
  "aura-2-draco-en",
  "aura-2-electra-en",
  "aura-2-harmonia-en",
  "aura-2-helena-en",
  "aura-2-hera-en",
  "aura-2-hermes-en",
  "aura-2-hyperion-en",
  "aura-2-iris-en",
  "aura-2-janus-en",
  "aura-2-juno-en",
  "aura-2-jupiter-en",
  "aura-2-luna-en",
  "aura-2-mars-en",
  "aura-2-minerva-en",
  "aura-2-neptune-en",
  "aura-2-odysseus-en",
  "aura-2-ophelia-en",
  "aura-2-orion-en",
  "aura-2-orpheus-en",
  "aura-2-pandora-en",
  "aura-2-phoebe-en",
  "aura-2-pluto-en",
  "aura-2-saturn-en",
  "aura-2-selene-en",
  "aura-2-thalia-en",
  "aura-2-theia-en",
  "aura-2-vesta-en",
  "aura-2-zeus-en",
];

export default function AudioCheckPage() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingFile, setPlayingFile] = useState<string | null>(null);
  const [regeneratingFile, setRegeneratingFile] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<Record<string, string>>({});
  const [newText, setNewText] = useState("");
  const [newVoice, setNewVoice] = useState("aura-2-thalia-en");
  const [isGenerating, setIsGenerating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const loadAudioFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/audio/list");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load audio files");
      }

      setAudioFiles(data.files);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudioFiles();
  }, []);

  const handleDelete = async (filename: string) => {
    if (!confirm(`Delete ${filename}?`)) {
      return;
    }

    try {
      const response = await fetch(
        `/api/audio/delete?filename=${encodeURIComponent(filename)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete file");
      }

      // Refresh the list
      await loadAudioFiles();
    } catch (err) {
      alert(`Error: ${(err as Error).message}`);
    }
  };

  const handleRegenerate = async (file: AudioFile) => {
    const voice = selectedVoice[file.name] || "aura-2-thalia-en";

    setRegeneratingFile(file.name);

    try {
      const response = await fetch("/api/audio/regenerate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: file.displayName,
          voice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to regenerate file");
      }

      // Wait a moment for file to be written
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Refresh the list
      await loadAudioFiles();

      // If this file is currently playing, reload the audio
      if (playingFile === file.name) {
        setPlayingFile(null);
        // Add cache buster to force reload
        setTimeout(() => {
          setPlayingFile(file.name);
        }, 100);
      }
    } catch (err) {
      alert(`Error: ${(err as Error).message}`);
    } finally {
      setRegeneratingFile(null);
    }
  };

  const handlePlay = (filename: string) => {
    if (playingFile === filename) {
      audioRef.current?.pause();
      setPlayingFile(null);
    } else {
      setPlayingFile(filename);
    }
  };

  const handleVoiceChange = (filename: string, voice: string) => {
    setSelectedVoice((prev) => ({
      ...prev,
      [filename]: voice,
    }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newText.trim()) {
      alert("Please enter text to generate audio");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/audio/regenerate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: newText.trim(),
          voice: newVoice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate audio");
      }

      // Wait a moment for file to be written
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Clear form
      setNewText("");
      setNewVoice("aura-2-thalia-en");

      // Refresh the list
      await loadAudioFiles();
    } catch (err) {
      alert(`Error: ${(err as Error).message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading audio files...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="audio-check-container min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Audio Files Review
        </h1>

        {/* Generate New Audio Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Generate New Audio
          </h2>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label
                htmlFor="text"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Text to speak:
              </label>
              <input
                id="text"
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Enter text (e.g., cat, dog, one two three)"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                disabled={isGenerating}
              />
            </div>

            <div>
              <label
                htmlFor="voice"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Voice Model:
              </label>
              <select
                id="voice"
                value={newVoice}
                onChange={(e) => setNewVoice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                disabled={isGenerating}
              >
                {VOICE_MODELS.map((voice) => (
                  <option key={voice} value={voice}>
                    {voice}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isGenerating || !newText.trim()}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isGenerating ? "Generating..." : "Generate Audio"}
            </button>
          </form>
        </div>

        {audioFiles.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No audio files found. Use the form above to generate your first
            audio file.
          </div>
        ) : (
          <div className="space-y-4">
            {audioFiles.map((file) => (
              <div
                key={file.name}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {file.displayName}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">{file.name}</p>

                    {/* Audio Player */}
                    <div className="mb-4">
                      {playingFile === file.name && (
                        <audio
                          ref={audioRef}
                          src={`${file.path}?t=${Date.now()}`}
                          autoPlay
                          controls
                          onEnded={() => setPlayingFile(null)}
                          className="w-full"
                        />
                      )}
                    </div>

                    {/* Voice Selection */}
                    <div className="flex items-center gap-3 mb-4">
                      <label className="text-sm font-medium text-gray-700">
                        Voice Model:
                      </label>
                      <select
                        value={selectedVoice[file.name] || "aura-2-thalia-en"}
                        onChange={(e) =>
                          handleVoiceChange(file.name, e.target.value)
                        }
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      >
                        {VOICE_MODELS.map((voice) => (
                          <option key={voice} value={voice}>
                            {voice}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handlePlay(file.name)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        {playingFile === file.name ? "Stop" : "Play"}
                      </button>

                      <button
                        onClick={() => handleRegenerate(file)}
                        disabled={regeneratingFile === file.name}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {regeneratingFile === file.name
                          ? "Regenerating..."
                          : "Regenerate"}
                      </button>

                      <button
                        onClick={() => handleDelete(file.name)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
