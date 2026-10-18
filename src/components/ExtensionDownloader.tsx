import React, { useState } from 'react';
import JSZip from 'jszip';
import { Download, Check, Copy, FileCode, Chrome, ExternalLink, Terminal, FolderCheck, Sparkles } from 'lucide-react';

export const ExtensionDownloader: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [activeCodeFile, setActiveCodeFile] = useState<
    'manifest' | 'background' | 'contentJs' | 'contentCss' | 'popupHtml' | 'popupCss' | 'popupJs' | 'optionsHtml'
  >('manifest');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  // File templates
  const fileContents = {
    manifest: `{
  "manifest_version": 3,
  "name": "SourceSnap - Save, Find & Cite",
  "version": "1.0.0",
  "description": "Save webpage text, URLs, and key excerpts for offline access, fast study search, and 1-click citation.",
  "permissions": [
    "contextMenus",
    "storage",
    "activeTab",
    "clipboardWrite"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_title": "SourceSnap - Saved Snippets",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["content.css"]
    }
  ],
  "options_ui": {
    "page": "options.html",
    "open_in_tab": true
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}`,

    background: `// SourceSnap Background Service Worker (Manifest V3)
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-to-sourcesnap",
    title: "Save selection to SourceSnap",
    contexts: ["selection"]
  });

  chrome.storage.local.get(["sourcesnap_snippets"], (result) => {
    if (!result.sourcesnap_snippets || result.sourcesnap_snippets.length === 0) {
      chrome.storage.local.set({
        sourcesnap_snippets: [
          {
            id: "snip-" + Date.now(),
            title: "GeeksforGeeks",
            url: "https://www.geeksforgeeks.org/vlan/",
            domain: "geeksforgeeks.org",
            text: "A VLAN (Virtual Local Area Network) is a logical segmentation of a physical network. It allows multiple networks to exist on the same physical infrastructure, improving security, performance and management.",
            createdAt: Date.now(),
            tags: ["Networking"]
          }
        ]
      });
    }
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "save-to-sourcesnap" && info.selectionText) {
    saveSnippet(info.selectionText, tab);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "SAVE_SNIPPET") {
    saveSnippet(message.text, sender.tab, message.extraData);
    sendResponse({ success: true });
  }
});

function saveSnippet(selectedText, tab, extraData = {}) {
  const url = (tab && tab.url) ? tab.url : (extraData.url || "https://example.com");
  const rawTitle = (tab && tab.title) ? tab.title : (extraData.title || "Web Resource");
  let domain = "web";
  try { domain = new URL(url).hostname.replace(/^www\\./, ""); } catch(e) {}

  const snippet = {
    id: "snip-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
    title: rawTitle,
    url: url,
    domain: domain,
    text: selectedText.trim(),
    createdAt: Date.now(),
    tags: extraData.tags || ["General"]
  };

  chrome.storage.local.get(["sourcesnap_snippets"], (res) => {
    const list = res.sourcesnap_snippets || [];
    list.unshift(snippet);
    chrome.storage.local.set({ sourcesnap_snippets: list }, () => {
      // Flash green tick badge on extension icon
      chrome.action.setBadgeText({ text: "✓" });
      chrome.action.setBadgeBackgroundColor({ color: "#22c55e" });
      setTimeout(() => chrome.action.setBadgeText({ text: "" }), 3000);
    });
  });
}`,

    contentJs: `// SourceSnap Content Script
(function () {
  let floatingBtn = null;

  document.addEventListener("mouseup", (e) => {
    if (floatingBtn && floatingBtn.contains(e.target)) return;
    const text = window.getSelection()?.toString().trim();
    if (text && text.length > 3) {
      showFloatingSaveButton(e.pageX, e.pageY, text);
    } else {
      removeFloatingSaveButton();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.altKey && (e.key === "s" || e.key === "S")) {
      const text = window.getSelection()?.toString().trim();
      if (text) {
        e.preventDefault();
        saveSelection(text);
      }
    }
  });

  function showFloatingSaveButton(x, y, text) {
    removeFloatingSaveButton();
    floatingBtn = document.createElement("div");
    floatingBtn.className = "sourcesnap-floating-btn";
    floatingBtn.innerHTML = '<span>Save to SourceSnap</span>';
    floatingBtn.style.left = Math.min(window.innerWidth - 180, Math.max(10, x + 8)) + "px";
    floatingBtn.style.top = Math.max(10, y - 36) + "px";
    floatingBtn.addEventListener("mousedown", (ev) => {
      ev.preventDefault();
      saveSelection(text);
      removeFloatingSaveButton();
    });
    document.body.appendChild(floatingBtn);
  }

  function removeFloatingSaveButton() {
    if (floatingBtn && floatingBtn.parentNode) floatingBtn.parentNode.removeChild(floatingBtn);
    floatingBtn = null;
  }

  function saveSelection(text) {
    chrome.runtime.sendMessage({
      action: "SAVE_SNIPPET",
      text: text,
      extraData: { title: document.title, url: window.location.href }
    });
  }
})();`,

    contentCss: `.sourcesnap-floating-btn {
  position: absolute;
  z-index: 2147483647;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #0f172a;
  color: #f8fafc;
  padding: 6px 12px;
  border-radius: 6px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
  border-left: 3px solid #f59e0b;
}`,

    popupHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SourceSnap</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="popup-container">
    <header class="app-header">
      <div class="brand">
        <h1 class="brand-name">SourceSnap</h1>
        <p class="brand-tagline">Save it. Find it. Cite it.</p>
      </div>
      <button id="openOptionsBtn" class="avatar-badge">S</button>
    </header>
    <div class="search-box">
      <input type="text" id="searchInput" placeholder="Search saved snippets...">
    </div>
    <div class="status-bar">
      <span id="snippetsCount">0 snippets saved</span>
      <select id="styleSelect">
        <option value="sourcesnap">SourceSnap Quick</option>
        <option value="apa">APA 7th</option>
        <option value="mla">MLA 9th</option>
        <option value="bibtex">BibTeX</option>
      </select>
    </div>
    <main class="snippets-container" id="snippetsList"></main>
    <div id="toastNotification" class="toast hidden">✓ Citation copied to clipboard!</div>
  </div>
  <script src="popup.js"></script>
</body>
</html>`,

    popupCss: `body {
  width: 360px;
  height: 520px;
  background-color: #0b1120;
  color: #f1f5f9;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.app-header {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background-color: #0f172a;
  border-bottom: 1px solid #1e293b;
}
.brand-name { font-size: 15px; font-weight: bold; }
.brand-tagline { font-size: 11px; color: #94a3b8; }
.avatar-badge { background: #f59e0b; border: none; font-weight: bold; padding: 4px 8px; border-radius: 4px; cursor: pointer; }
.search-box input {
  width: calc(100% - 24px);
  margin: 10px 12px;
  padding: 8px 12px;
  background: #1e293b;
  border: 1px solid #334155;
  color: white;
  border-radius: 6px;
}
.snippet-card {
  background: #1e293b;
  border-left: 4px solid #f59e0b;
  padding: 10px;
  margin: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
}
.btn-cite {
  background: #2563eb;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-weight: 600;
  margin-top: 8px;
  cursor: pointer;
}`,

    popupJs: `// SourceSnap Popup Script
let snippets = [];
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["sourcesnap_snippets"], (res) => {
    snippets = res.sourcesnap_snippets || [];
    render();
  });
  document.getElementById("searchInput").addEventListener("input", (e) => {
    render(e.target.value.toLowerCase());
  });
});

function render(query = "") {
  const container = document.getElementById("snippetsList");
  const filtered = snippets.filter(s => !query || s.text.toLowerCase().includes(query) || s.title.toLowerCase().includes(query));
  document.getElementById("snippetsCount").textContent = filtered.length + " snippets saved";
  container.innerHTML = "";
  filtered.forEach(item => {
    const el = document.createElement("div");
    el.className = "snippet-card";
    el.innerHTML = \`
      <p style="font-size: 13px;">\${item.text}</p>
      <small style="color: #94a3b8;">\${item.title} - \${item.domain}</small>
      <div><button class="btn-cite">Copy citation</button></div>
    \`;
    el.querySelector(".btn-cite").addEventListener("click", () => {
      const cite = \`\${item.title}\\n\\n"\${item.text}"\\n\\n---\\nSource URL: \${item.url}\\nSaved on: \${new Date(item.createdAt).toLocaleDateString()}\\n---\`;
      navigator.clipboard.writeText(cite).then(() => {
        const toast = document.getElementById("toastNotification");
        toast.classList.remove("hidden");
        setTimeout(() => toast.classList.add("hidden"), 2000);
      });
    });
    container.appendChild(el);
  });
}`,

    optionsHtml: `<!DOCTYPE html>
<html>
<head><title>SourceSnap Settings</title></head>
<body style="background: #0f172a; color: white; font-family: sans-serif; padding: 24px;">
  <h1>SourceSnap Vault & Preferences</h1>
  <p>Manage your saved web snippets and export options.</p>
</body>
</html>`
  };

  const downloadExtensionZip = async () => {
    try {
      setIsGenerating(true);
      const zip = new JSZip();

      // Add extension files
      zip.file('manifest.json', fileContents.manifest);
      zip.file('background.js', fileContents.background);
      zip.file('content.js', fileContents.contentJs);
      zip.file('content.css', fileContents.contentCss);
      zip.file('popup.html', fileContents.popupHtml);
      zip.file('popup.css', fileContents.popupCss);
      zip.file('popup.js', fileContents.popupJs);
      zip.file('options.html', fileContents.optionsHtml);

      // Add icons directory
      const iconsFolder = zip.folder('icons');
      const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
        <rect width="128" height="128" rx="28" fill="#0F172A"/>
        <path d="M34 22C30.6863 22 28 24.6863 28 28V106L64 88L100 106V28C100 24.6863 97.3137 22 94 22H34Z" fill="#F59E0B"/>
        <path d="M48 56L59 67L80 44" stroke="#0F172A" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
      if (iconsFolder) {
        iconsFolder.file('icon.svg', iconSvg);
      }

      // Add README.txt
      zip.file(
        'README.txt',
        `SourceSnap Chrome Extension
===========================
1. Open Google Chrome.
2. Visit: chrome://extensions
3. Enable 'Developer mode' in the top-right corner.
4. Click 'Load unpacked' and select this extracted folder.
5. You are ready! Pin SourceSnap to your Chrome toolbar.`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sourcesnap-chrome-extension.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsGenerating(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      setIsGenerating(false);
    }
  };

  const copyCode = (key: keyof typeof fileContents, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedFile(key);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Download Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-amber-500 text-slate-950">
                <Chrome className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Download SourceSnap Extension
              </h2>
            </div>
            <p className="text-sm text-slate-300 max-w-xl">
              Complete, production-ready Manifest V3 Chrome Extension package. Apne computer ke Google Chrome mein install karein aur kisi bhi website par text select karke foran save karein!
            </p>
          </div>

          <button
            onClick={downloadExtensionZip}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-5 h-5 stroke-[3] text-emerald-950" />
                <span>Downloaded Successfully!</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>{isGenerating ? 'Packaging ZIP...' : 'Download Extension (.zip)'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Step-by-Step Installation Guide (Urdu & English) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <FolderCheck className="w-5 h-5 text-amber-400" />
          <span>Chrome Mein Kaise Install Karein? (5 Easy Steps)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
              1
            </span>
            <h4 className="text-xs font-bold text-white">ZIP Extract Karein</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Download kiye gaye <code>sourcesnap-chrome-extension.zip</code> file ko extract ya unzip karein.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
              2
            </span>
            <h4 className="text-xs font-bold text-white">Extensions Kholein</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Chrome browser mein new tab kholein aur address bar mein type karein: <br />
              <code className="text-amber-300">chrome://extensions</code>
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
              3
            </span>
            <h4 className="text-xs font-bold text-white">Developer Mode ON</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Chrome extensions page ke top-right corner par <strong>Developer mode</strong> ka toggle switch on karein.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
              4
            </span>
            <h4 className="text-xs font-bold text-white">Load Unpacked</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Top-left par <strong>"Load unpacked"</strong> button dabayein aur apna extract kiya hua folder select karein.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
              5
            </span>
            <h4 className="text-xs font-bold text-white">Mubarak! Enjoy</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Toolbar par puzzle icon se SourceSnap ko pin karein aur kisi bhi page par text select karke right click karein!
            </p>
          </div>
        </div>
      </div>

      {/* Extension Source Code Viewer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Extension Source Code Inspector</h3>
          </div>

          <button
            onClick={() => copyCode(activeCodeFile, fileContents[activeCodeFile])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
          >
            {copiedFile === activeCodeFile ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Code Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Current File</span>
              </>
            )}
          </button>
        </div>

        {/* File Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-950 border-b border-slate-800 overflow-x-auto text-xs">
          {[
            { id: 'manifest', label: 'manifest.json' },
            { id: 'background', label: 'background.js' },
            { id: 'contentJs', label: 'content.js' },
            { id: 'contentCss', label: 'content.css' },
            { id: 'popupHtml', label: 'popup.html' },
            { id: 'popupCss', label: 'popup.css' },
            { id: 'popupJs', label: 'popup.js' },
            { id: 'optionsHtml', label: 'options.html' }
          ].map((file) => (
            <button
              key={file.id}
              onClick={() => setActiveCodeFile(file.id as any)}
              className={`px-3 py-1.5 rounded-md font-mono whitespace-nowrap transition-colors ${
                activeCodeFile === file.id
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {file.label}
            </button>
          ))}
        </div>

        {/* Code Content */}
        <pre className="p-4 sm:p-6 bg-[#0a0f1d] text-slate-300 font-mono text-xs overflow-x-auto max-h-[420px] scrollbar-thin scrollbar-thumb-slate-800">
          <code>{fileContents[activeCodeFile]}</code>
        </pre>
      </div>
    </div>
  );
};
