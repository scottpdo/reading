import { Letter, TouchPosition } from "../types/game";

interface FloatingLetterProps {
  letter: Letter;
  position: TouchPosition;
}

export function FloatingLetter({ letter, position }: FloatingLetterProps) {
  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: position.x - 40,
        top: position.y - 40,
      }}
    >
      <div className="w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center text-white text-4xl font-bold shadow-2xl opacity-90">
        {letter}
      </div>
    </div>
  );
}
