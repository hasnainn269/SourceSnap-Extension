import React from 'react';
import { Bookmark, Download, BookOpen, Monitor, Sparkles, HelpCircle } from 'lucide-react';

interface NavbarProps {
  activeTab: 'simulator' | 'vault' | 'download' | 'guide';
  setActiveTab: (tab: 'simulator' | 'vault' | 'download' | 'guide') => void;
  snippetCount: number;
  onOpenQuickAdd: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  snippetCount,
  onOpenQuickAdd
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                <path d="M5 3C4.44772 3 4 3.44772 4 4V21L12 17.5L20 21V4C20 3.44772 19.5523 3 19 3H5Z" fill="#F59E0B" />
                <path d="M8.5 10.5L11 13L15.5 8" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-white">SourceSnap</span>
                <span className="hidden sm:inline-block text-[10px] tracking-wide uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                  Chrome Extension
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">Save it. Find it. Cite it.</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-[55%] sm:max-w-none py-1 scrollbar-none">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'simulator'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Live Simulator"
            >
              <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden md:inline">Live Simulator</span>
              <span className="md:hidden">Simulate</span>
            </button>

            <button
              onClick={() => setActiveTab('vault')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'vault'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Offline Library"
            >
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden md:inline">Offline Library</span>
              <span className="md:hidden">Library</span>
              <span className={`text-[10px] px-1 py-0.2 rounded-full font-bold ${
                activeTab === 'vault' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'
              }`}>
                {snippetCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('download')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'download'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Download & Install Extension"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden md:inline">Download & Install</span>
              <span className="md:hidden">Install</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'guide'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Visual Guide"
            >
              <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden md:inline">Guide</span>
              <span className="md:hidden">Guide</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
