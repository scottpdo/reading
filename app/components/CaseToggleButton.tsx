interface CaseToggleButtonProps {
  isUppercase: boolean;
  onClick: () => void;
}

export function CaseToggleButton({ isUppercase, onClick }: CaseToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-16 h-16 rounded-full text-3xl font-bold flex items-center justify-center transition-all bg-purple-600 text-white hover:bg-purple-700 hover:scale-110 active:scale-95 shadow-lg"
      aria-label="Toggle letter case"
    >
      <span className="flex flex-row gap-0.5 leading-none">
        <span className={isUppercase ? 'opacity-100' : 'opacity-40'}>A</span>
        <span className={isUppercase ? 'opacity-40' : 'opacity-100'}>a</span>
      </span>
    </button>
  );
}
