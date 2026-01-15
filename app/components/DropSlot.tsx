import { Letter, SlotIndex } from "../types/game";
import { DraggableLetter } from "./DraggableLetter";

interface DropSlotProps {
  letter: Letter | null;
  slotIndex: SlotIndex;
  isHighlighted: boolean;
  isActive: boolean;
  showError: boolean;
  isLocked: boolean;
  // Only letter drag handlers (for letters already placed in slots)
  onDragStart: (letter: Letter) => void;
  onDragEnd: () => void;
  onTouchStart: (letter: Letter) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

export function DropSlot({
  letter,
  slotIndex,
  isHighlighted,
  isActive,
  showError,
  isLocked,
  onDragStart,
  onDragEnd,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: DropSlotProps) {
  return (
    <div
      data-slot-index={slotIndex}
      className={`
        w-20 h-20 rounded-lg flex items-center justify-center
        border-4 transition-all duration-300
        ${
          showError
            ? "border-solid border-red-500 bg-red-500/20 animate-shake"
            : isHighlighted
            ? "border-dashed border-yellow-400 bg-yellow-400/10"
            : isActive && !letter
            ? "border-dashed border-blue-400 bg-blue-400/10 animate-pulse"
            : "border-solid border-gray-600 bg-gray-800"
        }
      `}
    >
      {letter && (
        <DraggableLetter
          letter={letter}
          isLocked={isLocked}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          showBox={false}
        />
      )}
    </div>
  );
}
