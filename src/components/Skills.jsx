import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";
import SpotlightCard from "./SpotlightCard";

const BARS = [
  { label: "Python (Django)", pct: 90, pctColor: "text-primary", barColor: "from-primary to-primary-dim" },
  { label: "FastAPI", pct: 85, pctColor: "text-primary-dim", barColor: "from-cyan-400 to-primary" },
  { label: "Rest API", pct: 85, pctColor: "text-tertiary", barColor: "from-amber-400 to-amber-600" },
  { label: "SQL & PostgreSQL", pct: 85, pctColor: "text-tertiary", barColor: "from-tertiary to-tertiary-dim" },
  { label: "Frontend (HTML, CSS, JS)", pct: 80, pctColor: "text-secondary", barColor: "from-secondary to-on-secondary-container" },
];

const CARDS = [
  { icon: "database", title: "Backend", desc: "Robust systems with Python", color: "text-primary", hover: "hover:bg-primary/5" },
  { icon: "devices", title: "Frontend", desc: "Responsive pixel-perfect UIs", color: "text-tertiary", hover: "hover:bg-tertiary/5" },
  { icon: "cloud_done", title: "SQL", desc: "Joins, Complex Queries, Pseudo Columns", color: "text-secondary", hover: "hover:bg-secondary/5" },
  { icon: "psychology", title: "AI/ML", desc: "Data analysis, Genetic algorithm", color: "text-primary-dim", hover: "hover:bg-primary-dim/5" },
];

function SkillBar({ b, delay }) {
  const ref = useRef(null);
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFilled(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className="min-w-0">
      <div className="flex justify-between mb-2 text-xs sm:text-sm font-label">
        <span className="text-on-surface truncate pr-2">{b.label}</span>
        <span className={`${b.pctColor} shrink-0 font-mono font-semibold`}>{b.pct}%</span>
      </div>
      <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
        <div
          className={`skill-bar-fill h-full bg-gradient-to-r ${b.barColor} ${filled ? "is-filled" : ""}`}
          style={{ "--pct": `${b.pct}%`, transitionDelay: `${delay}ms` }}
        />
      </div>
    </div>
  );
}

export default function Skills() {
  return (
    <section className="py-24 bg-surface-container-low" id="skills">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 min-w-0">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <Reveal>
              <h2 className="text-3xl md:text-5xl font-bold font-headline mb-8">
                Technical <span className="text-primary">Arsenal</span>
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="text-base sm:text-lg text-on-surface-variant font-label">Leveraging modern frameworks and languages to build production-grade software solutions.</p>
            </Reveal>
            <br />
            <div className="space-y-6">
              {BARS.map((b, i) => (
                <SkillBar key={b.label} b={b} delay={i * 120} />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:gap-6 items-stretch">
            {CARDS.map((c, i) => (
              <Reveal key={c.title} delay={i * 100} className="h-full">
                <SpotlightCard className={`glass-card p-3.5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl group transition-colors ${c.hover} h-full flex flex-col justify-between min-w-0`}>
                  <div>
                    <span className={`material-symbols-outlined ${c.color} text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-4 block`}>{c.icon}</span>
                    <h4 className="font-headline font-bold text-base sm:text-lg md:text-xl mb-1 sm:mb-2">{c.title}</h4>
                  </div>
                  <p className="text-[11px] sm:text-xs text-on-surface-variant font-label leading-tight">{c.desc}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
