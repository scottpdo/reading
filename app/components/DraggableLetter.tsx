import { Letter } from "../types/game";

interface DraggableLetterProps {
  letter: Letter;
  onDragStart: (letter: Letter) => void;
  onDragEnd: () => void;
  onTouchStart: (letter: Letter) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  showBox?: boolean;
}

export function DraggableLetter({
  letter,
  onDragStart,
  onDragEnd,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  showBox = true,
}: DraggableLetterProps) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(letter)}
      onDragEnd={onDragEnd}
      onTouchStart={() => onTouchStart(letter)}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className={`
        ${showBox ? "w-20 h-20 bg-blue-600 rounded-lg shadow-lg" : ""}
        flex items-center justify-center text-white text-4xl font-bold
        cursor-move touch-none select-none active:scale-95 transition-transform
      `}
    >
      {letter}
    </div>
  );
}
