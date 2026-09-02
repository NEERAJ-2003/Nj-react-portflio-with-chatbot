import { useEffect, useRef } from "react";

const PHRASES = ["Python Developer", "Backend Developer", "Problem Solver"];
const MAG = 90; // magnetic pull radius (px)
const STR = 0.35; // pull strength

export default function Hero() {
  const canvasRef = useRef(null);
  const heroRef = useRef(null);
  const typingRef = useRef(null);
  const nameWrapRef = useRef(null);

  // Light-cycling mesh canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    const ctx = canvas.getContext("2d");
    let rafId;

    function resizeCanvas() {
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const colors = [
      [105, 156, 255],
      [156, 72, 234],
      [179, 204, 191],
      [72, 180, 210],
      [220, 130, 255],
    ];

    const orbs = [
      { xf: 0.18, yf: 0.22, size: 0.55 },
      { xf: 0.82, yf: 0.18, size: 0.45 },
      { xf: 0.75, yf: 0.8, size: 0.5 },
      { xf: 0.22, yf: 0.78, size: 0.4 },
      { xf: 0.5, yf: 0.5, size: 0.32 },
    ];

    let t = 0;
    function lv(a, b, f) {
      return a + (b - a) * f;
    }

    function drawCanvas() {
      const W = canvas.width,
        H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      t += 0.003;
      const cycleLen = Math.PI * 2;
      const phase = (t % (cycleLen * colors.length)) / cycleLen;
      const fromIdx = Math.floor(phase) % colors.length;
      const toIdx = (fromIdx + 1) % colors.length;
      const raw = phase - Math.floor(phase);
      const smooth = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
      const col = colors[fromIdx].map((v, i) => Math.round(lv(v, colors[toIdx][i], smooth)));

      orbs.forEach((orb, i) => {
        const ox = orb.xf * W + Math.sin(t * 0.38 + i * 1.3) * W * 0.055;
        const oy = orb.yf * H + Math.cos(t * 0.32 + i * 1.1) * H * 0.055;
        const r = Math.min(W, H) * orb.size;
        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
        g.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},0.10)`);
        g.addColorStop(0.4, `rgba(${col[0]},${col[1]},${col[2]},0.04)`);
        g.addColorStop(1, `rgba(${col[0]},${col[1]},${col[2]},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(ox, oy, r, 0, Math.PI * 2);
        ctx.fill();
      });

      rafId = requestAnimationFrame(drawCanvas);
    }
    drawCanvas();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  // Magnetic name letters
  useEffect(() => {
    let mx = 0,
      my = 0;
    let rafId;

    function onMouseMove(e) {
      mx = e.clientX;
      my = e.clientY;
    }
    document.addEventListener("mousemove", onMouseMove);

    function magneticTick() {
      const allChars = nameWrapRef.current
        ? nameWrapRef.current.querySelectorAll(".name-char, .name-char-accent")
        : [];
      allChars.forEach((c) => {
        const r = c.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = mx - cx;
        const dy = my - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAG) {
          const pull = (1 - dist / MAG) * STR;
          const sc = 1 + (1 - dist / MAG) * 0.1;
          c.style.transform = `translate(${dx * pull * 1.1}px,${dy * pull * 0.7}px) scale(${sc})`;
          c.style.textShadow = `0 0 0px rgba(105,156,255,${(1 - dist / MAG) * 0.65})`;
        } else {
          c.style.transform = "";
          c.style.textShadow = "";
        }
      });
      rafId = requestAnimationFrame(magneticTick);
    }
    magneticTick();

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  // Typing effect
  useEffect(() => {
    const el = typingRef.current;
    let phraseIndex = 0,
      charIndex = 0,
      isDeleting = false,
      typeSpeed = 100;
    let timer;

    function type() {
      const cur = PHRASES[phraseIndex];
      if (isDeleting) {
        el.textContent = cur.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 50;
      } else {
        el.textContent = cur.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 150;
      }
      if (!isDeleting && charIndex === cur.length) {
        isDeleting = true;
        typeSpeed = 2000;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % PHRASES.length;
        typeSpeed = 500;
      }
      timer = setTimeout(type, typeSpeed);
    }
    type();

    return () => clearTimeout(timer);
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden" id="home">
      <canvas id="hero-canvas" ref={canvasRef} />

      <div className="absolute inset-0 mesh-gradient opacity-40" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-dim rounded-full blur-[160px] opacity-20 animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-tertiary-dim rounded-full blur-[160px] opacity-10 animate-pulse-slow" />

      <div className="max-w-7xl mx-auto px-8 w-full relative z-10 text-center">
        <h1
          ref={nameWrapRef}
          className="font-extrabold font-headline tracking-tighter text-on-surface mb-6 leading-none drop-shadow-2xl whitespace-nowrap"
          style={{ fontSize: "clamp(2.75rem, 11vw, 10rem)" }}
        >

          {"NEERAJ".split("").map((ch, i) => (
            <span className="name-char" key={i}>
              {ch}
            </span>
          ))}
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-primary-dim to-tertiary inline-block filter drop-shadow-[0_0_30px_rgba(105,156,255,0.4)]">
            &nbsp;<span className="name-char-accent">K</span>&nbsp;<span className="name-char-accent">R</span>
          </span>
        </h1>

        <div className="text-2xl md:text-4xl font-light font-headline text-on-surface-variant mb-12 h-12 flex items-center justify-center">
          <span className="typing-container text-primary font-medium" ref={typingRef} id="typing-text">
            Python Developer
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          <a className="px-10 py-5 rounded-xl bg-gradient-to-r from-primary to-tertiary-dim text-on-primary-container font-bold shadow-2xl neon-glow-primary hover:scale-105 transition-all duration-300" href="#contact">
            Connect
          </a>
          <a className="px-10 py-5 rounded-xl bg-gradient-to-r from-primary to-tertiary-dim text-on-primary-container font-bold shadow-2xl neon-glow-primary hover:scale-105 transition-all duration-300" href="/Neeraj_KR_Resume.pdf" download="Neeraj_KR_Resume.pdf">
            Resume
          </a>
        </div>
      </div>
    </section>
  );
}
