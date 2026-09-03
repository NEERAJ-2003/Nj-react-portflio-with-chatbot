import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

const STATS = [
  { icon: "code", value: 100, suffix: "+", label: "LeetCode", color: "text-primary" },
  { icon: "auto_awesome", value: 5, suffix: "+", label: "Projects", color: "text-tertiary" },
  { icon: "school", value: 9.15, suffix: "", label: "CGPA", color: "text-secondary", decimals: 2 },
  { icon: "schedule", value: 24, suffix: "/7", label: "Round the Clock", color: "text-primary-dim" },
];

function StatCard({ s, delay }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(s.decimals ? "0.00" : "0");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const duration = 1100;
        const tick = (now) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          const current = s.value * eased;
          setDisplay(s.decimals ? current.toFixed(s.decimals) : String(Math.round(current)));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [s.value, s.decimals]);

  return (
    <Reveal delay={delay}>
      <div ref={ref} className="stat-card glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center hover-lift" style={{ animationDelay: `${delay}ms` }}>
        <span className={`material-symbols-outlined icon-bob ${s.color} text-4xl mb-2`}>{s.icon}</span>
        <span className="text-2xl font-bold font-headline">
          {display}
          {s.suffix}
        </span>
        <span className="text-xs font-label uppercase text-outline">{s.label}</span>
      </div>
    </Reveal>
  );
}

export default function About() {
  return (
    <section className="py-24 bg-surface-container-low" id="about">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid md:grid-cols-5 gap-12 items-end">
          <div className="md:col-span-3">
            <Reveal>
              <h2 className="text-3xl md:text-5xl font-bold font-headline mb-8 flex items-center gap-4">
                <span className="w-12 h-1 bg-primary rounded-full" />
                Architecting Logic
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <div className="glass-card p-8 md:p-12 rounded-3xl relative overflow-hidden hover-lift">
                <p className="text-xl text-on-surface-variant font-label">
                  I'm a <span className="text-on-surface font-semibold">Python Developer</span> with a strong foundation in building scalable, real-world applications using{" "}
                  <span className="text-primary-dim font-semibold">FastAPI, Django</span>. My work spans backend architecture,{" "}
                  <span className="text-primary-dim font-semibold">REST APIs</span>, and{" "}
                  <span className="text-primary-dim font-semibold">database design</span> - turning complex business logic into clean, maintainable systems.
                </p>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="now-grid">
                <div className="now-cell">
                  <span className="now-k">Now</span>
                  Software Engineer Trainee · ZKTeco
                </div>
                <div className="now-cell">
                  <span className="now-k">Based</span>
                  Bengaluru, India
                </div>
                <div className="now-cell">
                  <span className="now-k">Focus</span>
                  FastAPI · Django · REST
                </div>
              </div>
            </Reveal>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            {STATS.map((s, i) => (
              <StatCard key={s.label} s={s} delay={i * 90} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
