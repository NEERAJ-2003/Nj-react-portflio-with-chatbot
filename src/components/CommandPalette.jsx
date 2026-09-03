import { useEffect, useMemo, useRef, useState } from "react";

const ACTIONS = [
  { id: "home", label: "Go to Home", hint: "Section", icon: "home", href: "#home" },
  { id: "about", label: "Go to About", hint: "Section", icon: "person", href: "#about" },
  { id: "skills", label: "Go to Skills", hint: "Section", icon: "code", href: "#skills" },
  { id: "projects", label: "Go to Projects", hint: "Section", icon: "folder", href: "#projects" },
  { id: "experience", label: "Go to Experience", hint: "Section", icon: "work", href: "#experience" },
  { id: "contact", label: "Go to Contact", hint: "Section", icon: "mail", href: "#contact" },
  { id: "resume", label: "Download resume", hint: "PDF", icon: "download", href: "/Neeraj_KR_Resume.pdf", download: true },
  { id: "github", label: "Open GitHub", hint: "NEERAJ-2003", icon: "open_in_new", url: "https://github.com/NEERAJ-2003" },
  { id: "linkedin", label: "Open LinkedIn", hint: "Profile", icon: "open_in_new", url: "http://www.linkedin.com/in/neeraj-k-r-a1456b294" },
  { id: "email", label: "Copy email", hint: "devbyneeraj@gmail.com", icon: "content_copy", copy: "devbyneeraj@gmail.com" },
  { id: "freya", label: "Ask Freya", hint: "Chatbot", icon: "auto_awesome", event: "open-freya" },
];

function runAction(item) {
  if (item.href) {
    if (item.download) {
      const a = document.createElement("a");
      a.href = item.href;
      a.download = "Neeraj_KR_Resume.pdf";
      a.click();
      return;
    }
    document.querySelector(item.href)?.scrollIntoView({ behavior: "smooth" });
    return;
  }
  if (item.url) {
    window.open(item.url, "_blank", "noopener,noreferrer");
    return;
  }
  if (item.copy) {
    navigator.clipboard?.writeText(item.copy);
    window.dispatchEvent(new CustomEvent("portfolio-toast", { detail: "Email copied" }));
    return;
  }
  if (item.event) {
    window.dispatchEvent(new CustomEvent(item.event));
  }
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ACTIONS;
    return ACTIONS.filter((a) => `${a.label} ${a.hint}`.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    function openMenu() {
      setOpen(true);
      setQuery("");
      setActive(0);
    }
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setQuery("");
        setActive(0);
        return;
      }
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(results.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter" && results[active]) {
        e.preventDefault();
        runAction(results[active]);
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-cmdk", openMenu);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-cmdk", openMenu);
    };
  }, [open, results, active]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="cmdk-overlay" onClick={() => setOpen(false)}>
      <div className="cmdk-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Command menu">
        <div className="cmdk-search">
          <span className="material-symbols-outlined">search</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to a section, copy email, open GitHub…"
          />
          <kbd>ESC</kbd>
        </div>
        <div className="cmdk-list">
          {results.length === 0 && <p className="cmdk-empty">No matches</p>}
          {results.map((item, i) => (
            <button
              key={item.id}
              className={`cmdk-item ${i === active ? "is-active" : ""}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => {
                runAction(item);
                setOpen(false);
              }}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="cmdk-label">{item.label}</span>
              <span className="cmdk-hint">{item.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
