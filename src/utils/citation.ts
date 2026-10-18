/**
 * Citation formatting and snippet utility functions for SourceSnap
 */

export interface Snippet {
  id: string;
  title: string;
  url: string;
  domain: string;
  text: string;
  fullContext?: string;
  createdAt: number; // timestamp
  tags: string[];
  notes?: string;
  favorite?: boolean;
}

export type CitationStyle = 'sourcesnap' | 'apa' | 'mla' | 'chicago' | 'harvard' | 'bibtex' | 'markdown';

export function extractDomain(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return urlStr;
  }
}

export function formatDateCustom(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  const date = new Date(timestamp);
  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffDays === 0) return `Today, ${timeStr}`;
  if (diffDays === 1) return `Yesterday, ${timeStr}`;
  return `${formatDateCustom(timestamp)}`;
}

export function formatCitation(snippet: Snippet, style: CitationStyle = 'sourcesnap'): string {
  const cleanText = snippet.text.trim();
  const title = snippet.title || snippet.domain || 'Web Document';
  const savedDate = formatDateCustom(snippet.createdAt);
  const accessYear = new Date(snippet.createdAt).getFullYear();
  const accessMonthDayYear = new Date(snippet.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  switch (style) {
    case 'sourcesnap':
      // Matches the exact format from user's provided graphic:
      // GeeksforGeeks
      // "A VLAN (Virtual Local Area Network) is a logical segmentation..."
      // ---
      // Source URL: https://www.geeksforgeeks.org/vlan/
      // Saved on: Apr 26, 2025
      return `${title}\n\n"${cleanText}"\n\n---\nSource URL: ${snippet.url}\nSaved on: ${savedDate}\n---`;

    case 'apa':
      // APA 7th edition for web page
      return `${title}. (${accessYear}). Retrieved ${accessMonthDayYear}, from ${snippet.url}\nQuote: "${cleanText}"`;

    case 'mla':
      // MLA 9th edition
      return `"${title}." ${snippet.domain}, ${accessMonthDayYear}, ${snippet.url}. Accessed ${savedDate}.\nQuote: "${cleanText}"`;

    case 'chicago':
      // Chicago style note format
      return `"${title}," ${snippet.domain}, accessed ${accessMonthDayYear}, ${snippet.url}.\n"${cleanText}"`;

    case 'harvard':
      // Harvard style
      return `${snippet.domain} (${accessYear}) '${title}'. Available at: ${snippet.url} (Accessed: ${savedDate}).\nExcerpt: "${cleanText}"`;

    case 'bibtex': {
      const citeKey = (snippet.domain.replace(/[^a-zA-Z0-9]/g, '') + accessYear).toLowerCase() || 'online_source';
      return `@misc{${citeKey},
  title = {${title}},
  howpublished = {\\url{${snippet.url}}},
  note = {Accessed: ${savedDate}},
  annotation = {${cleanText}}
}`;
    }

    case 'markdown':
      return `> "${cleanText}"\n\n— **[${title}](${snippet.url})** *(${savedDate})*`;

    default:
      return `${title}\n\n"${cleanText}"\n\nSource: ${snippet.url}`;
  }
}

export function searchSnippets(snippets: Snippet[], query: string, activeTag?: string): Snippet[] {
  const q = query.trim().toLowerCase();
  return snippets.filter(snippet => {
    if (activeTag && activeTag !== 'all') {
      if (!snippet.tags.some(t => t.toLowerCase() === activeTag.toLowerCase())) {
        return false;
      }
    }

    if (!q) return true;

    return (
      snippet.text.toLowerCase().includes(q) ||
      snippet.title.toLowerCase().includes(q) ||
      snippet.url.toLowerCase().includes(q) ||
      snippet.domain.toLowerCase().includes(q) ||
      (snippet.notes && snippet.notes.toLowerCase().includes(q)) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(q))
    );
  });
}
