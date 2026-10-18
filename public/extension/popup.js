// SourceSnap Popup Logic
let allSnippets = [];
let currentFilter = "";
let expandedSnippetId = null;

const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const snippetsList = document.getElementById("snippetsList");
const snippetsCount = document.getElementById("snippetsCount");
const styleSelect = document.getElementById("styleSelect");
const toast = document.getElementById("toastNotification");
const toastText = document.getElementById("toastText");
const openOptionsBtn = document.getElementById("openOptionsBtn");
const openOfflineReaderBtn = document.getElementById("openOfflineReaderBtn");
const exportSnippetsBtn = document.getElementById("exportSnippetsBtn");

// Initialize popup
document.addEventListener("DOMContentLoaded", () => {
  loadSnippets();
  loadSavedStyle();

  searchInput.addEventListener("input", (e) => {
    currentFilter = e.target.value;
    if (currentFilter) {
      clearSearchBtn.classList.remove("hidden");
    } else {
      clearSearchBtn.classList.add("hidden");
    }
    renderSnippets();
  });

  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    currentFilter = "";
    clearSearchBtn.classList.add("hidden");
    renderSnippets();
    searchInput.focus();
  });

  styleSelect.addEventListener("change", (e) => {
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ sourcesnap_preferred_style: e.target.value });
    }
  });

  if (openOptionsBtn) {
    openOptionsBtn.addEventListener("click", () => {
      if (chrome.runtime && chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        window.open("options.html");
      }
    });
  }

  if (openOfflineReaderBtn) {
    openOfflineReaderBtn.addEventListener("click", () => {
      chrome.tabs.create({ url: "options.html#reader" });
    });
  }

  if (exportSnippetsBtn) {
    exportSnippetsBtn.addEventListener("click", exportSnippetsAsJSON);
  }
});

function loadSavedStyle() {
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(["sourcesnap_preferred_style"], (res) => {
      if (res.sourcesnap_preferred_style) {
        styleSelect.value = res.sourcesnap_preferred_style;
      }
    });
  }
}

function loadSnippets() {
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(["sourcesnap_snippets"], (result) => {
      allSnippets = result.sourcesnap_snippets || [];
      renderSnippets();
    });
  } else {
    // Fallback demo data
    allSnippets = [
      {
        id: "snip-vlan-demo",
        title: "GeeksforGeeks",
        url: "https://www.geeksforgeeks.org/vlan/",
        domain: "geeksforgeeks.org",
        text: "A VLAN (Virtual Local Area Network) is a logical segmentation of a physical network. It allows multiple networks to exist on the same physical infrastructure, improving security, performance and management.",
        createdAt: Date.now(),
        tags: ["Networking"]
      }
    ];
    renderSnippets();
  }
}

function renderSnippets() {
  const q = currentFilter.trim().toLowerCase();
  const filtered = allSnippets.filter((item) => {
    if (!q) return true;
    return (
      item.text.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.url.toLowerCase().includes(q) ||
      item.domain.toLowerCase().includes(q)
    );
  });

  // Update counter
  if (q) {
    snippetsCount.textContent = `${filtered.length} of ${allSnippets.length} saved snippets`;
  } else {
    snippetsCount.textContent = `${allSnippets.length} ${allSnippets.length === 1 ? "snippet" : "snippets"} saved`;
  }

  snippetsList.innerHTML = "";

  if (filtered.length === 0) {
    snippetsList.innerHTML = `
      <div class="empty-state">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <p>${q ? "No snippets found matching \"" + escapeHtml(q) + "\"" : "No snippets saved yet.<br>Select any text on a webpage and right-click to save!"}</p>
      </div>
    `;
    return;
  }

  filtered.forEach((item) => {
    const isExpanded = expandedSnippetId === item.id;
    const card = document.createElement("div");
    card.className = `snippet-card ${isExpanded ? "expanded" : ""}`;

    const formattedTime = formatTimestamp(item.createdAt);

    card.innerHTML = `
      <div class="snippet-header">
        <div class="snippet-text-preview">${escapeHtml(item.text)}</div>
        <div class="snippet-arrow">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </div>
      <div class="snippet-meta">
        <span class="snippet-title">${escapeHtml(item.title || item.domain)}</span>
        <span class="snippet-url">${escapeHtml(item.domain || item.url)}</span>
        <span class="snippet-time">${formattedTime}</span>
      </div>
      <div class="snippet-actions">
        <button class="btn-cite" data-id="${item.id}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
          </svg>
          <span>Copy citation</span>
        </button>
        <button class="btn-delete" data-id="${item.id}" title="Delete snippet">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          <span>Delete</span>
        </button>
      </div>
    `;

    // Card expand click
    card.addEventListener("click", (e) => {
      if (e.target.closest(".btn-cite") || e.target.closest(".btn-delete")) return;
      expandedSnippetId = isExpanded ? null : item.id;
      renderSnippets();
    });

    // Copy citation click
    const citeBtn = card.querySelector(".btn-cite");
    if (citeBtn) {
      citeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        copyCitation(item);
      });
    }

    // Delete snippet click
    const delBtn = card.querySelector(".btn-delete");
    if (delBtn) {
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteSnippet(item.id);
      });
    }

    snippetsList.appendChild(card);
  });
}

function copyCitation(snippet) {
  const style = styleSelect.value || "sourcesnap";
  const citationText = buildCitationString(snippet, style);

  navigator.clipboard.writeText(citationText).then(() => {
    showToast("Citation copied to clipboard!");
  }).catch(() => {
    // Fallback execCommand
    const ta = document.createElement("textarea");
    ta.value = citationText;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast("Citation copied to clipboard!");
  });
}

function deleteSnippet(id) {
  allSnippets = allSnippets.filter((item) => item.id !== id);
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ sourcesnap_snippets: allSnippets }, () => {
      renderSnippets();
      showToast("Snippet deleted");
    });
  } else {
    renderSnippets();
  }
}

function exportSnippetsAsJSON() {
  const blob = new Blob([JSON.stringify(allSnippets, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sourcesnap-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Backup exported!");
}

function buildCitationString(snippet, style) {
  const title = snippet.title || snippet.domain || "Web Page";
  const quote = snippet.text.trim();
  const savedDate = new Date(snippet.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  switch (style) {
    case "sourcesnap":
      return `${title}\n\n"${quote}"\n\n---\nSource URL: ${snippet.url}\nSaved on: ${savedDate}\n---`;
    case "apa":
      return `${title}. (${new Date(snippet.createdAt).getFullYear()}). Retrieved ${savedDate}, from ${snippet.url}\nQuote: "${quote}"`;
    case "mla":
      return `"${title}." ${snippet.domain}, ${savedDate}, ${snippet.url}.\nQuote: "${quote}"`;
    case "chicago":
      return `"${title}," ${snippet.domain}, accessed ${savedDate}, ${snippet.url}.\n"${quote}"`;
    case "bibtex":
      return `@misc{${snippet.domain.replace(/[^a-zA-Z0-9]/g, "") || "source"},
  title = {${title}},
  howpublished = {\\url{${snippet.url}}},
  note = {Accessed: ${savedDate}},
  annotation = {${quote}}
}`;
    case "markdown":
      return `> "${quote}"\n\n— **[${title}](${snippet.url})** *(${savedDate})*`;
    default:
      return `${title}\n\n"${quote}"\n\nSource: ${snippet.url}`;
  }
}

function formatTimestamp(ts) {
  if (!ts) return "Recently";
  const date = new Date(ts);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const timeStr = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  if (isToday) {
    return `Today, ${timeStr}`;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + `, ${timeStr}`;
}

let toastTimer = null;
function showToast(text) {
  if (toastTimer) clearTimeout(toastTimer);
  toastText.textContent = text;
  toast.classList.remove("hidden");

  toastTimer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2500);
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
