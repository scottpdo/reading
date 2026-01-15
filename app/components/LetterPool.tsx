import { useState, useEffect } from "react";
import { Letter } from "../types/game";
import { DraggableLetter } from "./DraggableLetter";

interface LetterPoolProps {
  letters: Letter[];
  onDragStart: (letter: Letter) => void;
  onDragEnd: () => void;
  onTouchStart: (letter: Letter) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onDrop: (e: React.DragEvent) => void;
}

export function LetterPool({
  letters,
  onDragStart,
  onDragEnd,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onDrop,
}: LetterPoolProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayLetters, setDisplayLetters] = useState(letters);

  useEffect(() => {
    // Detect if letters have changed
    const lettersChanged =
      letters.length !== displayLetters.length ||
      letters.some((letter, idx) => letter !== displayLetters[idx]);

    if (lettersChanged) {
      // Start fade out
      setIsTransitioning(true);

      // After fade out, update letters and fade in
      const timeout = setTimeout(() => {
        setDisplayLetters(letters);
        setIsTransitioning(false);
      }, 150); // Half of the 300ms transition

      return () => clearTimeout(timeout);
    }
  }, [letters, displayLetters]);

  return (
    <div
      className="flex flex-col gap-4 justify-center min-h-[300px] min-w-[100px] p-4 rounded-lg border-2 border-gray-700 bg-gray-800/30"
      data-available-area
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <div
        className={`flex flex-col gap-4 transition-opacity duration-300 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        {displayLetters.map((letter, index) => (
          <DraggableLetter
            key={`${letter}-${index}`}
            letter={letter}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          />
        ))}
      </div>
    </div>
  );
}
