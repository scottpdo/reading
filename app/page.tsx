"use client";

import { useState, useRef, useEffect } from "react";
import { useLetterGameLogic } from "./hooks/useLetterGameLogic";
import { useDragAndDropMechanics } from "./hooks/useDragAndDropMechanics";
import { LetterPool } from "./components/LetterPool";
import { DropSlot } from "./components/DropSlot";
import { FloatingLetter } from "./components/FloatingLetter";
import { SuccessModal } from "./components/SuccessModal";
import { WinModal } from "./components/WinModal";
import { ReplayButton } from "./components/ReplayButton";
import { CaseToggleButton } from "./components/CaseToggleButton";
import { SlotIndex, Letter } from "./types/game";

export default function Home() {
  // Game started state
  const [hasStarted, setHasStarted] = useState(false);

  // Letter case state
  const [isUppercase, setIsUppercase] = useState(true);

  // Track client-side hydration to avoid SSR mismatch
  const [isMounted, setIsMounted] = useState(false);

  // Game logic hook
  const gameLogic = useLetterGameLogic();

  // Set mounted state after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // UI feedback state (moved from hooks to integration layer)
  const [showError, setShowError] = useState<SlotIndex | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Audio refs
  const introAudioRef = useRef<HTMLAudioElement | null>(null);
  const wordAudioRef = useRef<HTMLAudioElement | null>(null);
  const chimeAudioRef = useRef<HTMLAudioElement | null>(null);
  const fanfareAudioRef = useRef<HTMLAudioElement | null>(null);
  const errorAudioRef = useRef<HTMLAudioElement | null>(null);

  // Track if intro audio is playing (to disable replay button)
  const [isIntroPlaying, setIsIntroPlaying] = useState(false);

  // Get current word as string for audio filename
  const currentWordString = gameLogic.currentWord.join("").toLowerCase();

  // Update word audio source when word changes
  useEffect(() => {
    if (wordAudioRef.current) {
      wordAudioRef.current.src = `/audio/words/${currentWordString}.mp3`;
      wordAudioRef.current.load();
    }
  }, [currentWordString]);

  // Play audio sequence when word changes (only after game has started)
  useEffect(() => {
    if (!hasStarted) return;

    const playAudioSequence = async () => {
      try {
        // Play "now spell the word" first
        if (introAudioRef.current) {
          setIsIntroPlaying(true);
          await introAudioRef.current.play();
          // Wait for intro to finish
          await new Promise((resolve) => {
            if (introAudioRef.current) {
              introAudioRef.current.onended = resolve;
            }
          });
          setIsIntroPlaying(false);
        }

        // Then play the word audio
        if (wordAudioRef.current) {
          await wordAudioRef.current.play();
        }
      } catch (error) {
        console.error("Error playing audio:", error);
        setIsIntroPlaying(false);
      }
    };

    playAudioSequence();
  }, [gameLogic.gameState.currentWordIndex, hasStarted]);

  // Play fanfare when game is complete
  useEffect(() => {
    if (gameLogic.gameState.isGameComplete && fanfareAudioRef.current) {
      fanfareAudioRef.current.currentTime = 0;
      fanfareAudioRef.current.play().catch(err => console.error("Error playing fanfare sound:", err));
    }
  }, [gameLogic.gameState.isGameComplete]);

  // Handle start button click
  const handleStart = () => {
    setHasStarted(true);
  };

  // Handle replay audio button click
  const handleReplayAudio = () => {
    if (wordAudioRef.current && !isIntroPlaying) {
      wordAudioRef.current.currentTime = 0;
      wordAudioRef.current.play().catch(err => console.error("Error replaying word audio:", err));
    }
  };

  // Handle case toggle button click
  const handleCaseToggle = () => {
    setIsUppercase(prev => !prev);
  };

  // Drop handler for drag mechanics
  const handleDropAttempt = (letter: Letter, targetSlot: SlotIndex) => {
    const result = gameLogic.attemptPlacement(letter, targetSlot);

    if (!result.success) {
      // Play error sound
      if (errorAudioRef.current) {
        errorAudioRef.current.currentTime = 0;
        errorAudioRef.current.play().catch(err => console.error("Error playing error sound:", err));
      }

      // Clear previous error timeout
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);

      // Show error animation
      setShowError(targetSlot);
      errorTimeoutRef.current = setTimeout(() => setShowError(null), 500);

      return { accepted: false };
    }

    // Success handling
    if (result.type === 'word-completed') {
      // Always play chime for word completion (including word 10)
      if (chimeAudioRef.current) {
        chimeAudioRef.current.currentTime = 0;
        chimeAudioRef.current.play().catch(err => console.error("Error playing chime sound:", err));
      }

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
    canDragFrom: (letter) => !gameLogic.isSlotSource(letter),
    activeSlot: gameLogic.gameState.currentPosition
  });

  // Reset wrapper
  const resetGame = () => {
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    setShowError(null);
    setShowSuccess(false);
    gameLogic.resetGame();
  };

  // Show start screen if game hasn't started
  if (!hasStarted) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4 bg-gray-900">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-8">Spell the Words</h1>
          <p className="text-2xl text-gray-300 mb-12">
            Listen and spell simple three-letter words
          </p>
          <button
            onClick={handleStart}
            className="px-12 py-6 bg-blue-600 text-white text-3xl font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Start Game
          </button>
        </div>

        {/* Hidden audio elements (preload) - only render after hydration */}
        {isMounted && (
          <>
            <audio
              ref={introAudioRef}
              src="/audio/words/now-spell-the-word.mp3"
              preload="auto"
            />
            <audio
              ref={wordAudioRef}
              src={`/audio/words/${currentWordString}.mp3`}
              preload="auto"
            />
            <audio
              ref={chimeAudioRef}
              src="/audio/effects/chime.mp3"
              preload="auto"
            />
            <audio
              ref={fanfareAudioRef}
              src="/audio/effects/fanfare.mp3"
              preload="auto"
            />
            <audio
              ref={errorAudioRef}
              src="/audio/effects/error.mp3"
              preload="auto"
            />
          </>
        )}
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-gray-900">
      <div className="w-full max-w-4xl h-[80vh] flex items-center justify-between gap-8 px-8">
        <div style={{ textTransform: isUppercase ? 'uppercase' : 'lowercase' }}>
          <LetterPool
            letters={gameLogic.availableLetters}
            onDragStart={dragMechanics.handleDragStart}
            onDragEnd={dragMechanics.handleDragEnd}
            onTouchStart={dragMechanics.handleTouchStart}
            onTouchMove={dragMechanics.handleTouchMove}
            onTouchEnd={dragMechanics.handleTouchEnd}
            onDrop={dragMechanics.handleDropToAvailable}
          />
        </div>

        <div className="flex flex-col items-center gap-6 flex-1 max-w-2xl">
          {/* Drop slots - container is the drop zone */}
          <div
            className="flex flex-row gap-6 justify-center"
            data-drop-container="true"
            onDragOver={dragMechanics.handleContainerDragOver}
            onDragLeave={dragMechanics.handleContainerDragLeave}
            onDrop={dragMechanics.handleContainerDrop}
            style={{ textTransform: isUppercase ? 'uppercase' : 'lowercase' }}
          >
            {gameLogic.slots.map((letterState, index) => (
              <DropSlot
                key={index}
                letter={letterState?.letter ?? null}
                slotIndex={index as SlotIndex}
                isHighlighted={dragMechanics.isDragOverContainer && gameLogic.gameState.currentPosition === index}
                isActive={gameLogic.gameState.currentPosition === index}
                showError={showError === index}
                isLocked={letterState?.isLocked ?? false}
                onDragStart={dragMechanics.handleDragStart}
                onDragEnd={dragMechanics.handleDragEnd}
                onTouchStart={dragMechanics.handleTouchStart}
                onTouchMove={dragMechanics.handleTouchMove}
                onTouchEnd={dragMechanics.handleTouchEnd}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Control buttons - fixed position in lower-right */}
      <div className="fixed bottom-8 right-8 flex gap-4">
        <ReplayButton onClick={handleReplayAudio} disabled={isIntroPlaying} />
        <CaseToggleButton isUppercase={isUppercase} onClick={handleCaseToggle} />
      </div>

      {dragMechanics.touchPosition && dragMechanics.draggingLetter && (
        <div style={{ textTransform: isUppercase ? 'uppercase' : 'lowercase' }}>
          <FloatingLetter
            letter={dragMechanics.draggingLetter}
            position={dragMechanics.touchPosition}
          />
        </div>
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

      {/* Hidden audio elements - only render after hydration */}
      {isMounted && (
        <>
          <audio
            ref={introAudioRef}
            src="/audio/words/now-spell-the-word.mp3"
            preload="auto"
          />
          <audio
            ref={wordAudioRef}
            src={`/audio/words/${currentWordString}.mp3`}
            preload="auto"
          />
          <audio
            ref={chimeAudioRef}
            src="/audio/effects/chime.mp3"
            preload="auto"
          />
          <audio
            ref={fanfareAudioRef}
            src="/audio/effects/fanfare.mp3"
            preload="auto"
          />
          <audio
            ref={errorAudioRef}
            src="/audio/effects/error.mp3"
            preload="auto"
          />
        </>
      )}
    </main>
  );
}
