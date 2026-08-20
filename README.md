# Aiva ⚡

> **Your 24/7 AI-Powered Campus Placement & Technical Viva Mentor**

[![Live Demo](https://img.shields.io/badge/Live_Demo-aiva--chatbot--sigma.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://aiva-chatbot-sigma.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Powered by Gemini](https://img.shields.io/badge/AI-Google_Gemini_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/)
[![React 19](https://img.shields.io/badge/Frontend-React_19_Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)

🔗 **Live Production URL**: **[https://aiva-chatbot-sigma.vercel.app/](https://aiva-chatbot-sigma.vercel.app/)**

---

## 🌟 What is Aiva?

**Aiva** is a high-speed, intelligent AI technical assistant and campus recruitment training platform. Built specifically for engineering students and job seekers, Aiva simulates real technical interview rounds and online assessment tests for top recruiters like **TCS, Infosys, Wipro, Accenture, Cognizant, Amazon, Microsoft, and Zoho**.

Powered by Google Gemini's low-latency flash models with automatic multi-model failover and an anti-repeat dynamic shuffle engine, Aiva guarantees continuous practice with zero repetitive questions and zero downtime.

---

## 🚀 Key Modules & Features

### 🏠 1. Placement Hub Dashboard
* **Mode Selection**: Clean landing hub with 3 action cards for **MCQ Tests**, **1:1 Technical Viva**, and **AI Mentor Chat**.
* **Highlights & Metrics**: Quick metrics tracking attempted questions, average score, and time taken.

### 📝 2. Placement Technical MCQ & OA Tests
* **Core Topics**: Dedicated MCQs for *C Output & Pointers*, *Java Core & OOPs*, *C++ STL*, *Python Mutability*, *DSA & Complexity*, *DBMS & SQL Queries*, and *OS & Networks*.
* **Interactive Option Cards (A, B, C, D)**: Clean glassmorphic selection cards with active glow and keyboard/click support.
* **Proper Multi-Line Code Syntax**: Formats code snippets with `JetBrains Mono`, clean indentations, and syntax highlighting.
* **Instant Evaluation**: Immediate scoring (10/10 or 0/10) with detailed technical explanations of execution flow and compiler behavior.

### 🎓 3. Technical Viva Interview Room (PYQ-Centric)
* **Company-Specific PYQs**: Filter questions tailored to *TCS / Infosys*, *Accenture / Cognizant*, or *Amazon / Microsoft / Zoho*.
* **Anti-Repeat Dynamic Shuffle**: Tracks recently asked questions in session memory to guarantee fresh topics every turn.
* **Realistic Interview Flow**:
  * ⏱️ **Synchronized Response Timer**: Timer begins strictly after the question appears on screen.
  * 🎙️ **Speech-to-Text Voice Recording**: Answer mock viva questions naturally using voice input (Web Speech API).
  * 🔊 **Interviewer Voice (Text-to-Speech)**: Listen to interview questions read out loud.
  * 💡 **Interviewer Focus Hints**: Reveals key architectural and conceptual clues.
  * 📊 **Multi-Metric Scorecard**: Score out of 10, verdict, missed points checklist, and formatted placement model answers.

### 💬 4. Ultra-Fast AI Placement Mentor Chat
* **Instant Streaming**: Fast Markdown streaming responses with code copy buttons.
* **Categorized Prompt Starters**: Filterable starter chips for quick PYQs across C, C++, Java, Python, and CS Fundamentals.
* **Voice Dictation & Text-to-Speech**: Hands-free conversation.

### 🎨 5. Eye-Comfort Dual Themes & Mobile Menu Bar
* **🌙 Dark Mode**: Deep Sapphire Blue & Obsidian Black glassmorphism.
* **☀️ Light Mode**: Fresh Emerald Green & Pure White frosted glass for eye comfort.
* **📱 Mobile Top Menu Bar**: Top hamburger menu (`☰ Menu`) with a glassmorphic slide-down drawer so navigation tabs are never hidden on smaller mobile screens.

---

## 🛠️ Architecture & Tech Stack

* **Frontend**: React 19, Vite, Vanilla CSS (Glassmorphism & Responsive Design), Web Speech API, React-Markdown, Remark-GFM.
* **Backend**: Node.js, Express, `@google/genai` SDK, CORS, Dotenv, Serverless Function handler for Vercel.
* **AI Model Engine**: Multi-model fallback (`gemini-flash-lite-latest` → `gemini-3.5-flash-lite` → `gemini-3.1-flash-lite` → `gemini-3.6-flash`) with an offline curated question bank.

---

## 💻 Local Development Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* [Google AI Studio API Key](https://aistudio.google.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/aniruddhadhar7/Aiva-chatbot.git
cd Aiva-chatbot
```

### 2. Backend Setup
1. Navigate to the server folder and install dependencies:
   ```bash
   cd server
   npm install
   ```
2. Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Add your Gemini API key in `server/.env`:
   ```env
   PORT=5000
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
4. Start the backend:
   ```bash
   npm run dev
   ```
   Runs at: `http://localhost:5000`

### 3. Frontend Setup
1. In a new terminal, navigate to the client folder and install dependencies:
   ```bash
   cd client
   npm install
   ```
2. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   Runs at: `http://localhost:5173`

---

## 🌐 Deploy to Vercel

1. Import the repository into **[Vercel](https://vercel.com/new)**.
2. In **Environment Variables**, add:
   * `GEMINI_API_KEY`: *(Your Google Gemini API Key)*
3. Click **Deploy**. Vercel will automatically build the client and deploy the serverless `/api` endpoints!

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
