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
  return (
    <div
      className="flex flex-col gap-4 justify-center min-h-[300px] min-w-[100px] p-4 rounded-lg border-2 border-gray-700 bg-gray-800/30"
      data-available-area
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      {letters.map((letter) => (
        <DraggableLetter
          key={letter}
          letter={letter}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />
      ))}
    </div>
  );
}
