export type Letter =
  | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I"
  | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R"
  | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z";

export type SlotIndex = 0 | 1 | 2;

export interface TouchPosition {
  x: number;
  y: number;
}

export type CVCWord = [Letter, Letter, Letter];

export interface GameState {
  wordBank: CVCWord[];
  currentWordIndex: number;
  currentPosition: SlotIndex;
  completedWords: number;
  isGameComplete: boolean;
  showSuccess: boolean;
  showError: SlotIndex | null;
}

export interface LetterState {
  letter: Letter;
  isLocked: boolean;
}

// Drag-and-drop callback types
export type DropHandler = (
  letter: Letter,
  targetSlot: SlotIndex
) => { accepted: boolean };

export type CanDragFrom = (letter: Letter) => boolean;
