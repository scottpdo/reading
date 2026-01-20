interface ReplayButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export function ReplayButton({ onClick, disabled }: ReplayButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-16 h-16 rounded-full text-3xl flex items-center justify-center transition-all ${
        disabled
          ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
          : 'bg-green-600 text-white hover:bg-green-700 hover:scale-110 active:scale-95 shadow-lg'
      }`}
      aria-label="Replay word audio"
    >
      🔊
    </button>
  );
}
