import { useEffect } from "react";

export default function ProjectModal({ project, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (project) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKey);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div className="portfolio-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={project.title}>
      <div className="portfolio-modal-content max-w-3xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-primary/15 bg-surface-container-low">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">
              {project.icon || "terminal"}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline font-bold text-xl text-on-surface">{project.title}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-label font-bold tracking-wide uppercase bg-primary/20 text-primary">
                  {project.category}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant font-label">{project.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            aria-label="Close case study"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6">
          {project.image && (
            <div className="relative rounded-2xl overflow-hidden h-52 w-full border border-primary/20">
              <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
            </div>
          )}

          {/* Problem & Goal */}
          <div>
            <h4 className="text-sm font-label uppercase tracking-widest text-primary font-bold mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">flag</span>
              Problem & Engineering Objective
            </h4>
            <p className="text-on-surface-variant font-body text-sm leading-relaxed">
              {project.problem}
            </p>
          </div>

          {/* Architecture & Flow */}
          <div className="glass-card p-5 rounded-xl border border-primary/15">
            <h4 className="text-sm font-label uppercase tracking-widest text-tertiary font-bold mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">schema</span>
              System Architecture & Workflow
            </h4>
            <p className="text-on-surface-variant font-body text-sm leading-relaxed mb-3">
              {project.architecture}
            </p>
            {project.flowSteps && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                {project.flowSteps.map((step, idx) => (
                  <div key={idx} className="bg-surface-container-high/60 p-3 rounded-lg border border-outline-variant/30">
                    <span className="text-[10px] font-label font-bold text-primary block mb-1">STEP 0{idx + 1}</span>
                    <p className="text-xs text-on-surface font-headline font-semibold mb-1">{step.title}</p>
                    <p className="text-[11px] text-on-surface-variant leading-tight">{step.detail}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Key Optimizations & Challenges */}
          <div>
            <h4 className="text-sm font-label uppercase tracking-widest text-secondary font-bold mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">build_circle</span>
              Technical Challenges & Optimizations
            </h4>
            <ul className="space-y-2">
              {project.challenges?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-on-surface-variant">
                  <span className="text-secondary font-bold text-sm leading-none">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Measurable Results */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {project.metrics?.map((m, idx) => (
              <div key={idx} className="bg-surface-container p-3.5 rounded-xl border border-primary/10 text-center">
                <span className="text-lg font-bold font-headline text-primary block">{m.value}</span>
                <span className="text-[11px] font-label uppercase tracking-wider text-on-surface-variant">{m.label}</span>
              </div>
            ))}
          </div>

          {/* Tech Stack Pills */}
          <div>
            <h4 className="text-xs font-label uppercase tracking-widest text-outline mb-2">Technologies Used</h4>
            <div className="flex flex-wrap gap-2">
              {project.tech?.map((t) => (
                <span key={t} className="px-2.5 py-1 bg-surface-container-high text-on-surface text-xs font-label rounded-md border border-outline-variant/30">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-primary/15 bg-surface-container-low">
          <span className="text-xs text-on-surface-variant font-label">Production Grade Showcase</span>
          <div className="flex items-center gap-3">
            {project.repo && (
              <a
                href={project.repo}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-label bg-surface-container hover:bg-surface-container-high text-on-surface border border-primary/20 transition-all hover:scale-105"
              >
                <span className="material-symbols-outlined text-sm">code</span>
                <span>GitHub Repo</span>
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-label bg-primary text-on-primary font-bold hover:scale-105 transition-all"
              >
                <span className="material-symbols-outlined text-sm">open_in_new</span>
                <span>Live Demo</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
