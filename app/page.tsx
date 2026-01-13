"use client";

import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { LetterPool } from "./components/LetterPool";
import { DropSlot } from "./components/DropSlot";
import { FloatingLetter } from "./components/FloatingLetter";
import { SlotIndex } from "./types/game";

export default function Home() {
  const {
    slots,
    dragOverSlot,
    draggingLetter,
    touchPosition,
    availableLetters,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDropToAvailable,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useDragAndDrop();

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-gray-900">
      <div className="w-full max-w-4xl h-[80vh] flex items-center justify-between gap-8 px-8">
        <LetterPool
          letters={availableLetters}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDrop={handleDropToAvailable}
        />

        <div className="flex flex-row gap-6 justify-center flex-1 max-w-2xl">
          {slots.map((letter, index) => (
            <DropSlot
              key={index}
              letter={letter}
              slotIndex={index as SlotIndex}
              isHighlighted={dragOverSlot === index}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
          ))}
        </div>
      </div>

      {touchPosition && draggingLetter && (
        <FloatingLetter letter={draggingLetter} position={touchPosition} />
      )}
    </main>
  );
}
