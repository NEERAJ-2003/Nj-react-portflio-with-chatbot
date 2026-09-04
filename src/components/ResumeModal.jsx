import { useEffect } from "react";

export default function ResumeModal({ isOpen, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKey);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="portfolio-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Resume Preview">
      <div className="portfolio-modal-content h-[90vh] max-w-5xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-primary/15 bg-surface-container-low">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">description</span>
            <div>
              <h3 className="font-headline font-bold text-lg text-on-surface">Neeraj_KR_Resume.pdf</h3>
              <p className="text-xs text-on-surface-variant font-label">Python / Backend Developer Resume</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/Neeraj_KR_Resume.pdf"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-label bg-surface-container hover:bg-surface-container-high text-on-surface border border-primary/20 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">open_in_new</span>
              <span>New Tab</span>
            </a>
            <a
              href="/Neeraj_KR_Resume.pdf"
              download="Neeraj_KR_Resume.pdf"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-label bg-primary text-on-primary font-semibold hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Download</span>
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors ml-2"
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* PDF Frame */}
        <div className="flex-1 w-full bg-surface-container-lowest relative overflow-hidden">
          <iframe
            src="/Neeraj_KR_Resume.pdf#toolbar=1&navpanes=0"
            className="w-full h-full border-none"
            title="Resume Preview"
          />
        </div>
      </div>
    </div>
  );
}
