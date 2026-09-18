import { useEffect, useRef, useState } from "react";
import { findAnswer, isSmalltalk, pickThinkingPhrase } from "../chatbot/chatbotEngine";

const QUICK_CHIPS = [
  { label: "Architecture 🧬", query: "Explain the Brain Tumor architecture pipeline" },
  { label: "FastAPI stack ⚡", query: "What are his FastAPI and REST skills?" },
  { label: "Backend stack 🐍", query: "What is his backend experience?" },
  { label: "Preview resume 📄", query: "Can I see his resume?" },
  { label: "Contact info 📬", query: "How do I contact Neeraj?" },
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedTranscript, setRecordedTranscript] = useState("");
  const [interimSpeech, setInterimSpeech] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [isIntroActive, setIsIntroActive] = useState(false);
  const [isIntroFading, setIsIntroFading] = useState(false);
  const introTimerRef = useRef(null);

  useEffect(() => {
    // Reveal starting teaser callout 1.8s after initial page mount
    const teaserTimer = setTimeout(() => {
      setShowTeaser(true);
    }, 1800);
    // Auto-dismiss after 10s if not interacted
    const autoDismissTimer = setTimeout(() => {
      setShowTeaser(false);
    }, 11000);
    return () => {
      clearTimeout(teaserTimer);
      clearTimeout(autoDismissTimer);
    };
  }, []);

  const messagesRef = useRef(null);
  const idRef = useRef(0);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const isRecordingRef = useRef(false);
  const recordedTranscriptRef = useRef("");
  const interimSpeechRef = useRef("");
  const voiceEnabledRef = useRef(voiceEnabled);
  const inputRef = useRef(null);

  // Active query generation trackers for cancellation
  const activeTimerRef = useRef(null);
  const activePhraseTimerRef = useRef(null);
  const activeTypingTimerRef = useRef(null);
  const activeBotMsgIdRef = useRef(null);

  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled;
  }, [voiceEnabled]);

  // Format seconds into MM:SS
  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }

  // Clean and speak response using Web Speech Synthesis
  function speakAnswer(text) {
    if (!("speechSynthesis" in window) || !voiceEnabledRef.current) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text
        .replace(/[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]/gu, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/[*_#`~]/g, "")
        .trim();
      if (!cleanText) return;
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const englishVoice =
        voices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (v.name.includes("Natural") ||
              v.name.includes("Google") ||
              v.name.includes("Samantha") ||
              v.name.includes("Zira"))
        ) || voices.find((v) => v.lang.startsWith("en"));
      if (englishVoice) utterance.voice = englishVoice;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech synthesis error:", err);
    }
  }

  // Start Voice Recording
  function startVoiceRecording() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      window.dispatchEvent(
        new CustomEvent("portfolio-toast", {
          detail: "Voice input is not supported in this browser. Please try Chrome or Edge.",
        })
      );
      return;
    }

    setRecordedTranscript("");
    setInterimSpeech("");
    recordedTranscriptRef.current = "";
    interimSpeechRef.current = "";
    setRecordingTime(0);

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        isRecordingRef.current = true;
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setRecordingTime((t) => t + 1);
        }, 1000);
      };

      recognition.onresult = (event) => {
        let interim = "";
        let finalAccumulated = recordedTranscriptRef.current;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalAccumulated =
              (finalAccumulated ? finalAccumulated.trim() + " " : "") + transcript.trim();
          } else {
            interim += transcript;
          }
        }
        recordedTranscriptRef.current = finalAccumulated;
        interimSpeechRef.current = interim;
        setRecordedTranscript(finalAccumulated);
        setInterimSpeech(interim);
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          cancelVoiceRecording(false);
          window.dispatchEvent(
            new CustomEvent("portfolio-toast", {
              detail: "Microphone access is blocked. Please enable mic permissions in your browser.",
            })
          );
        } else if (event.error !== "no-speech" && event.error !== "aborted") {
          window.dispatchEvent(
            new CustomEvent("portfolio-toast", {
              detail: "Voice input was interrupted. Please try speaking again.",
            })
          );
        }
      };

      recognition.onend = () => {
        // If still in recording mode, keep recognition alive
        if (isRecordingRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // ignore
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech recognition start failed:", err);
      cancelVoiceRecording(false);
      window.dispatchEvent(
        new CustomEvent("portfolio-toast", {
          detail: "Unable to access your microphone. Please verify device permissions.",
        })
      );
    }
  }

  // Cancel Voice Recording (Option 1: Cancel)
  function cancelVoiceRecording(showToast = true) {
    isRecordingRef.current = false;
    setIsRecording(false);
    clearInterval(timerRef.current);
    setRecordingTime(0);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }

    setRecordedTranscript("");
    setInterimSpeech("");
    recordedTranscriptRef.current = "";
    interimSpeechRef.current = "";

    if (showToast) {
      window.dispatchEvent(
        new CustomEvent("portfolio-toast", {
          detail: "Voice recording discarded.",
        })
      );
    }
  }

  // Send Voice Recording (Option 2: Send -> converts to input text & dispatches)
  function sendVoiceRecording() {
    isRecordingRef.current = false;
    setIsRecording(false);
    clearInterval(timerRef.current);
    setRecordingTime(0);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    const finalRecorded = (
      (recordedTranscriptRef.current || "") +
      " " +
      (interimSpeechRef.current || "")
    ).trim();

    setRecordedTranscript("");
    setInterimSpeech("");
    recordedTranscriptRef.current = "";
    interimSpeechRef.current = "";

    if (!finalRecorded) {
      window.dispatchEvent(
        new CustomEvent("portfolio-toast", {
          detail: "I didn't catch that — please speak into your microphone and try again.",
        })
      );
      return;
    }

    // Send message to Freya AI and clear input field
    setInput("");
    handleSend(finalRecorded);
  }

  // Hide Freya AI when any modal popup (Resume, Case Study, Architecture) is open
  useEffect(() => {
    function checkModal() {
      const modalExists = Boolean(document.querySelector(".portfolio-modal-overlay"));
      setIsModalOpen(modalExists);
      if (modalExists) {
        setOpen(false);
        if (isRecordingRef.current) {
          cancelVoiceRecording(false);
        }
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
      }
    }
    const observer = new MutationObserver(checkModal);
    observer.observe(document.body, { childList: true, subtree: true });
    checkModal();
    return () => observer.disconnect();
  }, []);

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

  function cancelActiveGeneration() {
    if (activeTimerRef.current) {
      clearTimeout(activeTimerRef.current);
      activeTimerRef.current = null;
    }
    if (activePhraseTimerRef.current) {
      clearInterval(activePhraseTimerRef.current);
      activePhraseTimerRef.current = null;
    }
    if (activeTypingTimerRef.current) {
      clearInterval(activeTypingTimerRef.current);
      activeTypingTimerRef.current = null;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (activeBotMsgIdRef.current) {
      const unfinishedId = activeBotMsgIdRef.current;
      setMessages((prev) =>
        prev.filter((m) => m.id !== unfinishedId || (m.sender === "bot" && m.text.trim().length > 0))
      );
      activeBotMsgIdRef.current = null;
    }
  }

  function typeOutMessage(id, text, speed = 36, action = null) {
    if (activeTypingTimerRef.current) {
      clearInterval(activeTypingTimerRef.current);
      activeTypingTimerRef.current = null;
    }
    let i = 0;
    updateMessage(id, "", null, action);
    if (voiceEnabledRef.current) {
      speakAnswer(text);
    }
    activeTypingTimerRef.current = setInterval(() => {
      i++;
      updateMessage(id, text.slice(0, i), null, action);
      if (i >= text.length) {
        clearInterval(activeTypingTimerRef.current);
        activeTypingTimerRef.current = null;
        if (activeBotMsgIdRef.current === id) {
          activeBotMsgIdRef.current = null;
        }
      }
    }, speed);
  }

  function openChat() {
    setOpen(true);
    setShowTeaser(false);
    if (!greetedRef.current) {
      greetedRef.current = true;
      setIsIntroActive(true);
      setIsIntroFading(false);

      introTimerRef.current = setTimeout(() => {
        setIsIntroFading(true);
        setTimeout(() => {
          setIsIntroActive(false);
          setIsIntroFading(false);
          const id = addMessage("", "bot");
          activeBotMsgIdRef.current = id;
          activeTimerRef.current = setTimeout(() => {
            typeOutMessage(
              id,
              "Hi, I'm Freya, Neeraj's AI assistant. Ask me about his Python & FastAPI stack, system architectures, or ML projects!",
              28
            );
          }, 120);
        }, 400);
      }, 1000);
    }
  }

  function skipIntro() {
    if (introTimerRef.current) {
      clearTimeout(introTimerRef.current);
      introTimerRef.current = null;
    }
    setIsIntroFading(true);
    setTimeout(() => {
      setIsIntroActive(false);
      setIsIntroFading(false);
      const id = addMessage("", "bot");
      activeBotMsgIdRef.current = id;
      typeOutMessage(
        id,
        "Hi, I'm Freya, Neeraj's AI assistant. Ask me about his Python & FastAPI stack, system architectures, or ML projects!",
        28
      );
    }, 180);
  }

  function clearChat() {
    cancelActiveGeneration();
    if (isRecordingRef.current) {
      cancelVoiceRecording(false);
    }
    setMessages([
      {
        id: nextId(),
        text: "Chat refreshed! Ask me about Neeraj's skills, Brain Tumor architecture, or projects.",
        sender: "bot",
        action: null,
      },
    ]);
  }

  useEffect(() => {
    function onOpen() {
      openChat();
    }
    window.addEventListener("open-freya", onOpen);
    return () => {
      window.removeEventListener("open-freya", onOpen);
      cancelActiveGeneration();
      if (isRecordingRef.current) {
        cancelVoiceRecording(false);
      }
    };
  }, []);

  function closeChat() {
    setOpen(false);
    cancelActiveGeneration();
    if (isRecordingRef.current) {
      cancelVoiceRecording(false);
    }
  }

  function handleSend(textToSend) {
    const text = (textToSend || input).trim();
    if (!text) return;

    // Interrupt any previous pending question or ongoing typing
    cancelActiveGeneration();

    addMessage(text, "user");
    setInput("");

    // Determine action trigger
    let action = null;
    const lower = text.toLowerCase();
    if (lower.includes("resume") || lower.includes("cv")) {
      action = { label: "📄 Preview PDF Resume", event: "open-resume-modal" };
    } else if (lower.includes("architecture") || lower.includes("pipeline") || lower.includes("clahe") || lower.includes("genetic")) {
      action = { label: "🧬 Explore Architecture", event: "open-arch-modal" };
    } else if (lower.includes("api playground") || lower.includes("rest api") || lower.includes("console") || lower.includes("swagger")) {
      action = { label: "⚡ Open REST API Console", href: "#api-playground" };
    } else if (lower.includes("contact") || lower.includes("hire") || lower.includes("email") || lower.includes("message")) {
      action = { label: "📬 Go to Contact Form", href: "#contact" };
    } else if (lower.includes("project") || lower.includes("tumor") || lower.includes("balance") || lower.includes("work")) {
      action = { label: "🚀 View Featured Projects", href: "#projects" };
    }

    if (isSmalltalk(text)) {
      const id = addMessage("", "bot");
      activeBotMsgIdRef.current = id;
      activeTimerRef.current = setTimeout(() => {
        typeOutMessage(id, findAnswer(text), 36, action);
      }, 250);
      return;
    }

    let currentPhrase = pickThinkingPhrase(null);
    const id = addMessage(currentPhrase, "typing");
    activeBotMsgIdRef.current = id;
    const thinkDelay = 1200 + Math.random() * 800;

    activePhraseTimerRef.current = setInterval(() => {
      currentPhrase = pickThinkingPhrase(currentPhrase);
      updateMessage(id, currentPhrase);
    }, 550);

    activeTimerRef.current = setTimeout(() => {
      if (activePhraseTimerRef.current) {
        clearInterval(activePhraseTimerRef.current);
        activePhraseTimerRef.current = null;
      }
      const answer = findAnswer(text);
      updateMessage(id, "", "bot");
      typeOutMessage(id, answer, 36, action);
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
      {/* Mobile Backdrop */}
      {open && !isModalOpen && (
        <div
          id="chat-mobile-backdrop"
          className="fixed inset-0 bg-black/65 backdrop-blur-[2px] z-[999] sm:hidden transition-opacity"
          onClick={closeChat}
          aria-hidden="true"
        />
      )}

      <div
        id="chat-toggle-wrap"
        className={open ? "chat-toggle-open" : ""}
        style={{ display: isModalOpen ? "none" : undefined }}
      >
        {!open && !isModalOpen && showTeaser && (
          <div
            className="freya-teaser-pill"
            onClick={openChat}
            role="button"
            tabIndex={0}
            aria-label="Open Freya AI chat"
          >
            <span className="freya-teaser-sparkle">✨</span>
            <div className="freya-teaser-text">
              <span className="freya-teaser-title">Ask Freya AI</span>
              <span className="freya-teaser-sub">Python & Backend</span>
            </div>
            <button
              type="button"
              className="freya-teaser-close"
              onClick={(e) => {
                e.stopPropagation();
                setShowTeaser(false);
              }}
              aria-label="Dismiss message"
            >
              <span className="material-symbols-outlined text-[13px]">close</span>
            </button>
          </div>
        )}
        {!open && !isModalOpen && (
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

      <div
        id="chat-window"
        className={open ? "open" : ""}
        style={{ display: isModalOpen ? "none" : undefined }}
      >
        {/* Splash Logo Starting Animation that smoothly changes to chat */}
        {isIntroActive && (
          <div
            className={`freya-splash-overlay ${isIntroFading ? "fade-out" : ""}`}
            onClick={skipIntro}
            title="Click to enter chat directly"
          >
            <div className="freya-splash-content">
              <div className="freya-avatar-halo-wrap splash">
                <div className="freya-avatar-pulse" />
                <div className="freya-avatar-ring" />
                <div className="freya-avatar-icon splash">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 1.5c.6 3.6 1.4 5.9 2.9 7.6 1.5 1.5 3.8 2.3 7.6 2.9-3.8.6-6.1 1.4-7.6 2.9-1.5 1.7-2.3 4-2.9 7.6-.6-3.6-1.4-5.9-2.9-7.6C7.6 13.4 5.3 12.6 1.5 12c3.8-.6 6.1-1.4 7.6-2.9C10.6 7.4 11.4 5.1 12 1.5Z"
                      fill="url(#freyaGradientHeader)"
                    />
                    <circle cx="19" cy="4" r="1.3" fill="url(#freyaGradientHeader)" />
                    <circle cx="4.5" cy="18.5" r="1" fill="url(#freyaGradientHeader)" />
                  </svg>
                </div>
              </div>
              <div className="freya-splash-title">Freya AI Assistant</div>
              <div className="freya-splash-badge">
                <span className="freya-status-dot" />
                <span>Online • Trained on Neeraj's Portfolio</span>
              </div>
              <div className="freya-splash-hint">Connecting to workspace...</div>
            </div>
          </div>
        )}

        {/* Mobile Drag Indicator */}
        <div
          className="w-full flex justify-center pt-2 pb-0.5 sm:hidden cursor-pointer flex-shrink-0 bg-surface-container-lowest/70"
          onClick={closeChat}
          title="Tap or drag to close"
        >
          <div className="w-10 h-1.5 rounded-full bg-white/30" />
        </div>

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
            <div className="flex items-center gap-1.5">
              <div id="chat-header-title">Freya AI</div>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <button
              id="chat-voice-toggle-btn"
              aria-label={voiceEnabled ? "Mute Freya's voice" : "Enable Freya's voice response"}
              title={voiceEnabled ? "Voice replies enabled (click to mute)" : "Enable voice replies"}
              onClick={() => {
                const next = !voiceEnabled;
                setVoiceEnabled(next);
                if (!next && "speechSynthesis" in window) {
                  window.speechSynthesis.cancel();
                }
                window.dispatchEvent(
                  new CustomEvent("portfolio-toast", {
                    detail: next ? "Freya voice replies enabled 🔊" : "Freya voice replies muted 🔇",
                  })
                );
              }}
              className={`w-7 h-7 flex items-center justify-center transition-colors rounded-lg hover:bg-surface-container ${
                voiceEnabled ? "text-primary bg-primary/15" : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {voiceEnabled ? "volume_up" : "volume_off"}
              </span>
            </button>
            <button
              id="chat-clear-btn"
              aria-label="Clear chat"
              title="Clear conversation"
              onClick={clearChat}
              className="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors rounded-lg hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
            </button>
            <button id="chat-close-btn" aria-label="Close chat" onClick={closeChat} style={{ marginLeft: 0 }}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
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
        <div className="chat-chips-area px-3 py-2 border-t border-white/5 bg-surface-container-lowest/50 flex gap-1.5 overflow-x-auto no-scrollbar">
          {QUICK_CHIPS.map((chip, idx) => (
            <button
              key={chip.label}
              onClick={() => handleSend(chip.query)}
              className="chat-chip text-left"
              style={{ "--chip-index": idx }}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Voice Recording Active Panel or Standard Input Area */}
        {isRecording ? (
          <div id="chat-recording-area">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="voice-pulse-dot flex-shrink-0" />
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-red-400 font-mono tracking-wider">
                    REC {formatTime(recordingTime)}
                  </span>
                  <div className="voice-waves flex items-center gap-0.5">
                    <span className="voice-wave-bar" />
                    <span className="voice-wave-bar" />
                    <span className="voice-wave-bar" />
                    <span className="voice-wave-bar" />
                  </div>
                </div>
                <div className="text-[11px] text-on-surface-variant truncate font-sans italic pr-1">
                  {recordedTranscript || interimSpeech
                    ? `"${(recordedTranscript + " " + interimSpeech).trim()}"`
                    : "Listening freely... speak now"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Option 1: Cancel Button */}
              <button
                type="button"
                id="chat-record-cancel-btn"
                aria-label="Cancel voice recording"
                title="Cancel recording"
                onClick={() => cancelVoiceRecording(true)}
              >
                <span className="material-symbols-outlined text-[15px]">close</span>
                <span>Cancel</span>
              </button>

              {/* Option 2: Send Button */}
              <button
                type="button"
                id="chat-record-send-btn"
                aria-label="Send voice input"
                title="Convert to text & send"
                onClick={sendVoiceRecording}
              >
                <span className="material-symbols-outlined text-[15px]">send</span>
                <span>Send</span>
              </button>
            </div>
          </div>
        ) : (
          <div id="chat-input-area">
            <button
              type="button"
              id="chat-mic-btn"
              aria-label="Record voice input"
              title="Voice input (click to record)"
              onClick={startVoiceRecording}
            >
              <span className="material-symbols-outlined">mic</span>
            </button>
            <input
              ref={inputRef}
              type="text"
              id="chat-input"
              placeholder="Ask Freya or click mic to record..."
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
        )}
      </div>
    </>
  );
}
