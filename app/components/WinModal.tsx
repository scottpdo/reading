interface WinModalProps {
  isOpen: boolean;
  onRestart: () => void;
}

export function WinModal({ isOpen, onRestart }: WinModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 text-center animate-bounce-in">
        <div className="text-8xl mb-4">🏆</div>
        <h2 className="text-4xl font-bold text-white mb-4">You Win!</h2>
        <p className="text-gray-300 text-xl mb-6">
          You completed all 10 words!
        </p>
        <button
          onClick={onRestart}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
