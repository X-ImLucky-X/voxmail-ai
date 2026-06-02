# 📬 VoxMail AI — Intelligent Email Productivity Assistant

> An AI-powered email assistant that automatically prioritizes emails, extracts actionable tasks, detects calendar-worthy events, and generates personalized replies using local LLMs.

---

# 📚 Table of Contents

1. Overview
2. Key Features
3. System Architecture
4. Tech Stack
5. Folder Structure
6. Mobile App Features
7. Backend Features
8. AI Processing Pipeline
9. Smart Email Workflow
10. How to Run
11. Screenshots
12. Demo Video
13. Future Improvements
14. Contributors
15. Conclusion

---

# 1. Overview

VoxMail AI is a mobile-first intelligent email productivity assistant designed to reduce inbox overload and improve productivity.

The platform combines:

* Gmail Integration
* AI Email Analysis
* Smart Priority Detection
* Task Extraction
* Calendar Event Detection
* Personalized Reply Generation
* Writing Style Memory
* Smart Inbox Management

Unlike traditional email clients, VoxMail AI actively understands email content and helps users focus on what matters most.

---

# 2. Key Features

### 📬 Smart Inbox

* AI-powered email categorization
* Priority-based sorting
* Intelligent email summaries
* Visual priority indicators

### 📋 Task Extraction

* Automatically extracts actionable tasks
* Persistent task tracking
* Task completion management
* Dedicated task center

### 📅 Calendar Event Detection

* Detects interviews
* Detects meetings
* Detects deadlines
* Extracts event details

### ✉️ AI Reply Generation

Generates:

* Short Reply
* Professional Reply
* Detailed Reply

### 🧠 Style Memory

* Learns writing patterns
* Generates personalized responses
* Maintains communication consistency

### 📊 Productivity Dashboard

* Inbox analytics
* Priority distribution
* Task statistics
* Completion tracking

### ⚡ Local AI Processing

* Ollama Integration
* Qwen 2.5 LLM
* Offline-capable AI workflows
* Privacy-friendly architecture

---

# 3. System Architecture

```text
React Native Mobile App
            │
            ▼
       FastAPI Backend
            │
 ┌──────────┼──────────┐
 ▼          ▼          ▼
Gmail API  Ollama    Cache Layer
           Qwen2.5
            │
            ▼
AI Analysis Engine
            │
 ┌──────────┼──────────┐
 ▼          ▼          ▼
Priority   Tasks    Calendar
Detection Extraction Detection
            │
            ▼
      Reply Generation
```

---

# 4. Tech Stack

| Technology   | Purpose            |
| ------------ | ------------------ |
| React Native | Mobile Application |
| Expo         | Mobile Development |
| FastAPI      | Backend API        |
| Python       | Backend Logic      |
| Ollama       | Local LLM Runtime  |
| Qwen 2.5     | AI Processing      |
| Gmail API    | Email Access       |
| Pydantic     | Validation         |
| Uvicorn      | API Server         |
| AsyncIO      | Backend Processing |

---

# 5. Folder Structure

```bash
voxmail-ai/
│
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   │   ├── triage_agent.py
│   │   │   └── draft_agent.py
│   │   │
│   │   ├── api/
│   │   │   └── routes.py
│   │   │
│   │   ├── services/
│   │   │   ├── cache_service.py
│   │   │   ├── gmail_service.py
│   │   │   ├── style_memory.py
│   │   │   └── task_service.py
│   │   │
│   │   └── utils/
│   │
│   ├── data/
│   ├── requirements.txt
│   └── main.py
│
├── mobile-app/
│   ├── src/
│   │   ├── screens/
│   │   ├── navigation/
│   │   ├── services/
│   │   └── components/
│   │
│   └── App.tsx
│
└── README.md
```

---

# 6. Mobile App Features

## 📬 Inbox Screen

* Smart email sorting
* Search functionality
* Priority indicators
* Dashboard analytics

## 📄 Email Detail Screen

Displays:

* Summary
* Priority
* Tasks
* Calendar Suggestions
* AI Replies

## 📋 Task Center

* Extracted tasks
* Completion tracking
* Priority labels
* Persistent storage

---

# 7. Backend Features

## 🧠 AI Triage Agent

Responsible for:

* Category detection
* Priority detection
* Summary generation
* Task extraction
* Calendar detection

## ✉️ AI Draft Agent

Responsible for:

* Reply generation
* Reply necessity detection
* Style adaptation

## ⚡ Cache Layer

* Faster reloads
* Reduced AI calls
* Improved performance

---

# 8. AI Processing Pipeline

### Step 1

Fetch emails from Gmail.

### Step 2

Analyze email content using Qwen 2.5.

### Step 3

Generate:

* Category
* Priority
* Summary
* Tasks
* Calendar Events

### Step 4

Generate personalized replies.

### Step 5

Store results in cache.

---

# 9. Smart Email Workflow

```text
Email Received
      │
      ▼
AI Analysis
      │
      ▼
Priority Detection
      │
      ▼
Task Extraction
      │
      ▼
Calendar Detection
      │
      ▼
Reply Generation
      │
      ▼
Smart Inbox + Task Center
```

---

# 10. How to Run

## Clone Repository

```bash
git clone https://github.com/X-ImLucky-X/voxmail-ai.git

cd voxmail-ai
```

## Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt
```

## Start Ollama

```bash
ollama run qwen2.5:7b
```

## Run Backend

```bash
python main.py
```

## Mobile App

```bash
cd mobile-app

npm install

npx expo start
```

---

# 11. Screenshots

## 📬 Inbox

Add screenshot here.

## 📄 Email Detail

Add screenshot here.

## 📋 Task Center

Add screenshot here.

## 📊 Dashboard

Add screenshot here.

---

# 12. Demo Video

🎥 Add YouTube demo link here.

---

# 13. Future Improvements

* Google Calendar Integration
* Voice Commands
* Multi-Account Support
* Outlook Integration
* Team Collaboration
* Push Notifications
* AI Meeting Scheduling
* Sentiment Analysis
* RAG-based Long-Term Memory

---

# 14. Contributors

| Name                | GitHub                         |
| ------------------- | ------------------------------ |
| Lakshya Kumar Singh | https://github.com/X-ImLucky-X |

---

# 15. Conclusion

VoxMail AI demonstrates how local LLMs can transform email management into an intelligent productivity workflow.

The project combines:

* Mobile Development
* AI Engineering
* Email Automation
* Productivity Systems
* Local LLM Infrastructure

into a unified AI-powered email assistant.

---

⭐ If you found this project useful, consider starring the repository.
