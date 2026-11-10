import { useState, useEffect, useRef } from "react";
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

/* ─── Zero-Lag Backdrop (Rendered on static canvas, clipped by parent) ─ */
function ProjectBackdrop({ project, isExpanded }) {
  if (project.id === "check-balance") {
    return (
      <div
        className="w-full h-full relative"
        style={{
          background:
            "radial-gradient(circle at 80% 20%, rgba(105, 156, 255, 0.16) 0%, transparent 55%), radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.14) 0%, transparent 55%), linear-gradient(135deg, #0c1424 0%, #060b14 100%)",
        }}
      >
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(105, 156, 255, 0.35) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        {/* Lightweight Fintech Preview with smooth floating rotation on expand */}
        <div
          className="absolute right-12 top-1/2 -translate-y-1/2 w-72 p-4 rounded-2xl bg-[#111726]/90 border border-white/10 shadow-xl pointer-events-none transition-all duration-1000 ease-out"
          style={{
            opacity: isExpanded ? 0.45 : 0.15,
            transform: isExpanded
              ? "translateY(-50%) scale(1) rotate(-2deg)"
              : "translateY(-48%) scale(0.94) rotate(0deg)",
          }}
        >
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-mono text-emerald-300 font-bold uppercase tracking-wider">
                Ledger Engine
              </span>
            </div>
            <span className="text-[10px] font-mono text-white/50">Vercel Edge</span>
          </div>

          <div className="my-2.5">
            <span className="text-[10px] font-label text-white/60 block">Real-time Balance</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white tracking-tight">$24,680.50</span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold">+18.4%</span>
            </div>
          </div>

          <svg viewBox="0 0 200 40" className="w-full h-8 text-primary stroke-current fill-none my-1" strokeWidth="2">
            <path d="M0,35 Q30,10 60,25 T120,8 T160,20 T200,5" />
          </svg>

          <div className="flex justify-between items-center pt-2 border-t border-white/5 text-[9px] font-mono text-white/40">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[11px] text-primary">bolt</span>
              Zero Latency
            </span>
            <span className="text-emerald-400 font-semibold">100% Score</span>
          </div>
        </div>
      </div>
    );
  }

  // Normal image project
  return (
    <img
      src={project.image}
      alt={project.title}
      className="w-full h-full object-cover pointer-events-none"
      style={{
        objectPosition: project.imagePosition || "center center",
      }}
    />
  );
}

/* ─── Fan Card (Desktop) with Ultra-Smooth, Relaxed Opening Animation ─ */
function FanCard({
  project,
  index,
  activeIndex,
  hoveredIndex,
  onHover,
  onSelect,
  onSelectProject,
  onOpenArch,
  totalCount,
}) {
  const isHovered = hoveredIndex === index;
  const isSelected = activeIndex === index;
  const isExpanded = hoveredIndex !== null ? isHovered : isSelected;
  const active = totalCount === 1 ? true : isExpanded;

  // Calibrated flex proportions
  const flexVal = totalCount === 1 ? "1 1 100%" : active ? "3.5 1 0%" : "0.75 1 0%";

  return (
    <div
      style={{
        flex: flexVal,
        minWidth: active ? "330px" : "110px",
        transform: active ? "translate3d(0, -4px, 0)" : "translate3d(0, 0, 0)",
        willChange: "flex, transform",
        /* Slower, ultra-luxurious glide curve: 1.2s duration */
        transition:
          "flex 3s cubic-bezier(0.16, 1, 0.3, 1), transform 3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 1.5s ease, border-color 0.6s ease",
        contain: "paint",
      }}
      onMouseEnter={() => onHover(index)}
      onClick={() => onSelect(index)}
      className={`rounded-3xl overflow-hidden cursor-pointer h-[480px] border relative ${active
        ? "border-primary/50 shadow-2xl shadow-primary/15"
        : "border-white/10 hover:border-primary/30 shadow-lg shadow-black/40"
        }`}
    >
      {/* Luminous Top Accent Glow on Open */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/70 to-transparent transition-opacity duration-700 pointer-events-none z-20"
        style={{ opacity: active ? 1 : 0 }}
      />

      {/*
        Fixed-width 1100px canvas with smooth scale on open
      */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="w-[1100px] h-full absolute left-0 top-0 transition-transform duration-1000 ease-out"
          style={{
            transform: active ? "scale(1.025)" : "scale(1.0)",
          }}
        >
          <ProjectBackdrop project={project} isExpanded={active} />
        </div>
      </div>

      {/* Active card high-contrast readability gradient */}
      <div
        className="absolute inset-0 pointer-events-none z-[5]"
        style={{
          opacity: active ? 1 : 0,
          transition: "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
          background:
            "linear-gradient(to top, rgba(12,14,18,0.98) 40%, rgba(12,14,18,0.7) 70%, rgba(12,14,18,0.2) 100%)",
        }}
      />

      {/* Inactive card veil: pure opacity blend */}
      <div
        className="absolute inset-0 bg-[#0c0e12]/85 pointer-events-none z-[6]"
        style={{
          opacity: active ? 0 : 1,
          transition: "opacity 0.7s ease-in-out",
        }}
      />

      {/* ── Collapsed Sidebar Presentation (Smooth dissolve out on open) ── */}
      <div
        className="absolute inset-0 z-10 flex flex-col items-center justify-between p-5 pointer-events-none"
        style={{
          opacity: active ? 0 : 1,
          transform: active ? "scale(0.92) translateY(-8px)" : "scale(1) translateY(0)",
          transition: active
            ? "opacity 0.35s ease-out, transform 0.45s ease-out"
            : "opacity 0.5s ease-out 0.25s, transform 0.5s ease-out 0.25s",
        }}
      >
        <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-primary shadow-md">
          <span className="material-symbols-outlined text-2xl">{project.icon || "code"}</span>
        </div>

        <div className="text-center px-1 my-auto flex flex-col items-center">
          <span className="px-2 py-0.5 rounded-full text-[9px] font-label font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/30 inline-block mb-2">
            {project.badge}
          </span>
          <p className="text-white font-bold text-sm font-headline leading-tight line-clamp-3">
            {project.title}
          </p>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-label text-white/50 group-hover:text-primary transition-colors">
          <span>Expand</span>
          <span className="material-symbols-outlined text-xs">arrow_forward</span>
        </div>
      </div>

      {/* ── Expanded Content (Smooth Staggered Float-Up on Open) ── */}
      <div
        className="absolute bottom-0 left-0 p-6 md:p-8 w-[640px] max-w-[90vw] z-10 flex flex-col justify-end pointer-events-none"
        style={{
          opacity: active ? 1 : 0,
          pointerEvents: active ? "auto" : "none",
        }}
      >
        {/* Badges row & Title */}
        <div
          style={{
            opacity: active ? 1 : 0,
            transform: active ? "translate3d(0, 0, 0)" : "translate3d(0, 16px, 0)",
            transition:
              "opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.18s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.18s",
          }}
        >
          <div className="flex items-center gap-2 mb-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-label font-bold uppercase tracking-wide bg-primary/20 text-primary border border-primary/30">
              {project.badge}
            </span>
            <span className="text-xs text-white/60 font-label">
              • {project.category}
            </span>
          </div>

          <h3 className="text-2xl md:text-3xl font-bold font-headline mb-2 text-white">
            {project.title}
          </h3>
        </div>

        {/* Summary */}
        <div
          style={{
            opacity: active ? 1 : 0,
            transform: active ? "translate3d(0, 0, 0)" : "translate3d(0, 18px, 0)",
            transition:
              "opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1) 0.26s, transform 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.26s",
          }}
        >
          <p className="text-sm text-white/80 font-label mb-3.5 line-clamp-3 leading-relaxed">
            {project.summary}
          </p>
        </div>

        {/* Key Metrics Row */}
        {project.metrics && (
          <div
            className="flex flex-wrap items-center gap-2 mb-3.5"
            style={{
              opacity: active ? 1 : 0,
              transform: active ? "translate3d(0, 0, 0)" : "translate3d(0, 20px, 0)",
              transition:
                "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.34s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.34s",
            }}
          >
            {project.metrics.map((m, mIdx) => (
              <div
                key={mIdx}
                className="px-2.5 py-1 rounded-lg bg-surface-container-high/90 border border-white/10 flex items-center gap-1.5"
              >
                <span className="text-primary font-mono font-bold text-xs">{m.value}</span>
                <span className="text-white/60 text-[10px] font-label">{m.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tech tags */}
        <div
          className="flex flex-wrap gap-1.5 mb-5"
          style={{
            opacity: active ? 1 : 0,
            transform: active ? "translate3d(0, 0, 0)" : "translate3d(0, 22px, 0)",
            transition:
              "opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.42s, transform 0.95s cubic-bezier(0.16, 1, 0.3, 1) 0.42s",
          }}
        >
          {project.tech.slice(0, 5).map((t) => (
            <span
              key={t}
              className="px-2.5 py-1 bg-white/10 rounded-lg text-white/90 text-[11px] font-label border border-white/10"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div
          className="flex flex-wrap items-center gap-3"
          style={{
            opacity: active ? 1 : 0,
            transform: active ? "translate3d(0, 0, 0)" : "translate3d(0, 24px, 0)",
            transition:
              "opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.50s, transform 1.0s cubic-bezier(0.16, 1, 0.3, 1) 0.50s",
          }}
        >
          {project.id === "brain-tumor" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenArch();
              }}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-label font-bold flex items-center gap-2 hover:opacity-90 shadow-md shadow-primary/30 transition-transform active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">schema</span>
              <span>Architecture</span>
            </button>
          )}

          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-label font-bold flex items-center gap-2 hover:opacity-90 shadow-md shadow-primary/30 transition-transform active:scale-95"
            >
              <span>Live App</span>
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </a>
          )}

          {project.repo && (
            <a
              href={project.repo}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-label font-bold flex items-center gap-2 border border-white/20 transition-transform active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">code</span>
              <span>GitHub</span>
            </a>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectProject(project);
            }}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-label font-medium border border-white/20 flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">visibility</span>
            <span>Case Study</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Touch Fan Card (Mobile) ────────────────────────────────────────── */
function TouchFanCard({ project, index, activeIndex, onTap, onSelectProject, onOpenArch }) {
  const isActive = activeIndex === index;
  const cardHeight = isActive ? 435 : 92;

  const handleToggle = () => {
    // If clicking on already expanded card, collapse it back to default small size (null)
    onTap(isActive ? null : index);
  };

  return (
    <div
      style={{
        height: cardHeight,
        transform: "translate3d(0, 0, 0)",
        willChange: "height, box-shadow, border-color",
        transition:
          "height 0.85s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.85s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.5s ease",
        overflow: "hidden",
        position: "relative",
        borderRadius: "1.25rem",
        cursor: "pointer",
        flexShrink: 0,
        contain: "paint",
      }}
      onClick={handleToggle}
      className={`border rounded-2xl overflow-hidden relative ${
        isActive
          ? "border-primary/50 shadow-2xl shadow-primary/15"
          : "border-white/10 shadow-md shadow-black/40"
      }`}
    >
      {/* Luminous Top Accent Glow on Open */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/70 to-transparent transition-opacity duration-700 pointer-events-none z-20"
        style={{ opacity: isActive ? 1 : 0 }}
      />

      {/* Background visual with smooth zoom and mobile opacity dampener for high-contrast images */}
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${project.id === "sentinel" ? "opacity-25" : ""}`}>
        <div
          className="w-full h-full transition-transform duration-1000 ease-out"
          style={{
            transform: isActive ? "scale(1.04)" : "scale(1.0)",
          }}
        >
          <ProjectBackdrop project={project} isExpanded={isActive} />
        </div>
      </div>

      {/* Dark gradient for text legibility - extra deep for Sentinel to prevent text bleed */}
      <div
        className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
        style={{
          background: project.id === "sentinel"
            ? (isActive
                ? "linear-gradient(to top, rgba(12,14,18,0.98) 50%, rgba(12,14,18,0.92) 80%, rgba(12,14,18,0.80) 100%)"
                : "linear-gradient(to top, rgba(12,14,18,0.96) 40%, rgba(12,14,18,0.88) 100%)")
            : (isActive
                ? "linear-gradient(to top, rgba(12,14,18,0.98) 45%, rgba(12,14,18,0.7) 75%, rgba(12,14,18,0.3) 100%)"
                : "linear-gradient(to top, rgba(12,14,18,0.88) 50%, rgba(12,14,18,0.65) 100%)"),
        }}
      />

      {/* Collapsed Bar (Top header visible when collapsed, smoothly dissolves and lifts on open) */}
      <div
        className="absolute inset-0 p-4 flex items-center justify-between z-10 pointer-events-none"
        style={{
          opacity: isActive ? 0 : 1,
          transform: isActive ? "translate3d(0, -6px, 0)" : "translate3d(0, 0, 0)",
          transition: isActive
            ? "opacity 0.35s ease-out, transform 0.45s ease-out"
            : "opacity 0.5s ease-out 0.25s, transform 0.5s ease-out 0.25s",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-primary shrink-0 transition-transform duration-500">
            <span className="material-symbols-outlined text-xl">{project.icon || "code"}</span>
          </div>
          <div>
            <span className="px-1.5 py-0.5 rounded text-[8px] font-label font-bold uppercase bg-primary/20 text-primary border border-primary/30 inline-block mb-0.5">
              {project.badge}
            </span>
            <p className="text-white font-bold text-sm font-headline leading-tight">{project.title}</p>
          </div>
        </div>
        <span
          className="material-symbols-outlined text-white/50 text-xl transition-transform duration-600 ease-out"
          style={{
            transform: isActive ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          expand_more
        </span>
      </div>

      {/* Expanded Content with buttery smooth float-up reveal */}
      <div
        className="absolute inset-0 p-5 flex flex-col justify-end z-10"
        style={{
          opacity: isActive ? 1 : 0,
          transform: isActive ? "translate3d(0, 0, 0)" : "translate3d(0, 18px, 0)",
          transition: isActive
            ? "opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.22s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.22s"
            : "opacity 0.25s ease-out, transform 0.3s ease-out",
          pointerEvents: isActive ? "auto" : "none",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="px-2 py-0.5 rounded-full text-[9px] font-label font-bold uppercase bg-primary/20 text-primary border border-primary/30">
            {project.badge}
          </span>
          <span className="text-[10px] text-white/60 font-label">{project.category}</span>
        </div>

        <h3 className="text-lg font-bold font-headline text-white mb-1 leading-snug">{project.title}</h3>
        <p className="text-xs text-white/75 font-label mb-2.5 line-clamp-2 leading-relaxed">{project.summary}</p>

        {/* Metrics */}
        {project.metrics && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {project.metrics.map((m, mIdx) => (
              <div key={mIdx} className="px-2 py-0.5 rounded-md bg-black/60 border border-white/10 text-[10px] font-mono flex items-center gap-1">
                <span className="text-primary font-bold">{m.value}</span>
                <span className="text-white/50">{m.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tech tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {project.tech.slice(0, 4).map((t) => (
            <span key={t} className="px-2 py-0.5 bg-white/10 rounded-md text-white/80 text-[10px] font-label border border-white/10">
              {t}
            </span>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
          {project.id === "brain-tumor" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenArch();
              }}
              className="px-3.5 py-2 rounded-xl bg-primary text-on-primary text-[11px] font-label font-bold flex items-center gap-1.5 shadow-md shadow-primary/25 min-h-[44px]"
            >
              <span className="material-symbols-outlined text-sm">schema</span>
              <span>Architecture</span>
            </button>
          )}

          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-3.5 py-2 rounded-xl bg-primary text-on-primary text-[11px] font-label font-bold flex items-center gap-1.5 shadow-md shadow-primary/25 min-h-[44px]"
            >
              <span>Live App</span>
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </a>
          )}

          {project.repo && (
            <a
              href={project.repo}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-3.5 py-2 rounded-xl bg-white/10 text-white text-[11px] font-label font-bold flex items-center gap-1.5 border border-white/20 min-h-[44px]"
            >
              <span className="material-symbols-outlined text-sm">code</span>
              <span>GitHub</span>
            </a>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectProject(project);
            }}
            className="px-3 py-2 rounded-xl bg-white/10 text-white text-[11px] font-label flex items-center gap-1.5 border border-white/20 min-h-[44px]"
          >
            <span className="material-symbols-outlined text-sm">visibility</span>
            <span>Case Study</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Projects Section ─────────────────────────────────────────── */
export default function Projects({ onSelectProject }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [desktopActiveIndex, setDesktopActiveIndex] = useState(1); // Default to Brain Tumor on Desktop
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(null); // On mobile, all cards start collapsed in small size
  const [archModalOpen, setArchModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const hoverTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 768);
    }
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    function handleOpenArch() {
      setArchModalOpen(true);
    }
    window.addEventListener("open-arch-modal", handleOpenArch);
    return () => window.removeEventListener("open-arch-modal", handleOpenArch);
  }, []);

  const filteredProjects =
    activeCategory === "All"
      ? PROJECTS_DATA
      : PROJECTS_DATA.filter((p) => p.category === activeCategory);

  const handleCategoryChange = (cat) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setActiveCategory(cat);
    setDesktopActiveIndex(0);
    setHoveredIndex(null);
    setMobileActiveIndex(null); // Keep collapsed on mobile filter change
  };

  /* Smooth hover opening handler: tracks active card so it stays opened without snapping back */
  const handleHover = (idx) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setHoveredIndex(idx);
      setDesktopActiveIndex(idx);
    }, 30);
  };

  const handleMouseLeaveSection = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setHoveredIndex(null);
  };

  const handleSelectDesktop = (idx) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setDesktopActiveIndex(idx);
    setHoveredIndex(null);
  };

  const currentDesktopIndex = hoveredIndex !== null ? hoveredIndex : desktopActiveIndex;

  return (
    <section className="py-24 bg-surface relative" id="projects">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 min-w-0">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <Reveal>
              <span className="px-3 py-1 rounded-full text-xs font-label bg-tertiary/10 text-tertiary border border-tertiary/20 inline-block mb-3">
                Portfolio Showcase
              </span>
              <h2 className="text-3xl md:text-5xl font-bold font-headline mb-4">
                Featured <span className="text-tertiary">Work & Systems</span>
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="text-lg text-on-surface-variant font-label max-w-2xl">
                A selection of production-ready systems where backend engineering, machine learning, and clean code meet to solve real-world problems.
              </p>
            </Reveal>
          </div>
          <Reveal delay={120}>
            <a
              className="text-primary font-label text-sm tracking-widest uppercase flex items-center gap-1.5 hover:underline"
              href="https://github.com/NEERAJ-2003?tab=repositories"
              target="_blank"
              rel="noreferrer"
            >
              <span>View All Repositories</span>
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </a>
          </Reveal>
        </div>

        {/* Category Filters */}
        <Reveal delay={100}>
          <div className="flex flex-wrap items-center gap-2 mb-10">
            {CATEGORIES.map((cat) => {
              const count =
                cat === "All"
                  ? PROJECTS_DATA.length
                  : PROJECTS_DATA.filter((p) => p.category === cat).length;
              const isCatActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-label font-bold transition-all flex items-center gap-2 ${isCatActive
                    ? "bg-primary text-on-primary shadow-md shadow-primary/20 scale-105"
                    : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/30"
                    }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${isCatActive
                      ? "bg-black/20 text-on-primary font-mono"
                      : "bg-white/10 text-on-surface-variant font-mono"
                      }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Responsive Showcase Container */}
        {isMobile ? (
          <div className="flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
            {filteredProjects.map((project, idx) => (
              <TouchFanCard
                key={project.id}
                project={project}
                index={idx}
                activeIndex={mobileActiveIndex}
                onTap={(newIdx) => setMobileActiveIndex(newIdx)}
                onSelectProject={onSelectProject}
                onOpenArch={() => setArchModalOpen(true)}
              />
            ))}
          </div>
        ) : (
          <Reveal delay={120}>
            <div>
              <div
                className="flex flex-row items-stretch gap-4"
                style={{ minHeight: 480 }}
                onMouseLeave={handleMouseLeaveSection}
              >
                {filteredProjects.map((project, idx) => (
                  <FanCard
                    key={project.id}
                    project={project}
                    index={idx}
                    activeIndex={desktopActiveIndex}
                    hoveredIndex={hoveredIndex}
                    onHover={handleHover}
                    onSelect={handleSelectDesktop}
                    onSelectProject={onSelectProject}
                    onOpenArch={() => setArchModalOpen(true)}
                    totalCount={filteredProjects.length}
                  />
                ))}
              </div>

              {/* Indicator dots for quick visual navigation */}
              {filteredProjects.length > 1 && (
                <div className="flex items-center justify-center gap-2.5 mt-8">
                  {filteredProjects.map((p, idx) => {
                    const isDotActive = currentDesktopIndex === idx;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSelectDesktop(idx)}
                        className={`h-2 rounded-full transition-all duration-300 ${isDotActive
                          ? "w-8 bg-primary shadow-sm shadow-primary/40"
                          : "w-2 bg-white/20 hover:bg-white/40"
                          }`}
                        aria-label={`View ${p.title}`}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </Reveal>
        )}
      </div>

      <ArchitectureModal isOpen={archModalOpen} onClose={() => setArchModalOpen(false)} />
    </section>
  );
}
