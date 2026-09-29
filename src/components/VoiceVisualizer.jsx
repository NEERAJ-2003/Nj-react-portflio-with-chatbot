import { useEffect, useRef, useState } from "react";

const THEME_PALETTES = {
  cobalt: {
    primary: "rgba(56, 189, 248, 0.9)",       // Sky cyan
    primaryGlow: "rgba(56, 189, 248, 0.65)",
    secondary: "rgba(105, 156, 255, 0.85)",   // Cobalt blue
    secondaryGlow: "rgba(105, 156, 255, 0.55)",
    tertiary: "rgba(156, 72, 234, 0.8)",      // Violet
    tertiaryGlow: "rgba(156, 72, 234, 0.4)",
    coreAccent: "rgba(255, 255, 255, 0.95)",
    coreGlow: "rgba(186, 230, 253, 0.95)",
    underGradTop: "rgba(56, 189, 248, 0.22)",
    underGradMid: "rgba(105, 156, 255, 0.18)",
    underGradBottom: "rgba(156, 72, 234, 0)",
    barTop: "rgba(56, 189, 248, 0.95)",
    barMid: "rgba(105, 156, 255, 0.85)",
    barBottom: "rgba(156, 72, 234, 0.75)",
    barShadow: "rgba(56, 189, 248, 0.5)",
  },
  emerald: {
    primary: "rgba(0, 245, 160, 0.95)",       // Cyber emerald
    primaryGlow: "rgba(0, 245, 160, 0.7)",
    secondary: "rgba(0, 229, 255, 0.88)",     // Electric aqua
    secondaryGlow: "rgba(0, 229, 255, 0.55)",
    tertiary: "rgba(52, 211, 153, 0.8)",      // Mint
    tertiaryGlow: "rgba(16, 185, 129, 0.4)",
    coreAccent: "rgba(255, 255, 255, 0.95)",
    coreGlow: "rgba(167, 243, 208, 0.95)",
    underGradTop: "rgba(0, 245, 160, 0.25)",
    underGradMid: "rgba(0, 229, 255, 0.2)",
    underGradBottom: "rgba(5, 150, 105, 0)",
    barTop: "rgba(0, 229, 255, 0.95)",
    barMid: "rgba(0, 245, 160, 0.9)",
    barBottom: "rgba(5, 150, 105, 0.75)",
    barShadow: "rgba(0, 245, 160, 0.6)",
  },
  violet: {
    primary: "rgba(191, 90, 242, 0.95)",      // Synthwave violet
    primaryGlow: "rgba(191, 90, 242, 0.7)",
    secondary: "rgba(255, 82, 154, 0.88)",    // Neon hot pink
    secondaryGlow: "rgba(255, 82, 154, 0.55)",
    tertiary: "rgba(168, 85, 247, 0.8)",      // Purple
    tertiaryGlow: "rgba(236, 72, 153, 0.4)",
    coreAccent: "rgba(255, 255, 255, 0.95)",
    coreGlow: "rgba(244, 114, 182, 0.95)",
    underGradTop: "rgba(191, 90, 242, 0.25)",
    underGradMid: "rgba(255, 82, 154, 0.2)",
    underGradBottom: "rgba(147, 51, 234, 0)",
    barTop: "rgba(255, 82, 154, 0.95)",
    barMid: "rgba(191, 90, 242, 0.9)",
    barBottom: "rgba(126, 34, 206, 0.75)",
    barShadow: "rgba(255, 82, 154, 0.6)",
  },
  amber: {
    primary: "rgba(255, 176, 32, 0.95)",      // Solar gold
    primaryGlow: "rgba(255, 176, 32, 0.7)",
    secondary: "rgba(255, 107, 53, 0.88)",    // Electric flame
    secondaryGlow: "rgba(255, 107, 53, 0.55)",
    tertiary: "rgba(251, 191, 36, 0.8)",      // Amber
    tertiaryGlow: "rgba(245, 158, 11, 0.4)",
    coreAccent: "rgba(255, 255, 255, 0.95)",
    coreGlow: "rgba(254, 240, 138, 0.95)",
    underGradTop: "rgba(255, 176, 32, 0.25)",
    underGradMid: "rgba(255, 107, 53, 0.2)",
    underGradBottom: "rgba(217, 72, 20, 0)",
    barTop: "rgba(255, 107, 53, 0.95)",
    barMid: "rgba(255, 176, 32, 0.9)",
    barBottom: "rgba(194, 65, 12, 0.75)",
    barShadow: "rgba(255, 176, 32, 0.6)",
  },
};

export default function VoiceVisualizer({ analyser, isRecording, theme: propTheme }) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const smoothedVolRef = useRef(0.15);

  const [activeTheme, setActiveTheme] = useState(() => {
    return propTheme || document.documentElement.getAttribute("data-theme") || "cobalt";
  });

  // Track and react to theme changes dynamically
  useEffect(() => {
    if (propTheme) {
      setActiveTheme(propTheme);
      return;
    }

    function checkTheme() {
      const current = document.documentElement.getAttribute("data-theme") || "cobalt";
      setActiveTheme(current);
    }

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const onCobalt = () => setActiveTheme("cobalt");
    const onEmerald = () => setActiveTheme("emerald");
    const onViolet = () => setActiveTheme("violet");
    const onAmber = () => setActiveTheme("amber");

    window.addEventListener("set-theme-cobalt", onCobalt);
    window.addEventListener("set-theme-emerald", onEmerald);
    window.addEventListener("set-theme-violet", onViolet);
    window.addEventListener("set-theme-amber", onAmber);

    return () => {
      observer.disconnect();
      window.removeEventListener("set-theme-cobalt", onCobalt);
      window.removeEventListener("set-theme-emerald", onEmerald);
      window.removeEventListener("set-theme-violet", onViolet);
      window.removeEventListener("set-theme-amber", onAmber);
    };
  }, [propTheme]);

  const paletteRef = useRef(THEME_PALETTES[activeTheme] || THEME_PALETTES.cobalt);
  useEffect(() => {
    paletteRef.current = THEME_PALETTES[activeTheme] || THEME_PALETTES.cobalt;
  }, [activeTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 320;
    const height = rect.height || 140;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    let phase = 0;
    const bufferLength = analyser ? analyser.frequencyBinCount : 32;
    const dataArray = analyser ? new Uint8Array(bufferLength) : null;

    function render() {
      if (!canvas) return;
      ctx.clearRect(0, 0, width, height);

      const pal = paletteRef.current;
      let targetVol = 0.12; // baseline idle organic movement

      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        // Focus on vocal frequency range (bins 2 to 24)
        const vocalBins = Math.min(24, bufferLength);
        for (let i = 2; i < vocalBins; i++) {
          sum += dataArray[i];
        }
        const avg = sum / (vocalBins - 2);
        // Normalize 0-255 to 0.12 - 1.0
        targetVol = Math.max(0.12, Math.min(1.0, 0.12 + (avg / 120) * 0.88));
      }

      // Smooth interpolation for silky animation
      smoothedVolRef.current += (targetVol - smoothedVolRef.current) * 0.18;
      const vol = smoothedVolRef.current;

      phase += 0.045 + vol * 0.05;
      const centerY = height / 2;

      // Theme-reactive multi-layer glowing waveforms
      const waves = [
        {
          color: pal.primary,
          glow: pal.primaryGlow,
          freq: 0.022,
          amp: (height * 0.28) * vol,
          speed: phase * 1.1,
          lineWidth: 2.8,
        },
        {
          color: pal.secondary,
          glow: pal.secondaryGlow,
          freq: 0.018,
          amp: (height * 0.32) * vol,
          speed: phase * 0.85 + 1.2,
          lineWidth: 2.5,
        },
        {
          color: pal.tertiary,
          glow: pal.tertiaryGlow,
          freq: 0.026,
          amp: (height * 0.22) * vol,
          speed: phase * 1.35 + 2.5,
          lineWidth: 2.0,
        },
        {
          color: pal.coreAccent,
          glow: pal.coreGlow,
          freq: 0.03,
          amp: (height * 0.16) * vol,
          speed: phase * 1.5 + 0.6,
          lineWidth: 1.5,
        },
      ];

      // Draw subtle theme-tailored ambient glow under the primary wave
      const gradUnder = ctx.createLinearGradient(0, centerY - 40, 0, centerY + 40);
      gradUnder.addColorStop(0, pal.underGradTop);
      gradUnder.addColorStop(0.5, pal.underGradMid);
      gradUnder.addColorStop(1, pal.underGradBottom);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      for (let x = 0; x <= width; x += 3) {
        const envelope = Math.sin((x / width) * Math.PI); // Taper at the edges
        const y = centerY + Math.sin(x * 0.02 + phase) * (height * 0.24) * vol * envelope;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, centerY);
      ctx.closePath();
      ctx.fillStyle = gradUnder;
      ctx.fill();
      ctx.restore();

      // Draw each vibrant wave curve with smooth Bezier approximation
      waves.forEach((w) => {
        ctx.save();
        ctx.shadowColor = w.glow;
        ctx.shadowBlur = 14 + vol * 10;
        ctx.strokeStyle = w.color;
        ctx.lineWidth = w.lineWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.beginPath();
        for (let x = 0; x <= width; x += 2) {
          const envelope = Math.sin((x / width) * Math.PI);
          const harmonic = Math.sin(x * w.freq * 2.2 + w.speed * 1.5) * 0.35;
          const y =
            centerY +
            (Math.sin(x * w.freq + w.speed) + harmonic) *
              w.amp *
              envelope;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        ctx.restore();
      });

      // Draw central dynamic equalizer frequency pillars in background
      const barCount = 18;
      const barSpacing = width / (barCount + 1);
      const barWidth = 3;

      for (let i = 0; i < barCount; i++) {
        const x = barSpacing * (i + 1);
        const normDistFromCenter = 1 - Math.abs((i - barCount / 2) / (barCount / 2));
        const envelope = Math.max(0, Math.sin(normDistFromCenter * (Math.PI / 2)));
        
        let barHeight = 6 + Math.sin(phase * 2 + i * 0.6) * 4;
        if (analyser && dataArray) {
          const binIndex = Math.floor((i / barCount) * Math.min(24, bufferLength));
          const freqVal = (dataArray[binIndex] || 0) / 255;
          barHeight = 6 + freqVal * (height * 0.45) * envelope;
        } else {
          barHeight = 6 + (Math.sin(phase * 3 + i * 0.7) * 0.5 + 0.5) * 22 * vol * envelope;
        }

        ctx.save();
        const barGrad = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2);
        barGrad.addColorStop(0, pal.barTop);
        barGrad.addColorStop(0.5, pal.barMid);
        barGrad.addColorStop(1, pal.barBottom);

        ctx.fillStyle = barGrad;
        ctx.shadowColor = pal.barShadow;
        ctx.shadowBlur = 6;

        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x - barWidth / 2, centerY - barHeight / 2, barWidth, barHeight, 2);
        } else {
          ctx.rect(x - barWidth / 2, centerY - barHeight / 2, barWidth, barHeight);
        }
        ctx.fill();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    }

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [analyser]);

  return (
    <div className={`voice-visualizer-container theme-${activeTheme}`}>
      {/* Concentric ambient glowing rings */}
      <div className="voice-glow-ring ring-3" />
      <div className="voice-glow-ring ring-2" />
      <div className="voice-glow-ring ring-1" />

      {/* Central Holographic Audio Core */}
      <div className="voice-center-orb">
        <div className="voice-orb-glow" />
        <div className="voice-orb-icon">
          <span className="material-symbols-outlined text-[20px] text-white">mic</span>
        </div>
      </div>

      {/* Real-time Dynamic Waveform Canvas */}
      <canvas
        ref={canvasRef}
        className="voice-wave-canvas"
        style={{ width: "100%", height: "135px" }}
      />
    </div>
  );
}
