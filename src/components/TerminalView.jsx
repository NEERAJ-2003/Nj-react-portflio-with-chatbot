import { useEffect, useRef, useState } from "react";

const INITIAL_LINES = [
  "Neeraj K R — Interactive Developer Shell [v2.4.0-release]",
  "Kernel: Linux 6.8.0-fastapi-backend x86_64",
  "Type 'help' for available commands, or 'exit' to return to GUI.",
  "----------------------------------------------------------------",
];

export default function TerminalView({ isOpen, onClose, onSetTheme, onOpenResume }) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState(INITIAL_LINES);
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      inputRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  function handleCommand(cmdRaw) {
    const cmd = cmdRaw.trim();
    if (!cmd) return;

    setCmdHistory((prev) => [...prev, cmd]);
    setHistoryIdx(-1);

    const parts = cmd.split(" ");
    const main = parts[0].toLowerCase();
    const arg = parts[1]?.toLowerCase();

    const newLogs = [`neeraj@portfolio:~$ ${cmd}`];

    switch (main) {
      case "help":
        newLogs.push(
          "Available Commands:",
          "  whoami       - Display developer overview & current role",
          "  skills       - Technical stack & backend competencies",
          "  projects     - List flagship portfolio projects",
          "  curl <url>   - Simulate REST API query (e.g. 'curl /profile')",
          "  resume       - Open full PDF resume viewer",
          "  contact      - Developer email, phone & socials",
          "  theme <name> - Switch accent theme (cobalt, emerald, violet, amber)",
          "  clear        - Clear console output",
          "  exit         - Exit terminal and return to GUI"
        );
        break;

      case "whoami":
      case "bio":
        newLogs.push(
          "NEERAJ K R",
          "Role: Python & Backend Developer",
          "Experience: Software Engineer Trainee at ZKTeco Biometrics India Pvt Ltd",
          "Education: B.Tech in CSE (CGPA: 9.15) — APJ Abdul Kalam Technological University",
          "Core Focus: Scalable REST APIs, FastAPI, Django, PostgreSQL, and Applied AI/ML."
        );
        break;

      case "skills":
        newLogs.push(
          "Backend:   Python 3.12, FastAPI, Django, REST Architecture, Microservices",
          "Database:  PostgreSQL, SQL (Complex queries, Window functions, Indexing)",
          "AI/ML:     PyTorch, CNN, Genetic Algorithms, Medical Image Processing",
          "Frontend:  React, JavaScript (ES6+), HTML5, CSS3, Tailwind CSS",
          "Tools:     Git, Docker, Postman, Linux CLI, Celery, Redis"
        );
        break;

      case "projects":
        newLogs.push(
          "1. Brain Tumor Detection System [CNN + Genetic Algorithms, Python]",
          "   - Medical imaging solution detecting MRI tumors with 96.4% precision.",
          "2. Check Balance Web App [JavaScript, HTML, CSS, REST]",
          "   - Real-time financial balance updater with instant synchronization.",
          "3. FastAPI High-Concurrency Microservices [FastAPI, PostgreSQL, Redis]",
          "   - Sub-30ms response times, JWT auth, and automated OpenAPI documentation.",
          "Tip: Scroll to #projects or type 'curl /projects' for raw JSON."
        );
        break;

      case "curl":
        if (!arg || arg === "/profile") {
          newLogs.push(
            "HTTP/1.1 200 OK",
            "Content-Type: application/json",
            "X-Powered-By: FastAPI / Uvicorn",
            "{",
            '  "developer": "Neeraj K R",',
            '  "specialty": "Python Backend & REST APIs",',
            '  "status": "Open to Opportunities"',
            "}"
          );
        } else if (arg === "/skills") {
          newLogs.push(
            "HTTP/1.1 200 OK",
            "{",
            '  "primary": ["Python", "FastAPI", "Django"],',
            '  "database": ["PostgreSQL", "SQL"],',
            '  "ml": ["PyTorch", "CNN", "Genetic Algorithms"]',
            "}"
          );
        } else {
          newLogs.push(`curl: (6) Could not resolve host or invalid endpoint '${arg}'. Try '/profile' or '/skills'.`);
        }
        break;

      case "resume":
        newLogs.push("Opening in-page PDF Resume viewer...");
        onOpenResume?.();
        break;

      case "contact":
        newLogs.push(
          "Email:    devbyneeraj@gmail.com",
          "Phone:    +91 9744733146",
          "GitHub:   https://github.com/NEERAJ-2003",
          "LinkedIn: http://www.linkedin.com/in/neeraj-k-r-a1456b294",
          "Location: Bengaluru, India"
        );
        break;

      case "theme":
        if (["cobalt", "emerald", "violet", "amber"].includes(arg)) {
          onSetTheme?.(arg);
          newLogs.push(`Theme updated to '${arg}'. CSS variables synchronized.`);
        } else {
          newLogs.push("Usage: theme <cobalt | emerald | violet | amber>");
        }
        break;

      case "clear":
        setHistory([]);
        setInput("");
        return;

      case "exit":
      case "quit":
        onClose();
        return;

      default:
        newLogs.push(`bash: ${cmd}: command not found. Type 'help' for available commands.`);
        break;
    }

    setHistory((prev) => [...prev, ...newLogs]);
    setInput("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      handleCommand(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIdx = historyIdx + 1 < cmdHistory.length ? historyIdx + 1 : historyIdx;
      setHistoryIdx(nextIdx);
      setInput(cmdHistory[cmdHistory.length - 1 - nextIdx] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setInput(cmdHistory[cmdHistory.length - 1 - nextIdx] || "");
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setInput("");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const list = ["help", "whoami", "skills", "projects", "curl", "resume", "contact", "theme", "clear", "exit"];
      const match = list.find((c) => c.startsWith(input.toLowerCase().trim()));
      if (match) setInput(match);
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="terminal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Terminal Shell">
      <div className="terminal-window" onClick={(e) => e.stopPropagation()}>
        {/* Window Header */}
        <div className="terminal-header">
          <div className="terminal-dots">
            <span className="terminal-dot red" onClick={onClose} title="Close (ESC)" />
            <span
              className="terminal-dot yellow"
              onClick={() => setHistory((prev) => [...prev, "--- minimized ---"])}
              title="Minimize"
            />
            <span
              className="terminal-dot green"
              onClick={() => handleCommand("help")}
              title="Help"
            />
          </div>
          <span className="text-xs text-outline font-mono">neeraj@portfolio: ~ (bash)</span>
          <button
            onClick={onClose}
            className="text-xs text-outline hover:text-on-surface flex items-center gap-1 font-mono transition-colors"
          >
            <span>ESC</span>
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Output Screen */}
        <div className="terminal-body" onClick={() => inputRef.current?.focus()}>
          {history.map((line, idx) => (
            <div
              key={idx}
              className={`${
                line.startsWith("neeraj@portfolio")
                  ? "text-primary font-semibold"
                  : line.startsWith("HTTP") || line.startsWith("Available")
                  ? "text-tertiary"
                  : line.startsWith("bash:")
                  ? "text-rose-400"
                  : "text-on-surface-variant"
              }`}
            >
              {line}
            </div>
          ))}

          {/* Active Input Line */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-primary font-semibold select-none">neeraj@portfolio:~$</span>
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-transparent border-none outline-none text-on-surface font-mono text-sm p-0 m-0"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              spellCheck="false"
              autoComplete="off"
            />
            <span className="terminal-cursor" />
          </div>
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
