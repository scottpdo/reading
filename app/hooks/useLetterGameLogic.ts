import { useState, useEffect } from "react";
import { Letter, SlotIndex, CVCWord, LetterState } from "../types/game";

// Word bank constant
const CVC_WORDS: CVCWord[] = [
  ["C", "A", "T"],
  ["D", "O", "G"],
  ["B", "A", "T"],
  ["R", "A", "T"],
  ["P", "I", "G"],
  ["B", "U", "G"],
  ["S", "U", "N"],
  ["R", "U", "N"],
  ["P", "E", "N"],
  ["H", "E", "N"],
];

// Shuffle function using Fisher-Yates algorithm
function shuffleWords(words: CVCWord[]): CVCWord[] {
  const shuffled = [...words];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Vowels and consonants
const VOWELS: Letter[] = ["A", "E", "I", "O", "U"];
const CONSONANTS: Letter[] = [
  "B", "C", "D", "F", "G", "H", "J", "K", "L", "M",
  "N", "P", "Q", "R", "S", "T", "V", "W", "X", "Y", "Z"
];

// Check if a letter is a vowel
function isVowel(letter: Letter): boolean {
  return VOWELS.includes(letter);
}

// Generate 2 random letters that aren't the correct one
// If correct letter is a vowel, ensure at least one distractor is also a vowel
function getRandomDistractors(correctLetter: Letter): [Letter, Letter] {
  const correctIsVowel = isVowel(correctLetter);

  if (correctIsVowel) {
    // Filter out the correct vowel from available vowels
    const availableVowels = VOWELS.filter(v => v !== correctLetter);

    // Pick one random vowel distractor
    const vowelIndex = Math.floor(Math.random() * availableVowels.length);
    const vowelDistractor = availableVowels[vowelIndex];

    // Pick one random consonant distractor
    const consonantIndex = Math.floor(Math.random() * CONSONANTS.length);
    const consonantDistractor = CONSONANTS[consonantIndex];

    // Randomly order the two distractors
    return Math.random() < 0.5
      ? [vowelDistractor, consonantDistractor]
      : [consonantDistractor, vowelDistractor];
  } else {
    // For consonants, pick any 2 letters (excluding the correct one)
    const allLetters = [...VOWELS, ...CONSONANTS].filter(l => l !== correctLetter);

    // Shuffle and take first 2
    for (let i = allLetters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allLetters[i], allLetters[j]] = [allLetters[j], allLetters[i]];
    }

    return [allLetters[0], allLetters[1]];
  }
}

export interface PlacementResult {
  success: boolean;
  type: 'invalid' | 'position-advanced' | 'word-completed';
  reason?: string;
}

interface GameLogicState {
  wordBank: CVCWord[];
  currentWordIndex: number;
  currentPosition: SlotIndex;
  completedWords: number;
  isGameComplete: boolean;
}

export function useLetterGameLogic() {
  // Initialize shuffled word bank once on mount
  const [gameState, setGameState] = useState<GameLogicState>(() => {
    const shuffled = shuffleWords(CVC_WORDS);
    return {
      wordBank: shuffled,
      currentWordIndex: 0,
      currentPosition: 0 as SlotIndex,
      completedWords: 0,
      isGameComplete: false,
    };
  });

  const [slots, setSlots] = useState<(LetterState | null)[]>([null, null, null]);

  // Compute current word and correct letter
  const currentWord = gameState.wordBank[gameState.currentWordIndex];
  const correctLetter = currentWord[gameState.currentPosition];

  // Store available letters in state to prevent re-randomization during strict mode
  const [availableLetters, setAvailableLetters] = useState<Letter[]>(() => {
    const [distractor1, distractor2] = getRandomDistractors(currentWord[0]);
    const letters = [currentWord[0], distractor1, distractor2];

    // Shuffle the letters so correct letter isn't always first
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }

    return letters;
  });

  // Update available letters when position changes
  useEffect(() => {
    const [distractor1, distractor2] = getRandomDistractors(correctLetter);
    const letters = [correctLetter, distractor1, distractor2];

    // Shuffle the letters so correct letter isn't always first
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }

    setAvailableLetters(letters);
  }, [gameState.currentWordIndex, gameState.currentPosition, correctLetter]);

  // Log current word for debugging (only on word change)
  useEffect(() => {
    console.log("Current word:", currentWord.join(""));
  }, [gameState.currentWordIndex]);

  // Check if letter is from a slot (for drag prevention)
  const isSlotSource = (letter: Letter): boolean => {
    return slots.some(s => s?.letter === letter);
  };

  // Attempt to place a letter in a slot
  const attemptPlacement = (letter: Letter, targetSlot: SlotIndex): PlacementResult => {
    // Can only place letter in the active position
    if (targetSlot !== gameState.currentPosition) {
      return {
        success: false,
        type: 'invalid',
        reason: `Must fill position ${gameState.currentPosition} first`
      };
    }

    // Check if letter matches
    const expectedLetter = currentWord[targetSlot];
    if (letter !== expectedLetter) {
      return {
        success: false,
        type: 'invalid',
        reason: `Expected ${expectedLetter}, got ${letter}`
      };
    }

    // Valid placement - lock the letter
    const newSlots = [...slots];
    newSlots[targetSlot] = { letter, isLocked: true };
    setSlots(newSlots);

    // Check if word is complete
    if (gameState.currentPosition === 2) {
      // All 3 positions filled - word complete!
      return {
        success: true,
        type: 'word-completed'
      };
    } else {
      // Move to next position
      const nextPosition = (gameState.currentPosition + 1) as SlotIndex;
      setGameState(prev => ({
        ...prev,
        currentPosition: nextPosition
      }));

      return {
        success: true,
        type: 'position-advanced'
      };
    }
  };

  // Advance to next word
  const advanceToNextWord = () => {
    const nextIndex = gameState.currentWordIndex + 1;

    if (nextIndex >= gameState.wordBank.length) {
      // Game complete!
      setGameState(prev => ({
        ...prev,
        isGameComplete: true,
      }));
    } else {
      // Next word
      setGameState(prev => ({
        ...prev,
        currentWordIndex: nextIndex,
        currentPosition: 0 as SlotIndex,
        completedWords: prev.completedWords + 1,
      }));
      setSlots([null, null, null]);
    }
  };

  // Reset game
  const resetGame = () => {
    const shuffled = shuffleWords(CVC_WORDS);
    setGameState({
      wordBank: shuffled,
      currentWordIndex: 0,
      currentPosition: 0 as SlotIndex,
      completedWords: 0,
      isGameComplete: false,
    });
    setSlots([null, null, null]);
  };

  return {
    // State
    gameState,
    availableLetters,
    slots,
    currentWord,

    // Actions
    attemptPlacement,
    advanceToNextWord,
    resetGame,
    isSlotSource,
  };
}
