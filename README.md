# DigiPlus AI-Powered Service Desk 🤖🎫

A clean, modern, and intelligent IT Service Desk web application built for the **DigiPlus Technical Assessment**. The application assists support engineers in triaging natural language incident descriptions, generating automated AI root-cause diagnostics, matching relevant technical knowledge-base runbooks, and recording incident resolutions with persistent SQLite storage.

---

## 🌟 Key Features

## Main Features

### 1. Dashboard
- Shows total, open, in-progress, and resolved incidents.
- Displays recent incidents.
- Shows incident priority and category summaries.

### 2. Ticket Management
- Create tickets with title, description, priority, and category.
- Search and filter tickets.
- Move tickets through Open, In Progress, Resolved, and Closed.
- Add root cause and resolution details.

### 3. AI Incident Analysis
- Analyze incidents using Google Gemini.
- Generates a short summary, possible root cause, and suggested solution.
- Recommends the appropriate priority and category.
- Allows AI-generated solutions to be copied into the resolution notes.

### 4. Knowledge Base
- Includes support guides for common technical issues.
- Shows relevant guides based on the incident.
- Allows engineers to view and copy troubleshooting steps.

### 5. Data Storage
- Uses SQLite to store incidents and knowledge-base data.
- Data remains available after refreshing or restarting the application.
- Includes sample incidents and support guides.

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

