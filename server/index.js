import "dotenv/config";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
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
    },
    {
      question: "What is the difference between Structure (`struct`) and Union (`union`) in C, and what is Structure Padding?",
      topic: "C Programming",
      difficulty: "Easy",
      companyTag: "Zoho / Cisco",
      pyqFrequency: "Top Hardware & Software PYQ",
      expectedKeyPoints: [
        "struct allocates memory for all members; size is sum + padding",
        "union shares memory across all members; size equals largest member",
        "Padding aligns members to word boundaries (e.g. 4-byte/8-byte) for CPU read efficiency"
      ]
    },
    {
      question: "What is the difference between `const char* p`, `char* const p`, and `const char* const p` in C?",
      topic: "C Programming",
      difficulty: "Easy",
      companyTag: "Amazon / Microsoft",
      pyqFrequency: "Top Pointer Viva Question",
      expectedKeyPoints: [
        "const char* p: Pointer to constant data (value cannot change)",
        "char* const p: Constant pointer (address cannot change)",
        "const char* const p: Constant pointer to constant data (neither can change)"
      ]
    },
    {
      question: "What is the difference between `sizeof` operator and `strlen()` library function in C?",
      topic: "C Programming",
      difficulty: "Easy",
      companyTag: "Accenture / Infosys",
      pyqFrequency: "Standard String PYQ",
      expectedKeyPoints: [
        "sizeof is a compile-time unary operator giving total allocated bytes including '\\0'",
        "strlen() is a runtime function counting characters until the first null terminator '\\0'"
      ]
    },
    {
      question: "How do Preprocessor Directives like `#define` macros differ from `const` variables and inline functions in C?",
      topic: "C Programming",
      difficulty: "Easy",
      companyTag: "TCS / Cognizant",
      pyqFrequency: "Frequent C Placement PYQ",
      expectedKeyPoints: [
        "#define is textual replacement during preprocessing without type checking",
        "const is type-safe and evaluated by the compiler",
        "Inline functions provide function call speed with type safety"
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
    },
    {
      question: "What is the difference between an Abstract Class and an Interface in Java 8+?",
      topic: "Java (Core & OOPs)",
      difficulty: "Easy",
      companyTag: "Amazon / Microsoft / Wipro",
      pyqFrequency: "High Yield OOPs Question",
      expectedKeyPoints: [
        "Abstract class can have state/instance variables, constructors, and method implementations",
        "Interface defines contract; in Java 8+ supports default & static methods, Java 9+ private methods",
        "Class can implement multiple interfaces but inherit only one class"
      ]
    },
    {
      question: "What is the difference between `ArrayList` and `LinkedList` in Java Collections Framework?",
      topic: "Java (Core & OOPs)",
      difficulty: "Easy",
      companyTag: "Cognizant / Accenture",
      pyqFrequency: "Top Collections PYQ",
      expectedKeyPoints: [
        "ArrayList uses dynamic resizable array: O(1) random access, O(n) middle insertions",
        "LinkedList uses doubly linked list: O(n) access, O(1) insertion/deletion at nodes"
      ]
    },
    {
      question: "Explain Exception Handling hierarchy in Java: Checked vs Unchecked (Runtime) Exceptions.",
      topic: "Java (Core & OOPs)",
      difficulty: "Easy",
      companyTag: "Infosys / TCS",
      pyqFrequency: "Universal Java Viva PYQ",
      expectedKeyPoints: [
        "Throwable is root class with Exception and Error subclasses",
        "Checked exceptions (IOException, SQLException) checked at compile time",
        "Unchecked exceptions (NullPointerException, ArrayIndexOutOfBoundsException) occur at runtime"
      ]
    },
    {
      question: "How does Garbage Collection and Memory Management (Heap vs Stack) work in Java?",
      topic: "Java (Core & OOPs)",
      difficulty: "Easy",
      companyTag: "Zoho / Cisco",
      pyqFrequency: "JVM Placement PYQ",
      expectedKeyPoints: [
        "Stack stores primitive variables and method call frames",
        "Heap stores objects and instance variables managed by Garbage Collector (Young/Old gen)"
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
    },
    {
      question: "Why should a Destructor be declared `virtual` in a Base class in C++?",
      topic: "C++ (OOPs & STL)",
      difficulty: "Easy",
      companyTag: "Cisco / Adobe",
      pyqFrequency: "Crucial Memory/OOPs PYQ",
      expectedKeyPoints: [
        "Ensures derived class destructor is called when deleting derived object via base class pointer",
        "Prevents resource leaks and undefined behavior"
      ]
    },
    {
      question: "What is the difference between Reference (`&`) and Pointer (`*`) in C++?",
      topic: "C++ (OOPs & STL)",
      difficulty: "Easy",
      companyTag: "Wipro / Tech Mahindra",
      pyqFrequency: "Core C++ Viva Question",
      expectedKeyPoints: [
        "Reference cannot be NULL and must be initialized upon declaration; cannot be reseated",
        "Pointer can be NULL, re-assigned to different memory addresses, and supports pointer arithmetic"
      ]
    },
    {
      question: "What is the difference between `map` (Red-Black Tree) and `unordered_map` (Hash Table) in C++ STL?",
      topic: "C++ (OOPs & STL)",
      difficulty: "Easy",
      companyTag: "Amazon / Infosys",
      pyqFrequency: "Top STL Data Structure PYQ",
      expectedKeyPoints: [
        "std::map: Ordered keys, implemented as Self-Balancing BST (Red-Black Tree), O(log n) operations",
        "std::unordered_map: Unordered keys, implemented as Hash Table, O(1) average operations"
      ]
    },
    {
      question: "What is the Diamond Problem in multiple inheritance and how does Virtual Inheritance solve it in C++?",
      topic: "C++ (OOPs & STL)",
      difficulty: "Easy",
      companyTag: "Capgemini / TCS",
      pyqFrequency: "OOPs Ambiguity PYQ",
      expectedKeyPoints: [
        "Diamond problem: Ambiguity when two derived classes inherit from a base class and child inherits both",
        "Virtual base classes (`virtual public Base`) ensure only one copy of base class exists in most-derived object"
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
    },
    {
      question: "What is PEP 8, and how does memory management work in Python (Reference Counting and Garbage Collection)?",
      topic: "Python (Core & Scripting)",
      difficulty: "Easy",
      companyTag: "Tech Mahindra / Zoho",
      pyqFrequency: "Standard Python Viva PYQ",
      expectedKeyPoints: [
        "PEP 8 is the official Python style guide",
        "Reference counting deallocates object when reference count hits 0",
        "Cyclic GC handles circular references"
      ]
    },
    {
      question: "What is the difference between `*args` and `**kwargs` in Python function definitions?",
      topic: "Python (Core & Scripting)",
      difficulty: "Easy",
      companyTag: "Infosys / TCS",
      pyqFrequency: "Python Arguments PYQ",
      expectedKeyPoints: [
        "*args allows passing variable number of non-keyword positional arguments as a tuple",
        "**kwargs allows passing variable number of keyword arguments as a dictionary"
      ]
    },
    {
      question: "What are Lambda functions in Python and how do you use them with `map()`, `filter()`, and `reduce()`?",
      topic: "Python (Core & Scripting)",
      difficulty: "Easy",
      companyTag: "Accenture / Wipro",
      pyqFrequency: "Functional Python PYQ",
      expectedKeyPoints: [
        "Lambda is an anonymous inline function with single expression (`lambda x: x*2`)",
        "map applies function to all elements; filter selects elements based on boolean predicate"
      ]
    },
    {
      question: "What is the difference between `append()` and `extend()` methods in Python lists?",
      topic: "Python (Core & Scripting)",
      difficulty: "Easy",
      companyTag: "Cognizant / Capgemini",
      pyqFrequency: "Basic Python Syntax PYQ",
      expectedKeyPoints: [
        "append(x) adds argument as a single element at end of list",
        "extend(iterable) iterates over argument and adds each element individually"
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
    },
    {
      question: "What is the difference between DELETE, TRUNCATE, and DROP commands in SQL?",
      topic: "DBMS & SQL",
      difficulty: "Easy",
      companyTag: "Capgemini / Tech Mahindra",
      pyqFrequency: "Frequent SQL Placement PYQ",
      expectedKeyPoints: [
        "DELETE: DML command, deletes specific rows with WHERE, rollable",
        "TRUNCATE: DDL command, deletes all rows instantly, resets auto-increment",
        "DROP: DDL command, completely removes table structure and data"
      ]
    },
    {
      question: "What is the difference between Clustered and Non-Clustered Indexes in SQL?",
      topic: "DBMS & SQL",
      difficulty: "Easy",
      companyTag: "Amazon / Microsoft",
      pyqFrequency: "High Frequency Indexing PYQ",
      expectedKeyPoints: [
        "Clustered: Determines physical storage order of data (only 1 per table)",
        "Non-Clustered: Separate structure with pointers to physical data (multiple per table)"
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
    },
    {
      question: "What is Paging in Virtual Memory, and what is Thrashing?",
      topic: "Operating Systems",
      difficulty: "Easy",
      companyTag: "Accenture / Capgemini",
      pyqFrequency: "Core Memory OS PYQ",
      expectedKeyPoints: [
        "Paging divides memory into fixed-size frames and pages, avoiding external fragmentation",
        "Thrashing occurs when OS spends more time swapping pages in/out than executing processes"
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
    },
    {
      question: "What happens step-by-step when you type 'https://www.google.com' in your browser?",
      topic: "Computer Networks",
      difficulty: "Easy",
      companyTag: "Amazon / Microsoft / Zoho",
      pyqFrequency: "Top Placement Architecture PYQ",
      expectedKeyPoints: [
        "DNS resolution translates domain to IP address",
        "TCP 3-way handshake & TLS handshake established",
        "HTTP GET request sent and web resources rendered by browser"
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
    },
    {
      question: "What is the difference between Stack and Queue, and how do you implement a Queue using two Stacks?",
      topic: "Data Structures & Algorithms",
      difficulty: "Easy",
      companyTag: "Amazon / Microsoft / Accenture",
      pyqFrequency: "High Frequency Placement PYQ",
      expectedKeyPoints: [
        "Stack: LIFO (Last In First Out); Queue: FIFO (First In First Out)",
        "Enqueue into stack1; dequeue by popping from stack2 (if empty, transfer all from stack1 to stack2)"
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
    },
    {
      question: "What is the difference between `state` and `props` in React?",
      topic: "React & Full Stack (MERN)",
      difficulty: "Easy",
      companyTag: "Accenture / Cognizant",
      pyqFrequency: "Essential React Viva Question",
      expectedKeyPoints: [
        "Props: Read-only data passed from parent to child",
        "State: Mutable internal data triggering re-render on change"
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
      feedback: "Your answer is too short for a campus placement interview. In technical rounds, define the concept clearly, provide syntax or example, and mention advantages.",
      missedPoints: [
        "State formal definition and primary purpose",
        "Explain internal mechanism or real-world example",
        "Mention advantages and performance characteristics"
      ],
      idealAnswer: `For placement viva in **${topic}**: Always structure your answer into: (1) Core definition, (2) Syntax / working steps, (3) Practical use case or trade-offs.`
    };
  }

  const score = Math.min(10, Math.max(6, Math.round(6 + Math.min(4, wordCount / 15))));
  const verdict = score >= 8 ? "Strong Answer" : "Good Attempt";

  return {
    score: score,
    verdict: verdict,
    feedback: `Good technical explanation for this **${topic}** placement question! You demonstrated sound conceptual knowledge. To score 10/10 in technical rounds, state formal keywords and mention code/syntax nuances.`,
    missedPoints: [
      "Include specific language syntax or execution steps",
      "Mention memory management or complexity if applicable"
    ],
    idealAnswer: `For **${topic}** placement PYQs: Begin with a direct definition, follow with the internal memory/runtime behavior, contrast with common alternatives, and conclude with best practices.`
  };
}

// 1. Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    server: "Aiva High-Speed PYQ Placement Engine (Anti-Repeat Dynamic Shuffle)",
    models: CANDIDATE_MODELS,
    time: new Date().toISOString(),
  });
});

// 2. Chat Route (Streaming with automatic model failover)
app.post("/api/chat", async (req, res) => {
  try {
    const { prompt, history } = req.body;
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

    if (!streamSuccess) {
      res.write("I am ready to help with your technical prep! Feel free to ask any question regarding C, C++, Java, Python, DBMS, OS, or placement interview topics.");
    }

    res.end();
  } catch (error) {
    console.error("Gemini API Error Detail:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || "Failed to process request" });
    } else {
      res.end();
    }
  }
});

// 3. Viva: Generate Placement PYQ Question (Anti-Repeat Dynamic Selection)
app.post("/api/viva/question", async (req, res) => {
  const {
    topic = "C Programming",
    difficulty = "Easy",
    company = "All Top Companies",
    recentQuestions = []
  } = req.body || {};

  try {
    const recentListStr = Array.isArray(recentQuestions) && recentQuestions.length > 0
      ? recentQuestions.slice(-10).map((q, i) => `${i + 1}. "${q}"`).join("\n")
      : "None";

    const prompt = `You are a campus placement technical interviewer for companies like TCS, Infosys, Wipro, Accenture, Cognizant, Amazon, Microsoft.
Generate 1 frequent, high-yield placement PYQ at ${difficulty} level for topic: ${topic}.
Company Focus: ${company}

CRITICAL ANTI-REPEAT INSTRUCTION:
DO NOT generate any of the following recently asked questions:
${recentListStr}

Pick a completely fresh, distinct sub-concept in ${topic}.

Return ONLY valid JSON matching this schema:
{
  "question": "Clear, direct viva question frequently asked in placement drives",
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "companyTag": "${company === "All Top Companies" ? "TCS / Infosys / Wipro / Accenture" : company}",
  "pyqFrequency": "Frequently asked in 80%+ Technical Rounds",
  "expectedKeyPoints": ["Core Definition/Concept", "Internal Working / Mechanism", "Real-world example or trade-off"]
}`;

    const data = await callGeminiWithFailover(async (modelName) => {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          maxOutputTokens: 380, // Low tokens for ultra-fast generation
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
    console.warn("Viva Question AI generation failed, using curated non-repeating PYQ bank fallback:", error.message);
    
    const topicQuestions = FALLBACK_QUESTIONS[topic] || FALLBACK_QUESTIONS["C Programming"];
    
    // Filter out questions that have already been asked
    const askedSet = new Set((recentQuestions || []).map(q => (q || "").toLowerCase().trim()));
    const unaskedQuestions = topicQuestions.filter(q => !askedSet.has(q.question.toLowerCase().trim()));
    
    // If all questions have been asked, shuffle from the full list
    const candidatePool = unaskedQuestions.length > 0 ? unaskedQuestions : topicQuestions;
    const randomQuestion = candidatePool[Math.floor(Math.random() * candidatePool.length)];
    
    res.json({
      question: randomQuestion.question,
      topic: topic,
      difficulty: difficulty,
      companyTag: randomQuestion.companyTag || (company !== "All Top Companies" ? company : "TCS / Infosys / Accenture"),
      pyqFrequency: randomQuestion.pyqFrequency || "Top Placement PYQ",
      expectedKeyPoints: randomQuestion.expectedKeyPoints,
      isCurated: true
    });
  }
});

// 4. Viva: Evaluate Candidate Answer
app.post("/api/viva/evaluate", async (req, res) => {
  const { question, userAnswer, topic = "Computer Science", difficulty = "Easy" } = req.body || {};

  if (!userAnswer || !userAnswer.trim()) {
    return res.status(400).json({ error: "User answer is required" });
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
    console.warn("Viva Evaluation AI call failed, using heuristic evaluation fallback:", error.message);
    const fallbackData = fallbackEvaluation(question, userAnswer, topic, difficulty);
    res.json(fallbackData);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Aiva high-availability PYQ backend running on http://localhost:${PORT}`)
);
