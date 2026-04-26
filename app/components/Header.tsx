"use client";

interface HeaderProps {
  showNewBtn?: boolean;
  onNew?: () => void;
}

export default function Header({ showNewBtn, onNew }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur-md border-b border-warm-200/60">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <WaveIcon />
          </div>
          <span className="font-bold text-warm-800 text-[17px] tracking-tight">
            VoiceScribe
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {showNewBtn && (
            <button onClick={onNew} className="btn-secondary text-sm">
              <span className="text-base leading-none">+</span>
              新增轉錄
            </button>
          )}
          <div className="w-8 h-8 rounded-full bg-warm-200 flex items-center justify-center
                          text-warm-700 font-semibold text-sm cursor-pointer
                          hover:bg-warm-300 transition-colors">
            王
          </div>
        </div>
      </div>
    </header>
  );
}

function WaveIcon() {
  return (
    <svg viewBox="0 0 20 14" className="w-5 h-4 fill-white">
      <rect x="0" y="5" width="3" height="4" rx="1.5" />
      <rect x="4.5" y="2" width="3" height="10" rx="1.5" />
      <rect x="9" y="0" width="3" height="14" rx="1.5" />
      <rect x="13.5" y="3" width="3" height="8" rx="1.5" />
      <rect x="18" y="5" width="2" height="4" rx="1" />
    </svg>
  );
}
