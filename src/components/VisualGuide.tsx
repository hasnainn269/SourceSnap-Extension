import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, ExternalLink, Copy, HelpCircle } from 'lucide-react';

interface VisualGuideProps {
  onGoToSimulator: () => void;
}

export const VisualGuide: React.FC<VisualGuideProps> = ({ onGoToSimulator }) => {
  const [lang, setLang] = useState<'urdu' | 'english'>('urdu');
  const [copiedExample, setCopiedExample] = useState(false);

  const sampleCitation = `GeeksforGeeks

"A VLAN (Virtual Local Area Network) is a logical segmentation of a physical network. It allows multiple networks to exist on the same physical infrastructure, improving security, performance and management."
---
Source URL: https://www.geeksforgeeks.org/vlan/
Saved on: Apr 26, 2025
---`;

  const copySample = () => {
    navigator.clipboard.writeText(sampleCitation);
    setCopiedExample(true);
    setTimeout(() => setCopiedExample(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Graphic Header */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none">
                <path d="M5 3C4.44772 3 4 3.44772 4 4V21L12 17.5L20 21V4C20 3.44772 19.5523 3 19 3H5Z" fill="#F59E0B" />
                <path d="M8.5 10.5L11 13L15.5 8" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                SourceSnap
                <span className="text-xs uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                  Step-by-Step Guide
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                {lang === 'urdu'
                  ? 'Step 3: Find and cite. Popup mein search karo aur citation copy kar lo.'
                  : 'Step 3: Find and cite. Search in popup and copy formatted citation.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-1">
              <button
                onClick={() => setLang('urdu')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  lang === 'urdu' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Roman Urdu
              </button>
              <button
                onClick={() => setLang('english')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  lang === 'english' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
            </div>

            <button
              onClick={onGoToSimulator}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-transform active:scale-95 shadow-sm"
            >
              <span>Try in Simulator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 6 Grid Cards Matching Uploaded Poster */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Step 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 relative flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="text-sm font-bold text-white">
                {lang === 'urdu' ? 'Website par text select karo' : 'Select text on any website'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {lang === 'urdu'
                ? 'Kisi bhi webpage par important paragraph select karo (jaise GeeksforGeeks ka example).'
                : 'Highlight any important paragraph, definition or excerpt on any webpage.'}
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300">
            <span className="bg-blue-900/60 text-blue-200 px-1 py-0.5 rounded">
              A VLAN (Virtual Local Area Network) is a logical segmentation...
            </span>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 relative flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="text-sm font-bold text-white">
                {lang === 'urdu' ? 'Right-click karo' : 'Right-click on selection'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {lang === 'urdu'
                ? 'Selected text par right-click karo aur "Save selection to SourceSnap" par click karo.'
                : 'Right click on the highlighted text and click "Save selection to SourceSnap".'}
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs">
            <div className="bg-blue-600 text-white font-semibold px-2 py-1.5 rounded flex items-center gap-2">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
                <path d="M5 3C4.44772 3 4 3.44772 4 4V21L12 17.5L20 21V4C20 3.44772 19.5523 3 19 3H5Z" fill="#FBBF24" />
                <path d="M8.5 10.5L11 13L15.5 8" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Save selection to SourceSnap</span>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 relative flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="text-sm font-bold text-white">
                {lang === 'urdu' ? 'Toolbar par confirmation' : 'Toolbar confirmation tick'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {lang === 'urdu'
                ? 'Extension icon par green tick dikhai dega. Ab popup khol lo.'
                : 'A green tick checkmark appears on the extension icon. Now open popup.'}
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex items-center justify-center gap-3">
            <div className="relative p-2 bg-slate-900 border border-amber-500/50 rounded-lg">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                <path d="M5 3C4.44772 3 4 3.44772 4 4V21L12 17.5L20 21V4C20 3.44772 19.5523 3 19 3H5Z" fill="#F59E0B" />
                <path d="M8.5 10.5L11 13L15.5 8" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-slate-950 font-black text-[9px] rounded-full flex items-center justify-center">
                ✓
              </span>
            </div>
            <span className="text-xs text-emerald-400 font-semibold">Green tick active!</span>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 relative flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                4
              </span>
              <h3 className="text-sm font-bold text-white">
                {lang === 'urdu' ? 'Popup mein search karo' : 'Search in popup'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {lang === 'urdu'
                ? 'Popup kholne ke baad search bar mein keyword type karo (text, title ya URL).'
                : 'Type any keyword in the search bar (snippet text, title, or URL).'}
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs">
            <div className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 flex items-center justify-between text-slate-200">
              <span className="font-medium text-amber-300">VLAN</span>
              <span className="text-slate-500 text-[10px]">1 of 1 saved</span>
            </div>
          </div>
        </div>

        {/* Step 5 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 relative flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                5
              </span>
              <h3 className="text-sm font-bold text-white">
                {lang === 'urdu' ? 'Citation copy karo' : 'Copy citation button'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {lang === 'urdu'
                ? 'Search result mein se apna snippet select karo. "Copy citation" button par click karo.'
                : 'Select snippet from results. Click the "Copy citation" button.'}
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 flex items-center gap-2">
            <button className="flex-1 bg-blue-600 text-white font-semibold px-3 py-1.5 rounded text-xs flex items-center justify-center gap-1.5">
              <Copy className="w-3.5 h-3.5" />
              <span>Copy citation</span>
            </button>
            <span className="text-[11px] text-emerald-400 font-medium">✓ Copied!</span>
          </div>
        </div>

        {/* Step 6 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 relative flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
                6
              </span>
              <h3 className="text-sm font-bold text-white">
                {lang === 'urdu' ? 'Citation mil gaya 🎉' : 'Citation Ready 🎉'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {lang === 'urdu'
                ? 'Ab clipboard mein yeh text copy ho jayega. Ab ise apne notes, assignment ya document mein paste kar sakte ho.'
                : 'Citation is in clipboard. Paste it into your notes, assignment, or thesis.'}
            </p>
          </div>

          <button
            onClick={copySample}
            className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-amber-300 font-semibold px-3 py-1.5 rounded text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            {copiedExample ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedExample ? 'Sample Copied!' : 'Copy Sample Citation'}</span>
          </button>
        </div>
      </div>

      {/* Copied Citation Preview Box (Matching Step 6 in Image) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <span>Copied citation format (example):</span>
        </h4>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap select-all">
          {sampleCitation}
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-white font-medium">
          <span className="text-base">💡</span>
          <strong>Bas itna hi!</strong>
          <span className="text-slate-300">Select karo → Save karo → Search karo → Citation copy karo ✅</span>
        </div>

        <span className="text-amber-400 font-bold tracking-wide italic text-sm">
          Study smarter!
        </span>
      </div>
    </div>
  );
};
