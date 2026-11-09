import { useState } from "react";
import DinoGame from "./DinoGame";
import Reveal from "./Reveal";

function copyText(value, label) {
  navigator.clipboard?.writeText(value);
  window.dispatchEvent(new CustomEvent("portfolio-toast", { detail: `${label} copied` }));
}

export default function Contact() {
  const [copied, setCopied] = useState("");

  function copy(value, label) {
    copyText(value, label);
    setCopied(label);
    setTimeout(() => setCopied(""), 1600);
  }

  return (
    <section className="py-24 bg-surface-container-low relative overflow-hidden" id="contact">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] animate-pulse-slow" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        {/* Section Header */}
        <div className="mb-10">
          <Reveal>
            <span className="px-3 py-1 rounded-full text-xs font-label bg-primary/10 text-primary border border-primary/20 inline-block mb-3">
              Get In Touch
            </span>
            <h2 className="text-4xl md:text-6xl font-bold font-headline">
              Let's <span className="text-primary">Connect</span>
            </h2>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Column: Direct Info & Socials */}
          <div className="min-w-0">
            <Reveal delay={80}>
              <p className="text-base sm:text-lg text-on-surface-variant font-label leading-relaxed mb-8 break-words">
                Currently open to software engineering opportunities, backend development roles, and innovative technical projects. My inbox is always open.
              </p>
            </Reveal>

            <div className="space-y-4">
              <Reveal delay={140}>
                <div className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl glass-card border border-primary/15 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <div className="flex-1 min-w-0 pr-1">
                    <p className="text-[10px] font-label text-outline uppercase tracking-widest">Email Address</p>
                    <a
                      href="mailto:devbyneeraj@gmail.com"
                      className="text-sm sm:text-base text-on-surface font-medium hover:text-primary transition-colors block break-all [overflow-wrap:anywhere]"
                    >
                      devbyneeraj@gmail.com
                    </a>
                  </div>
                  <button
                    className="copy-btn shrink-0 w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors flex items-center justify-center"
                    onClick={() => copy("devbyneeraj@gmail.com", "Email")}
                    aria-label="Copy email"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {copied === "Email" ? "check" : "content_copy"}
                    </span>
                  </button>
                </div>
              </Reveal>

              <Reveal delay={200}>
                <div className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl glass-card border border-tertiary/15 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary shrink-0">
                    <span className="material-symbols-outlined">call</span>
                  </div>
                  <div className="flex-1 min-w-0 pr-1">
                    <p className="text-[10px] font-label text-outline uppercase tracking-widest">Phone & WhatsApp</p>
                    <a
                      href="tel:+919744733146"
                      className="text-sm sm:text-base text-on-surface font-medium hover:text-tertiary transition-colors block break-all [overflow-wrap:anywhere]"
                    >
                      +91 9744733146
                    </a>
                  </div>
                  <button
                    className="copy-btn shrink-0 w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors flex items-center justify-center"
                    onClick={() => copy("+919744733146", "Phone")}
                    aria-label="Copy phone"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {copied === "Phone" ? "check" : "content_copy"}
                    </span>
                  </button>
                </div>
              </Reveal>

              <Reveal delay={260}>
                <div className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl glass-card border border-secondary/15 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                    <span className="material-symbols-outlined">location_on</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-label text-outline uppercase tracking-widest">Base Location</p>
                    <p className="text-sm sm:text-base text-on-surface font-medium leading-snug">Bengaluru, Karnataka, India</p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Right Column: Chrome Dino Game */}
          <div>
            <Reveal delay={160}>
              <DinoGame />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
