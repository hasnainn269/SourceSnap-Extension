/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar.tsx';
import { Simulator } from './components/Simulator.tsx';
import { OfflineVault } from './components/OfflineVault.tsx';
import { ExtensionDownloader } from './components/ExtensionDownloader.tsx';
import { VisualGuide } from './components/VisualGuide.tsx';
import { Snippet } from './utils/citation.ts';

const LOCAL_STORAGE_KEY = 'sourcesnap_snippets_vault_v1';

const INITIAL_SNIPPETS: Snippet[] = [
  {
    id: 'snip-vlan-geeksforgeeks',
    title: 'GeeksforGeeks',
    url: 'https://www.geeksforgeeks.org/vlan/',
    domain: 'geeksforgeeks.org',
    text: 'A VLAN (Virtual Local Area Network) is a logical segmentation of a physical network. It allows multiple networks to exist on the same physical infrastructure, improving security, performance and management.',
    createdAt: 1745672000000, // Apr 26, 2025 (matching mockup)
    tags: ['Networking', 'CS'],
    notes: 'Key concept for computer networks assignment & exams'
  },
  {
    id: 'snip-neural-networks',
    title: 'Wikipedia - Neural Networks',
    url: 'https://en.wikipedia.org/wiki/Artificial_neural_network',
    domain: 'en.wikipedia.org',
    text: 'An artificial neural network (ANN) is a computational model inspired by the biological neural networks in animal brains. It consists of connected units or nodes called artificial neurons.',
    createdAt: Date.now() - 86400000 * 2,
    tags: ['AI', 'Computer Science'],
    notes: 'Fundamental deep learning architecture'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'vault' | 'download' | 'guide'>('simulator');
  const [snippets, setSnippets] = useState<Snippet[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_SNIPPETS;
  });

  const [lastCopiedCitation, setLastCopiedCitation] = useState<string>('');

  // Persist snippets to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(snippets));
    } catch (e) {
      console.warn('Unable to persist to localStorage', e);
    }
  }, [snippets]);

  const handleSaveSnippet = (snippetData: Omit<Snippet, 'id' | 'createdAt'>) => {
    const newSnippet: Snippet = {
      ...snippetData,
      id: 'snip-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: Date.now()
    };
    setSnippets((prev) => [newSnippet, ...prev]);

    // Micro celebratory sparkle
    confetti({
      particleCount: 28,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#f59e0b', '#10b981', '#3b82f6']
    });
  };

  const handleDeleteSnippet = (id: string) => {
    setSnippets((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateSnippet = (id: string, updates: Partial<Snippet>) => {
    setSnippets((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        snippetCount={snippets.length}
        onOpenQuickAdd={() => setActiveTab('vault')}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'simulator' && (
          <Simulator
            snippets={snippets}
            onSaveSnippet={handleSaveSnippet}
            onDeleteSnippet={handleDeleteSnippet}
            onOpenVault={() => setActiveTab('vault')}
            lastCopiedCitation={lastCopiedCitation}
          />
        )}

        {activeTab === 'vault' && (
          <OfflineVault
            snippets={snippets}
            onAddSnippet={handleSaveSnippet}
            onDeleteSnippet={handleDeleteSnippet}
            onUpdateSnippet={handleUpdateSnippet}
          />
        )}

        {activeTab === 'download' && <ExtensionDownloader />}

        {activeTab === 'guide' && (
          <VisualGuide onGoToSimulator={() => setActiveTab('simulator')} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">SourceSnap</span>
            <span>·</span>
            <span>Save it. Find it. Cite it.</span>
          </div>
          <div>
            Built with HTML, CSS, JavaScript, TypeScript & Chrome Extension Manifest V3
          </div>
        </div>
      </footer>
    </div>
  );
}
