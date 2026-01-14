interface SuccessModalProps {
  isOpen: boolean;
  completedWords: number;
  totalWords: number;
}

export function SuccessModal({
  isOpen,
  completedWords,
  totalWords,
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 text-center animate-bounce-in">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-white mb-2">Great Job!</h2>
        <p className="text-gray-300 text-lg">
          {completedWords} of {totalWords} words complete
        </p>
      </div>
    </div>
  );
}
