import { useState, useEffect } from "react";
import Reveal from "./Reveal";
import ArchitectureModal from "./ArchitectureModal";

export const PROJECTS_DATA = [
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

export default function Projects({ onSelectProject }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [archModalOpen, setArchModalOpen] = useState(false);

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

  return (
    <section className="py-24 bg-surface relative" id="projects">
      <div className="max-w-7xl mx-auto px-8">
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
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-label font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-on-primary shadow-lg shadow-primary/20 scale-105"
                    : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-12 gap-6">
          {filteredProjects.map((project, idx) => {
            const isBrainTumor = project.id === "brain-tumor";
            const colSpan =
              activeCategory === "All"
                ? isBrainTumor
                  ? "md:col-span-7 lg:col-span-8"
                  : "md:col-span-5 lg:col-span-4"
                : "md:col-span-12 lg:col-span-8";

            return (
              <Reveal key={project.id} className={colSpan} delay={80 + (idx % 3) * 60}>
                {isBrainTumor ? (
                  /* Featured Large Hero Card for Brain Tumor */
                  <div className="brain-zoom relative rounded-3xl h-[440px] overflow-hidden group border border-primary/20 flex flex-col justify-end p-6 md:p-8">
                    <img
                      alt={project.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      src={project.image}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />

                    <div className="relative z-10">
                      <h3 className="text-2xl md:text-3xl font-bold font-headline mb-2 text-on-surface">
                        {project.title}
                      </h3>
                      <p className="text-sm md:text-base text-on-surface-variant font-label max-w-2xl mb-6 line-clamp-3 leading-relaxed">
                        {project.summary}
                      </p>

                      {/* 2 Boxes: Architecture & Case Study */}
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => setArchModalOpen(true)}
                          className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-label font-bold flex items-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">schema</span>
                          <span>Architecture</span>
                        </button>
                        <button
                          onClick={() => onSelectProject(project)}
                          className="px-4 py-2.5 rounded-xl bg-surface/80 backdrop-blur-md hover:bg-surface-container-high text-on-surface text-xs font-label font-medium border border-outline-variant/30 flex items-center gap-1.5 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                          <span>Case Study</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard Grid Glass Card (e.g. Check Balance Web App) */
                  <div className="glass-card p-6 md:p-8 rounded-3xl flex flex-col justify-between h-[440px] border border-primary/15 hover:border-primary/40 transition-colors">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="material-symbols-outlined text-3xl text-tertiary">
                          {project.icon}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-label font-bold uppercase tracking-wide bg-primary/10 text-primary">
                          {project.badge}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold font-headline mb-2">{project.title}</h3>
                      <p className="text-sm text-on-surface-variant font-label line-clamp-3 mb-4">
                        {project.summary}
                      </p>
                    </div>

                    <div>
                      {/* Tech Pills */}
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {project.tech.slice(0, 4).map((t) => (
                          <span
                            key={t}
                            className="px-2.5 py-1 bg-surface-variant/40 rounded-lg text-on-surface-variant text-[11px] font-label"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      {/* 2 Boxes: Launch Live App & Case Study */}
                      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-primary/10">
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-label font-bold flex items-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
                          >
                            <span>Live App</span>
                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                          </a>
                        )}
                        <button
                          onClick={() => onSelectProject(project)}
                          className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-label font-medium border border-outline-variant/30 flex items-center gap-1.5 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                          <span>Case Study</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* Architecture Popup Modal */}
      <ArchitectureModal
        isOpen={archModalOpen}
        onClose={() => setArchModalOpen(false)}
      />
    </section>
  );
}
