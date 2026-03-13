#  User Management System

> A professional-grade, fully client-side dashboard for managing users — built with **HTML5**, **CSS3**, and **TypeScript**.**JavaScript**

![HTML5](https://img.shields.io/badge/HTML5-E44D26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-264DE4?style=for-the-badge&logo=css3&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## 📌 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [File Structure](#file-structure)
- [How to Run](#how-to-run)
- [How I Built It](#how-i-built-it)
- [Data Model](#data-model)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [What I Learned](#what-i-learned)
- [Author](#author)

---

## Overview

The **User Management System (UMS)** is a fully browser-based web app with no backend or server required. It lets you create, read, update, and delete user records with a clean dark UI. All data is saved automatically using the browser's `localStorage` API.

The project started as a basic CRUD table and was upgraded into a full dashboard with multiple views, CSV import/export, an activity log, drag-to-reorder, dark/light mode, and much more.

---

## Features

| Feature | Description |
|---|---|
| ✅ CRUD | Add, edit, view, and delete users |
| 🔍 Search | Real-time search by name or email |
| 🎛️ Filters | Filter by specialty and status |
| 🔃 Sort | Sort by name, age, specialty, or join date (asc/desc) |
| 📋 Table View | Paginated, drag-to-reorder table |
| 🃏 Card View | Responsive card grid layout |
| 📌 Kanban View | 3-column board by user status |
| 📄 CSV Export | Download all users as `.csv` |
| 📥 CSV Import | Upload a `.csv` to add users |
| 👁️ Profile Modal | Full user profile with all details |
| 🕓 Activity Log | Live sidebar of last 10 actions |
| 🔢 Stat Counters | Animated number counters |
| 🎨 Auto Avatars | Colour-coded initials avatar per user |
| 🏷️ Status Badges | Active / Pending / Inactive |
| 📝 Notes Field | 200-char note per user with live counter |
| ✅ Validation | Inline form error messages |
| 💪 Name Strength | Live feedback while typing |
| 💾 Draft Autosave | Form saved to localStorage on each keystroke |
| ↕️ Drag & Drop | Drag table rows to reorder |
| 🌙 Dark / Light Mode | Full theme switch, persisted |
| ⌨️ Keyboard Shortcuts | `Ctrl+N`, `Ctrl+F`, `Ctrl+E`, `1/2/3`, `Esc`, `?` |
| ✨ Particle BG | Canvas-animated floating particles |
| 📱 Responsive | Works on desktop, tablet, and mobile |

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **HTML5** | Page structure and semantic markup |
| **CSS3** | Styling, animations, dark/light themes via CSS variables |
| **TypeScript** | Type-safe source code (`main.ts`) |
| **JavaScript ES6** | Compiled output loaded by the browser (`main.js`) |
| **Font Awesome 6.5** | Icons throughout the UI |
| **Google Fonts** | `Space Grotesk` + `JetBrains Mono` |
| **localStorage API** | Data persistence between sessions |
| **Canvas API** | Animated particle background |
| **Blob / FileReader API** | CSV file export and import |

---

## File Structure

```
user-management/
├── index.html      ← Page structure, all modals, and layout
├── style.css       ← All styles (dark theme, animations, responsive)
├── main.ts         ← TypeScript source — edit this to make changes
└── main.js         ← Compiled JavaScript — loaded by the browser
```

> ✅ No build tools, no frameworks, no npm install needed to **run** the project.

---

## How to Run

### Option A — Just open it
1. Download or clone the project folder
2. Open `index.html` in any modern browser
3. Done — it runs entirely in the browser

### Option B — Edit the TypeScript & recompile
1. Install [Node.js](https://nodejs.org)
2. Install the TypeScript compiler:
   ```bash
   npm install -g typescript
   ```
3. Edit `main.ts`, then compile:
   ```bash
   npx tsc main.ts --target ES6 --lib ES6,DOM
   ```
4. Refresh `index.html` in your browser

---

## How I Built It

### Step 1 — Original Version
Started with a simple CRUD table in plain HTML/CSS/JS:
- Users stored in an array, persisted with `localStorage`
- Basic modal form for add/edit
- Search and specialty filter
- Animated gradient background
- Confetti on save, ripple on button click

### Step 2 — Redesign
Planned a full visual overhaul before writing new code:
- **Dark theme** as default with CSS custom properties (`--bg`, `--text`, `--accent`)
- `Space Grotesk` font replacing Segoe UI
- Canvas particle background replacing the gradient
- Glassmorphism surfaces with `backdrop-filter: blur`

### Step 3 — Migrate to TypeScript
Rewrote the JS in TypeScript with full type safety:

```typescript
interface User {
  id:        number;
  name:      string;
  email:     string;
  age:       number;
  specialty: string;
  createdAt: string;
  avatar:    string;
  status:    'active' | 'inactive' | 'pending';
  notes:     string;
}
```

Compiled with:
```bash
npx tsc main.ts --target ES6 --lib ES6,DOM
```

### Step 4 — Adding Features One by One

**Three View Modes**
Three render functions (`renderTableView`, `renderCardView`, `renderKanbanView`) called by a shared `renderAll()` based on the `currentView` state variable.

**CSV Export**
```typescript
const blob = new Blob([csvString], { type: 'text/csv' });
const url  = URL.createObjectURL(blob);
const a    = document.createElement('a');
a.href = url; a.download = 'users.csv'; a.click();
```

**CSV Import**
A hidden `<input type="file">` triggers `FileReader`, which reads the file as text, splits by newlines, and parses each row into a `User` object. Duplicate emails are skipped.

**Activity Log**
Every action calls `logActivity(action, detail)` which pushes an `ActivityEntry` onto the log array, saves it to `localStorage`, and re-renders the sidebar `<ul>`.

**Auto Avatars**
Colour is chosen deterministically — ASCII codes of the name are summed and used as an index into a 10-colour palette:
```typescript
function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
```

**Animated Stat Counters**
A `setInterval` at ~60fps applies a cubic ease-out to animate numbers from old to new value.

**Drag-to-Reorder**
HTML5 Drag and Drop API on table rows. On `drop`, the source user is spliced out of the array and inserted at the destination index.

**Bulk Select & Delete**
Each row has a checkbox that adds/removes the user ID from a `Set<number>`. A "Select All" checkbox toggles all IDs. The bulk-delete button appears only when `selectedIds.size > 0`.

**Pagination**
```typescript
const page = list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
```
Page resets to 1 on any filter or search change.

**Draft Autosave**
Every `input` event calls `saveDraft()`, storing form values as JSON under `'ums_draft'`. On modal open, `restoreDraft()` repopulates the fields. Cleared on successful submit.

**Canvas Particles**
60 particle objects with random positions and velocities, redrawn every frame with `requestAnimationFrame`, bouncing off viewport edges.

**Dark / Light Mode**
All colours are CSS custom properties on `:root`. A `body.light-mode` class overrides them. One class toggle is all it takes — no JS colour logic:
```css
body.light-mode {
  --bg:   #f0f0f8;
  --text: #1a1a2e;
  /* ... */
}
```

### Step 5 — Polish & Responsive
- Media queries at 1024px, 768px, 480px
- Statistics grid: 4 → 2 → 1 columns
- Table scrolls horizontally on small screens
- All elements keyboard-focusable with `focus-visible` outlines
- `Escape` closes any open modal

---

## Data Model

Each user is stored as a JSON object:

```json
{
  "id":        1748000000001,
  "name":      "Ali Housseny Mohammed",
  "email":     "ali@dev.io",
  "age":       19,
  "specialty": "softwareengineer",
  "status":    "active",
  "notes":     "Legend of the team",
  "createdAt": "2025-05-23T14:00:00.000Z",
  "avatar":    "#6C63FF"
}
```

**localStorage keys:**
| Key | Contents |
|---|---|
| `ums_users_v2` | JSON array of all users |
| `ums_activity` | Last 50 activity log entries |
| `ums_theme` | `"dark"` or `"light"` |
| `ums_draft` | Autosaved form values |

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl / Cmd + N` | Open Add New User modal |
| `Ctrl / Cmd + F` | Focus the search input |
| `Ctrl / Cmd + E` | Export all users to CSV |
| `1` | Switch to Table view |
| `2` | Switch to Card view |
| `3` | Switch to Kanban view |
| `?` | Open Keyboard Shortcuts panel |
| `Escape` | Close any open modal |
| Double-click row | Open Edit modal for that user |
| Drag row | Reorder users in the table |

---

## What I Learned

- Writing TypeScript interfaces and compiling TS → JS
- HTML5 Drag and Drop API for reorderable rows
- `Blob` + `URL.createObjectURL` for browser-side file downloads
- `FileReader` API to parse uploaded CSV files
- CSS custom properties for instant theme switching
- Animated counters with `requestAnimationFrame` and easing functions
- Drawing and animating on an HTML5 `<canvas>` element
- Building pagination with ellipsis logic
- Using `Set<number>` for efficient multi-selection state
- Keyboard shortcut handlers with `event.key` and modifier keys

---

## Author

**Ali Housseny Mohammed**
- 📧 alihouseny61@gmail.com
- 💼 Software Engineer & Web Developer
- 📅 2025

---


