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
      <div className="portfolio-modal-content h-[90vh] max-w-5xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-primary/15 bg-surface-container-low shrink-0 gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="material-symbols-outlined text-primary text-xl sm:text-2xl shrink-0">description</span>
            <div className="min-w-0">
              <h3 className="font-headline font-bold text-sm sm:text-base text-on-surface truncate">Neeraj_KR_Resume.pdf</h3>
              <p className="text-[11px] text-on-surface-variant font-label truncate hidden sm:block">Python / Backend Developer Resume</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <a
              href="/Neeraj_KR_Resume.pdf"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-label bg-surface-container hover:bg-surface-container-high text-on-surface border border-primary/20 transition-colors"
              title="Open in new tab"
            >
              <span className="material-symbols-outlined text-sm">open_in_new</span>
              <span className="hidden sm:inline">New Tab</span>
            </a>
            <a
              href="/Neeraj_KR_Resume.pdf"
              download="Neeraj_KR_Resume.pdf"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-label bg-primary text-on-primary font-semibold hover:opacity-90 transition-opacity"
              title="Download resume"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span className="hidden sm:inline">Download</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-surface-container hover:bg-rose-500/20 text-on-surface hover:text-rose-400 border border-outline-variant/30 transition-colors flex items-center justify-center shrink-0 ml-1"
              aria-label="Close modal"
              title="Close"
            >
              <span className="material-symbols-outlined text-lg sm:text-xl">close</span>
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

        {/* User Friendly Bottom Footer Bar with Close Button */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-t border-primary/15 bg-surface-container-low shrink-0 text-xs font-label">
          <span className="text-on-surface-variant text-[11px]">Resume Document Viewer</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30 font-medium transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">close</span>
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
