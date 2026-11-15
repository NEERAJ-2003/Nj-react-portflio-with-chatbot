import { useEffect, useRef, useState } from "react";

/**
 * SplashScreen — full-viewport intro animation shown on every load.
 *
 * Timeline (total ≈ 2 400 ms):
 *   0 ms        — orbs + ring fade-scale in
 *   600 ms      — tagline fades in
 *   1 000 ms    — progress bar fills (600 ms)
 *   1 700 ms    — overlay slides up & fades out
 *   2 000 ms    — onDone() called → component unmounted by parent
 */

const TAGLINE = "Where Code Meets Creativity";

// 20 ambient orbs — fixed ratios, responsive to any screen
const ORBS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: (((i * 47 + 13) % 97) / 97) * 100,
  y: (((i * 31 + 7)  % 89) / 89) * 100,
  size: 60 + ((i * 23) % 120),
  dur: 4 + ((i * 7) % 6),
  delay: (i * 0.3) % 3,
  hue: (i * 37) % 360,
}));

export default function SplashScreen({ onDone }) {
  const [phase, setPhase]       = useState("idle"); // idle → ring → tagline → bar → exit
  const [barWidth, setBarWidth] = useState(0);
  const [exiting, setExiting]   = useState(false);
  const rAF = useRef(null);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("ring"),    100);
    const t2 = setTimeout(() => setPhase("tagline"), 600);
    const t3 = setTimeout(() => setPhase("bar"),     1000);
    const t4 = setTimeout(() => setExiting(true),    1700);
    const t5 = setTimeout(() => onDone(),            2000);
    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, [onDone]);

  // Animate progress bar
  useEffect(() => {
    if (phase !== "bar") return;
    const start = performance.now();
    const dur   = 580;
    function tick(now) {
      const pct = Math.min((now - start) / dur, 1);
      setBarWidth(pct * 100);
      if (pct < 1) rAF.current = requestAnimationFrame(tick);
    }
    rAF.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rAF.current);
  }, [phase]);

  return (
    <div
      aria-hidden="true"
      className={[
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden",
        "bg-background select-none",
        "transition-all duration-[300ms] ease-in",
        exiting ? "opacity-0 -translate-y-3 pointer-events-none" : "opacity-100 translate-y-0",
      ].join(" ")}
    >
      {/* Floating ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        {ORBS.map((o) => (
          <span
            key={o.id}
            style={{
              position: "absolute",
              left: `${o.x}%`,
              top:  `${o.y}%`,
              width:  `${o.size}px`,
              height: `${o.size}px`,
              borderRadius: "50%",
              background: `hsl(${o.hue}, 70%, 55%)`,
              opacity: 0.07,
              filter: "blur(32px)",
              animation: `splashOrb ${o.dur}s ${o.delay}s ease-in-out infinite alternate`,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>

      {/* Centre content */}
      <div
        className={[
          "relative z-10 flex flex-col items-center gap-6 px-6",
          "transition-all duration-500 ease-out",
          phase === "idle" ? "opacity-0 scale-95" : "opacity-100 scale-100",
        ].join(" ")}
      >
        {/* Spinning gradient ring — no text inside */}
        <div className="relative w-20 h-20">
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 80 80"
            fill="none"
            style={{ animation: "splashSpin 2.4s linear infinite" }}
          >
            <circle
              cx="40" cy="40" r="36"
              stroke="url(#splashGrad)"
              strokeWidth="2.5"
              strokeDasharray="60 160"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="splashGrad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor="#699cff" />
                <stop offset="100%" stopColor="#ddb7ff" />
              </linearGradient>
            </defs>
          </svg>

          {/* Inner glowing dot */}
          <div
            className="absolute inset-0 m-auto w-3 h-3 rounded-full
                        bg-gradient-to-br from-primary to-tertiary
                        shadow-[0_0_16px_6px_rgba(105,156,255,0.4)]"
          />
        </div>

        {/* Tagline */}
        <p
          className={[
            "text-sm sm:text-base font-label text-on-surface-variant tracking-widest uppercase text-center",
            "transition-all duration-700",
            phase === "tagline" || phase === "bar"
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2",
          ].join(" ")}
        >
          {TAGLINE}
        </p>

        {/* Progress bar */}
        <div className="w-48 sm:w-64 h-[2px] bg-outline-variant/30 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-tertiary"
            style={{
              width: `${barWidth}%`,
              boxShadow: "0 0 8px rgba(105,156,255,0.6)",
            }}
          />
        </div>

        {/* Loading label */}
        <p
          className={[
            "text-[11px] font-mono text-outline tracking-widest uppercase -mt-3",
            "transition-opacity duration-500",
            phase === "bar" ? "opacity-100" : "opacity-0",
          ].join(" ")}
        >
          Initialising…
        </p>
      </div>

      <style>{`
        @keyframes splashSpin { to { transform: rotate(360deg); } }
        @keyframes splashOrb  { from{transform:translate(-50%,-50%) scale(1)} to{transform:translate(-50%,-50%) scale(1.35)} }
      `}</style>
    </div>
  );
}
