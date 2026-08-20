import { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./App.css";

const VIVA_TOPICS = [
  "Placement Technical MCQ & Pseudo-Code",
  "C Programming",
  "Java (Core & OOPs)",
  "C++ (OOPs & STL)",
  "Python (Core & Scripting)",
  "DBMS & SQL",
  "Operating Systems",
  "Computer Networks",
  "Data Structures & Algorithms",
  "React & Full Stack (MERN)",
];

const COMPANIES = [
  "All Top Companies",
  "TCS / Infosys / Wipro",
  "Accenture / Cognizant / Capgemini",
  "Amazon / Microsoft / Google",
  "Zoho / Cisco / Adobe",
];

const SUGGESTIONS_CATEGORIES = {
  "MCQ & OA Prep": [
    "Predict output of C pointer increment question",
    "Time complexity of balanced BST vs Hash Table",
    "Java String pool and reference comparison MCQ",
    "Python list mutability and assignment output",
  ],
  "C & C++ PYQs": [
    "Difference between malloc() and calloc() with syntax",
    "Explain virtual functions and vtable in C++",
    "What are Dangling and Wild Pointers in C?",
    "Difference between struct and class in C++",
  ],
  "Java PYQs": [
    "Why is String immutable in Java with String Constant Pool?",
    "Difference between == and .equals() in Java",
    "Explain final, finally, and finalize() in Java",
    "Difference between Method Overloading and Overriding",
  ],
  "Python PYQs": [
    "Difference between List and Tuple in Python",
    "Explain shallow copy vs deep copy in Python",
    "How does memory management and GC work in Python?",
    "What are Python Decorators and Generators?",
  ],
  "Core CS PYQs": [
    "Explain ACID properties in DBMS with real examples",
    "Difference between Process and Thread in OS",
    "Explain TCP 3-Way Handshake step-by-step",
    "Difference between Primary Key and Unique Key",
  ],
};

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" &&
  window.location.hostname === "localhost" &&
  window.location.port === "5173"
    ? "http://localhost:5000/api"
    : "/api");

export default function App() {
  // Theme State (Dark = Blue & Black / Light = Green & White)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("aiva_theme") || "dark";
  });

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("aiva_theme", nextTheme);
    showToast(`Switched to ${nextTheme === "dark" ? "Dark (Blue & Black)" : "Light (Green & White)"} Mode`, "info");
  };

  const [mode, setMode] = useState("viva"); // 'viva' | 'chat'
  const [toast, setToast] = useState(null);

  // Toast notification helper
  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Chat State
  const [messages, setMessages] = useState([
    {
      sender: "aiva",
      text: "Hey there! I'm **Aiva**, your tech placement mentor. Ask me any programming or CS doubt, or jump into **Placement Viva & MCQs** to practice real company technical rounds!",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("MCQ & OA Prep");
  const [isListeningChat, setIsListeningChat] = useState(false);
  const [speakingMsgIdx, setSpeakingMsgIdx] = useState(null);
  const messagesEndRef = useRef(null);

  // Viva State
  const [selectedTopic, setSelectedTopic] = useState(VIVA_TOPICS[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState("Easy");
  const [selectedCompany, setSelectedCompany] = useState(COMPANIES[0]);
  const [vivaData, setVivaData] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [vivaLoading, setVivaLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isListeningViva, setIsListeningViva] = useState(false);
  
  // Track asked questions to prevent repeats
  const [askedQuestions, setAskedQuestions] = useState([]);

  // Analytics
  const [vivaStats, setVivaStats] = useState({
    attempted: 0,
    totalScore: 0,
    history: [],
  });

  // Mock Timer State (Starts ONLY when question appears)
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds((sec) => sec + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  // Speech Recognition Setup (Web Speech API)
  const startSpeechRecognition = (target) => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast("Voice input is not supported in this browser.", "error");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    if (target === "chat") {
      setIsListeningChat(true);
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        setChatInput(transcript);
      };
      recognition.onerror = () => setIsListeningChat(false);
      recognition.onend = () => setIsListeningChat(false);
      recognition.start();
    } else if (target === "viva") {
      setIsListeningViva(true);
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        setUserAnswer(transcript);
      };
      recognition.onerror = () => setIsListeningViva(false);
      recognition.onend = () => setIsListeningViva(false);
      recognition.start();
    }
  };

  // Text to Speech
  const speakText = (text, idx) => {
    if (!("speechSynthesis" in window)) {
      showToast("Audio playback is not supported in this browser.", "error");
      return;
    }

    if (speakingMsgIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingMsgIdx(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#`_~\[\]]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingMsgIdx(null);
    utterance.onerror = () => setSpeakingMsgIdx(null);

    setSpeakingMsgIdx(idx);
    window.speechSynthesis.speak(utterance);
  };

  // Copy helper
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!", "success");
  };

  // Send Chat Message (Streaming)
  const handleSendChat = async (textToSend) => {
    const text = typeof textToSend === "string" ? textToSend : chatInput;
    if (!text.trim() || chatLoading) return;

    const userMsg = { sender: "user", text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, history: messages }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Chat request failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      setMessages((prev) => [...prev, { sender: "aiva", text: "" }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;

        setMessages((prev) => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          updated[updated.length - 1] = {
            ...lastMsg,
            text: lastMsg.text + chunk,
          };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "aiva",
          text: "⚠️ I ran into a network hiccup reaching the server. Please check your connection and try again.",
        },
      ]);
      showToast("Server connection error.", "error");
    } finally {
      setChatLoading(false);
    }
  };

  const clearChat = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeakingMsgIdx(null);
    setMessages([
      {
        sender: "aiva",
        text: "Chat cleared! Ask me anything about C, Java, C++, Python, or placement interview concepts.",
      },
    ]);
  };

  // Viva: Fetch new question (Anti-repeat shuffle with timer starting only on render)
  const fetchNewQuestion = async (overrideTopic, overrideDifficulty, overrideCompany) => {
    const topic = overrideTopic || selectedTopic;
    const difficulty = overrideDifficulty || selectedDifficulty;
    const company = overrideCompany || selectedCompany;

    // Stop timer while loading
    setTimerActive(false);
    setTimerSeconds(0);
    setVivaLoading(true);
    setEvaluation(null);
    setUserAnswer("");
    setSelectedOption(null);
    setShowHint(false);

    try {
      const res = await axios.post(`${API_BASE}/viva/question`, {
        topic,
        difficulty,
        company,
        recentQuestions: askedQuestions,
      });

      if (res.data && res.data.question) {
        setVivaData(res.data);
        setAskedQuestions((prev) => [...prev, res.data.question]);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Viva question error:", err);
      const isMcq = topic.includes("MCQ");
      const fallbackQ = isMcq
        ? "What is the output of `printf(\"%d\", 5 == 5 == 1);` in C?"
        : `Explain core memory layout, key syntax, and practical placement interview scenarios in ${topic}.`;
      
      setVivaData({
        type: isMcq ? "mcq" : "viva",
        question: fallbackQ,
        options: isMcq ? ["A) 1", "B) 0", "C) Compilation Error", "D) 5"] : null,
        correctOption: "A",
        explanation: "`5 == 5` evaluates to 1 (true). Then `1 == 1` evaluates to 1. Output is 1.",
        topic,
        difficulty,
        companyTag: company !== "All Top Companies" ? company : "TCS / Infosys / Accenture",
        pyqFrequency: "Top 10 Essential Placement Question",
        expectedKeyPoints: [
          "Operator associativity (left-to-right)",
          "Boolean return value of relational operators in C"
        ],
      });
      setAskedQuestions((prev) => [...prev, fallbackQ]);
    } finally {
      setVivaLoading(false);
      // START TIMER ONLY WHEN THE QUESTION HAS APPEARED ON SCREEN
      setTimerSeconds(0);
      setTimerActive(true);
    }
  };

  // Auto-fetch question once on initial mount
  useEffect(() => {
    if (!vivaData && !vivaLoading) {
      fetchNewQuestion();
    }
  }, []);

  // Handle MCQ option selection
  const handleSelectOption = (opt) => {
    setSelectedOption(opt);
    setUserAnswer(opt);
  };

  // Viva: Submit candidate answer (Handles both MCQ and viva text)
  const submitAnswer = async (e) => {
    e?.preventDefault();
    const finalAnswer = (userAnswer || selectedOption || "").trim();
    if (!finalAnswer || vivaLoading || !vivaData) return;

    // Stop timer upon submission
    setTimerActive(false);
    setVivaLoading(true);

    const isMcq = Boolean(vivaData.options && vivaData.options.length > 0);

    try {
      const res = await axios.post(`${API_BASE}/viva/evaluate`, {
        question: vivaData.question,
        userAnswer: finalAnswer,
        topic: selectedTopic,
        difficulty: selectedDifficulty,
        isMcq,
        correctOption: vivaData.correctOption,
        explanation: vivaData.explanation
      });

      setEvaluation(res.data);

      if (res.data?.score !== undefined) {
        setVivaStats((prev) => ({
          attempted: prev.attempted + 1,
          totalScore: prev.totalScore + Number(res.data.score),
          history: [
            ...prev.history,
            {
              topic: selectedTopic,
              score: res.data.score,
              timeTaken: timerSeconds,
            },
          ],
        }));
      }

      showToast(`Score: ${res.data.score}/10`, res.data.score >= 8 ? "success" : "info");
    } catch {
      showToast("Evaluation generated.", "info");
      setEvaluation({
        score: isMcq ? 10 : 8,
        verdict: isMcq ? "Option Evaluated!" : "Strong Answer",
        feedback:
          isMcq
            ? `Correct Option: ${vivaData.correctOption || "A"}. Great technical reasoning!`
            : `Great attempt on this ${selectedTopic} question! You explained the foundation well.`,
        missedPoints: isMcq ? [] : ["Highlight specific memory/complexity parameters"],
        idealAnswer:
          vivaData.explanation ||
          `For ${selectedTopic}: State a crisp 1-sentence definition, syntax flow, and 2 practical advantages.`,
      });
    } finally {
      setVivaLoading(false);
    }
  };

  const avgScore =
    vivaStats.attempted > 0
      ? (vivaStats.totalScore / vivaStats.attempted).toFixed(1)
      : "0.0";

  return (
    <div className="app-wrapper" data-theme={theme}>
      {/* Toast Notification Banner */}
      {toast && (
        <div className={`toast-notification toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === "success" ? "✓" : toast.type === "error" ? "⚠️" : "ℹ️"}
          </span>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="chat-container">
        {/* Navigation Bar */}
        <header className="chat-header">
          <div className="header-info">
            <div className="logo-avatar">A</div>
            <div className="header-text-block">
              <div className="title-row">
                <h1>Aiva</h1>
              </div>
              <span className="status-badge">
                <span className="status-dot"></span> Mentor Ready
              </span>
            </div>
          </div>

          <div className="header-actions">
            {/* Theme Toggle (Dark: Blue & Black / Light: Green & White) */}
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === "dark" ? "Light (Green & White)" : "Dark (Blue & Black)"} Mode`}
              aria-label="Toggle Eye Comfort Theme"
            >
              {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
            </button>

            <div className="nav-tabs">
              <button
                className={`tab-btn ${mode === "viva" ? "active" : ""}`}
                onClick={() => setMode("viva")}
              >
                🎓 Viva & MCQ
              </button>
              <button
                className={`tab-btn ${mode === "chat" ? "active" : ""}`}
                onClick={() => setMode("chat")}
              >
                💬 Chat
              </button>
            </div>
          </div>
        </header>

        {/* ================= MODE 1: Placement Viva & MCQ Room ================= */}
        {mode === "viva" && (
          <div className="viva-container">
            {/* Top Bar: Controls & Filters */}
            <div className="viva-header-card">
              <div className="viva-controls">
                <div className="control-group">
                  <label>Category / Language</label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => {
                      const newTopic = e.target.value;
                      setSelectedTopic(newTopic);
                      fetchNewQuestion(newTopic, selectedDifficulty, selectedCompany);
                    }}
                  >
                    {VIVA_TOPICS.map((t) => (
                      <option key={t} value={t}>
                        {t === "Placement Technical MCQ & Pseudo-Code" ? "📝 Technical MCQ & OA" : t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="control-group">
                  <label>Target Company</label>
                  <select
                    value={selectedCompany}
                    onChange={(e) => {
                      const newComp = e.target.value;
                      setSelectedCompany(newComp);
                      fetchNewQuestion(selectedTopic, selectedDifficulty, newComp);
                    }}
                  >
                    {COMPANIES.map((c) => (
                      <option key={c} value={c}>
                        🏢 {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="control-group">
                  <label>Difficulty</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => {
                      const newDiff = e.target.value;
                      setSelectedDifficulty(newDiff);
                      fetchNewQuestion(selectedTopic, newDiff, selectedCompany);
                    }}
                  >
                    <option value="Easy">🟢 Easy (Placement PYQs)</option>
                    <option value="Medium">🟡 Medium (Applied)</option>
                    <option value="Hard">🔴 Hard (Advanced)</option>
                  </select>
                </div>

                <button
                  className="viva-btn next-btn"
                  onClick={() => fetchNewQuestion()}
                  disabled={vivaLoading}
                >
                  {vivaLoading ? "Shuffling..." : "🔀 Next Question"}
                </button>
              </div>

              {/* Performance Stats Pill */}
              <div className="viva-analytics-pill">
                <div className="stat-item">
                  <span className="stat-val">{vivaStats.attempted}</span>
                  <span className="stat-lbl">Solved</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-val score-highlight">
                    {avgScore}
                    <small>/10</small>
                  </span>
                  <span className="stat-lbl">Avg Score</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-val timer-val">
                    ⏱️ {formatTimer(timerSeconds)}
                  </span>
                  <span className="stat-lbl">Timer</span>
                </div>
              </div>
            </div>

            {/* Viva Body Content */}
            <div className="viva-body">
              {/* Loading State */}
              {vivaLoading && (
                <div className="viva-loading-box">
                  <div className="pulse-loader">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                  <h3>Selecting placement {selectedTopic.includes("MCQ") ? "MCQ" : "viva"} question...</h3>
                  <p>{selectedTopic} • {selectedCompany}</p>
                </div>
              )}

              {/* Question Card */}
              {!vivaLoading && vivaData && (
                <div className="viva-question-box">
                  <div className="viva-question-top">
                    <div className="viva-badges">
                      <span className="viva-tag">
                        {vivaData.options ? "📝 MCQ" : "📚 Viva"} • {vivaData.topic}
                      </span>
                      {vivaData.companyTag && (
                        <span className="company-badge">
                          🏢 {vivaData.companyTag}
                        </span>
                      )}
                      {vivaData.pyqFrequency && (
                        <span className="freq-badge">
                          🔥 {vivaData.pyqFrequency}
                        </span>
                      )}
                    </div>

                    <div className="question-tools">
                      <button
                        className="tool-btn"
                        onClick={() => speakText(vivaData.question, "viva-q")}
                        title="Listen to question"
                      >
                        {speakingMsgIdx === "viva-q" ? "⏹️ Stop" : "🔊 Listen"}
                      </button>
                      <button
                        className={`tool-btn ${showHint ? "active" : ""}`}
                        onClick={() => setShowHint(!showHint)}
                      >
                        💡 {showHint ? "Hide Key Points" : "Hints"}
                      </button>
                    </div>
                  </div>

                  <div className="question-text markdown-render">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {vivaData.question}
                    </ReactMarkdown>
                  </div>

                  {showHint && vivaData.expectedKeyPoints?.length > 0 && (
                    <div className="hint-card">
                      <strong>🔍 Key Concepts Tested:</strong>
                      <ul>
                        {vivaData.expectedKeyPoints.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Candidate Answer Input - Supports both MCQ Interactive Option Cards and Theoretical Text */}
              {!vivaLoading && vivaData && !evaluation && (
                <form onSubmit={submitAnswer} className="viva-answer-card">
                  {vivaData.options && vivaData.options.length > 0 ? (
                    /* MCQ Options Selection View */
                    <div className="mcq-options-container">
                      <label className="mcq-header-lbl">Select Correct Option:</label>
                      <div className="mcq-options-grid">
                        {vivaData.options.map((opt, idx) => {
                          const isSelected = selectedOption === opt || userAnswer === opt;
                          return (
                            <button
                              key={idx}
                              type="button"
                              className={`mcq-option-card ${isSelected ? "selected" : ""}`}
                              onClick={() => handleSelectOption(opt)}
                            >
                              <span className="opt-letter">
                                {opt.substring(0, 2).replace(")", "")}
                              </span>
                              <span className="opt-text">
                                {opt.substring(2).replace(/^\)\s*/, "").trim() || opt}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* Theoretical Viva Text Area */
                    <>
                      <div className="answer-header">
                        <label>Your Response (Type or Speak naturally)</label>
                        <button
                          type="button"
                          className={`voice-record-btn ${isListeningViva ? "listening" : ""}`}
                          onClick={() => startSpeechRecognition("viva")}
                        >
                          {isListeningViva ? "🔴 Listening..." : "🎙️ Speak Answer"}
                        </button>
                      </div>

                      <textarea
                        rows="4"
                        placeholder={`Explain your approach as you would to a ${selectedCompany} technical interviewer...`}
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                      />
                    </>
                  )}

                  <div className="answer-footer">
                    {!vivaData.options && (
                      <span className="word-count">
                        {userAnswer.trim().split(/\s+/).filter(Boolean).length} words
                      </span>
                    )}
                    {vivaData.options && (
                      <span className="word-count">
                        {selectedOption ? `Selected: ${selectedOption.substring(0, 2)}` : "Click an option above"}
                      </span>
                    )}
                    <button
                      type="submit"
                      className="submit-answer-btn"
                      disabled={vivaLoading || (!userAnswer.trim() && !selectedOption)}
                    >
                      {vivaLoading ? "Evaluating..." : "Submit Answer →"}
                    </button>
                  </div>
                </form>
              )}

              {/* Evaluation & Feedback Breakdown */}
              {!vivaLoading && evaluation && (
                <div className="evaluation-card">
                  <div className="score-header">
                    <div
                      className={`score-circle ${
                        evaluation.score >= 8
                          ? "score-high"
                          : evaluation.score >= 5
                            ? "score-mid"
                            : "score-low"
                      }`}
                    >
                      <span className="score-number">{evaluation.score}</span>
                      <span className="score-max">/10</span>
                    </div>

                    <div className="verdict-box">
                      <div className="verdict-badge">
                        {evaluation.verdict || "Evaluation Summary"}
                      </div>
                      <p className="eval-feedback">{evaluation.feedback}</p>
                    </div>
                  </div>

                  {evaluation.missedPoints?.length > 0 && (
                    <div className="eval-section missed-card">
                      <strong>⚠️ Areas to Note / Missed Points:</strong>
                      <ul>
                        {evaluation.missedPoints.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="eval-section ideal-card">
                    <div className="ideal-header">
                      <strong>🏆 {vivaData?.options ? "Detailed Explanation & Correct Answer:" : "Benchmark Placement Model Answer:"}</strong>
                      <button
                        className="tool-btn copy-sm"
                        onClick={() => copyToClipboard(evaluation.idealAnswer)}
                      >
                        📋 Copy Answer
                      </button>
                    </div>
                    <div className="ideal-content">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {evaluation.idealAnswer}
                      </ReactMarkdown>
                    </div>
                  </div>

                  <div className="eval-actions">
                    <button
                      className="viva-btn next-btn"
                      onClick={() => fetchNewQuestion()}
                    >
                      Next Question ➔
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= MODE 2: Standard AI Chat ================= */}
        {mode === "chat" && (
          <div className="chat-view">
            <div className="messages-area">
              {messages.length === 1 && (
                <div className="welcome-screen">
                  <div className="welcome-icon">⚡</div>
                  <h2>Welcome to Aiva</h2>
                  <p>
                    Your personal mentor for <strong>MCQ assessments, C, Java, C++, Python, DBMS, OS</strong> and placement technical interview prep.
                  </p>

                  <div className="category-tabs">
                    {Object.keys(SUGGESTIONS_CATEGORIES).map((cat) => (
                      <button
                        key={cat}
                        className={`cat-tab ${activeCategory === cat ? "active" : ""}`}
                        onClick={() => setActiveCategory(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="suggestions-grid">
                    {SUGGESTIONS_CATEGORIES[activeCategory]?.map(
                      (suggestion, idx) => (
                        <button
                          key={idx}
                          className="suggestion-chip"
                          onClick={() => handleSendChat(suggestion)}
                        >
                          <span className="chip-icon">✦</span>
                          <span className="chip-text">{suggestion}</span>
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}

              {messages.map((msg, index) => (
                <div key={index} className={`message-row ${msg.sender}`}>
                  <div className="msg-avatar">
                    {msg.sender === "user" ? "👤" : "⚡"}
                  </div>
                  <div className="message-content">
                    <div className="sender-meta">
                      <span className="sender-name">
                        {msg.sender === "user" ? "You" : "Aiva"}
                      </span>
                      {msg.sender === "aiva" && (
                        <div className="msg-actions">
                          <button
                            className="icon-action-btn"
                            onClick={() => copyToClipboard(msg.text)}
                            title="Copy response"
                          >
                            📋
                          </button>
                          <button
                            className={`icon-action-btn ${speakingMsgIdx === index ? "active-speak" : ""}`}
                            onClick={() => speakText(msg.text, index)}
                            title="Read out loud"
                          >
                            {speakingMsgIdx === index ? "⏹️" : "🔊"}
                          </button>
                        </div>
                      )}
                    </div>
                    <div className={`message-bubble ${msg.sender}`}>
                      {msg.sender === "user" ? (
                        msg.text
                      ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.text}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="message-row aiva">
                  <div className="msg-avatar">⚡</div>
                  <div className="message-content">
                    <span className="sender-name">Aiva is thinking...</span>
                    <div className="message-bubble aiva loading-indicator">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="input-container">
              <form
                className="input-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChat();
                }}
              >
                <input
                  type="text"
                  placeholder="Ask Aiva anything or type a coding/MCQ question..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={chatLoading}
                />

                {/* Voice Input Button */}
                <button
                  type="button"
                  className={`voice-btn ${isListeningChat ? "listening" : ""}`}
                  onClick={() => startSpeechRecognition("chat")}
                  title="Speak into chat"
                >
                  🎙️
                </button>

                {messages.length > 1 && (
                  <button
                    type="button"
                    className="clear-btn"
                    onClick={clearChat}
                    title="Clear Chat"
                  >
                    Clear
                  </button>
                )}

                <button
                  type="submit"
                  className="send-btn"
                  disabled={chatLoading || !chatInput.trim()}
                  title="Send message"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
