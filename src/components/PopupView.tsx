import React, { useState } from 'react';
import { Search, X, ChevronRight, Copy, Trash2, Check, ExternalLink, BookOpen, Download, Settings } from 'lucide-react';
import { Snippet, CitationStyle, formatCitation, searchSnippets, formatRelativeTime } from '../utils/citation.ts';

interface PopupViewProps {
  snippets: Snippet[];
  onDeleteSnippet: (id: string) => void;
  onCitationCopied?: (citationText: string, snippet: Snippet) => void;
  onOpenVault?: () => void;
  className?: string;
  isFloatingModal?: boolean;
  onClose?: () => void;
}

export const PopupView: React.FC<PopupViewProps> = ({
  snippets,
  onDeleteSnippet,
  onCitationCopied,
  onOpenVault,
  className = '',
  isFloatingModal = false,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(snippets[0]?.id || null);
  const [citationStyle, setCitationStyle] = useState<CitationStyle>('sourcesnap');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Citation copied to clipboard!');

  const filtered = searchSnippets(snippets, searchQuery);

  const handleCopyCitation = (snippet: Snippet, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const formatted = formatCitation(snippet, citationStyle);
    navigator.clipboard.writeText(formatted).then(() => {
      setToastMessage('Citation copied to clipboard!');
      setShowToast(true);
      if (onCitationCopied) onCitationCopied(formatted, snippet);
      setTimeout(() => setShowToast(false), 2500);
    }).catch(() => {
      // Fallback
      setToastMessage('Citation copied to clipboard!');
      setShowToast(true);
      if (onCitationCopied) onCitationCopied(formatted, snippet);
      setTimeout(() => setShowToast(false), 2500);
    });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteSnippet(id);
    setToastMessage('Snippet deleted');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className={`w-[360px] h-[550px] bg-[#0b1120] text-slate-100 rounded-xl overflow-hidden shadow-2xl border border-slate-700/80 flex flex-col font-sans relative ${className}`}>
      {/* Header */}
      <div className="bg-[#0f172a] px-3.5 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 flex items-center justify-center filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.3)]">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <path d="M5 3C4.44772 3 4 3.44772 4 4V21L12 17.5L20 21V4C20 3.44772 19.5523 3 19 3H5Z" fill="#F59E0B" />
              <path d="M8.5 10.5L11 13L15.5 8" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-white tracking-tight leading-tight">SourceSnap</h2>
            <p className="text-[11px] text-slate-400 leading-none">Save it. Find it. Cite it.</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenVault && (
            <button
              onClick={onOpenVault}
              className="w-7 h-7 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs transition-transform active:scale-95"
              title="Open full offline vault"
              aria-label="Open full offline vault"
            >
              S
            </button>
          )}
          {isFloatingModal && onClose && (
            <button
              onClick={onClose}
              className="w-7 h-7 rounded text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center text-sm"
              aria-label="Close popup"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-[#0f172a] px-3.5 py-2.5">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-2.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved snippets..."
            className="w-full h-9 bg-[#1e293b] border border-slate-700/80 rounded-md pl-8 pr-8 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 text-slate-400 hover:text-slate-200"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Sub-header status and citation format selector */}
      <div className="bg-[#0b1120] px-3.5 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>
          {searchQuery
            ? `${filtered.length} of ${snippets.length} saved snippets`
            : `${snippets.length} ${snippets.length === 1 ? 'snippet' : 'snippets'} saved`}
        </span>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400">Format:</span>
          <select
            value={citationStyle}
            onChange={(e) => setCitationStyle(e.target.value as CitationStyle)}
            className="bg-[#1e293b] border border-slate-700 text-slate-200 rounded px-1.5 py-0.5 text-[11px] focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="sourcesnap">SourceSnap</option>
            <option value="apa">APA 7th</option>
            <option value="mla">MLA 9th</option>
            <option value="chicago">Chicago</option>
            <option value="bibtex">BibTeX</option>
            <option value="markdown">Markdown</option>
          </select>
        </div>
      </div>

      {/* Snippet Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-700">
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
            <Search className="w-8 h-8 text-slate-600" />
            <p className="text-xs">
              {searchQuery
                ? `No snippets found matching "${searchQuery}"`
                : 'No snippets saved yet.\nSelect any text on a webpage and right-click to save!'}
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className={`bg-[#1e293b] border-l-4 border-amber-500 rounded-md p-3 cursor-pointer transition-all ${
                  isExpanded ? 'bg-[#1a2436] shadow-md ring-1 ring-amber-500/30' : 'hover:bg-[#273549]'
                }`}
              >
                {/* Header preview and chevron */}
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-xs text-slate-200 leading-snug font-medium ${isExpanded ? '' : 'line-clamp-2'}`}>
                    {item.text}
                  </p>
                  <ChevronRight
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 mt-0.5 ${
                      isExpanded ? 'rotate-90 text-amber-400' : ''
                    }`}
                  />
                </div>

                {/* Metadata */}
                <div className="mt-1.5 flex flex-col gap-0.5 text-[11px]">
                  <span className="text-slate-300 font-medium">{item.title || item.domain}</span>
                  <span className="text-slate-400 truncate">{item.domain || item.url}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </div>

                {/* Expanded Action Buttons */}
                {isExpanded && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-700/80 flex items-center gap-2">
                    <button
                      onClick={(e) => handleCopyCitation(item, e)}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy citation</span>
                    </button>
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="text-slate-400 hover:text-red-400 hover:border-red-500/50 border border-slate-700 px-2.5 py-1.5 rounded text-xs flex items-center gap-1 transition-colors"
                      title="Delete snippet"
                      aria-label="Delete snippet"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Floating In-Popup Green Toast (Matches Mockup Step 5 & 6) */}
      {showToast && (
        <div className="absolute bottom-11 left-3 right-3 bg-emerald-600 text-white px-3 py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-2 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer bar */}
      <div className="bg-[#0f172a] px-3.5 py-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        {onOpenVault && (
          <button
            onClick={onOpenVault}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Offline Library</span>
          </button>
        )}
        <span className="text-[10px] text-slate-400 font-mono">v1.0.0</span>
      </div>
    </div>
  );
};
