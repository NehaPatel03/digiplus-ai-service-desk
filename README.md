# DigiPlus AI-Powered Service Desk 🤖🎫

A clean, modern, and intelligent IT Service Desk web application built for the **DigiPlus Technical Assessment**. The application assists support engineers in triaging natural language incident descriptions, generating automated AI root-cause diagnostics, matching relevant technical knowledge-base runbooks, and recording incident resolutions with persistent SQLite storage.

---

## 🌟 Key Features

### 1. Dashboard 📊
- **Real-Time KPI Counters**: Total Incidents, Open Issues (🔴), In Progress (🟡), and Resolved Tickets (🟢).
- **Recent Incidents Feed**: Quick overview of recently filed tickets with direct access to diagnostics and resolution.
- **Priority & Category Distribution**: Visual breakdown of incident severities and technical domains.

### 2. Ticket Management & Lifecycle 🎫
- **Create Tickets**: Form validation with Title, Detailed Description, Priority (`Urgent`, `High`, `Medium`, `Low`), and Category (`Network`, `Software`, `Hardware`, `Access & Security`, `Email & Communication`, `Cloud & Infrastructure`, `Billing & Accounts`, `Other`).
- **Interactive Filtering**: Filter by status tabs, priority, category, or real-time keyword search.
- **Lifecycle Transitions**: Transition status across `Open` ➡️ `In Progress` ➡️ `Resolved` ➡️ `Closed`.
- **Resolution Recording**: Document root causes, actions taken, and mark incidents resolved with timestamps.

### 3. AI Incident Analysis 🤖
- **One-Click AI Diagnosis**: Click the **"Analyze with AI 🤖"** button on any ticket to trigger diagnostic reasoning.
- **Structured Output**:
  - **Executive Summary**: 1-2 sentence overview of the problem.
  - **Identified Root Cause**: Technical diagnosis of why the incident occurred.
  - **Suggested Solution**: Step-by-step actionable remediation guide.
  - **Recommended Classification**: AI suggests optimal Category and Priority with a one-click apply button.
  - **One-Click Resolution Copy**: Transfer AI remediation steps directly into the Resolution Notes box.

### 4. Technical Knowledge Base 🧠
- **Pre-Loaded Support Runbooks**: Comprehensive guides for frequent enterprise issues (VPN timeouts, Outlook Modern Auth loops, Database connection pool exhaustion, AWS S3 403 Access Denied, Network printer offline, Docker/WSL2 resource spikes).
- **Contextual Matching**: Tickets automatically display matching runbooks based on keyword/tag overlap and technical domain.
- **In-Place Runbook Viewer**: Read and copy runbook commands without leaving the ticket.

### 5. Persistent Storage 💾
- Powered by **SQLite** (`data/support_desk.db`) via `better-sqlite3`.
- Auto-seeds realistic initial incidents and technical runbooks on first boot.
- Data persists across server restarts and page refreshes.

---

## 🛠️ Technology Stack

| Area | Technology |
| :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) (App Router, Server Actions & Route Handlers) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) (v4 Dark Mode UI) |
| **Database** | [SQLite](https://www.sqlite.org/) with `better-sqlite3` |
| **AI Engine** | [Google Gemini API](https://ai.google.dev/) (`gemini-2.0-flash` / `gemini-1.5-flash`) + Intelligent Fallback |
| **Icons** | [Lucide React](https://lucide.dev/) + Emojis 🚀 |

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ or v20+ / v22+ recommended)
- `npm` (bundled with Node.js)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure AI API Key (Optional)
Copy the example environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your **Google Gemini API Key**:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```
> 💡 *Note: If no API key is provided, the application automatically uses an intelligent built-in heuristic diagnostic engine matching HuggingFace help-desk datasets, so the application remains 100% functional out-of-the-box.*

### 3. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build & Test
```bash
npm run build
npm run start
```

---

## 🧪 Automated End-to-End Testing

To run the automated verification script testing the entire incident lifecycle (Ticket Creation ➡️ AI Analysis ➡️ Runbook Matching ➡️ Resolution ➡️ Dashboard Stats):

```bash
node test-e2e.mjs
```

---

## 📂 Project Structure

```
d:/assignment/
├── data/
│   └── support_desk.db        # Persistent SQLite database file
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai/analyze/    # AI ticket analysis endpoint
│   │   │   ├── knowledge-base/# KB search and retrieval endpoint
│   │   │   ├── stats/         # Dashboard statistics endpoint
│   │   │   └── tickets/       # CRUD ticket endpoints
│   │   ├── knowledge-base/    # Knowledge Base browser page
│   │   ├── tickets/           # Tickets list and detail pages
│   │   │   └── [id]/          # Ticket detail & AI resolution workbench
│   │   ├── globals.css        # Tailwind styling & dark theme
│   │   ├── layout.tsx         # Root layout with navigation & header
│   │   └── page.tsx           # Dashboard view
│   ├── components/
│   │   ├── Badges.tsx         # Status, priority & category badge components
│   │   ├── CreateTicketModal.tsx # New ticket submission modal
│   │   └── Navbar.tsx         # Global navigation header
│   └── lib/
│       ├── ai.ts              # Gemini AI integration & structured parsing
│       ├── db.ts              # SQLite database schema, seeding & queries
│       └── types.ts           # TypeScript interfaces & domain types
├── test-e2e.mjs               # End-to-end automated test suite
├── .env.example               # Environment variables template
└── README.md                  # Documentation
```

---

## 💡 Design Decisions & Assumptions

1. **Simplicity & Zero-Config Persistence**: We selected embedded SQLite via `better-sqlite3` to ensure zero setup friction, fast synchronous queries, and absolute data persistence without requiring external database servers or Docker containers.
2. **Robust AI Fallback**: The AI service gracefully attempts live Google Gemini generation (`gemini-2.0-flash`). If network restrictions, quota limits, or missing API keys occur, it seamlessly falls back to an intelligent natural language analyzer to prevent any user disruption.
3. **Contextual Knowledge Integration**: Support engineers don't need to switch tabs to search documentation; relevant runbooks are dynamically matched and previewed directly inside the ticket resolution panel.
4. **Clean & Modern UI**: Tailored with Tailwind CSS dark mode, high-contrast badges, micro-animations, and visual indicators for an intuitive support desk experience.
