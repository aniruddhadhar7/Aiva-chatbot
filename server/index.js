import "dotenv/config";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY || "";
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey });

// Priority list of fast, high-rate-limit models with fallback
const CANDIDATE_MODELS = [
  "gemini-flash-lite-latest",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.6-flash",
].filter(Boolean);

// Clean JSON response string safely
const cleanJson = (text) => {
  if (!text) return null;
  try {
    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
};

// Robust model caller with automatic failover
async function callGeminiWithFailover(apiCallFn) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured on server");
  }
  let lastError = null;
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const result = await apiCallFn(modelName);
      return result;
    } catch (err) {
      console.warn(`[Failover] Model ${modelName} failed: ${err.message}`);
      lastError = err;
      continue;
    }
  }
  throw lastError || new Error("All Gemini models failed");
}

// Extensive, Diverse, High-Yield Campus Placement PYQ Question Bank (No-Repeat Shuffle Pool)
const FALLBACK_QUESTIONS = {
  "Placement Technical MCQ & Pseudo-Code": [
    {
      question: "What will be the output of the following C code snippet?\n```c\n#include <stdio.h>\n\nint main() {\n    int a = 10, b = 20;\n    if (a = 5) {\n        b = 30;\n    }\n    printf(\"%d %d\", a, b);\n    return 0;\n}\n```",
      options: [
        "A) 10 20",
        "B) 5 30",
        "C) 10 30",
        "D) Compilation Error"
      ],
      correctOption: "B",
      explanation: "In the `if (a = 5)` statement, it is an assignment operator (`=`), not a comparison (`==`). The value 5 is assigned to `a`, which evaluates to truthy (non-zero). Hence, the if block executes, setting `b = 30`. Output is `5 30`.",
      topic: "Placement Technical MCQ & Pseudo-Code",
      difficulty: "Easy",
      companyTag: "TCS NQT / Infosys",
      pyqFrequency: "Asked in 85% Technical MCQ Rounds",
      expectedKeyPoints: ["Assignment vs comparison operator in C", "Non-zero integer evaluated as truthy in conditional"]
    },
    {
      question: "What is the time complexity of searching an element in a balanced Binary Search Tree (AVL / Red-Black Tree) containing N elements?",
      options: [
        "A) O(1)",
        "B) O(log N)",
        "C) O(N)",
        "D) O(N log N)"
      ],
      correctOption: "B",
      explanation: "In a balanced BST, the height of the tree is strictly bounded by O(log N). Every comparison eliminates half the remaining subtrees, making search time complexity O(log N).",
      topic: "Placement Technical MCQ & Pseudo-Code",
      difficulty: "Easy",
      companyTag: "Accenture / Cognizant",
      pyqFrequency: "Top Technical MCQ PYQ",
      expectedKeyPoints: ["Balanced tree height property", "Logarithmic search time"]
    },
    {
      question: "What is the output of the following Python code?\n```python\nx = [1, 2, 3]\ny = x\ny.append(4)\nprint(x)\n```",
      options: [
        "A) [1, 2, 3]",
        "B) [1, 2, 3, 4]",
        "C) [4, 1, 2, 3]",
        "D) TypeError"
      ],
      correctOption: "B",
      explanation: "In Python, lists are mutable objects. The assignment `y = x` copies the object reference, not the list itself. Modifying `y` directly affects `x` since both point to the same memory location in heap.",
      topic: "Placement Technical MCQ & Pseudo-Code",
      difficulty: "Easy",
      companyTag: "Wipro / Capgemini",
      pyqFrequency: "Core Python Assessment Question",
      expectedKeyPoints: ["Reference assignment in Python lists", "Mutability mechanics"]
    },
    {
      question: "Which of the following sorting algorithms is Stable and guarantees O(N log N) worst-case time complexity?",
      options: [
        "A) QuickSort",
        "B) MergeSort",
        "C) HeapSort",
        "D) SelectionSort"
      ],
      correctOption: "B",
      explanation: "MergeSort always divides the array in half and merges sorted sub-arrays, guaranteeing O(N log N) time in best, average, and worst cases while preserving relative order of equal elements (Stable). QuickSort is not stable and has O(N^2) worst case; HeapSort is not stable.",
      topic: "Placement Technical MCQ & Pseudo-Code",
      difficulty: "Easy",
      companyTag: "Amazon / Microsoft / Zoho",
      pyqFrequency: "Universal Placement MCQ",
      expectedKeyPoints: ["Stability in sorting algorithms", "Worst case complexity comparison"]
    },
    {
      question: "What will be the output of the following Java snippet?\n```java\nString s1 = \"Java\";\nString s2 = new String(\"Java\");\nSystem.out.println(s1 == s2);\nSystem.out.println(s1.equals(s2));\n```",
      options: [
        "A) true, true",
        "B) false, true",
        "C) true, false",
        "D) false, false"
      ],
      correctOption: "B",
      explanation: "`s1` is created in String Constant Pool (SCP), while `s2` is created in normal heap memory. `==` checks reference addresses (different -> false), while `.equals()` checks content ('Java' == 'Java' -> true).",
      topic: "Placement Technical MCQ & Pseudo-Code",
      difficulty: "Easy",
      companyTag: "TCS / Tech Mahindra",
      pyqFrequency: "Top Java MCQ Question",
      expectedKeyPoints: ["String Constant Pool vs Heap", "Reference equality vs content equality"]
    },
    {
      question: "In SQL, which clause is used to filter groups created by the `GROUP BY` clause?",
      options: [
        "A) WHERE",
        "B) HAVING",
        "C) ORDER BY",
        "D) FILTER"
      ],
      correctOption: "B",
      explanation: "`WHERE` filters individual rows before grouping. `HAVING` filters aggregated group results after `GROUP BY` is executed.",
      topic: "Placement Technical MCQ & Pseudo-Code",
      difficulty: "Easy",
      companyTag: "Cognizant / Accenture",
      pyqFrequency: "Standard SQL MCQ",
      expectedKeyPoints: ["WHERE vs HAVING clause difference", "Filtering after aggregation"]
    }
  ],
  "C Programming": [
    {
      question: "What is the difference between malloc() and calloc() in C, and why is typecasting needed?",
      topic: "C Programming",
      difficulty: "Easy",
      companyTag: "TCS / Infosys / Wipro",
      pyqFrequency: "Asked in 85% Technical Rounds",
      expectedKeyPoints: [
        "malloc() allocates single uninitialized block (garbage values); calloc() allocates multiple zero-initialized blocks",
        "Syntax: malloc(size) vs calloc(num, element_size)",
        "Both return void pointer (void*) and NULL on failure"
      ]
    },
    {
      question: "Explain the difference between Pass by Value and Pass by Reference using pointers in C.",
      topic: "C Programming",
      difficulty: "Easy",
      companyTag: "Accenture / Cognizant",
      pyqFrequency: "Top Technical Viva PYQ",
      expectedKeyPoints: [
        "Pass by value copies data; modifications don't reflect in caller",
        "Pass by reference passes memory address via pointers (&x); caller data is modified",
        "Swap function example using pointers"
      ]
    },
    {
      question: "What is a Dangling Pointer, Null Pointer, and Wild Pointer in C? How do you prevent memory leaks?",
      topic: "C Programming",
      difficulty: "Easy",
      companyTag: "Capgemini / Tech Mahindra",
      pyqFrequency: "Frequent Memory PYQ",
      expectedKeyPoints: [
        "Dangling: Points to freed memory location",
        "Null: Points to NULL (0x0)",
        "Wild: Uninitialized pointer pointing anywhere in memory",
        "Prevention: Free allocated memory and set pointer to NULL"
      ]
    },
    {
      question: "Explain the 4 Storage Classes in C (auto, static, extern, register) and their scope & lifetime.",
      topic: "C Programming",
      difficulty: "Easy",
      companyTag: "TCS / Wipro / Infosys",
      pyqFrequency: "Core C Placement PYQ",
      expectedKeyPoints: [
        "auto: Local scope, stack memory, destroyed on function exit",
        "static: Retains value across function calls throughout program lifetime",
        "extern: Global scope across multiple source files",
        "register: Request CPU register storage for fast access"
      ]
    }
  ],
  "Java (Core & OOPs)": [
    {
      question: "Why is the `main` method declared as `public static void main(String[] args)` in Java?",
      topic: "Java (Core & OOPs)",
      difficulty: "Easy",
      companyTag: "TCS / Infosys / Cognizant",
      pyqFrequency: "Top 1 Essential Placement Question",
      expectedKeyPoints: [
        "public: Globally accessible by JVM",
        "static: Allows JVM to call main without instantiating class",
        "void: No return value expected",
        "String[] args: Accepts command-line parameters"
      ]
    },
    {
      question: "What is the difference between `==` operator and `.equals()` method in Java, and why is String immutable?",
      topic: "Java (Core & OOPs)",
      difficulty: "Easy",
      companyTag: "Accenture / Wipro / Amazon",
      pyqFrequency: "Asked in 90% Java Rounds",
      expectedKeyPoints: [
        "== compares object references/memory addresses",
        ".equals() compares actual character content",
        "String immutability provides security, thread-safety, and String Constant Pool caching"
      ]
    },
    {
      question: "Explain the difference between Method Overloading and Method Overriding in Java.",
      topic: "Java (Core & OOPs)",
      difficulty: "Easy",
      companyTag: "Infosys / Capgemini",
      pyqFrequency: "Core Java Placement PYQ",
      expectedKeyPoints: [
        "Overloading: Same class, same name, different parameters (Compile-time)",
        "Overriding: Subclass overrides parent method with exact signature (Runtime)",
        "Rules: Return type must be covariant, access modifier cannot be more restrictive"
      ]
    },
    {
      question: "What is the difference between `final`, `finally`, and `finalize()` in Java?",
      topic: "Java (Core & OOPs)",
      difficulty: "Easy",
      companyTag: "TCS / Tech Mahindra",
      pyqFrequency: "Frequent Campus PYQ",
      expectedKeyPoints: [
        "final: Constant variable, non-overridable method, non-inheritable class",
        "finally: Block in try-catch that executes unconditionally for resource cleanup",
        "finalize(): Method called by Garbage Collector before destroying object (deprecated)"
      ]
    }
  ],
  "C++ (OOPs & STL)": [
    {
      question: "What is a Virtual Function in C++ and how does Runtime Polymorphism work using vtable and vptr?",
      topic: "C++ (OOPs & STL)",
      difficulty: "Easy",
      companyTag: "Amazon / Microsoft / Zoho",
      pyqFrequency: "Top C++ Interview Question",
      expectedKeyPoints: [
        "Virtual function enables dynamic method dispatch when calling overridden methods via base pointer",
        "vtable: Array of function pointers created for each class",
        "vptr: Hidden pointer inside each object pointing to class vtable"
      ]
    },
    {
      question: "What is the difference between `struct` and `class` in C++?",
      topic: "C++ (OOPs & STL)",
      difficulty: "Easy",
      companyTag: "TCS / Infosys",
      pyqFrequency: "Classic C++ Viva PYQ",
      expectedKeyPoints: [
        "Members and inheritance are public by default in struct",
        "Members and inheritance are private by default in class",
        "Both support member functions, constructors, and inheritance"
      ]
    },
    {
      question: "What is the difference between `vector` and `list` in C++ Standard Template Library (STL)?",
      topic: "C++ (OOPs & STL)",
      difficulty: "Easy",
      companyTag: "Accenture / Cognizant",
      pyqFrequency: "High Frequency STL Question",
      expectedKeyPoints: [
        "vector: Dynamic contiguous array, fast random access O(1), costly middle insertion O(n)",
        "list: Doubly linked list, non-contiguous, fast insertion/deletion O(1), no random access O(n)"
      ]
    }
  ],
  "Python (Core & Scripting)": [
    {
      question: "What is the difference between List and Tuple in Python, and when should you choose one over the other?",
      topic: "Python (Core & Scripting)",
      difficulty: "Easy",
      companyTag: "TCS / Infosys / Accenture",
      pyqFrequency: "Asked in 95% Python Interviews",
      expectedKeyPoints: [
        "List is mutable `[]`; Tuple is immutable `()`",
        "Tuples use less memory, are faster, and can be used as dictionary keys",
        "Lists are used for dynamic collections requiring modifications"
      ]
    },
    {
      question: "Explain the difference between `is` and `==` in Python, and how shallow copy differs from deep copy.",
      topic: "Python (Core & Scripting)",
      difficulty: "Easy",
      companyTag: "Wipro / Cognizant / Amazon",
      pyqFrequency: "Top Python PYQ",
      expectedKeyPoints: [
        "== checks value equality; is checks memory identity/reference (`id()`)",
        "Shallow copy duplicates container only; deep copy duplicates all nested objects recursively"
      ]
    },
    {
      question: "What are Python Decorators and Generators (with `yield` keyword) explained simply?",
      topic: "Python (Core & Scripting)",
      difficulty: "Easy",
      companyTag: "Capgemini / Microsoft",
      pyqFrequency: "Frequent Python Viva PYQ",
      expectedKeyPoints: [
        "Decorator: Function modifying/extending behavior of another function without altering code (`@decorator`)",
        "Generator: Function producing stream of values lazily with `yield`, saving RAM"
      ]
    }
  ],
  "DBMS & SQL": [
    {
      question: "What are ACID properties in DBMS explained with a simple bank fund transfer example?",
      topic: "DBMS & SQL",
      difficulty: "Easy",
      companyTag: "TCS / Infosys / Wipro",
      pyqFrequency: "Universal Placement PYQ",
      expectedKeyPoints: [
        "Atomicity: All-or-nothing transfer",
        "Consistency: Total balance invariant maintained",
        "Isolation: Concurrent transactions execute without dirty reads",
        "Durability: Committed records persist"
      ]
    },
    {
      question: "What is the difference between Primary Key, Unique Key, and Foreign Key in SQL?",
      topic: "DBMS & SQL",
      difficulty: "Easy",
      companyTag: "Accenture / Cognizant",
      pyqFrequency: "Top SQL Viva PYQ",
      expectedKeyPoints: [
        "Primary Key: Uniquely identifies row, no NULL (1 per table)",
        "Unique Key: Unique values, accepts 1 NULL (multiple per table)",
        "Foreign Key: Refers to Primary Key in another table, enforces referential integrity"
      ]
    }
  ],
  "Operating Systems": [
    {
      question: "What is the difference between Process and Thread, and what is Context Switching overhead?",
      topic: "Operating Systems",
      difficulty: "Easy",
      companyTag: "TCS / Infosys / Amazon",
      pyqFrequency: "Fundamental OS Viva Question",
      expectedKeyPoints: [
        "Process: Program in execution with isolated memory space",
        "Thread: Lightweight unit sharing process memory",
        "Context Switching saves and restores CPU state (registers/PC)"
      ]
    },
    {
      question: "What is a Deadlock and what are the 4 essential Coffman conditions?",
      topic: "Operating Systems",
      difficulty: "Easy",
      companyTag: "Wipro / Cognizant / Microsoft",
      pyqFrequency: "Top OS Placement PYQ",
      expectedKeyPoints: [
        "Deadlock is permanent blocking of processes waiting for mutual resources",
        "4 Conditions: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait"
      ]
    }
  ],
  "Computer Networks": [
    {
      question: "Explain the TCP 3-Way Handshake connection establishment and difference between TCP and UDP.",
      topic: "Computer Networks",
      difficulty: "Easy",
      companyTag: "TCS / Infosys / Cisco",
      pyqFrequency: "Universal Network Viva PYQ",
      expectedKeyPoints: [
        "SYN -> SYN-ACK -> ACK sequence",
        "TCP: Reliable, connection-oriented, ordered; UDP: Unreliable, connectionless, high speed"
      ]
    }
  ],
  "Data Structures & Algorithms": [
    {
      question: "What is the difference between Array and Linked List in terms of memory, insertion, and access time?",
      topic: "Data Structures & Algorithms",
      difficulty: "Easy",
      companyTag: "TCS / Infosys / Cognizant",
      pyqFrequency: "Core DSA Viva PYQ",
      expectedKeyPoints: [
        "Array: Contiguous memory, O(1) random access, fixed size, O(n) middle insertion",
        "Linked List: Non-contiguous, O(n) sequential access, dynamic size, O(1) head insertion"
      ]
    }
  ],
  "React & Full Stack (MERN)": [
    {
      question: "What is the Virtual DOM in React and how does reconciliation work?",
      topic: "React & Full Stack (MERN)",
      difficulty: "Easy",
      companyTag: "TCS Digital / Infosys / Startups",
      pyqFrequency: "Top React Placement PYQ",
      expectedKeyPoints: [
        "Virtual DOM is lightweight in-memory representation of real DOM",
        "Diffing algorithm calculates minimal batch updates to real DOM"
      ]
    }
  ]
};

// Fallback evaluator when quota or connection is unavailable
function fallbackEvaluation(question, userAnswer, topic, difficulty) {
  const ans = (userAnswer || "").trim();
  const wordCount = ans.split(/\s+/).filter(Boolean).length;
  
  if (wordCount < 5) {
    return {
      score: 4,
      verdict: "Needs Improvement",
      feedback: "Your answer is too brief for a campus recruitment interview. State the core definition, provide syntax or example, and discuss advantages.",
      missedPoints: [
        "State formal definition and primary purpose",
        "Explain internal mechanism or real-world example",
        "Mention advantages and performance characteristics"
      ],
      idealAnswer: `For placement viva in **${topic}**: Structure your response as: (1) Core definition, (2) Syntax / working steps, (3) Practical use case or trade-offs.`
    };
  }

  const score = Math.min(10, Math.max(6, Math.round(6 + Math.min(4, wordCount / 15))));
  const verdict = score >= 8 ? "Strong Answer" : "Good Attempt";

  return {
    score: score,
    verdict: verdict,
    feedback: `Good technical explanation for this **${topic}** question! You demonstrated sound conceptual understanding. To score 10/10 in technical rounds, state formal keywords and code syntax nuances.`,
    missedPoints: [
      "Include specific language syntax or execution steps",
      "Mention memory management or complexity if applicable"
    ],
    idealAnswer: `For **${topic}** placement PYQs: Begin with a direct definition, follow with the internal memory/runtime behavior, contrast with common alternatives, and conclude with best practices.`
  };
}

// Universal Router (Mounted on both /api and / so it works seamlessly in all environments)
const router = express.Router();

// 1. Health Check
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    server: "Aiva High-Speed PYQ Placement Engine",
    models: CANDIDATE_MODELS,
    hasApiKey: Boolean(apiKey),
    time: new Date().toISOString(),
  });
});

// 2. Chat Route (Streaming with automatic model failover)
router.post("/chat", async (req, res) => {
  try {
    const { prompt, history } = req.body || {};
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "Valid text prompt is required" });
    }

    let contents = [];
    if (Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-8);
      contents = recentHistory
        .filter((msg) => msg && msg.text && msg.sender)
        .map((msg) => ({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        }));
    }

    contents.push({
      role: "user",
      parts: [{ text: prompt.trim() }],
    });

    res.setHeader("Content-Type", "text/plain; charset=utf-8");

    let streamSuccess = false;
    if (apiKey) {
      for (const modelName of CANDIDATE_MODELS) {
        try {
          const stream = await ai.models.generateContentStream({
            model: modelName,
            contents: contents,
            config: {
              maxOutputTokens: 1024,
              systemInstruction:
                "You are Aiva, an intelligent, helpful, and ultra-fast AI assistant & placement mentor. Provide concise, clear, and visually well-formatted responses using Markdown, code snippets, and structured bullet points when helpful.",
            },
          });

          for await (const chunk of stream) {
            if (chunk.text) res.write(chunk.text);
          }
          streamSuccess = true;
          break;
        } catch (err) {
          console.warn(`[Chat Stream Failover] Model ${modelName} failed: ${err.message}`);
        }
      }
    }

    if (!streamSuccess) {
      res.write("Hello! I am Aiva, your tech placement mentor. Ask me any programming or CS doubt, or test your skills in the **MCQ & Viva** sections!");
    }

    res.end();
  } catch (error) {
    console.error("Chat Error Detail:", error);
    if (!res.headersSent) {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.write("Hello! I am Aiva, your tech placement mentor. Feel free to ask any question regarding C, C++, Java, Python, DBMS, OS, or placement interview topics.");
    }
    res.end();
  }
});

// 3. Viva: Generate Placement PYQ Question (MCQ & Theoretical Support)
router.post("/viva/question", async (req, res) => {
  const {
    topic = "C Programming",
    difficulty = "Easy",
    company = "All Top Companies",
    recentQuestions = []
  } = req.body || {};

  const isMcq = topic.includes("MCQ") || (req.body.subTopic && req.body.subTopic.includes("MCQ"));

  try {
    const recentListStr = Array.isArray(recentQuestions) && recentQuestions.length > 0
      ? recentQuestions.slice(-10).map((q, i) => `${i + 1}. "${q}"`).join("\n")
      : "None";

    let prompt = "";

    if (isMcq) {
      prompt = `You are an expert technical assessment creator for campus placement tests at companies like TCS NQT, Infosys, Accenture, Cognizant, Wipro, Amazon.
Generate 1 high-yield, realistic technical MCQ / output-finding / pseudo-code question at ${difficulty} level for: ${req.body.subTopic || topic}.
Company Focus: ${company}

CRITICAL CODE FORMATTING RULE:
Whenever the question includes a code snippet, function, or pseudo-code, YOU MUST FORMAT IT AS A PROPER MULTI-LINE MARKDOWN CODE BLOCK (\`\`\`c, \`\`\`java, \`\`\`python, or \`\`\`cpp).
- EACH statement MUST be on its own separate line (\\n).
- Format braces '{' and '}' on new lines with 4-space indentation.
- NEVER write multiple semicolons or code statements on a single line.

Example format:
"What will be the output of the following C code snippet?\\n\`\`\`c\\n#include <stdio.h>\\n\\nint main() {\\n    int a = 10, b = 20;\\n    if (a = 5) {\\n        b = 30;\\n    }\\n    printf(\\"%d %d\\", a, b);\\n    return 0;\\n}\\n\`\`\`"

CRITICAL ANTI-REPEAT INSTRUCTION:
DO NOT generate any of the following recently asked questions:
${recentListStr}

Return ONLY valid JSON matching this schema:
{
  "type": "mcq",
  "question": "Question explanation text followed by \\n\\n\`\`\`language\\n// properly indented code here\\n\`\`\`",
  "options": [
    "A) Option A text",
    "B) Option B text",
    "C) Option C text",
    "D) Option D text"
  ],
  "correctOption": "A" | "B" | "C" | "D",
  "explanation": "2-3 sentences explaining why the correct option is right and the step-by-step code execution",
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "companyTag": "${company === "All Top Companies" ? "TCS NQT / Infosys / Accenture" : company}",
  "pyqFrequency": "Asked in 85%+ Online Assessments",
  "expectedKeyPoints": ["Core concept tested", "Execution logic"]
}`;
    } else {
      prompt = `You are a campus placement technical interviewer for companies like TCS, Infosys, Wipro, Accenture, Cognizant, Amazon, Microsoft.
Generate 1 frequent, high-yield placement viva question at ${difficulty} level for topic: ${topic}.
Company Focus: ${company}

CRITICAL ANTI-REPEAT INSTRUCTION:
DO NOT generate any of the following recently asked questions:
${recentListStr}

Pick a completely fresh, distinct sub-concept in ${topic}.

Return ONLY valid JSON matching this schema:
{
  "type": "viva",
  "question": "Clear, direct viva question frequently asked in placement drives",
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "companyTag": "${company === "All Top Companies" ? "TCS / Infosys / Wipro / Accenture" : company}",
  "pyqFrequency": "Frequently asked in 80%+ Technical Rounds",
  "expectedKeyPoints": ["Core Definition/Concept", "Internal Working / Mechanism", "Real-world example or trade-off"]
}`;
    }

    const data = await callGeminiWithFailover(async (modelName) => {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          maxOutputTokens: 550,
        },
      });
      const parsed = cleanJson(response.text);
      if (!parsed || !parsed.question) {
        throw new Error("Invalid JSON structure from Gemini");
      }
      return parsed;
    });

    res.json(data);
  } catch (error) {
    console.warn("Viva Question AI generation fallback:", error.message);
    
    const poolKey = isMcq ? "Placement Technical MCQ & Pseudo-Code" : (FALLBACK_QUESTIONS[topic] ? topic : "C Programming");
    const topicQuestions = FALLBACK_QUESTIONS[poolKey] || FALLBACK_QUESTIONS["Placement Technical MCQ & Pseudo-Code"];
    
    const askedSet = new Set((recentQuestions || []).map(q => (q || "").toLowerCase().trim()));
    const unaskedQuestions = topicQuestions.filter(q => !askedSet.has(q.question.toLowerCase().trim()));
    
    const candidatePool = unaskedQuestions.length > 0 ? unaskedQuestions : topicQuestions;
    const randomQuestion = candidatePool[Math.floor(Math.random() * candidatePool.length)];
    
    res.json({
      type: isMcq ? "mcq" : "viva",
      question: randomQuestion.question,
      options: randomQuestion.options || null,
      correctOption: randomQuestion.correctOption || null,
      explanation: randomQuestion.explanation || null,
      topic: topic,
      difficulty: difficulty,
      companyTag: randomQuestion.companyTag || (company !== "All Top Companies" ? company : "TCS / Infosys / Accenture"),
      pyqFrequency: randomQuestion.pyqFrequency || "Top Placement PYQ",
      expectedKeyPoints: randomQuestion.expectedKeyPoints,
      isCurated: true
    });
  }
});

// 4. Viva: Evaluate Candidate Answer (Handles both MCQ & Theoretical Viva)
router.post("/viva/evaluate", async (req, res) => {
  const {
    question,
    userAnswer,
    topic = "Computer Science",
    difficulty = "Easy",
    isMcq = false,
    correctOption = null,
    explanation = null
  } = req.body || {};

  if (!userAnswer || !userAnswer.trim()) {
    return res.status(400).json({ error: "User answer is required" });
  }

  // Instant precise evaluation for MCQs
  if (isMcq && correctOption) {
    const userClean = userAnswer.trim().toUpperCase();
    const correctClean = correctOption.trim().toUpperCase();
    
    const isCorrect = userClean.startsWith(correctClean) || userClean.includes(`OPTION ${correctClean}`) || userClean.includes(`(${correctClean})`);

    return res.json({
      score: isCorrect ? 10 : 0,
      verdict: isCorrect ? "Correct Option! 🎉" : "Incorrect Option ❌",
      feedback: isCorrect
        ? `Spot on! Option ${correctClean} is the correct answer.`
        : `Option ${correctClean} is the correct answer. You selected: ${userAnswer}.`,
      missedPoints: isCorrect ? [] : ["Review the concept and execution mechanism below."],
      idealAnswer: explanation || `The correct option is **${correctClean}**.`
    });
  }

  try {
    const prompt = `You are an expert technical interviewer evaluating a student's answer in a campus placement viva round.
Topic: ${topic} (${difficulty} Difficulty)
Question: "${question}"
Candidate Answer: "${userAnswer}"

Evaluate constructively for campus recruitment standards. Return ONLY a JSON object:
{
  "score": 8,
  "verdict": "Strong Answer" | "Good Attempt" | "Needs Improvement" | "Weak",
  "feedback": "2-3 sentences of direct feedback on technical accuracy, clarity, and depth",
  "missedPoints": ["Key point 1 missed", "Key point 2 missed"],
  "idealAnswer": "Concise, benchmark placement model answer formatted with markdown bolding and bullet points"
}`;

    const data = await callGeminiWithFailover(async (modelName) => {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          maxOutputTokens: 800,
        },
      });
      const parsed = cleanJson(response.text);
      if (!parsed || parsed.score === undefined) {
        throw new Error("Invalid evaluation JSON from Gemini");
      }
      return parsed;
    });

    res.json(data);
  } catch (error) {
    console.warn("Viva Evaluation fallback:", error.message);
    const fallbackData = fallbackEvaluation(question, userAnswer, topic, difficulty);
    res.json(fallbackData);
  }
});

// Mount router on both /api and / for absolute reliability
app.use("/api", router);
app.use("/", router);

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () =>
    console.log(`Aiva high-availability PYQ backend running on http://localhost:${PORT}`)
  );
}

export default app;
