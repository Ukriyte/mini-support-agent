# Support Live Chat Agent

A minimal AI-powered customer support chat widget that simulates a live support experience with persistent conversations and LLM-backed responses.

---

## 🚀 Running Locally

### Backend
```bash
cd backend
npm install
```
Create `.env`:
```env
PORT=3001
GEMINI_API_KEY=your_api_key
```
Run:
```bash
npm run dev
```
### Frontend
```bash
cd frontend
npm install
```
Create `.env`:
```env
VITE_API_URL=http://localhost:3001
```
Run:
```bash
npm run dev
```

## 🗄 Database Setup

- Uses **SQLite** via [`better-sqlite3`](https://www.npmjs.com/package/better-sqlite3)
- No migrations required
- Tables are **auto-created on backend startup**

### Tables

- `conversations(id, created_at)`
- `messages(id, conversation_id, sender, text, created_at)`

### Reset Database (Development Only)

```bash
rm chat.db
```

## 🔐 Environment Variables

Backend Environment Variables:

- `GEMINI_API_KEY` – Google Gemini API key (free tier supported)
- `PORT` – Port on which the backend server runs

Frontend Environment Variables:

- `VITE_API_URL` – Base URL of the backend API


> 🔒 Secrets are never committed to the repository.

---

## 🧠 Architecture Overview

### Backend Structure
```bash
routes → services → db / llm
```
### Key Components

- `chat.routes.ts` – HTTP routing layer
- `chat.service.ts` – Conversation and message persistence logic
- `llm.service.ts` – LLM abstraction layer
- `db.ts` – SQLite connection and schema initialization

### Design Goals

- Clear separation of concerns
- Stateless backend (session ID passed from frontend)
- Easy to swap LLM providers (e.g., Gemini, OpenAI)
- The backend is channel-agnostic; chat is treated as a generic message stream, making it easy to add additional channels (e.g., WhatsApp, Instagram) without changing core business logic.

## 🤖 LLM Notes

- **Provider:** Google Gemini (`gemini-1.5-flash`)
- Chosen to avoid paid API friction during development
- System prompt defines a helpful **e-commerce support agent**
- FAQ knowledge (shipping, returns, support hours) is embedded directly in the prompt
- Only the **latest 20 messages** are sent to the LLM to prevent context bloat

---

## ⚠️ Issues Encountered & Decisions

- OpenAI SDK had frequent breaking changes → switched to Gemini
- Free OpenAI API credits are no longer guaranteed
- Prompt size could grow unbounded → capped message history window
- Reload persistence required explicit `sessionId` handling on the frontend
- SQLite query ordering needed adjustment to fetch **latest** messages instead of oldest

---

## 🛡 Robustness

- Empty messages are rejected
- Long messages are safely truncated
- LLM / API failures return friendly fallback responses
- Invalid session IDs return an empty conversation history
- Backend never crashes on malformed or bad input

## 🔮 If I Had More Time

- Implement streaming responses for improved UX
- Add per-session rate limiting to prevent abuse
- Store FAQs in the database instead of embedding them in the prompt
- Introduce basic analytics and usage metrics
- Add unit and integration test coverage


## 🚀 Deployment Notes

- Frontend and backend are deployed separately
- Backend secrets are configured via the hosting platform
- Frontend uses `VITE_API_URL` to point to the deployed backend
- No secrets are exposed to the client
