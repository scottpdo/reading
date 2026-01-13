import { Letter, SlotIndex } from "../types/game";
import { DraggableLetter } from "./DraggableLetter";

interface DropSlotProps {
  letter: Letter | null;
  slotIndex: SlotIndex;
  isHighlighted: boolean;
  onDragStart: (letter: Letter) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, slotIndex: SlotIndex) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, slotIndex: SlotIndex) => void;
  onTouchStart: (letter: Letter) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

export function DropSlot({
  letter,
  slotIndex,
  isHighlighted,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: DropSlotProps) {
  return (
    <div
      data-slot-index={slotIndex}
      onDragOver={(e) => onDragOver(e, slotIndex)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, slotIndex)}
      className={`
        w-20 h-20 rounded-lg flex items-center justify-center
        border-4 transition-all
        ${
          isHighlighted
            ? "border-dashed border-yellow-400 bg-yellow-400/10"
            : "border-solid border-gray-600 bg-gray-800"
        }
      `}
    >
      {letter && (
        <DraggableLetter
          letter={letter}
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
