import { useEffect, useRef, useState } from "react";
import { findAnswer, isSmalltalk, pickThinkingPhrase } from "../chatbot/chatbotEngine";

const QUICK_CHIPS = [
  { label: "Backend stack 🐍", query: "What is his backend experience?" },
  { label: "Brain Tumor ML 🧠", query: "Tell me about his Brain Tumor project" },
  { label: "FastAPI skills ⚡", query: "What are his FastAPI and REST skills?" },
  { label: "Preview resume 📄", query: "Can I see his resume?" },
  { label: "Contact info 📬", query: "How do I contact Neeraj?" },
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesRef = useRef(null);
  const idRef = useRef(0);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const greetedRef = useRef(false);

  function nextId() {
    idRef.current += 1;
    return idRef.current;
  }

  function addMessage(text, sender, action = null) {
    const id = nextId();
    setMessages((prev) => [...prev, { id, text, sender, action }]);
    return id;
  }

  function updateMessage(id, text, sender, action = null) {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, text, sender: sender ?? m.sender, action: action ?? m.action } : m
      )
    );
  }

  function typeOutMessage(id, text, speed = 18, action = null) {
    let i = 0;
    updateMessage(id, "", null, action);
    const timer = setInterval(() => {
      i++;
      updateMessage(id, text.slice(0, i), null, action);
      if (i >= text.length) clearInterval(timer);
    }, speed);
  }

  function openChat() {
    setOpen(true);
    if (!greetedRef.current) {
      greetedRef.current = true;
      addMessage(
        "Hi, I'm Freya, Neeraj's AI assistant. Ask me about his Python backend skills, FastAPI architectures, or ML projects!",
        "bot"
      );
    }
  }

  useEffect(() => {
    function onOpen() {
      openChat();
    }
    window.addEventListener("open-freya", onOpen);
    return () => window.removeEventListener("open-freya", onOpen);
  }, []);

  function closeChat() {
    setOpen(false);
  }

  function handleSend(textToSend) {
    const text = (textToSend || input).trim();
    if (!text) return;
    addMessage(text, "user");
    if (!textToSend) setInput("");

    // Determine action trigger
    let action = null;
    const lower = text.toLowerCase();
    if (lower.includes("resume") || lower.includes("cv")) {
      action = { label: "📄 Preview PDF Resume", event: "open-resume-modal" };
    } else if (lower.includes("contact") || lower.includes("hire") || lower.includes("email")) {
      action = { label: "📬 Go to Contact Form", href: "#contact" };
    } else if (lower.includes("project") || lower.includes("tumor") || lower.includes("work")) {
      action = { label: "🚀 View Featured Projects", href: "#projects" };
    }

    if (isSmalltalk(text)) {
      const id = addMessage("", "bot");
      setTimeout(() => {
        typeOutMessage(id, findAnswer(text), 18, action);
      }, 250);
      return;
    }

    let currentPhrase = pickThinkingPhrase(null);
    const id = addMessage(currentPhrase, "typing");
    const thinkDelay = 1200 + Math.random() * 800;

    const phraseTimer = setInterval(() => {
      currentPhrase = pickThinkingPhrase(currentPhrase);
      updateMessage(id, currentPhrase);
    }, 550);

    setTimeout(() => {
      clearInterval(phraseTimer);
      const answer = findAnswer(text);
      updateMessage(id, "", "bot");
      typeOutMessage(id, answer, 22, action);
    }, thinkDelay);
  }

  function handleActionClick(action) {
    if (action.event) {
      window.dispatchEvent(new CustomEvent(action.event));
      setOpen(false);
    } else if (action.href) {
      document.querySelector(action.href)?.scrollIntoView({ behavior: "smooth" });
      setOpen(false);
    }
  }

  const sparkles = [
    { top: "5%", left: "50%", sx: "-22px", sy: "-14px", delay: "0s" },
    { top: "50%", left: "95%", sx: "16px", sy: "6px", delay: "0.9s" },
    { top: "90%", left: "20%", sx: "-10px", sy: "18px", delay: "1.8s" },
    { top: "20%", left: "10%", sx: "-18px", sy: "10px", delay: "2.5s" },
  ];

  return (
    <>
      <div id="chat-toggle-wrap">
        {!open && (
          <>
            <div className="freya-halo" />
            <div className="freya-halo delay" />
            {sparkles.map((s, i) => (
              <span
                key={i}
                className="freya-sparkle"
                style={{ top: s.top, left: s.left, "--sx": s.sx, "--sy": s.sy, animationDelay: s.delay }}
              />
            ))}
          </>
        )}
        <button
          id="chat-toggle-btn"
          className={open ? "is-open" : ""}
          aria-label="Open chat assistant"
          onClick={() => (open ? closeChat() : openChat())}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="freyaGradientBtn" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#dce8ff" />
              </linearGradient>
            </defs>
            <path
              d="M12 1.5c.6 3.6 1.4 5.9 2.9 7.6 1.5 1.5 3.8 2.3 7.6 2.9-3.8.6-6.1 1.4-7.6 2.9-1.5 1.7-2.3 4-2.9 7.6-.6-3.6-1.4-5.9-2.9-7.6C7.6 13.4 5.3 12.6 1.5 12c3.8-.6 6.1-1.4 7.6-2.9C10.6 7.4 11.4 5.1 12 1.5Z"
              fill="url(#freyaGradientBtn)"
            />
            <circle cx="19" cy="4" r="1.3" fill="url(#freyaGradientBtn)" />
            <circle cx="4.5" cy="18.5" r="1" fill="url(#freyaGradientBtn)" />
          </svg>
        </button>
      </div>

      <div id="chat-window" className={open ? "open" : ""}>
        {/* Chat Header */}
        <div id="chat-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="freyaGradientHeader" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#699cff" />
                <stop offset="100%" stopColor="#9c48ea" />
              </linearGradient>
            </defs>
            <path
              d="M12 1.5c.6 3.6 1.4 5.9 2.9 7.6 1.5 1.5 3.8 2.3 7.6 2.9-3.8.6-6.1 1.4-7.6 2.9-1.5 1.7-2.3 4-2.9 7.6-.6-3.6-1.4-5.9-2.9-7.6C7.6 13.4 5.3 12.6 1.5 12c3.8-.6 6.1-1.4 7.6-2.9C10.6 7.4 11.4 5.1 12 1.5Z"
              fill="url(#freyaGradientHeader)"
            />
            <circle cx="19" cy="4" r="1.3" fill="url(#freyaGradientHeader)" />
            <circle cx="4.5" cy="18.5" r="1" fill="url(#freyaGradientHeader)" />
          </svg>
          <div id="chat-header-text">
            <div id="chat-header-title">Freya AI</div>
          </div>
          <button id="chat-close-btn" aria-label="Close chat" onClick={closeChat}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Chat Messages */}
        <div id="chat-messages" ref={messagesRef}>
          {messages.map((m) => {
            const isUser = m.sender === "user";
            return (
              <div
                key={m.id}
                className={`w-full flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1`}
              >
                <div className={`chat-msg ${m.sender}`}>
                  {m.sender === "typing" && (
                    <span className="typing-dots">
                      <span />
                      <span />
                      <span />
                    </span>
                  )}
                  {m.text}
                </div>

                {/* Action Button inside Chat */}
                {m.action && m.sender === "bot" && (
                  <div className="flex justify-start pl-1 pt-1">
                    <button
                      onClick={() => handleActionClick(m.action)}
                      className="px-2.5 py-1 rounded-lg bg-primary/15 border border-primary/30 text-[11px] font-label text-primary font-bold hover:bg-primary hover:text-on-primary transition-all flex items-center gap-1 shadow-sm"
                    >
                      <span>{m.action.label}</span>
                      <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-2 border-t border-white/5 bg-surface-container-lowest/50 flex gap-1.5 overflow-x-auto no-scrollbar">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip.label}
              onClick={() => handleSend(chip.query)}
              className="chat-chip text-left"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <div id="chat-input-area">
          <input
            type="text"
            id="chat-input"
            placeholder="Ask about backend, ML, experience..."
            autoComplete="off"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <button id="chat-send-btn" aria-label="Send message" onClick={() => handleSend()}>
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </>
  );
}
