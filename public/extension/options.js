// SourceSnap Options & Library Page Script
let snippets = [];

document.addEventListener("DOMContentLoaded", () => {
  const tabLib = document.getElementById("tabLibrary");
  const tabSet = document.getElementById("tabSettings");
  const secLib = document.getElementById("librarySection");
  const secSet = document.getElementById("settingsSection");
  const defaultCitation = document.getElementById("defaultCitation");
  const showFloatingBtn = document.getElementById("showFloatingButton");

  tabLib.addEventListener("click", () => {
    tabLib.classList.add("active");
    tabSet.classList.remove("active");
    secLib.style.display = "block";
    secSet.style.display = "none";
  });

  tabSet.addEventListener("click", () => {
    tabSet.classList.add("active");
    tabLib.classList.remove("active");
    secSet.style.display = "block";
    secLib.style.display = "none";
  });

  // Load preferences
  chrome.storage.local.get(["sourcesnap_snippets", "sourcesnap_preferred_style", "sourcesnap_floating"], (res) => {
    snippets = res.sourcesnap_snippets || [];
    renderLibrary();

    if (res.sourcesnap_preferred_style) {
      defaultCitation.value = res.sourcesnap_preferred_style;
    }
    if (res.sourcesnap_floating !== undefined) {
      showFloatingBtn.checked = res.sourcesnap_floating;
    }
  });

  defaultCitation.addEventListener("change", (e) => {
    chrome.storage.local.set({ sourcesnap_preferred_style: e.target.value });
  });

  showFloatingBtn.addEventListener("change", (e) => {
    chrome.storage.local.set({ sourcesnap_floating: e.target.checked });
  });

  document.getElementById("exportAllJsonBtn").addEventListener("click", () => {
    downloadFile(JSON.stringify(snippets, null, 2), "sourcesnap-vault.json", "application/json");
  });

  document.getElementById("exportAllCsvBtn").addEventListener("click", () => {
    let csv = "ID,Title,Domain,URL,Date,Snippet\n";
    snippets.forEach((s) => {
      const line = [
        `"${s.id}"`,
        `"${(s.title || "").replace(/"/g, '""')}"`,
        `"${s.domain}"`,
        `"${s.url}"`,
        `"${new Date(s.createdAt).toISOString()}"`,
        `"${(s.text || "").replace(/"/g, '""')}"`
      ].join(",");
      csv += line + "\n";
    });
    downloadFile(csv, "sourcesnap-vault.csv", "text/csv");
  });

  document.getElementById("clearAllBtn").addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all saved snippets? This cannot be undone.")) {
      chrome.storage.local.set({ sourcesnap_snippets: [] }, () => {
        snippets = [];
        renderLibrary();
      });
    }
  });
});

function renderLibrary() {
  const container = document.getElementById("libraryList");
  if (!container) return;

  if (snippets.length === 0) {
    container.innerHTML = `<p style="color: #94a3b8; grid-column: 1/-1;">No snippets saved yet. Highlight text on any site and right-click 'Save selection to SourceSnap'.</p>`;
    return;
  }

  container.innerHTML = "";
  snippets.forEach((item) => {
    const card = document.createElement("div");
    card.className = "snippet-item";
    card.innerHTML = `
      <div>
        <p class="snippet-text">"${escapeHtml(item.text)}"</p>
        <div class="snippet-info">
          <strong>${escapeHtml(item.title || item.domain)}</strong> · <a href="${item.url}" target="_blank" style="color: #60a5fa; text-decoration: none;">${escapeHtml(item.domain)}</a>
          <br>Saved on ${new Date(item.createdAt).toLocaleDateString()}
        </div>
      </div>
      <div class="actions">
        <button class="action-btn cite-btn">Copy Citation</button>
        <button class="del-btn">Delete</button>
      </div>
    `;

    card.querySelector(".cite-btn").addEventListener("click", () => {
      const citeStr = `${item.title || item.domain}\n\n"${item.text}"\n\n---\nSource URL: ${item.url}\nSaved on: ${new Date(item.createdAt).toLocaleDateString()}\n---`;
      navigator.clipboard.writeText(citeStr).then(() => {
        alert("Citation copied to clipboard!");
      });
    });

    card.querySelector(".del-btn").addEventListener("click", () => {
      snippets = snippets.filter((s) => s.id !== item.id);
      chrome.storage.local.set({ sourcesnap_snippets: snippets }, () => {
        renderLibrary();
      });
    });

    container.appendChild(card);
  });
}

function downloadFile(content, fileName, contentType) {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
