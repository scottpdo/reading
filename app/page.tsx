"use client";

import { useState, useRef } from "react";
import { useLetterGameLogic } from "./hooks/useLetterGameLogic";
import { useDragAndDropMechanics } from "./hooks/useDragAndDropMechanics";
import { LetterPool } from "./components/LetterPool";
import { DropSlot } from "./components/DropSlot";
import { FloatingLetter } from "./components/FloatingLetter";
import { SuccessModal } from "./components/SuccessModal";
import { WinModal } from "./components/WinModal";
import { SlotIndex, Letter } from "./types/game";

export default function Home() {
  // Game logic hook
  const gameLogic = useLetterGameLogic();

  // UI feedback state (moved from hooks to integration layer)
  const [showError, setShowError] = useState<SlotIndex | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Drop handler for drag mechanics
  const handleDropAttempt = (letter: Letter, targetSlot: SlotIndex) => {
    const result = gameLogic.attemptPlacement(letter, targetSlot);

    if (!result.success) {
      // Clear previous error timeout
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);

      // Show error animation
      setShowError(targetSlot);
      errorTimeoutRef.current = setTimeout(() => setShowError(null), 500);

      return { accepted: false };
    }

    // Success handling
    if (result.type === 'word-completed') {
      setShowSuccess(true);
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = setTimeout(() => {
        gameLogic.advanceToNextWord();
        setShowSuccess(false);
      }, 2000);
    }

    return { accepted: true };
  };

  // Drag mechanics hook
  const dragMechanics = useDragAndDropMechanics({
    onDrop: handleDropAttempt,
    canDragFrom: (letter) => !gameLogic.isSlotSource(letter)
  });

  // Reset wrapper
  const resetGame = () => {
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    setShowError(null);
    setShowSuccess(false);
    gameLogic.resetGame();
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-gray-900">
      <div className="w-full max-w-4xl h-[80vh] flex items-center justify-between gap-8 px-8">
        <LetterPool
          letters={gameLogic.availableLetters}
          onDragStart={dragMechanics.handleDragStart}
          onDragEnd={dragMechanics.handleDragEnd}
          onTouchStart={dragMechanics.handleTouchStart}
          onTouchMove={dragMechanics.handleTouchMove}
          onTouchEnd={dragMechanics.handleTouchEnd}
          onDrop={dragMechanics.handleDropToAvailable}
        />

        <div className="flex flex-row gap-6 justify-center flex-1 max-w-2xl">
          {gameLogic.slots.map((letterState, index) => (
            <DropSlot
              key={index}
              letter={letterState?.letter ?? null}
              slotIndex={index as SlotIndex}
              isHighlighted={dragMechanics.dragOverSlot === index}
              isActive={gameLogic.gameState.currentPosition === index}
              showError={showError === index}
              isLocked={letterState?.isLocked ?? false}
              onDragStart={dragMechanics.handleDragStart}
              onDragEnd={dragMechanics.handleDragEnd}
              onDragOver={dragMechanics.handleDragOver}
              onDragLeave={dragMechanics.handleDragLeave}
              onDrop={dragMechanics.handleDrop}
              onTouchStart={dragMechanics.handleTouchStart}
              onTouchMove={dragMechanics.handleTouchMove}
              onTouchEnd={dragMechanics.handleTouchEnd}
            />
          ))}
        </div>
      </div>

      {dragMechanics.touchPosition && dragMechanics.draggingLetter && (
        <FloatingLetter
          letter={dragMechanics.draggingLetter}
          position={dragMechanics.touchPosition}
        />
      )}

      <SuccessModal
        isOpen={showSuccess}
        completedWords={gameLogic.gameState.completedWords + 1}
        totalWords={10}
      />

      <WinModal
        isOpen={gameLogic.gameState.isGameComplete}
        onRestart={resetGame}
      />
    </main>
  );
}
