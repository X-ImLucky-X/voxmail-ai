# 📬 VoxMail AI — Intelligent Email Assistant Powered by Local AI

**An enterprise-grade, privacy-first email productivity assistant that prioritizes messages, extracts actionable tasks, detects calendar events, and automates personalized replies using local LLMs.**

[Explore Docs](#-table-of-contents) • [View Demo](#11-demo-video) • [Report Bug](https://github.com/X-ImLucky-X/voxmail-ai/issues)

---

## 📚 Table of Contents

1. [Overview](#1-overview)
2. [Key Features](#2-key-features)
3. [System Architecture](#3-system-architecture)
4. [Tech Stack](#4-tech-stack)
5. [Folder Structure](#5-folder-structure)
6. [Core Component Breakdown](#6-core-component-breakdown)
7. [AI Processing Pipeline](#7-ai-processing-pipeline)
8. [Authentication & Security](#8-authentication--security)
9. [How to Run](#9-how-to-run)
10. [Screenshots](#10-screenshots)
11. [Demo Video](#11-demo-video)
12. [Future Improvements](#12-future-improvements)
13. [Contributors](#13-contributors)
14. [License](#14-license)

---

## 1. Overview

**VoxMail AI** redefines email management by converting a chaotic inbox into an organized, actionable productivity dashboard. Operating on a mobile-first architecture, it securely interfaces with the Gmail API and runs local inference using **Ollama (Qwen 2.5)**.

By keeping LLM processing completely local, VoxMail AI guarantees **absolute data privacy** while providing deep features like writing style replication, zero-latency caching, semantic task extraction, and deterministic state management.

---

## 2. Key Features

### 📬 Smart Inbox & Triage

- **AI Prioritization:** Multi-class classification scores incoming mail (High/Medium/Low priority).
- **Automated Summaries:** Short, punchy, context-aware bullet points of dense threads.
- **Smart Categorization:** Automatically segments emails into clean channels (Work, Personal, Marketing, Updates).

### 📋 Task Control Hub

- **Deterministic Task Extraction:** Semantic analysis pulls actionable tasks out of email prose.
- **State Tracking:** Complete, edit, or track completion status directly from the app interface.
- **Dashboard Analytics:** High-level metrics showing pending vs. completed tasks extracted from your mail.

### 📅 Event Detection

- Parses emails for dates, time blocks, and meeting agendas.
- Extracts structural data for context vectors (Interviews, Deadlines, Meetings).

### ✍️ Style-Memorized AI Drafts

- **Three-tier Generations:** Instantly produces *Short*, *Professional*, or *Detailed* replies.
- **Style Memory Engine:** Implicitly learns user preferences and writing patterns over time by analyzing approved drafts.

### ⚡ Local & Secure

- **Privacy Centric:** No third-party LLM APIs. Data stays locally hosted inside your network infrastructure.
- **Supabase Protected:** Secure multi-tenant architecture isolating relational states per authenticated `user_id`.

---

## 3. System Architecture

```text
               ┌──────────────────────────────┐
               │   React Native (Expo App)    │
               └──────────────┬───────────────┘
                              │
                              ▼ HTTPS / WebSockets (JWT Bearer Token)
               ┌──────────────────────────────┐
               │       FastAPI Backend        │
               └──────────────┬───────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    Gmail API    │  │ Supabase Auth   │  │   Cache Layer   │
│ (OAuth / Mail)  │  │  & PostgreSQL   │  │  (In-Memory/DB) │
└─────────────────┘  └─────────────────┘  └─────────────────┘
                              │
                              ▼ Local IPC / Loopback
                     ┌─────────────────┐
                     │   Ollama Engine │
                     │  (Qwen 2.5 LLM) │
                     └────────┬────────┘
                              │
         ┌────────────────────┴────────────────────┐
         ▼                                         ▼
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│        AI Triage Agent          │       │         AI Draft Agent          │
├─────────────────────────────────┤       ├─────────────────────────────────┤
│  • Priority Label Generation    │       │  • Style Memory Personalization │
│  • Semantic Task Extraction     │       │  • 3-Tier Variant Creation      │
│  • Intent & Event Parsing       │       │  • Context Assembly             │
└─────────────────────────────────┘       └─────────────────────────────────┘
```

---

## 4. Tech Stack

### Frontend

- **Framework:** React Native (Expo Workflow)
- **Language:** TypeScript
- **State & Networking:** Axios, Native Context API, Async Storage

### Backend

- **Core Engine:** FastAPI (Python 3.10+)
- **Asynchronous Driver:** AsyncIO, Uvicorn (ASGI web server)
- **Data Validation:** Pydantic v2

### AI Infrastructure

- **LLM Runtime:** Ollama Local Server
- **Target Model:** Qwen 2.5 (7B Parameter Optimized Variant)
- **Context Core:** Tokenized text parsing & multi-agent system

### Database & Security

- **Auth & Store:** Supabase DB (PostgreSQL relational architecture)
- **Token Protocol:** Cryptographic JSON Web Tokens (JWT)

---

## 5. Folder Structure

```bash
voxmail-ai/
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   │   ├── triage_agent.py        # Email structure, task, & priority parsing
│   │   │   └── draft_agent.py         # Response generation and formatting
│   │   ├── api/
│   │   │   └── routes.py              # Main API endpoint definitions
│   │   ├── services/
│   │   │   ├── gmail_service.py       # OAuth workflow and IMAP/REST synchronization
│   │   │   ├── cache_service.py       # Low-latency local storage for AI responses
│   │   │   ├── task_service.py        # Task CRUD logic and state persistence
│   │   │   ├── auth_service.py        # Token validation handlers
│   │   │   ├── style_memory.py        # User writing style feature engine
│   │   │   ├── email_pipeline.py      # Master orchestration layer
│   │   │   └── supabase_service.py    # Remote DB connection pool management
│   │   └── models/
│   │       └── email_models.py        # Type enforcement using Pydantic
│   ├── main.py                        # Server entry point
│   └── requirements.txt               # Backend dependencies
├── mobile-app/
│   ├── src/
│   │   ├── screens/                   # Inbox, Details, Tasks, Dashboard
│   │   ├── components/                # Reusable UI widgets
│   │   ├── context/                   # Global state management
│   │   ├── services/                  # Network configuration for endpoints
│   │   └── navigation/                # Bottom tabs and stack routers
│   ├── App.tsx                        # Root layout entry
│   └── app.json                       # Expo application metadata
└── README.md
```

---

## 6. Core Component Breakdown

### Mobile Client Application

- **Smart Inbox Screen:** Real-time email previews color-coded with calculated semantic priority weights.
- **Analysis Workspace Panel:** Visual readout showing long emails converted into clean bullet points, detected calendar alerts, and inline AI generation options.
- **Task Control Center:** A central layout to tick off checklist items pulled from your messages.

### Intelligent Backend Services

- **AI Triage Agent:** Runs deterministic functional schemas over unstructured strings using structural inference prompts.
- **Cache Acceleration Engine:** Deduplicates downstream tasks. If an email timestamp and message structure match an item in the cache, it yields an immediate response without spinning up the LLM.
- **Style Engine:** Evaluates past approved messages to optimize prompt engineering templates dynamically.

---

## 7. AI Processing Pipeline

```text
[ Incoming Email Webhook ] ──> ( Fetch Raw Payload via Gmail API )
                                               │
                                               ▼
                               ┌──────────────────────────────┐
                               │  FastAPI Orchestration Core  │
                               └──────────────┬───────────────┘
                                               │
                       ┌───────────────────────┴───────────────────────┐
                       ▼ [Miss]                                        ▼ [Hit]
         ┌───────────────────────────┐                        ┌─────────────────────────┐
         │ Check Cache Storage DB    │                        │ Serve Fast Response     │
         └─────────────┬─────────────┘                        │ From Memory Buffer      │
                       │                                      └─────────────────────────┘
                       ▼
       ┌──────────────────────────────┐
       │   Local Ollama Qwen 2.5      │
       ├──────────────────────────────┤
       │  1. Run Intent Triage        │
       │  2. Build Context Summaries  │
       │  3. Extract Task Properties  │
       │  4. Apply Style Constraints  │
       └──────────────┬───────────────┘
                       │
                       ▼
       ┌──────────────────────────────┐
       │ Multi-Variant Generation     │
       ├──────────────────────────────┤
       │  • Short  • Professional     │
       │  • Detailed                  │
       └──────────────┬───────────────┘
                       │
                       ▼
         ┌───────────────────────────┐
         │ Sync Cache & Push State   │
         │ to Supabase Database      │
         └─────────────┬─────────────┘
                       │
                       ▼
         ┌───────────────────────────┐
         │ Stream Payload Out to     │
         │ Mobile Screen Device      │
         └───────────────────────────┘
```

---

## 8. Authentication & Security

- **JWT Verification Pipeline:** Secure middleware protects API routes. All endpoints check incoming headers for a valid cryptographic `Bearer <JWT>` signature from Supabase before running data transactions.
- **Row-Level User Isolation:** The underlying database schemas enforce explicit user boundaries. App states like task lists, specific cache objects, or user style arrays include a parent foreign key bind matching an isolated `user_id`.

---

## 9. How to Run

### Step 1: Clone the Repository

```bash
git clone https://github.com/X-ImLucky-X/voxmail-ai.git
cd voxmail-ai
```

### Step 2: Configure the Backend Environment

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Unix/macOS
source venv/bin/activate

pip install -r requirements.txt
```

### Step 3: Install & Launch Ollama Locally

1. Download and install Ollama for your system from [ollama.com](https://ollama.com).
2. Pull the target model:

```bash
ollama run qwen2.5:7b
```

### Step 4: Setup Third-Party API Developer Consoles

**Google Cloud:**
- Enable the **Gmail API**, configure your OAuth Consent screen, download your credentials file, name it `credentials.json`, and place it in the `/backend` root directory.

**Supabase:**
- Create a project and populate an `.env` file in `/backend`:

```env
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_project_anon_key
```

### Step 5: Start the App Services

```bash
# Start the FastAPI backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# In a new terminal, start the Expo frontend
cd ../mobile-app
npm install
npx expo start
```

---

## 10. Screenshots

| 📬 Smart Inbox UI | 📄 Email Analysis Detail | 📋 Task Control Center |
|:-----------------:|:------------------------:|:----------------------:|
| *[Place Inbox Screenshot Here]* | *[Place Analysis Screenshot Here]* | *[Place Task Center Screenshot Here]* |

| ✍️ AI Response Generation | 📊 Analytical Dashboard |
|:-------------------------:|:-----------------------:|
| *[Place Replies Screenshot Here]* | *[Place Dashboard Screenshot Here]* |

---

## 11. Demo Video

### 🎥 Project Demonstration Walkthrough

Click the thumbnail below to watch the deep-dive engineering review and product walkthrough on YouTube:

<!-- Replace the placeholder below with your actual YouTube thumbnail and link -->
[![VoxMail AI Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)

---

## 12. Future Improvements

- [ ] **Direct Native Google Calendar Integration:** One-click syncing of detected events straight to your device calendar.
- [ ] **Long-Term Retrieval-Augmented Generation (RAG):** Connect a local vector DB to query older email archives instantly.
- [ ] **Automated Rule Workflows:** Set up background rules to automatically handle repetitive receipts and newsletters.
- [ ] **Voice-Activated Action Commands:** Dictate instructions via your microphone to auto-generate context replies on the go.
- [ ] **Multi-Protocol Email Client Setup:** Add IMAP/SMTP layer configurations to support Outlook, iCloud, and custom domains.

---

## 13. Contributors

<!-- Add contributor profiles here -->

---

## 14. License

This repository is licensed and distributed under the terms of the **MIT License**. Refer to the [LICENSE](LICENSE) file for full details.

---

> **Give this project a ⭐ if it helped optimize your inbox productivity workflow!**