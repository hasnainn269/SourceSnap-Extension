// SourceSnap Content Script
// Captures text selections, provides floating quick-save icon and Alt+S shortcut

(function () {
  let floatingBtn = null;

  // Listen for text selection
  document.addEventListener("mouseup", (e) => {
    // Avoid triggering inside existing floating button
    if (floatingBtn && floatingBtn.contains(e.target)) return;

    const selection = window.getSelection();
    const text = selection ? selection.toString().trim() : "";

    if (text && text.length > 3) {
      showFloatingSaveButton(e.pageX, e.pageY, text);
    } else {
      removeFloatingSaveButton();
    }
  });

  // Listen for keyboard shortcut: Alt + S
  document.addEventListener("keydown", (e) => {
    if (e.altKey && (e.key === "s" || e.key === "S")) {
      const selection = window.getSelection();
      const text = selection ? selection.toString().trim() : "";
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
    floatingBtn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
        <polyline points="9 10 11 12 15 8"/>
      </svg>
      <span>Save to SourceSnap</span>
    `;

    // Position above or near cursor
    floatingBtn.style.left = `${Math.min(window.innerWidth - 180, Math.max(10, x + 8))}px`;
    floatingBtn.style.top = `${Math.max(10, y - 38)}px`;

    floatingBtn.addEventListener("mousedown", (ev) => {
      ev.stopPropagation();
      ev.preventDefault();
      saveSelection(text);
      removeFloatingSaveButton();
    });

    document.body.appendChild(floatingBtn);
  }

  function removeFloatingSaveButton() {
    if (floatingBtn && floatingBtn.parentNode) {
      floatingBtn.parentNode.removeChild(floatingBtn);
      floatingBtn = null;
    }
  }

  function saveSelection(text) {
    const pageTitle = document.title || window.location.hostname;
    const pageUrl = window.location.href;

    chrome.runtime.sendMessage({
      action: "SAVE_SNIPPET",
      text: text,
      extraData: {
        title: pageTitle,
        url: pageUrl
      }
    });

    showInPageToast("Saved to SourceSnap! ✓");
  }

  function showInPageToast(msg) {
    const toast = document.createElement("div");
    toast.className = "sourcesnap-inpage-toast";
    toast.textContent = msg;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("sourcesnap-toast-fadeout");
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 2200);
  }

  // Listen for confirmation messages from background
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "SNIPPET_SAVED_NOTIFICATION") {
      showInPageToast("Saved to SourceSnap! ✓");
    }
  });
})();
