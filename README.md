# SourceSnap 🔖

> **Save it. Find it. Cite it.**  
> Chrome Extension & Offline Snippet Saver for Web Excerpts, Research, and Instant Citations.

![SourceSnap Logo](public/favicon.svg)

---

## 📖 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
- [How to Install the Chrome Extension](#-how-to-install-the-chrome-extension)
- [How to Use (The 6-Step Workflow)](#-how-to-use-the-6-step-workflow)
- [Citation Styles Supported](#-citation-styles-supported)
- [Project Architecture & File Tree](#-project-architecture--file-tree)
- [Local Development & Testing](#-local-development--testing)
- [Bilingual Guide (Roman Urdu / اردو)](#-bilingual-guide-roman-urdu)
- [License](#-license)

---

## 🌟 Overview

**SourceSnap** is a Google Chrome Extension (Manifest V3) and companion Web Studio designed for students, researchers, engineers, and readers. It solves the everyday friction of losing track of critical paragraphs, definitions, and references across the web.

When reading articles, tutorials, or papers:
1. Highlight any important paragraph or sentence.
2. Right-click and choose **"Save selection to SourceSnap"** (or use `Alt + S`).
3. The toolbar icon immediately confirms with an animated **green tick badge (`✓`)**.
4. Open the extension popup to search, organize, read offline, or **copy formatted citations in 1 click**.

All data is stored locally (`chrome.storage.local` / `localStorage`), allowing full **100% offline access** even when disconnected from the internet.

---

## 🚀 Key Features

- **⚡ 1-Click Web Selection & Context Menu**: Right-click any selected text to save it alongside page title, URL, domain, and timestamp.
- **🟢 Instant Toolbar Confirmation**: Extension icon displays a green checkmark badge so you know your excerpt was safely saved.
- **🔍 Fast Keyword Search**: Real-time filtering by quote text, webpage title, domain, or custom tags.
- **📋 Instant Citation Generator**: Produces formatted citations ready to paste into assignments, Google Docs, Notion, or Word.
- **📚 Distraction-Free Offline Reader**: View saved quotes and original paragraph context in a clean, ad-free reader with Dark, Sepia, and Light modes with custom font sizes.
- **🧠 Active Recall Flashcard Mode**: Flip through saved snippets as flashcards to memorize definitions and concepts for exams (*"Offline Yaad Rakhna"*).
- **🔊 Text-to-Speech (Audio)**: Built-in speech synthesis to listen to your saved quotes on the go.
- **💾 Export & Backup**: 1-click export to **Markdown (`.md`)**, **JSON**, or **CSV**.
- **📦 1-Click Extension ZIP**: Download the complete, unpacked Chrome Extension folder straight from the browser UI.

---

## 🛠 How to Install the Chrome Extension

You can load SourceSnap into Google Chrome in less than 60 seconds:

### Step 1: Download or Extract Extension Files
- In the SourceSnap web app, go to the **"Download & Install"** tab and click **"Download Extension (.zip)"**.
- Extract `sourcesnap-chrome-extension.zip` to a folder on your computer.  
*(Alternatively, you can directly use the `public/extension/` folder from this repository).*

### Step 2: Open Chrome Extensions
- Open Google Chrome.
- In the address bar, navigate to:
  ```text
  chrome://extensions
  ```

### Step 3: Enable Developer Mode
- In the top-right corner of the Extensions page, switch **"Developer mode"** to **ON**.

### Step 4: Load Unpacked
- In the top-left corner, click **"Load unpacked"**.
- Select the extracted extension directory (the folder containing `manifest.json`).

### Step 5: Pin to Toolbar
- Click the puzzle icon (Extensions menu) in Chrome's top bar.
- Pin **SourceSnap** to your toolbar so the golden bookmark icon is always visible.

---

## 🎯 How to Use (The 6-Step Workflow)

The workflow follows the official SourceSnap infographic:

| Step | Action | Description |
|:---:|:---|:---|
| **1** | **Website par text select karo** | Highlight any paragraph, sentence, or definition on any webpage. |
| **2** | **Right-click karo** | Right-click the selected text and choose **"Save selection to SourceSnap"** (or press `Alt + S`). |
| **3** | **Toolbar par confirmation** | A green checkmark badge appears on the extension icon. |
| **4** | **Popup mein search karo** | Click the SourceSnap icon to open the popup and search by keyword or URL. |
| **5** | **Citation copy karo** | Click on your snippet and hit the **"Copy citation"** button. |
| **6** | **Citation mil gaya 🎉** | Formatted citation is copied to your clipboard — paste it directly into your notes or assignment! |

---

## 📑 Citation Styles Supported

### 1. SourceSnap Quick (Default)
```text
GeeksforGeeks

"A VLAN (Virtual Local Area Network) is a logical segmentation of a physical network. It allows multiple networks to exist on the same physical infrastructure, improving security, performance and management."
---
Source URL: https://www.geeksforgeeks.org/vlan/
Saved on: Apr 26, 2025
---
```

### 2. APA 7th Edition
```text
GeeksforGeeks. (2025). Retrieved April 26, 2025, from https://www.geeksforgeeks.org/vlan/
Quote: "A VLAN (Virtual Local Area Network) is a logical segmentation..."
```

### 3. MLA 9th Edition
```text
"GeeksforGeeks." geeksforgeeks.org, April 26, 2025, https://www.geeksforgeeks.org/vlan/. Accessed Apr 26, 2025.
Quote: "A VLAN (Virtual Local Area Network) is a logical segmentation..."
```

### 4. BibTeX (for LaTeX Research Papers)
```bibtex
@misc{geeksforgeeksorg2025,
  title = {GeeksforGeeks},
  howpublished = {\url{https://www.geeksforgeeks.org/vlan/}},
  note = {Accessed: Apr 26, 2025},
  annotation = {A VLAN (Virtual Local Area Network) is a logical segmentation...}
}
```

### 5. Markdown Quote
```markdown
> "A VLAN (Virtual Local Area Network) is a logical segmentation..."

— **[GeeksforGeeks](https://www.geeksforgeeks.org/vlan/)** *(Apr 26, 2025)*
```

---

## 📂 Project Architecture & File Tree

```text
├── public/
│   ├── favicon.svg             # Official SourceSnap golden bookmark vector logo
│   ├── favicon.ico             # Browser icon fallback
│   ├── favicon.png             # 32x32 raster icon
│   └── extension/              # Complete Chrome Extension files (Manifest V3)
│       ├── manifest.json       # Extension metadata, permissions & action settings
│       ├── background.js       # Service worker: context menus, storage, badge tick
│       ├── content.js          # In-page text selection & floating save button
│       ├── content.css         # Styling for in-page floating pill & toast
│       ├── popup.html          # Sleek popup UI matching the mockup
│       ├── popup.css           # Navy/amber/green design styles
│       ├── popup.js            # Search, filter, instant clipboard copy & deletion
│       ├── options.html        # Settings & full-screen offline library
│       ├── options.js          # Preferences, backup JSON/CSV export
│       └── icons/              # 16px, 48px, 128px PNG and SVG icons
├── src/
│   ├── components/
│   │   ├── Navbar.tsx          # Responsive navigation & brand header
│   │   ├── Simulator.tsx       # Interactive Chrome browser simulator
│   │   ├── PopupView.tsx       # Standalone & embedded popup component
│   │   ├── OfflineVault.tsx    # Offline library, reader mode & flashcards
│   │   ├── ExtensionDownloader.tsx # 1-click ZIP packager & code inspector
│   │   └── VisualGuide.tsx     # 6-step visual walkthrough (Urdu/English)
│   ├── utils/
│   │   ├── citation.ts         # Pure citation formatting & search algorithms
│   │   └── citation.test.ts    # Unit tests running with Node 22 native test runner
│   ├── App.tsx                 # Root React application
│   ├── main.tsx                # React DOM entry point
│   └── index.css               # Tailwind CSS styles
├── index.html                  # HTML entry point with SourceSnap favicon & metadata
├── package.json                # Project dependencies
└── tsconfig.json               # TypeScript configuration
```

---

## 💻 Local Development & Testing

### Prerequisites
- Node.js 22+ installed
- npm installed

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open `http://localhost:3000` to interact with the simulator, offline vault, and extension downloader.

### 3. Run Logic Unit Tests
Tests are implemented using Node's native test runner (`node:test`):
```bash
node --test src/utils/citation.test.ts
```

### 4. Build for Production
```bash
npm run build
```

---

## 🇵🇰 Bilingual Guide (Roman Urdu)

### SourceSnap Kya Hai?
SourceSnap ek Chrome Extension aur offline research tool hai jo kisi bhi website se important sentences, definitions aur URLs ko save karta hai takay aap:
1. **Offline Access**: Internet ke baghair bhi apne saved points ko padh sakein.
2. **Offline Yaad Rakhna**: Flashcard study mode ke zariye exam ya quiz ki preparation kar sakein.
3. **Instant Citation**: Apne notes ya assignment mein 1 click par source ke sath quote paste kar sakein.

### Chrome Mein Kaise Install Karein?
1. Web app mein **"Download & Install"** tab par jayein aur **"Download Extension (.zip)"** par click karein.
2. ZIP file ko extract karein.
3. Chrome browser mein new tab kholein aur type karein: `chrome://extensions`
4. Top-right corner par **Developer mode** toggle ON karein.
5. Top-left corner par **"Load unpacked"** dabayein aur extract kiya hua folder select karein.
6. Toolbar par pin karein aur use karna shuru karein!

---

## 📄 License
This project is licensed under the Apache-2.0 License.
