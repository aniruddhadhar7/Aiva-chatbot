# Aiva ⚡

**Aiva** is a high-speed, intelligent AI technical assistant and campus placement viva simulator. Powered by Google Gemini's low-latency flash models with automatic multi-model failover and a dynamic anti-repeat shuffle engine, Aiva provides instant technical mentoring and interview practice across core computer science and programming domains.

---

## 🌟 Key Features

### 🎓 1. Placement Viva Room (PYQ-Centric)
* **Topic Specialization**: Comprehensive coverage across **C Programming**, **Java (Core & OOPs)**, **C++ (OOPs & STL)**, **Python (Core & Scripting)**, **DBMS & SQL**, **Operating Systems**, **Computer Networks**, **Data Structures & Algorithms**, and **React & Full Stack (MERN)**.
* **Target Company PYQs**: Filters and company badges for top campus recruiters (*TCS, Infosys, Wipro, Accenture, Cognizant, Amazon, Microsoft, Zoho, Cisco*).
* **Anti-Repeat Dynamic Shuffle**: Remembers previously asked questions in the session to guarantee fresh, varied subtopics with zero annoying repeats.
* **Realistic Interview Flow**:
  * ⏱️ **Synchronized Response Timer**: Timer begins strictly after the question is rendered on screen.
  * 🎙️ **Speech-to-Text Voice Recording**: Answer mock viva questions naturally using voice input (Web Speech API).
  * 🔊 **Interviewer Voice (Text-to-Speech)**: Listen to interview questions read out loud.
  * 💡 **Interviewer Focus Hints**: Reveals key architectural and conceptual focus points.
  * 📊 **Instant Multi-Metric Scorecard**: Score out of 10, verdict, strengths, missed points checklist, and formatted benchmark model answers.

### 💬 2. Ultra-Fast AI Chat
* **Instant Streaming**: Fast Markdown streaming responses with code syntax formatting and copy buttons.
* **Categorized Prompt Starters**: Filterable starter chips for *C & C++ PYQs*, *Java PYQs*, *Python PYQs*, and *Core CS PYQs*.
* **Voice Dictation & Text-to-Speech**: Hands-free conversation.
* **Responsive Dark Glassmorphism**: Clean, edge-to-edge mobile and desktop UI built with `100dvh` viewport adaptation.

---

## 🛠️ Architecture & Tech Stack

* **Frontend**: React 19, Vite, Vanilla CSS (Glassmorphism & Responsive Design), Web Speech API, React-Markdown.
* **Backend**: Node.js, Express, `@google/genai` SDK, CORS, Dotenv.
* **AI Model Engine**: Multi-model fallback (`gemini-flash-lite-latest` → `gemini-3.5-flash-lite` → `gemini-3.1-flash-lite` → `gemini-3.6-flash`) with an offline curated fallback question bank.

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* [Google AI Studio API Key](https://aistudio.google.com/) (Free tier available)

---

### 1. Clone the Repository
```bash
git clone https://github.com/aniruddhadhar7/aivachat.git
cd aivachat
```

---

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

3. Open `.env` and add your Google Gemini API key:
   ```env
   PORT=5000
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   GEMINI_MODEL=gemini-flash-lite-latest
   ```

4. Start the backend server:
   ```bash
   npm start
   # or for live reloading:
   npm run dev
   ```
   Backend will run at: `http://localhost:5000`

---

### 3. Frontend Setup
1. Open a new terminal window, navigate to the client directory, and install dependencies:
   ```bash
   cd client
   npm install
   ```

2. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   Frontend will run at: `http://localhost:5173`

---

## 🔒 API Key & Security Best Practices

* Never commit your `.env` file containing real API keys to GitHub.
* `.env` is included in `.gitignore` by default.
* Distribute only `.env.example` as a template for other developers.

---

## 📂 Project Structure

```
aivachat/
├── .gitignore               # Root gitignore protecting API keys and build artifacts
├── README.md                # Project documentation
├── client/                  # React + Vite Frontend
│   ├── index.html
│   ├── package.json
│   ├── src/
│   │   ├── App.jsx          # Main application interface (Viva + Chat)
│   │   ├── App.css          # Responsive styling & themes
│   │   ├── main.jsx
│   │   └── index.css
│   └── vite.config.js
└── server/                  # Express + Gemini AI Backend
    ├── .env.example         # Environment template (safe for git)
    ├── index.js             # API endpoints & anti-repeat failover logic
    └── package.json
```

---

## 📄 License
This project is licensed under the MIT License.
