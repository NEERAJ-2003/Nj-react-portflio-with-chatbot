import { useEffect, useState } from "react";

export const ARCH_NODES = [
  {
    id: "preprocessing",
    num: "1",
    title: "1. MRI Preprocessing",
    tag: "OpenCV & Python",
    desc: "Applies CLAHE contrast enhancement, Gaussian noise filtering, and morphological skull-stripping to isolate brain tissue from raw MRI scans.",
    activeBorder: "border-amber-400/80",
    badgeBg: "bg-amber-400/15 text-amber-300 border border-amber-400/30",
    specs: {
      label1: "Framework / Library",
      val1: "Python 3.12 / OpenCV / NumPy",
      label2: "Technique",
      val2: "CLAHE & Morphological Filtering",
      label3: "Pipeline Stage",
      val3: "Noise Reduction & Skull Stripping",
    },
  },
  {
    id: "cnn",
    num: "2",
    title: "2. Deep CNN Feature Extraction",
    tag: "Deep Learning (CNN)",
    desc: "Multi-layered convolutional kernels with batch normalization extract hierarchical spatial representations and subtle pathological tumor textures.",
    activeBorder: "border-primary",
    badgeBg: "bg-primary/15 text-primary border border-primary/30",
    specs: {
      label1: "Architecture",
      val1: "Deep Convolutional Neural Network",
      label2: "Feature Space",
      val2: "High-Dimensional Spatial Textures",
      label3: "Inference Latency",
      val3: "42ms Model Inference",
    },
  },
  {
    id: "genetic",
    num: "3",
    title: "3. Genetic Algorithm Optimizer",
    tag: "Genetic Algorithm (GA)",
    desc: "Evolutionary algorithm executes selection, crossover, and mutation to optimize classification thresholds and hyperparameter weights, avoiding local minima traps.",
    activeBorder: "border-secondary",
    badgeBg: "bg-secondary/15 text-secondary border border-secondary/30",
    specs: {
      label1: "Method",
      val1: "Genetic Optimization (Evolutionary Search)",
      label2: "Fitness Metric",
      val2: "Diagnostic Accuracy & F1-Score Optimization",
      label3: "Optimization",
      val3: "Hyperparameter & Threshold Convergence",
    },
  },
  {
    id: "detection",
    num: "4",
    title: "4. Diagnostic Output",
    tag: "Diagnostic Inference",
    desc: "Outputs binary detection (Tumor / Non-Tumor) and diagnostic probability with 96.4% precision evaluated across 2,500+ clinical scans.",
    activeBorder: "border-emerald-400",
    badgeBg: "bg-emerald-400/15 text-emerald-300 border border-emerald-400/30",
    specs: {
      label1: "Overall Accuracy",
      val1: "96.4% Detection Accuracy",
      label2: "Dataset Volume",
      val2: "2,500+ Evaluated Scans",
      label3: "Clinical Metric",
      val3: "Automated Early Detection",
    },
  },
];

export default function ArchitectureModal({ isOpen, onClose }) {
  const [activeBlock, setActiveBlock] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setActiveBlock(null);
    }
  }, [isOpen]);

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
    <div
      className="portfolio-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="System Architecture Modal"
    >
      <div
        className="portfolio-modal-content max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-primary/15 bg-surface-container-low">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">
              schema
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline font-bold text-xl text-on-surface">
                  System Architecture
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-label font-bold tracking-wide uppercase bg-primary/20 text-primary">
                  AI & ML Pipeline
                </span>
              </div>
              <p className="text-xs text-on-surface-variant font-label">
                Brain Tumor CNN & Genetic Algorithm Architecture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            aria-label="Close architecture modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 max-h-[80vh]">
          <div>
            <h4 className="text-sm font-label uppercase tracking-widest text-primary font-bold mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">hub</span>
              End-to-End Diagnostic Pipeline
            </h4>
            <p className="text-on-surface-variant font-body text-sm leading-relaxed">
              Raw MRI scans undergo preprocessing and normalization. A Deep Convolutional
              Neural Network (CNN) extracts intricate multi-scale spatial features, while an
              evolutionary Genetic Algorithm optimizes layer weights and classification
              thresholds to prevent local minima traps. Select any block below to inspect its
              technical specifications.
            </p>
          </div>

          {/* 4 Context Blocks with per-block dropdowns */}
          <div className="space-y-3.5">
            {ARCH_NODES.map((node) => {
              const isSelected = activeBlock === node.id;
              return (
                <div
                  key={node.id}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isSelected
                      ? `${node.activeBorder} bg-surface-container shadow-lg shadow-primary/5`
                      : "border-outline-variant/30 bg-surface-container-high/40 hover:border-primary/40"
                  }`}
                >
                  {/* Block Header Button */}
                  <button
                    onClick={() =>
                      setActiveBlock((prev) => (prev === node.id ? null : node.id))
                    }
                    className="w-full p-4 md:p-5 text-left flex items-start justify-between gap-4 transition-colors"
                    aria-expanded={isSelected}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-label font-bold uppercase tracking-wider ${node.badgeBg}`}
                        >
                          {node.tag}
                        </span>
                      </div>
                      <h5 className="font-headline font-bold text-sm md:text-base text-on-surface">
                        {node.title}
                      </h5>
                      <p className="text-xs text-on-surface-variant font-label mt-1 line-clamp-2">
                        {node.desc}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 pt-1">
                      <span
                        className={`material-symbols-outlined text-lg transition-transform duration-300 ${
                          isSelected ? "rotate-180 text-primary" : "text-outline"
                        }`}
                      >
                        expand_more
                      </span>
                    </div>
                  </button>

                  {/* BLOCK INFORMATION - EXPANDS DIRECTLY BELOW THIS BLOCK */}
                  {isSelected && (
                    <div className="px-4 pb-4 md:px-5 md:pb-5 pt-2 border-t border-outline-variant/20 bg-surface-container-lowest/70 animate-fadeIn">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-base">
                            verified
                          </span>
                          <span className="font-headline font-bold text-xs md:text-sm text-on-surface">
                            {node.title} Specifications
                          </span>
                        </div>
                        <span className="text-[11px] font-label text-outline">
                          Stage 0{node.num} of 04
                        </span>
                      </div>

                      <p className="text-xs text-on-surface-variant font-body leading-relaxed mb-4">
                        {node.desc}
                      </p>

                      {/* Specs Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-outline-variant/15 text-xs font-label">
                        <div className="bg-surface-container/60 p-3 rounded-xl border border-outline-variant/20">
                          <span className="text-[10px] text-outline block uppercase tracking-wider mb-1 font-semibold">
                            {node.specs.label1}
                          </span>
                          <span className="text-on-surface font-semibold text-xs block">
                            {node.specs.val1}
                          </span>
                        </div>
                        <div className="bg-surface-container/60 p-3 rounded-xl border border-outline-variant/20">
                          <span className="text-[10px] text-outline block uppercase tracking-wider mb-1 font-semibold">
                            {node.specs.label2}
                          </span>
                          <span className="text-on-surface font-semibold text-xs block">
                            {node.specs.val2}
                          </span>
                        </div>
                        <div className="bg-surface-container/60 p-3 rounded-xl border border-outline-variant/20">
                          <span className="text-[10px] text-outline block uppercase tracking-wider mb-1 font-semibold">
                            {node.specs.label3}
                          </span>
                          <span className="text-on-surface font-semibold text-xs block">
                            {node.specs.val3}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-primary/15 bg-surface-container-low">
          <span className="text-xs text-on-surface-variant font-label">
            Production ML System Architecture
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-label font-medium border border-outline-variant/30 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
