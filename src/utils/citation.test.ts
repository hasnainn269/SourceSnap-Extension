import test from 'node:test';
import assert from 'node:assert/strict';
import { formatCitation, searchSnippets, extractDomain } from './citation.ts';
import type { Snippet } from './citation.ts';

const mockSnippet: Snippet = {
  id: 'snip-1',
  title: 'GeeksforGeeks',
  url: 'https://www.geeksforgeeks.org/vlan/',
  domain: 'geeksforgeeks.org',
  text: 'A VLAN (Virtual Local Area Network) is a logical segmentation of a physical network.',
  createdAt: 1745672000000, // Apr 26, 2025
  tags: ['Networking', 'CS'],
  notes: 'Key concept for computer networks exam'
};

test('extractDomain correctly strips www and paths', () => {
  assert.equal(extractDomain('https://www.geeksforgeeks.org/vlan/'), 'geeksforgeeks.org');
  assert.equal(extractDomain('https://en.wikipedia.org/wiki/VLAN'), 'en.wikipedia.org');
});

test('formatCitation produces exact SourceSnap citation layout from the design mockup', () => {
  const result = formatCitation(mockSnippet, 'sourcesnap');
  assert.match(result, /^GeeksforGeeks/);
  assert.match(result, /"A VLAN \(Virtual Local Area Network\) is a logical segmentation of a physical network\."/);
  assert.match(result, /Source URL: https:\/\/www\.geeksforgeeks\.org\/vlan\//);
  assert.match(result, /Saved on:/);
});

test('formatCitation generates valid BibTeX format', () => {
  const bib = formatCitation(mockSnippet, 'bibtex');
  assert.ok(bib.includes('@misc{'));
  assert.ok(bib.includes('title = {GeeksforGeeks}'));
  assert.ok(bib.includes('howpublished = {\\url{https://www.geeksforgeeks.org/vlan/}}'));
});

test('formatCitation generates valid APA format', () => {
  const apa = formatCitation(mockSnippet, 'apa');
  assert.ok(apa.includes('GeeksforGeeks.'));
  assert.ok(apa.includes('from https://www.geeksforgeeks.org/vlan/'));
});

test('searchSnippets matches queries across text, title, url, tags, and notes', () => {
  const list = [mockSnippet];

  // Match keyword in text
  const match1 = searchSnippets(list, 'VLAN');
  assert.equal(match1.length, 1);

  // Match keyword in title
  const match2 = searchSnippets(list, 'Geeks');
  assert.equal(match2.length, 1);

  // Match keyword in URL
  const match3 = searchSnippets(list, 'geeksforgeeks.org');
  assert.equal(match3.length, 1);

  // Match keyword in note
  const match4 = searchSnippets(list, 'exam');
  assert.equal(match4.length, 1);

  // Unrelated keyword
  const match5 = searchSnippets(list, 'QuantumPhysics');
  assert.equal(match5.length, 0);

  // Tag filter
  const match6 = searchSnippets(list, '', 'Networking');
  assert.equal(match6.length, 1);

  const match7 = searchSnippets(list, '', 'Biology');
  assert.equal(match7.length, 0);
});
