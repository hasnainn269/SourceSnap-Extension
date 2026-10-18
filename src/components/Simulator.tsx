import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Lock,
  Puzzle,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  BookOpen,
  ClipboardPaste,
  Info
} from 'lucide-react';
import { Snippet } from '../utils/citation.ts';
import { PopupView } from './PopupView.tsx';

interface SimulatorProps {
  snippets: Snippet[];
  onSaveSnippet: (snippet: Omit<Snippet, 'id' | 'createdAt'>) => void;
  onDeleteSnippet: (id: string) => void;
  onOpenVault: () => void;
  lastCopiedCitation?: string;
}

interface ArticlePreset {
  title: string;
  url: string;
  domain: string;
  heading: string;
  body: string;
  tags: string[];
}

const PRESETS: ArticlePreset[] = [
  {
    title: 'GeeksforGeeks',
    url: 'https://www.geeksforgeeks.org/vlan/',
    domain: 'geeksforgeeks.org',
    heading: 'What is VLAN?',
    body: `A VLAN (Virtual Local Area Network) is a logical segmentation of a physical network. It allows multiple networks to exist on the same physical infrastructure, improving security, performance and management.

Why Use VLANs?
1. Enhanced Security: By separating broadcast domains, sensitive data can be isolated between corporate departments without extra cabling.
2. Cost & Hardware Reduction: Eliminates the need for expensive distinct routers or physical switches for every subnetwork.
3. Higher Performance: Reduces broadcast traffic by confining packets to their specific logical VLAN group.
4. Simplified Administration: Group users by logical function or project rather than physical desk location.`,
    tags: ['Networking', 'CS']
  },
  {
    title: 'Wikipedia - Neural Networks',
    url: 'https://en.wikipedia.org/wiki/Artificial_neural_network',
    domain: 'en.wikipedia.org',
    heading: 'Artificial Neural Networks',
    body: `An artificial neural network (ANN) is a computational model inspired by the biological neural networks in animal brains. It consists of connected units or nodes called artificial neurons.

Each connection, like synapses in a biological brain, can transmit a signal to other neurons. An artificial neuron receives signals, processes them, and can signal neurons connected to it. Real-valued numbers characterize both signals and outputs, which are computed by non-linear activation functions.`,
    tags: ['AI', 'Computer Science']
  },
  {
    title: 'MDN Web Docs - Asynchronous JavaScript',
    url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous',
    domain: 'developer.mozilla.org',
    heading: 'Introducing Asynchronous JavaScript',
    body: `Asynchronous programming is a technique that enables your program to start a potentially long-running task and still be able to be responsive to other events while that task runs, rather than having to wait until that task has finished.

In modern web development, operations like fetching resources over the network, accessing local databases, or querying camera streams are inherently asynchronous to keep user interfaces smooth and non-blocking.`,
    tags: ['JavaScript', 'WebDev']
  }
];

export const Simulator: React.FC<SimulatorProps> = ({
  snippets,
  onSaveSnippet,
  onDeleteSnippet,
  onOpenVault,
  lastCopiedCitation
}) => {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [currentUrl, setCurrentUrl] = useState(PRESETS[0].url);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [hasBadgeNotification, setHasBadgeNotification] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [inPageToast, setInPageToast] = useState<string | null>(null);

  // Selection & context menu state
  const [selectedText, setSelectedText] = useState('');
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [floatingBtnPos, setFloatingBtnPos] = useState<{ x: number; y: number } | null>(null);

  // Live test notes / clipboard paste
  const [testNotes, setTestNotes] = useState(
    'My Study Notes & Assignment:\n---\n(Paste your copied citation here to verify how it looks!)'
  );

  const articleContainerRef = useRef<HTMLDivElement>(null);
  const currentArticle = PRESETS[selectedPresetIndex];

  // Handle text selection in simulated article
  const handleMouseUp = (e: React.MouseEvent) => {
    // If clicking on custom context menu or floating button, don't clear
    if ((e.target as HTMLElement).closest('.sim-context-menu') || (e.target as HTMLElement).closest('.sim-floating-btn')) {
      return;
    }

    const selection = window.getSelection();
    const text = selection ? selection.toString().trim() : '';

    if (text && text.length > 3) {
      setSelectedText(text);
      setActiveStep(2);

      // Compute relative position for floating save button
      if (articleContainerRef.current) {
        const rect = articleContainerRef.current.getBoundingClientRect();
        setFloatingBtnPos({
          x: Math.min(rect.width - 180, Math.max(10, e.clientX - rect.left + 10)),
          y: Math.max(10, e.clientY - rect.top - 36)
        });
      }
    } else {
      setSelectedText('');
      setFloatingBtnPos(null);
      setContextMenuPos(null);
    }
  };

  // Right-click context menu simulation
  const handleContextMenu = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    const text = selection ? selection.toString().trim() : '';

    if (text && text.length > 2) {
      e.preventDefault();
      setSelectedText(text);
      if (articleContainerRef.current) {
        const rect = articleContainerRef.current.getBoundingClientRect();
        setContextMenuPos({
          x: Math.min(rect.width - 240, Math.max(10, e.clientX - rect.left)),
          y: Math.min(rect.height - 180, Math.max(10, e.clientY - rect.top))
        });
      }
    }
  };

  // Trigger Save to SourceSnap (Matches Step 2 -> Step 3)
  const executeSaveSelection = () => {
    if (!selectedText) return;

    onSaveSnippet({
      title: currentArticle.title,
      url: currentArticle.url,
      domain: currentArticle.domain,
      text: selectedText,
      tags: currentArticle.tags,
      notes: `Saved from ${currentArticle.domain} for offline review`
    });

    // Close menu & floating button
    setContextMenuPos(null);
    setFloatingBtnPos(null);

    // Trigger step 3 confirmation: green badge on extension icon!
    setHasBadgeNotification(true);
    setActiveStep(3);

    // Show in-page toast
    setInPageToast('Saved to SourceSnap! Check the toolbar icon ✓');
    setTimeout(() => setInPageToast(null), 3000);

    // Clear selection
    window.getSelection()?.removeAllRanges();
  };

  // Open extension popup (Step 3 -> Step 4)
  const handleToolbarIconClick = () => {
    setIsPopupOpen(!isPopupOpen);
    if (!isPopupOpen) {
      setActiveStep(4);
      // clear badge tick
      setHasBadgeNotification(false);
    }
  };

  const handlePresetChange = (idx: number) => {
    setSelectedPresetIndex(idx);
    setCurrentUrl(PRESETS[idx].url);
    setSelectedText('');
    setContextMenuPos(null);
    setFloatingBtnPos(null);
  };

  const handlePasteClipboardToNotes = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setTestNotes((prev) => prev + '\n\n' + text);
        setActiveStep(6);
      }
    } catch {
      if (lastCopiedCitation) {
        setTestNotes((prev) => prev + '\n\n' + lastCopiedCitation);
        setActiveStep(6);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Helper Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
              {activeStep}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                {activeStep === 1 && 'Step 1: Website par koi bhi aham sentence ya paragraph select karo.'}
                {activeStep === 2 && 'Step 2: Right-click karo ya "Save selection to SourceSnap" dabao.'}
                {activeStep === 3 && 'Step 3: Toolbar icon par green tick dikhai dega! Ab icon par click karo.'}
                {activeStep === 4 && 'Step 4: Extension popup khul gaya! Search karo ya snippet select karo.'}
                {activeStep === 5 && 'Step 5: "Copy citation" button dabao! Formatted citation clipboard mein copy ho jayega.'}
                {activeStep === 6 && 'Step 6: 🎉 Citation mil gaya! Ab isey apne notes ya assignment mein paste kar lo.'}
              </h3>
              <p className="text-xs text-slate-400">
                {activeStep === 1 && 'Try highlighting the first paragraph of "What is VLAN?" below.'}
                {activeStep === 2 && 'Click the blue context menu item "Save selection to SourceSnap".'}
                {activeStep === 3 && 'Notice the green tick badge on the top right extension icon in the browser toolbar.'}
                {activeStep === 4 && 'The popup lists your saved excerpts with instant search.'}
                {activeStep === 5 && 'Formatted with source title, quotation, URL, and saved date.'}
                {activeStep === 6 && 'Click "Paste into Notes" below to see the result!'}
              </p>
            </div>
          </div>

          {/* Quick preset selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Article Preset:</span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {PRESETS.map((preset, idx) => (
                <button
                  key={preset.domain}
                  onClick={() => handlePresetChange(idx)}
                  className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                    selectedPresetIndex === idx
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {preset.title.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Browser Window Simulator */}
      <div className="relative rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Chrome Window Top Bar (Tabs & Window Controls) */}
        <div className="bg-slate-950 px-4 pt-3 pb-2 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Window Dots */}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block"></span>
            </div>

            {/* Active Chrome Tab */}
            <div className="flex items-center gap-2 bg-slate-900 border-t border-x border-slate-700/80 rounded-t-lg px-3 py-1.5 text-xs text-slate-200 font-medium max-w-[260px] truncate shadow-sm">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[9px] font-bold">
                G
              </div>
              <span className="truncate">{currentArticle.heading} - {currentArticle.title}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
            <span>Chrome Simulator</span>
          </div>
        </div>

        {/* Chrome Address & Toolbar */}
        <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between gap-3">
          {/* Navigation buttons */}
          <div className="flex items-center gap-2 text-slate-400">
            <button className="p-1 hover:text-slate-200 rounded" title="Back" aria-label="Back">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button className="p-1 hover:text-slate-200 rounded" title="Forward" aria-label="Forward">
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="p-1 hover:text-slate-200 rounded" title="Reload" aria-label="Reload">
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* URL Bar */}
          <div className="flex-1 max-w-2xl bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs text-slate-300">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-slate-400 select-none">https://</span>
            <span className="text-white font-medium">{currentArticle.domain}</span>
            <span className="text-slate-400 truncate">/{currentArticle.url.split(currentArticle.domain)[1]?.replace(/^\//, '')}</span>
          </div>

          {/* Extensions Toolbar */}
          <div className="flex items-center gap-2 relative">
            <button
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
              title="Extensions"
              aria-label="Extensions"
            >
              <Puzzle className="w-4 h-4" />
            </button>

            {/* SourceSnap Extension Icon with Green Tick Badge Notification */}
            <div className="relative">
              <button
                onClick={handleToolbarIconClick}
                className={`relative p-1.5 rounded-lg border transition-all flex items-center justify-center ${
                  isPopupOpen
                    ? 'bg-amber-500/20 border-amber-500/50 shadow-md shadow-amber-500/10'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 hover:border-amber-500/40'
                }`}
                title="SourceSnap - Save it. Find it. Cite it."
                aria-label="SourceSnap Extension Icon"
              >
                {/* Golden Bookmark Icon */}
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                  <path d="M5 3C4.44772 3 4 3.44772 4 4V21L12 17.5L20 21V4C20 3.44772 19.5523 3 19 3H5Z" fill="#F59E0B" />
                  <path d="M8.5 10.5L11 13L15.5 8" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>

                {/* Animated Green Tick Badge (Step 3) */}
                {hasBadgeNotification && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-full flex items-center justify-center shadow-lg ring-2 ring-slate-900 animate-bounce">
                    ✓
                  </span>
                )}
              </button>

              {/* Floating Extension Popup Attached to Toolbar Icon */}
              {isPopupOpen && (
                <div className="absolute right-0 top-11 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <PopupView
                    snippets={snippets}
                    onDeleteSnippet={onDeleteSnippet}
                    onCitationCopied={(cite) => {
                      setActiveStep(5);
                    }}
                    onOpenVault={onOpenVault}
                    isFloatingModal={true}
                    onClose={() => setIsPopupOpen(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Webpage Content Area */}
        <div
          ref={articleContainerRef}
          onMouseUp={handleMouseUp}
          onContextMenu={handleContextMenu}
          className="relative min-h-[460px] max-h-[580px] overflow-y-auto bg-white text-slate-900 p-8 sm:p-12 font-sans select-text cursor-text"
        >
          {/* Article Header (GeeksforGeeks / Wikipedia styling) */}
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  {currentArticle.title}
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-400">{currentArticle.domain}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {currentArticle.heading}
              </h1>
            </div>

            {/* Instruction Tip */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Neeche diye gaye paragraph ko mouse se select karo:</strong>
                <p className="mt-0.5 text-amber-800">
                  Select karne ke baad right-click karo ya floating "Save to SourceSnap" button par click karo.
                </p>
              </div>
            </div>

            {/* Article Text Content */}
            <div className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed space-y-4">
              {currentArticle.body.split('\n\n').map((paragraph, i) => (
                <p
                  key={i}
                  className={`p-2 rounded transition-colors ${
                    i === 0 ? 'bg-amber-100/30 font-medium' : ''
                  }`}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Floating "Save to SourceSnap" Pill (shown upon text selection) */}
          {floatingBtnPos && selectedText && (
            <div
              style={{ left: `${floatingBtnPos.x}px`, top: `${floatingBtnPos.y}px` }}
              className="sim-floating-btn absolute z-40 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-xl border-l-4 border-amber-500 flex items-center gap-2 cursor-pointer hover:bg-slate-800 transition-transform active:scale-95 animate-in fade-in zoom-in-95 duration-100"
              onClick={executeSaveSelection}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
                <path d="M5 3C4.44772 3 4 3.44772 4 4V21L12 17.5L20 21V4C20 3.44772 19.5523 3 19 3H5Z" fill="#F59E0B" />
                <path d="M8.5 10.5L11 13L15.5 8" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Save selection to SourceSnap</span>
            </div>
          )}

          {/* Realistic Chrome Right-Click Context Menu (Step 2 in graphic) */}
          {contextMenuPos && selectedText && (
            <div
              style={{ left: `${contextMenuPos.x}px`, top: `${contextMenuPos.y}px` }}
              className="sim-context-menu absolute z-50 w-60 bg-white text-slate-800 rounded-lg shadow-2xl border border-slate-200 py-1.5 text-xs font-normal animate-in fade-in zoom-in-95 duration-100 select-none"
            >
              <div className="px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between text-slate-600 cursor-default">
                <span>Copy</span>
                <span className="text-[11px] text-slate-400">Ctrl+C</span>
              </div>
              <div className="px-3 py-1.5 hover:bg-slate-100 text-slate-600 truncate cursor-default">
                Search Google for "{selectedText.slice(0, 16)}..."
              </div>
              <div className="px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between text-slate-600 cursor-default">
                <span>Print...</span>
                <span className="text-[11px] text-slate-400">Ctrl+P</span>
              </div>

              <div className="my-1 border-t border-slate-200"></div>

              {/* The Key Action: Save selection to SourceSnap */}
              <div
                onClick={executeSaveSelection}
                className="px-3 py-2 bg-blue-600 text-white font-semibold flex items-center gap-2 cursor-pointer hover:bg-blue-700 transition-colors"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                    <path d="M5 3C4.44772 3 4 3.44772 4 4V21L12 17.5L20 21V4C20 3.44772 19.5523 3 19 3H5Z" fill="#FBBF24" />
                    <path d="M8.5 10.5L11 13L15.5 8" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span>Save selection to SourceSnap</span>
              </div>

              <div className="my-1 border-t border-slate-200"></div>

              <div className="px-3 py-1.5 hover:bg-slate-100 text-slate-600 cursor-default">
                Inspect
              </div>
            </div>
          )}

          {/* In-Page Toast */}
          {inPageToast && (
            <div className="absolute bottom-6 right-6 z-40 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{inPageToast}</span>
            </div>
          )}
        </div>
      </div>

      {/* Live Notepad / Assignment Paste Test Area (Step 6) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <ClipboardPaste className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-semibold text-white">
              Step 6 Verification: Test Your Copied Citation
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePasteClipboardToNotes}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors shadow-sm"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>Paste from Clipboard</span>
            </button>
            <button
              onClick={() => setTestNotes('My Study Notes & Assignment:\n---\n')}
              className="px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white text-xs"
            >
              Clear
            </button>
          </div>
        </div>

        <textarea
          value={testNotes}
          onChange={(e) => setTestNotes(e.target.value)}
          rows={5}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-amber-500"
          placeholder="Paste citation here..."
        />
        <p className="text-[11px] text-slate-400 mt-2">
          Tip: In popup, click "Copy citation" button, then click "Paste from Clipboard" to see how seamlessly it integrates into your papers, Word docs, or notes!
        </p>
      </div>
    </div>
  );
};
