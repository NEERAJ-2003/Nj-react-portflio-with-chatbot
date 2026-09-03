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
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <Reveal>
              <h2 className="text-4xl md:text-6xl font-bold font-headline mb-8">
                Let's <span className="text-primary">Connect</span>
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="text-lg text-on-surface-variant font-label">Interested in collaborating or just want to say hi? My inbox is always open.</p>
            </Reveal>
            <br />
            <div className="space-y-6">
              <Reveal delay={140}>
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-xl glass-card flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-label text-outline uppercase tracking-widest">Email</p>
                    <p className="text-base text-on-surface-variant font-label">
                      <a href="mailto:devbyneeraj@gmail.com">devbyneeraj@gmail.com</a>
                    </p>
                  </div>
                  <button className="copy-btn" onClick={() => copy("devbyneeraj@gmail.com", "Email")} aria-label="Copy email">
                    <span className="material-symbols-outlined">{copied === "Email" ? "check" : "content_copy"}</span>
                  </button>
                </div>
              </Reveal>
              <Reveal delay={220}>
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-xl glass-card flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined">call</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-label text-outline uppercase tracking-widest">Phone</p>
                    <p className="text-base text-on-surface-variant font-label">
                      <a href="tel:+919744733146">+91 9744733146</a>
                    </p>
                  </div>
                  <button className="copy-btn" onClick={() => copy("+919744733146", "Phone")} aria-label="Copy phone">
                    <span className="material-symbols-outlined">{copied === "Phone" ? "check" : "content_copy"}</span>
                  </button>
                </div>
              </Reveal>
            </div>
          </div>

          <Reveal delay={160}>
            <DinoGame />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
