import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  Volume2,
  VolumeX,
  Copy,
  Trash2,
  ExternalLink,
  Plus,
  FileDown,
  Sparkles,
  Check,
  Brain,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Tag
} from 'lucide-react';
import { Snippet, CitationStyle, formatCitation, searchSnippets, formatRelativeTime } from '../utils/citation.ts';

interface OfflineVaultProps {
  snippets: Snippet[];
  onAddSnippet: (snippet: Omit<Snippet, 'id' | 'createdAt'>) => void;
  onDeleteSnippet: (id: string) => void;
  onUpdateSnippet: (id: string, updates: Partial<Snippet>) => void;
}

export const OfflineVault: React.FC<OfflineVaultProps> = ({
  snippets,
  onAddSnippet,
  onDeleteSnippet,
  onUpdateSnippet
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [citationFormat, setCitationFormat] = useState<CitationStyle>('sourcesnap');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Offline Reader modal state
  const [readingSnippet, setReadingSnippet] = useState<Snippet | null>(null);
  const [readerTheme, setReaderTheme] = useState<'dark' | 'sepia' | 'light'>('dark');
  const [readerFontSize, setReaderFontSize] = useState<number>(18);

  // Flashcard Study / Memorization mode ("Offline Yaad Rakhna")
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [studyIndex, setStudyIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Audio Speech state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Manual Add Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newText, setNewText] = useState('');
  const [newTag, setNewTag] = useState('');

  // Collect all unique tags
  const allTags = ['all', ...Array.from(new Set(snippets.flatMap((s) => s.tags)))];
  const filteredSnippets = searchSnippets(snippets, searchQuery, selectedTag);

  const handleCopy = (snippet: Snippet) => {
    const text = formatCitation(snippet, citationFormat);
    navigator.clipboard.writeText(text);
    setCopiedId(snippet.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    let domain = 'offline-note';
    try {
      if (newUrl) {
        domain = new URL(newUrl).hostname.replace(/^www\./, '');
      }
    } catch {
      domain = 'custom-source';
    }

    onAddSnippet({
      title: newTitle.trim() || domain,
      url: newUrl.trim() || 'https://offline-note.local',
      domain: domain,
      text: newText.trim(),
      tags: newTag.trim() ? [newTag.trim()] : ['General'],
      notes: 'Manually saved for offline review'
    });

    setNewTitle('');
    setNewUrl('');
    setNewText('');
    setNewTag('');
    setShowAddModal(false);
  };

  const exportAllJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(snippets, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `sourcesnap-vault-${Date.now()}.json`);
    dlAnchor.click();
  };

  const exportAllMarkdown = () => {
    let md = `# SourceSnap Offline Vault\n*Exported on ${new Date().toLocaleDateString()}*\n\n`;
    snippets.forEach((s) => {
      md += `### ${s.title}\n`;
      md += `> ${s.text}\n\n`;
      md += `- **URL**: [${s.url}](${s.url})\n`;
      md += `- **Tags**: ${s.tags.join(', ')}\n`;
      md += `- **Saved**: ${new Date(s.createdAt).toLocaleDateString()}\n\n---\n\n`;
    });
    const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(md);
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `sourcesnap-notes.md`);
    dlAnchor.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Toggle */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Offline Web Vault & Reader</h2>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                100% Offline Access
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Internet ke baghair bhi apne saved snippets, research citations aur text paragraphs ko padhein aur yaad karein.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setIsStudyMode(!isStudyMode);
                setStudyIndex(0);
                setIsCardFlipped(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isStudyMode
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-purple-300" />
              <span>{isStudyMode ? 'Close Study Flashcards' : 'Flashcard Study Mode (Yaad Rakhna)'}</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Snippet Manually</span>
            </button>

            <button
              onClick={exportAllMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
              title="Export as Markdown notes"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Export .MD</span>
            </button>
          </div>
        </div>

        {/* Search & Tag Filter Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in offline snippets..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs text-slate-400 shrink-0">Tags:</span>
            {allTags.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTag(t)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedTag === t
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-1.5 shrink-0 pl-2">
              <span className="text-xs text-slate-400">Cite:</span>
              <select
                value={citationFormat}
                onChange={(e) => setCitationFormat(e.target.value as CitationStyle)}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="sourcesnap">SourceSnap Quick</option>
                <option value="apa">APA 7th</option>
                <option value="mla">MLA 9th</option>
                <option value="chicago">Chicago</option>
                <option value="bibtex">BibTeX</option>
                <option value="markdown">Markdown</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Flashcard Study / Memorization View ("Offline Yaad Rakhna") */}
      {isStudyMode && snippets.length > 0 && (
        <div className="bg-gradient-to-br from-slate-900 to-purple-950/40 border border-purple-500/30 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-xl">
          <div className="flex items-center justify-between text-xs text-purple-300">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="font-semibold uppercase tracking-wider">Active Recall Flashcard Mode</span>
            </div>
            <span>
              Card {studyIndex + 1} of {snippets.length}
            </span>
          </div>

          {/* Flashcard Container */}
          <div
            onClick={() => setIsCardFlipped(!isCardFlipped)}
            className="cursor-pointer max-w-xl mx-auto min-h-[220px] bg-slate-950 border border-purple-500/20 rounded-xl p-6 flex flex-col justify-center items-center gap-4 hover:border-purple-500/40 transition-all shadow-inner"
          >
            {!isCardFlipped ? (
              <div className="space-y-3">
                <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
                  Front: Source & Topic
                </span>
                <h3 className="text-xl font-bold text-white">
                  {snippets[studyIndex]?.title || snippets[studyIndex]?.domain}
                </h3>
                <p className="text-xs text-slate-400">
                  Tag: {snippets[studyIndex]?.tags.join(', ')} · URL: {snippets[studyIndex]?.domain}
                </p>
                <p className="text-xs text-amber-400 font-medium">Click card to reveal saved excerpt & definition</p>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                  Back: Saved Key Concept
                </span>
                <p className="text-sm sm:text-base text-slate-100 italic leading-relaxed font-serif">
                  "{snippets[studyIndex]?.text}"
                </p>
                {snippets[studyIndex]?.notes && (
                  <p className="text-xs text-slate-400 bg-slate-900/90 p-2 rounded">
                    Notes: {snippets[studyIndex]?.notes}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setStudyIndex((prev) => (prev > 0 ? prev - 1 : snippets.length - 1));
                setIsCardFlipped(false);
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white"
              title="Previous card"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsCardFlipped(!isCardFlipped)}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-sm"
            >
              {isCardFlipped ? 'Show Front' : 'Flip Card'}
            </button>
            <button
              onClick={() => {
                setStudyIndex((prev) => (prev < snippets.length - 1 ? prev + 1 : 0));
                setIsCardFlipped(false);
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white"
              title="Next card"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Snippet Grid */}
      {filteredSnippets.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 rounded-xl border border-slate-800 p-8 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">No saved excerpts found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try highlighting text in the simulator or clicking "Add Snippet Manually" to save quotes for offline viewing.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSnippets.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between transition-all group hover:shadow-lg"
            >
              {/* Card Header & Content */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                    <span className="text-xs font-semibold text-white truncate max-w-[170px]">
                      {item.title || item.domain}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </div>

                <div
                  onClick={() => setReadingSnippet(item)}
                  className="cursor-pointer bg-slate-950 p-3 rounded-lg border border-slate-800/80 hover:border-amber-500/40 transition-colors"
                  title="Click to open full distraction-free offline reader"
                >
                  <p className="text-xs text-slate-200 line-clamp-4 leading-relaxed font-serif italic">
                    "{item.text}"
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors truncate max-w-[180px]"
                  >
                    <span>{item.domain}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>

                  {item.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setReadingSnippet(item)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                    title="Read in Offline Mode"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleSpeak(item.text)}
                    className={`p-1.5 rounded transition-colors ${
                      isSpeaking
                        ? 'text-amber-400 bg-amber-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title="Listen to audio read-out"
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(item)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                      copiedId === item.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Citation</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onDeleteSnippet(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                    title="Delete snippet"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Distraction-Free Offline Reader Modal */}
      {readingSnippet && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div
            className={`w-full max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col border ${
              readerTheme === 'dark'
                ? 'bg-slate-950 text-slate-100 border-slate-800'
                : readerTheme === 'sepia'
                ? 'bg-[#fbf0d9] text-[#433422] border-[#e4d4b3]'
                : 'bg-white text-slate-900 border-slate-200'
            }`}
          >
            {/* Reader Header */}
            <div className="px-6 py-4 border-b border-slate-800/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base leading-tight">
                    {readingSnippet.title || readingSnippet.domain}
                  </h3>
                  <p className="text-xs opacity-75">{readingSnippet.domain}</p>
                </div>
              </div>

              {/* Reader Preferences Bar */}
              <div className="flex items-center gap-2">
                {/* Theme selector */}
                <div className="flex items-center rounded-lg border border-slate-700/50 p-0.5">
                  <button
                    onClick={() => setReaderTheme('dark')}
                    className={`px-2 py-0.5 text-xs rounded ${readerTheme === 'dark' ? 'bg-slate-800 font-bold' : ''}`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => setReaderTheme('sepia')}
                    className={`px-2 py-0.5 text-xs rounded ${readerTheme === 'sepia' ? 'bg-[#ebd7b2] text-slate-900 font-bold' : ''}`}
                  >
                    Sepia
                  </button>
                  <button
                    onClick={() => setReaderTheme('light')}
                    className={`px-2 py-0.5 text-xs rounded ${readerTheme === 'light' ? 'bg-slate-200 text-slate-900 font-bold' : ''}`}
                  >
                    Light
                  </button>
                </div>

                {/* Font Size */}
                <button
                  onClick={() => setReaderFontSize((s) => Math.max(14, s - 2))}
                  className="px-2 py-1 text-xs border border-slate-700/50 rounded hover:bg-slate-800"
                >
                  A-
                </button>
                <button
                  onClick={() => setReaderFontSize((s) => Math.min(26, s + 2))}
                  className="px-2 py-1 text-xs border border-slate-700/50 rounded hover:bg-slate-800"
                >
                  A+
                </button>

                {/* Close */}
                <button
                  onClick={() => setReadingSnippet(null)}
                  className="px-3 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded hover:bg-amber-400 transition-colors ml-2"
                >
                  Done
                </button>
              </div>
            </div>

            {/* Reader Content Body */}
            <div className="p-8 sm:p-12 overflow-y-auto flex-1 font-serif leading-relaxed">
              <div className="max-w-xl mx-auto space-y-6">
                <div className="border-l-4 border-amber-500 pl-4 py-2 italic font-serif">
                  <p style={{ fontSize: `${readerFontSize}px` }}>
                    "{readingSnippet.text}"
                  </p>
                </div>

                {readingSnippet.notes && (
                  <div className="p-4 rounded-lg bg-black/10 border border-current/10 text-xs font-sans">
                    <strong>Study Notes:</strong> {readingSnippet.notes}
                  </div>
                )}

                <div className="pt-6 border-t border-current/10 text-xs font-sans opacity-70 flex flex-col gap-1">
                  <span>Source: {readingSnippet.url}</span>
                  <span>Saved on: {new Date(readingSnippet.createdAt).toLocaleDateString()}</span>
                  <span>Tags: {readingSnippet.tags.join(', ')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Snippet Manually Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Add Web Excerpt for Offline Access</h3>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Source Title / Article Name</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. GeeksforGeeks - Computer Networks"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Source URL</label>
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com/topic"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Snippet / Paragraph Quote (Required)</label>
                <textarea
                  required
                  rows={4}
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Paste important paragraph or definitions here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Category / Tag</label>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="e.g. Exam, Networking, Biology"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shadow-sm"
                >
                  Save to Offline Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
