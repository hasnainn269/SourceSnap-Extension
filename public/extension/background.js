// SourceSnap Background Service Worker (Manifest V3)

// Register Context Menu on Installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-to-sourcesnap",
    title: "Save selection to SourceSnap",
    contexts: ["selection"]
  });

  // Seed default demo snippet if empty
  chrome.storage.local.get(["sourcesnap_snippets"], (result) => {
    if (!result.sourcesnap_snippets || result.sourcesnap_snippets.length === 0) {
      const initialSnippets = [
        {
          id: "snip-" + Date.now(),
          title: "GeeksforGeeks",
          url: "https://www.geeksforgeeks.org/vlan/",
          domain: "geeksforgeeks.org",
          text: "A VLAN (Virtual Local Area Network) is a logical segmentation of a physical network. It allows multiple networks to exist on the same physical infrastructure, improving security, performance and management.",
          createdAt: Date.now(),
          tags: ["Networking", "CS"],
          notes: "Essential for network architecture study"
        }
      ];
      chrome.storage.local.set({ sourcesnap_snippets: initialSnippets });
    }
  });
});

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "save-to-sourcesnap" && info.selectionText) {
    saveSnippetFromTab(info.selectionText, tab);
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "SAVE_SNIPPET") {
    saveSnippetFromTab(message.text, sender.tab, message.extraData);
    sendResponse({ success: true });
  }
});

function saveSnippetFromTab(selectedText, tab, extraData = {}) {
  const url = (tab && tab.url) ? tab.url : (extraData.url || "https://example.com");
  const rawTitle = (tab && tab.title) ? tab.title : (extraData.title || "Web Resource");
  
  // Clean domain and title
  let domain = "web";
  try {
    domain = new URL(url).hostname.replace(/^www\./, "");
  } catch (e) {
    domain = "web";
  }

  // If title is long, use website name or clean title
  let displayTitle = rawTitle;
  if (rawTitle.includes(" - ")) {
    const parts = rawTitle.split(" - ");
    displayTitle = parts[parts.length - 1].trim() || parts[0].trim();
  } else if (rawTitle.includes(" | ")) {
    const parts = rawTitle.split(" | ");
    displayTitle = parts[parts.length - 1].trim() || parts[0].trim();
  }

  const newSnippet = {
    id: "snip-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
    title: displayTitle || domain,
    url: url,
    domain: domain,
    text: selectedText.trim(),
    fullContext: extraData.fullContext || selectedText.trim(),
    createdAt: Date.now(),
    tags: extraData.tags || ["General"],
    notes: extraData.notes || ""
  };

  chrome.storage.local.get(["sourcesnap_snippets"], (result) => {
    const list = result.sourcesnap_snippets || [];
    list.unshift(newSnippet);
    chrome.storage.local.set({ sourcesnap_snippets: list }, () => {
      // Show confirmation on toolbar icon badge
      showBadgeConfirmation();

      // Notify active tab to display in-page toast confirmation
      if (tab && tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          action: "SNIPPET_SAVED_NOTIFICATION",
          snippet: newSnippet
        }).catch(() => {
          // Tab might not have content script ready, safe to ignore
        });
      }
    });
  });
}

function showBadgeConfirmation() {
  chrome.action.setBadgeText({ text: "✓" });
  chrome.action.setBadgeBackgroundColor({ color: "#22c55e" }); // Green tick badge

  // Clear badge after 3 seconds
  setTimeout(() => {
    chrome.action.setBadgeText({ text: "" });
  }, 3000);
}
