import { useEffect, useRef, useState } from "react";
import { findAnswer, isSmalltalk, pickThinkingPhrase } from "../chatbot/chatbotEngine";

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

  function addMessage(text, sender) {
    const id = nextId();
    setMessages((prev) => [...prev, { id, text, sender }]);
    return id;
  }

  function updateMessage(id, text, sender) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text, sender: sender ?? m.sender } : m)));
  }

  function typeOutMessage(id, text, speed = 18) {
    let i = 0;
    updateMessage(id, "");
    const timer = setInterval(() => {
      i++;
      updateMessage(id, text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, speed);
  }

  function openChat() {
    setOpen(true);
    if (!greetedRef.current) {
      greetedRef.current = true;
      addMessage("Hi, I'm Freya, Neeraj's AI. Ask me about him.", "bot");
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

  function sendMessage() {
    const text = input.trim();
    if (!text) return;
    addMessage(text, "user");
    setInput("");

    if (isSmalltalk(text)) {
      const id = addMessage("", "bot");
      setTimeout(() => {
        typeOutMessage(id, findAnswer(text), 18);
      }, 250);
      return;
    }

    let currentPhrase = pickThinkingPhrase(null);
    const id = addMessage(currentPhrase, "typing");
    const thinkDelay = 1600 + Math.random() * 1000;

    const phraseTimer = setInterval(() => {
      currentPhrase = pickThinkingPhrase(currentPhrase);
      updateMessage(id, currentPhrase);
    }, 650);

    setTimeout(() => {
      clearInterval(phraseTimer);
      const answer = findAnswer(text);
      updateMessage(id, "", "bot");
      typeOutMessage(id, answer, 26);
    }, thinkDelay);
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
            <path d="M12 1.5c.6 3.6 1.4 5.9 2.9 7.6 1.5 1.5 3.8 2.3 7.6 2.9-3.8.6-6.1 1.4-7.6 2.9-1.5 1.7-2.3 4-2.9 7.6-.6-3.6-1.4-5.9-2.9-7.6C7.6 13.4 5.3 12.6 1.5 12c3.8-.6 6.1-1.4 7.6-2.9C10.6 7.4 11.4 5.1 12 1.5Z" fill="url(#freyaGradientBtn)" />
            <circle cx="19" cy="4" r="1.3" fill="url(#freyaGradientBtn)" />
            <circle cx="4.5" cy="18.5" r="1" fill="url(#freyaGradientBtn)" />
          </svg>
        </button>
      </div>

      <div id="chat-window" className={open ? "open" : ""}>
        <div id="chat-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="freyaGradientHeader" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#699cff" />
                <stop offset="100%" stopColor="#9c48ea" />
              </linearGradient>
            </defs>
            <path d="M12 1.5c.6 3.6 1.4 5.9 2.9 7.6 1.5 1.5 3.8 2.3 7.6 2.9-3.8.6-6.1 1.4-7.6 2.9-1.5 1.7-2.3 4-2.9 7.6-.6-3.6-1.4-5.9-2.9-7.6C7.6 13.4 5.3 12.6 1.5 12c3.8-.6 6.1-1.4 7.6-2.9C10.6 7.4 11.4 5.1 12 1.5Z" fill="url(#freyaGradientHeader)" />
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
        <div id="chat-messages" ref={messagesRef}>
          {messages.map((m) => (
            <div key={m.id} className={`chat-msg ${m.sender}`}>
              {m.sender === "typing" && (
                <span className="typing-dots">
                  <span />
                  <span />
                  <span />
                </span>
              )}
              {m.text}
            </div>
          ))}
        </div>
        <div id="chat-input-area">
          <input
            type="text"
            id="chat-input"
            placeholder="You can ask here..."
            autoComplete="off"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />
          <button id="chat-send-btn" aria-label="Send message" onClick={sendMessage}>
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </>
  );
}
