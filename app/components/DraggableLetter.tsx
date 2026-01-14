import { Letter } from "../types/game";

interface DraggableLetterProps {
  letter: Letter;
  isLocked?: boolean;
  onDragStart: (letter: Letter) => void;
  onDragEnd: () => void;
  onTouchStart: (letter: Letter) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  showBox?: boolean;
}

export function DraggableLetter({
  letter,
  isLocked = false,
  onDragStart,
  onDragEnd,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  showBox = true,
}: DraggableLetterProps) {
  return (
    <div
      draggable={!isLocked}
      onDragStart={isLocked ? undefined : () => onDragStart(letter)}
      onDragEnd={isLocked ? undefined : onDragEnd}
      onTouchStart={isLocked ? undefined : () => onTouchStart(letter)}
      onTouchMove={isLocked ? undefined : onTouchMove}
      onTouchEnd={isLocked ? undefined : onTouchEnd}
      className={`
        ${showBox ? "w-20 h-20 bg-blue-600 rounded-lg shadow-lg" : ""}
        flex items-center justify-center text-white text-4xl font-bold
        ${isLocked ? "cursor-default" : "cursor-move"}
        ${isLocked ? "opacity-100" : "active:scale-95"}
        touch-none select-none transition-transform
      `}
    >
      {letter}
    </div>
  );
}
