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
    transition: "all 1.2s cubic-bezier(0.34,1.4,0.64,1)",
    zIndex,
    position: "relative",
    minWidth: 0,
  };

  const hasImage = !!project.image;

  return (
    <div style={style} onMouseEnter={() => onHover(index)} className="rounded-3xl overflow-hidden cursor-pointer group">
      {hasImage ? (
        <div className="relative h-[440px] w-full flex flex-col justify-end border border-white/10 rounded-3xl overflow-hidden">
          <img src={project.image} alt={project.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/10" />

          <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300" style={{ opacity: isHovered ? 0 : 1, pointerEvents: "none" }}>
            <div className="text-center px-3">
              <span className="material-symbols-outlined text-white/60 text-3xl mb-2 block">{project.icon}</span>
              <p className="text-white font-bold text-sm font-headline leading-snug line-clamp-2">{project.title}</p>
            </div>
          </div>

          <div className="relative z-10 p-6 md:p-8" style={{ opacity: isHovered ? 1 : 0, transform: isHovered ? "translateY(0)" : "translateY(16px)", transition: "opacity 0.3s 0.1s, transform 0.3s 0.1s" }}>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-label font-bold uppercase tracking-wide bg-primary/20 text-primary border border-primary/30 inline-block mb-3">{project.badge}</span>
            <h3 className="text-2xl md:text-3xl font-bold font-headline mb-2 text-white">{project.title}</h3>
            <p className="text-sm text-white/70 font-label mb-5 line-clamp-2 leading-relaxed max-w-xl">{project.summary}</p>
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
              {project.repo && (
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

function MobileCard({ project, onSelectProject, onOpenArch }) {
  const hasImage = !!project.image;
  return hasImage ? (
    <div className="relative rounded-3xl h-[360px] overflow-hidden border border-white/10 flex flex-col justify-end">
      <img src={project.image} alt={project.title} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-transparent" />
      <div className="relative z-10 p-6">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-label font-bold uppercase bg-primary/20 text-primary border border-primary/30 inline-block mb-2">{project.badge}</span>
        <h3 className="text-2xl font-bold font-headline mb-2 text-white">{project.title}</h3>
        <p className="text-sm text-white/70 font-label mb-4 line-clamp-2">{project.summary}</p>
        <div className="flex flex-wrap gap-2">
          {project.id === "brain-tumor" && (
            <button onClick={onOpenArch} className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-label font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">schema</span> Architecture
            </button>
          )}
          {project.repo && (
            <a href={project.repo} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-label font-bold flex items-center gap-1.5 border border-white/20">
              <span className="material-symbols-outlined text-sm">code</span> GitHub
            </a>
          )}
          <button onClick={() => onSelectProject(project)} className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-label border border-white/20 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">visibility</span> Case Study
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div className="glass-card p-6 rounded-3xl flex flex-col justify-between h-[360px] border border-primary/15">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="material-symbols-outlined text-3xl text-tertiary">{project.icon}</span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-label font-bold uppercase bg-primary/10 text-primary">{project.badge}</span>
        </div>
        <h3 className="text-xl font-bold font-headline mb-2">{project.title}</h3>
        <p className="text-sm text-on-surface-variant font-label line-clamp-3">{project.summary}</p>
      </div>
      <div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tech.slice(0, 4).map((t) => (
            <span key={t} className="px-2.5 py-1 bg-surface-variant/40 rounded-lg text-on-surface-variant text-[11px] font-label">{t}</span>
          ))}
        </div>
        <div className="flex gap-3 pt-4 border-t border-primary/10">
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-label font-bold flex items-center gap-1.5">
              Live App <span className="material-symbols-outlined text-sm">open_in_new</span>
            </a>
          )}
          <button onClick={() => onSelectProject(project)} className="px-4 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-label border border-outline-variant/30 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">visibility</span> Case Study
          </button>
        </div>
      </div>
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
            <a className="text-primary font-label text-sm tracking-widest uppercase flex items-center gap-1.5 hover:underline" href="https://github.com/NEERAJ-2003?tab=repositories" target="_blank" rel="noreferrer">
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
          <div className="flex flex-col gap-6">
            {filteredProjects.map((project) => (
              <MobileCard key={project.id} project={project} onSelectProject={onSelectProject} onOpenArch={() => setArchModalOpen(true)} />
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
