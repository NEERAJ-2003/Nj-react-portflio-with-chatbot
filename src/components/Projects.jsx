import { useState, useEffect } from "react";
import Reveal from "./Reveal";
import ArchitectureModal from "./ArchitectureModal";

export const PROJECTS_DATA = [
  {
    id: "sentinel",
    title: "Sentinel",
    subtitle: "Cryptographic Trust & Governance for Autonomous AI Agents",
    category: "AI & ML",
    badge: "IBM Hackathon",
    icon: "security",
    image: "/sentinel_img.jpg",
    imagePosition: "left center",
    noZoom: true,
    containImageMobile: true,
    summary:
      "Sentinel enforces cryptographic trust and governance for autonomous AI agents running on IBM Bob — intercepting every action, validating against policy, and attaching deterministic digital signatures before execution.",
    problem:
      "Autonomous AI agents operating in production environments can execute unintended or malicious actions without oversight. There was no lightweight governance layer that could intercept, validate, and cryptographically sign agent decisions in real time.",
    architecture:
      "A FastAPI middleware layer sits between the IBM Bob agent runtime and the external world. Every agent action passes through an Intercept → Policy Check → Cryptographic Sign → Deterministic Guard pipeline before execution. React frontend visualizes the trust flow in real time.",
    flowSteps: [
      { title: "Bob Agent Intercept", detail: "Every agent action is captured before execution by Sentinel FastAPI middleware." },
      { title: "Policy Check", detail: "Action payload validated against governance rules and role-based permission sets." },
      { title: "Cryptographic Sign", detail: "Approved actions are signed with Ed25519 keys, creating an immutable audit trail." },
    ],
    challenges: [
      "Achieving sub-10ms governance overhead so AI agent latency is imperceptible in real-time workflows.",
      "Designing a deterministic guard that is cryptographically tamper-proof even when deployed in adversarial environments.",
    ],
    metrics: [
      { value: "<10ms", label: "Governance Overhead" },
      { value: "Ed25519", label: "Signature Scheme" },
      { value: "IBM Bob", label: "Hackathon 2.0" },
    ],
    tech: ["FastAPI", "React", "IBM Bob", "Cryptography", "Python"],
    repo: "https://github.com/NEERAJ-2003/Sentinel",
  },
  {
    id: "brain-tumor",
    title: "Brain Tumor Detection System",
    subtitle: "Medical imaging diagnosis utilizing Deep CNN & Genetic Algorithm optimization",
    category: "AI & ML",
    badge: "ML System",
    icon: "psychology",
    image: "/project_img.png",
    summary:
      "An intelligent medical imaging solution that detects brain tumors from MRI scans using CNN for feature extraction and Genetic Algorithms for optimizing model performance.",
    problem:
      "Manual MRI tumor diagnosis is time-intensive and subject to human cognitive fatigue. The objective was to build an automated, highly-accurate computer vision pipeline capable of detecting tumor boundaries with clinical-grade precision.",
    architecture:
      "Raw MRI scans undergo preprocessing and normalization. A Deep Convolutional Neural Network (CNN) extracts intricate multi-scale spatial features, while an evolutionary Genetic Algorithm optimizes layer weights and classification thresholds to prevent local minima traps.",
    flowSteps: [
      { title: "MRI Preprocessing", detail: "Histogram equalization, noise filtering, and edge contrast tuning." },
      { title: "CNN Extraction", detail: "Multi-layered convolutional kernels extract deep morphological tumor signatures." },
      { title: "Genetic Optimization", detail: "Convergence algorithm fine-tunes decision thresholds for 96.4% accuracy." },
    ],
    challenges: [
      "Mitigating overfitting on medical datasets through synthetic affine transformations and Elastic Distortion data augmentation.",
      "Optimizing model inference time down to 42ms for real-time diagnostic assistance in clinical environments.",
    ],
    metrics: [
      { value: "96.4%", label: "Detection Accuracy" },
      { value: "42ms", label: "Inference Time" },
      { value: "2,500+", label: "Scans Evaluated" },
    ],
    tech: ["Python", "CNN", "Genetic Algorithm", "OpenCV", "PyTorch"],
    repo: "https://github.com/NEERAJ-2003",
  },
  {
    id: "check-balance",
    title: "Check Balance Web App",
    subtitle: "Real-time interactive financial ledger & balance computation engine",
    category: "Web Apps",
    badge: "Web App",
    icon: "account_balance_wallet",
    summary:
      "Interactive financial application empowering users to monitor and audit fund distributions in real time with an ultra-responsive client-side interface.",
    problem:
      "Users needed a lightning-fast, distraction-free calculation tool to audit personal finances without heavy banking apps or slow network requests.",
    architecture:
      "Engineered with clean vanilla JavaScript, HTML5, and CSS3, utilizing optimistic local state persistence and REST communication.",
    flowSteps: [
      { title: "State Calculation", detail: "Precise floating-point currency arithmetic and balance auditing." },
      { title: "Optimistic UI", detail: "Zero-latency UI updates with instant visual feedback." },
      { title: "Cloud Persistence", detail: "Stateless persistence layer deployed globally on Vercel." },
    ],
    challenges: [
      "Preventing IEEE-754 binary floating-point precision errors during currency additions.",
      "Ensuring seamless touch interaction and accessibility across all mobile form factors.",
    ],
    metrics: [
      { value: "100%", label: "Responsive Score" },
      { value: "< 0.3s", label: "Initial Load Time" },
      { value: "Zero", label: "External Dependencies" },
    ],
    tech: ["JavaScript", "HTML5", "CSS3", "REST APIs"],
    liveUrl: "https://check-balance-pi.vercel.app/",
  },
];

const CATEGORIES = ["All", "AI & ML", "Web Apps"];

function FanCard({ project, index, hoveredIndex, onHover, onSelectProject, onOpenArch }) {
  const isHovered = hoveredIndex === index;
  const hasHover = hoveredIndex !== null;
  const isBefore = hasHover && index < hoveredIndex;
  const isAfter = hasHover && index > hoveredIndex;

  const tiltDeg = isBefore ? -18 : isAfter ? 18 : 0;
  const translateX = isBefore ? "-55px" : isAfter ? "55px" : "0px";
  const scale = isHovered ? 1 : hasHover ? 0.88 : 1;
  const zIndex = isHovered ? 30 : 10;

  const style = {
    flex: isHovered ? "3.2 1 0%" : hasHover ? "0.55 1 0%" : "1 1 0%",
    transform: `perspective(1200px) rotateY(${tiltDeg}deg) translateX(${translateX}) scale(${scale})`,
    transformOrigin: isBefore ? "right center" : "left center",
    transition: "all 0.75s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    zIndex,
    position: "relative",
    minWidth: 0,
  };

  const hasImage = !!project.image;

  return (
    <div style={style} onMouseEnter={() => onHover(index)} className="rounded-3xl overflow-hidden cursor-pointer group">
      {hasImage ? (
        <div className="relative h-[440px] w-full flex flex-col justify-end border border-white/10 rounded-3xl overflow-hidden">

          {/* noZoom cards: use background-image so expanding container reveals more content instead of zooming */}
          {project.noZoom ? (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${project.image})`,
                backgroundSize: "cover",
                backgroundPosition: project.imagePosition || "center center",
                backgroundRepeat: "no-repeat",
              }}
            />
          ) : (
            /* Normal cards: img with scale-zoom on hover */
            <img
              src={project.image}
              alt={project.title}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                transform: isHovered ? "scale(1.10)" : "scale(1.0)",
                transition: "transform 1.2s cubic-bezier(0.34,1.4,0.64,1)",
                objectPosition: project.imagePosition || "center center",
              }}
            />
          )}

          {/* Gradient overlay — lighter when not hovered so image shows through */}
          <div
            className="absolute inset-0"
            style={{
              background: isHovered
                ? "linear-gradient(to top, rgba(0,0,0,0.92) 40%, rgba(0,0,0,0.45) 70%, rgba(0,0,0,0.15) 100%)"
                : "linear-gradient(to top, rgba(0,0,0,0.70) 25%, rgba(0,0,0,0.20) 65%, rgba(0,0,0,0.05) 100%)",
              transition: "background 1.2s ease",
            }}
          />

          {/* Collapsed: just the title pinned at bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 z-10 p-5 pointer-events-none"
            style={{
              opacity: isHovered ? 0 : 1,
              transform: isHovered ? "translateY(6px)" : "translateY(0)",
              transition: "opacity 0.35s, transform 0.35s",
            }}
          >
            <span className="px-2 py-0.5 rounded-full text-[10px] font-label font-bold uppercase tracking-wide bg-primary/20 text-primary border border-primary/30 inline-block mb-1.5">
              {project.badge}
            </span>
            <p className="text-white font-bold text-base font-headline leading-snug">{project.title}</p>
          </div>

          {/* Expanded content: slides up on hover */}
          <div
            className="relative z-10 p-6 md:p-8"
            style={{
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? "translateY(0)" : "translateY(22px)",
              transition: "opacity 0.4s 0.15s, transform 0.4s 0.15s",
            }}
          >
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-label font-bold uppercase tracking-wide bg-primary/20 text-primary border border-primary/30 inline-block mb-3">
              {project.badge}
            </span>
            <h3 className="text-2xl md:text-3xl font-bold font-headline mb-2 text-white">{project.title}</h3>
            <p className="text-sm text-white/75 font-label mb-5 line-clamp-2 leading-relaxed max-w-xl">{project.summary}</p>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {project.tech.slice(0, 5).map((t) => (
                <span key={t} className="px-2.5 py-1 bg-white/10 backdrop-blur-sm rounded-lg text-white/80 text-[11px] font-label border border-white/10">{t}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              {project.id === "brain-tumor" && (
                <button onClick={(e) => { e.stopPropagation(); onOpenArch(); }} className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-label font-bold flex items-center gap-2 hover:opacity-90 shadow-lg shadow-primary/30 transition-all">
                  <span className="material-symbols-outlined text-sm">schema</span><span>Architecture</span>
                </button>
              )}
              {project.repo && project.id !== "brain-tumor" && (
                <a href={project.repo} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white text-xs font-label font-bold flex items-center gap-2 border border-white/20 transition-all">
                  <span className="material-symbols-outlined text-sm">code</span><span>GitHub</span>
                </a>
              )}
              <button onClick={(e) => { e.stopPropagation(); onSelectProject(project); }} className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white text-xs font-label font-medium border border-white/20 flex items-center gap-1.5 transition-all">
                <span className="material-symbols-outlined text-sm">visibility</span><span>Case Study</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card h-[440px] p-6 md:p-8 rounded-3xl flex flex-col justify-between border border-primary/15 hover:border-primary/40 transition-colors relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 z-10" style={{ opacity: isHovered ? 0 : 1, pointerEvents: "none" }}>
            <div className="text-center px-3">
              <span className="material-symbols-outlined text-tertiary text-3xl mb-2 block">{project.icon}</span>
              <p className="text-on-surface font-bold text-sm font-headline">{project.title}</p>
            </div>
          </div>
          <div className="h-full flex flex-col justify-between" style={{ opacity: isHovered ? 1 : 0, transition: "opacity 0.3s 0.1s" }}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="material-symbols-outlined text-3xl text-tertiary">{project.icon}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-label font-bold uppercase bg-primary/10 text-primary">{project.badge}</span>
              </div>
              <h3 className="text-xl font-bold font-headline mb-2">{project.title}</h3>
              <p className="text-sm text-on-surface-variant font-label line-clamp-3 mb-4">{project.summary}</p>
            </div>
            <div>
              <div className="flex flex-wrap gap-1.5 mb-6">
                {project.tech.slice(0, 4).map((t) => (
                  <span key={t} className="px-2.5 py-1 bg-surface-variant/40 rounded-lg text-on-surface-variant text-[11px] font-label">{t}</span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-primary/10">
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-label font-bold flex items-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20 transition-all">
                    <span>Live App</span><span className="material-symbols-outlined text-sm">open_in_new</span>
                  </a>
                )}
                <button onClick={(e) => { e.stopPropagation(); onSelectProject(project); }} className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-label font-medium border border-outline-variant/30 flex items-center gap-1.5 transition-colors">
                  <span className="material-symbols-outlined text-sm">visibility</span><span>Case Study</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Touch Fan Card (Mobile) ────────────────────────────────────── */
function TouchFanCard({ project, index, activeIndex, onTap, onSelectProject, onOpenArch }) {
  const isActive  = activeIndex === index;
  const hasActive = activeIndex !== null;
  const hasImage  = !!project.image;

  const cardHeight = isActive
    ? (project.containImageMobile ? 400 : 380)
    : (hasActive ? 90 : 130);

  const style = {
    height: cardHeight,
    transition: project.containImageMobile
      ? "height 1.15s cubic-bezier(0.16, 1, 0.3, 1)"
      : "height 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    overflow: "hidden",
    position: "relative",
    borderRadius: "1.25rem",
    cursor: "pointer",
    flexShrink: 0,
  };

  return (
    <div style={style} onClick={() => onTap(isActive ? null : index)}
      className="border border-white/10 rounded-2xl overflow-hidden">

      {hasImage ? (
        project.containImageMobile ? (
          /* Framed slide layout for mobile (Sentinel) with smooth morphing from the right side */
          <div className="relative w-full h-full bg-[#0a0e17] p-3.5 flex flex-col justify-between overflow-hidden">
            {/* Top row / Hero presentation frame */}
            <div
              className="w-full relative"
              style={{
                minHeight: isActive ? "180px" : "86px",
                transition: "min-height 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              
              {/* Collapsed Left Text */}
              <div
                className={`transition-all duration-700 ease-out ${
                  isActive ? "opacity-0 -translate-x-4 h-0 overflow-hidden pointer-events-none mb-0" : "max-w-[56%] z-10 opacity-100 translate-x-0 pt-1"
                }`}
              >
                <span className="px-1.5 py-0.5 rounded-md text-[8px] font-label font-bold uppercase bg-primary/25 text-primary border border-primary/30 inline-block mb-1">
                  {project.badge}
                </span>
                <p className="text-white font-bold text-sm font-headline leading-snug">{project.title}</p>
                <p className="text-[11px] text-white/60 font-label truncate mt-0.5">{project.subtitle}</p>
              </div>

              {/* Animated Floating Slide Frame - scaling from the right side itself */}
              <div
                style={{
                  transformOrigin: "top right",
                  transition: "all 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                className={`absolute top-0 right-0 rounded-xl overflow-hidden border flex items-center justify-center p-1.5 shadow-lg shrink-0 origin-top-right ${
                  isActive
                    ? "w-full h-[180px] bg-black/40 border-primary/40 shadow-primary/20 shadow-xl z-20"
                    : "w-[44%] h-[82px] bg-white/5 border-white/15 z-10 slide-frame-animated"
                }`}
              >
                <img
                  src={project.image}
                  alt={project.title}
                  style={{
                    transformOrigin: "top right",
                    objectPosition: isActive ? "center center" : "right center",
                    transition: "all 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  className={`w-full h-full object-contain rounded-lg ${
                    isActive ? "scale-100" : "scale-[0.98]"
                  }`}
                />
              </div>
            </div>

            {/* Active Expanded Content (Details & Buttons) */}
            <div
              className={`transition-all duration-700 flex flex-col justify-between flex-1 mt-2.5 ${
                isActive
                  ? "opacity-100 translate-y-0 pointer-events-auto delay-150"
                  : "opacity-0 translate-y-4 pointer-events-none h-0 overflow-hidden"
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-label font-bold uppercase bg-primary/20 text-primary border border-primary/30">
                    {project.badge}
                  </span>
                  <h3 className="text-lg font-bold font-headline text-white">{project.title}</h3>
                </div>
                <p className="text-xs text-white/75 font-label mb-2.5 line-clamp-2 leading-relaxed">
                  {project.summary}
                </p>
                <div className="flex flex-wrap gap-1 mb-2.5">
                  {project.tech.slice(0, 4).map((t) => (
                    <span key={t} className="px-2 py-0.5 bg-white/10 rounded-md text-white/80 text-[10px] font-label border border-white/10">{t}</span>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                {project.repo && (
                  <a href={project.repo} target="_blank" rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 text-white text-[11px] font-label font-bold flex items-center gap-1.5 border border-white/20">
                    <span className="material-symbols-outlined text-sm">code</span>GitHub
                  </a>
                )}
                <button onClick={(e) => { e.stopPropagation(); onSelectProject(project); }}
                  className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary text-[11px] font-label font-bold flex items-center gap-1.5 shadow-md shadow-primary/25">
                  <span className="material-symbols-outlined text-sm">visibility</span>Case Study
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <img src={project.image} alt={project.title}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                transform: isActive ? "scale(1.06)" : "scale(1.0)",
                transition: "transform 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                objectPosition: project.imagePosition || "center center",
              }}
            />

            {/* Gradient */}
            <div className="absolute inset-0" style={{
              background: isActive
                ? "linear-gradient(to top, rgba(0,0,0,0.93) 40%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.1) 100%)"
                : "linear-gradient(to top, rgba(0,0,0,0.75) 30%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0.05) 100%)",
              transition: "background 0.65s ease",
            }} />

            {/* Collapsed label */}
            <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none"
              style={{ opacity: isActive ? 0 : 1, transition: "opacity 0.3s" }}>
              <span className="px-1.5 py-0.5 rounded-md text-[8px] font-label font-bold uppercase bg-primary/25 text-primary border border-primary/30 inline-block mb-1">
                {project.badge}
              </span>
              <p className="text-white font-bold text-sm font-headline leading-snug">{project.title}</p>
            </div>

            {/* Expanded content */}
            <div className="absolute bottom-0 left-0 right-0 p-5 z-10"
              style={{
                opacity: isActive ? 1 : 0,
                transform: isActive ? "translateY(0)" : "translateY(14px)",
                transition: "opacity 0.35s 0.15s, transform 0.35s 0.15s",
                pointerEvents: isActive ? "auto" : "none",
              }}>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-label font-bold uppercase bg-primary/20 text-primary border border-primary/30 inline-block mb-2">
                {project.badge}
              </span>
              <h3 className="text-xl font-bold font-headline mb-1.5 text-white">{project.title}</h3>
              <p className="text-xs text-white/70 font-label mb-3 line-clamp-2 leading-relaxed">{project.summary}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {project.tech.slice(0, 4).map((t) => (
                  <span key={t} className="px-2 py-0.5 bg-white/10 rounded-md text-white/80 text-[10px] font-label border border-white/10">{t}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {project.id === "brain-tumor" && (
                  <button onClick={(e) => { e.stopPropagation(); onOpenArch(); }}
                    className="px-3 py-1.5 rounded-xl bg-primary text-on-primary text-[11px] font-label font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">schema</span>Architecture
                  </button>
                )}
                {project.repo && project.id !== "brain-tumor" && (
                  <a href={project.repo} target="_blank" rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-[11px] font-label font-bold flex items-center gap-1.5 border border-white/20">
                    <span className="material-symbols-outlined text-sm">code</span>GitHub
                  </a>
                )}
                <button onClick={(e) => { e.stopPropagation(); onSelectProject(project); }}
                  className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-[11px] font-label flex items-center gap-1.5 border border-white/20">
                  <span className="material-symbols-outlined text-sm">visibility</span>Case Study
                </button>
              </div>
            </div>
          </div>
        )
      ) : (
        /* Glass card (Check Balance) */
        <div className="glass-card h-full p-4 flex flex-col justify-between border-0">
          {/* Collapsed icon label */}
          <div className="absolute inset-0 flex items-center px-4"
            style={{ opacity: isActive ? 0 : 1, transition: "opacity 0.3s", pointerEvents: "none" }}>
            <span className="material-symbols-outlined text-2xl text-tertiary mr-3">{project.icon}</span>
            <div>
              <span className="px-1.5 py-0.5 rounded text-[8px] font-label font-bold uppercase bg-primary/10 text-primary inline-block mb-0.5">{project.badge}</span>
              <p className="text-on-surface font-bold text-sm font-headline">{project.title}</p>
            </div>
          </div>

          {/* Expanded content */}
          <div className="h-full flex flex-col justify-between"
            style={{ opacity: isActive ? 1 : 0, transition: "opacity 0.35s 0.15s", pointerEvents: isActive ? "auto" : "none" }}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="material-symbols-outlined text-2xl text-tertiary">{project.icon}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-label font-bold uppercase bg-primary/10 text-primary">{project.badge}</span>
              </div>
              <h3 className="text-lg font-bold font-headline mb-1.5">{project.title}</h3>
              <p className="text-xs text-on-surface-variant font-label line-clamp-3">{project.summary}</p>
            </div>
            <div>
              <div className="flex flex-wrap gap-1 mb-3">
                {project.tech.slice(0, 4).map((t) => (
                  <span key={t} className="px-2 py-0.5 bg-surface-variant/40 rounded text-on-surface-variant text-[10px] font-label">{t}</span>
                ))}
              </div>
              <div className="flex gap-2 pt-3 border-t border-primary/10">
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-1.5 rounded-xl bg-primary text-on-primary text-[11px] font-label font-bold flex items-center gap-1.5">
                    Live App <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </a>
                )}
                <button onClick={(e) => { e.stopPropagation(); onSelectProject(project); }}
                  className="px-3 py-1.5 rounded-xl bg-surface-container text-on-surface text-[11px] font-label border border-outline-variant/30 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">visibility</span>Case Study
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default function Projects({ onSelectProject }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [archModalOpen, setArchModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function checkMobile() { setIsMobile(window.innerWidth < 768); }
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    function handleOpenArch() { setArchModalOpen(true); }
    window.addEventListener("open-arch-modal", handleOpenArch);
    return () => window.removeEventListener("open-arch-modal", handleOpenArch);
  }, []);

  const filteredProjects =
    activeCategory === "All"
      ? PROJECTS_DATA
      : PROJECTS_DATA.filter((p) => p.category === activeCategory);

  return (
    <section className="py-24 bg-surface relative" id="projects">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <Reveal>
              <span className="px-3 py-1 rounded-full text-xs font-label bg-tertiary/10 text-tertiary border border-tertiary/20 inline-block mb-3">Portfolio Showcase</span>
              <h2 className="text-3xl md:text-5xl font-bold font-headline mb-4">Featured <span className="text-tertiary">Work & Systems</span></h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="text-lg text-on-surface-variant font-label max-w-2xl">A selection of production-ready systems where backend engineering, machine learning, and clean code meet to solve real-world problems.</p>
            </Reveal>
          </div>
          <Reveal delay={120}>
            <a className="text-primary font-label text-sm tracking-widest uppercase flex items-center gap-1.5" href="https://github.com/NEERAJ-2003?tab=repositories" target="_blank" rel="noreferrer">
              <span>View All Repositories</span><span className="material-symbols-outlined text-sm">open_in_new</span>
            </a>
          </Reveal>
        </div>

        <Reveal delay={100}>
          <div className="flex flex-wrap items-center gap-2 mb-10">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => { setActiveCategory(cat); setHoveredIndex(null); }}
                className={`px-4 py-2 rounded-xl text-xs font-label font-bold transition-all ${activeCategory === cat ? "bg-primary text-on-primary shadow-lg shadow-primary/20 scale-105" : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/30"}`}>
                {cat}
              </button>
            ))}
          </div>
        </Reveal>

        {isMobile ? (
          <div className="flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
            {filteredProjects.map((project, idx) => (
              <TouchFanCard
                key={project.id}
                project={project}
                index={idx}
                activeIndex={hoveredIndex}
                onTap={setHoveredIndex}
                onSelectProject={onSelectProject}
                onOpenArch={() => setArchModalOpen(true)}
              />
            ))}
          </div>
        ) : (
          <Reveal delay={120}>
            <div className="flex flex-row items-stretch gap-3" style={{ minHeight: 440 }} onMouseLeave={() => setHoveredIndex(null)}>
              {filteredProjects.map((project, idx) => (
                <FanCard key={project.id} project={project} index={idx} hoveredIndex={hoveredIndex} onHover={setHoveredIndex} onSelectProject={onSelectProject} onOpenArch={() => setArchModalOpen(true)} />
              ))}
            </div>
          </Reveal>
        )}
      </div>
      <ArchitectureModal isOpen={archModalOpen} onClose={() => setArchModalOpen(false)} />
    </section>
  );
}
