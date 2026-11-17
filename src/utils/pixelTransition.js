/**
 * Ultra-Smooth Themed Pixel Dissolve Transition
 * ─────────────────────────────────────────────────────────────────────────
 * Engineered for maximum smoothness and visual harmony:
 *   • Active Accent Tint: Incorporates your selected theme color from the 4
 *     accent options (Cobalt #699cff, Emerald #00f5a0, Violet #bf5af2, Amber #ffb020)
 *     as delicate sparkling pixels along the wave crest, seamlessly harmonizing
 *     with matte black (#171717) and clean white (#ffffff).
 *   • Sine-Weighted S-Curve Easing: Combines easeInOutCubic with half-sine
 *     optical alpha interpolation for continuous, liquid-like dissolution.
 *   • Two-Stage Fluid Motion:
 *       1. Cover Wave (0 → 50%): Pixels bloom outward from the toggle button
 *          with subtle accent glints, solidifying into 100% opaque cover.
 *       2. Midpoint (50%): DOM theme swaps invisibly under solid canvas.
 *       3. Reveal Wave (50 → 100%): Pixels dissolve outward in the same momentum,
 *          smoothly unveiling the new theme from the background.
 *   • Hardware-accelerated canvas with translate3d(0,0,0) and sub-pixel closure.
 *   • Optimized block counts for mobile and desktop screens.
 * ─────────────────────────────────────────────────────────────────────────
 */

let isTransitioning = false;

// ── 4 Accent Theme Map ────────────────────────────────────────────────────
const ACCENT_MAP = {
  cobalt: "#699cff",
  emerald: "#00f5a0",
  violet: "#bf5af2",
  amber: "#ffb020",
};

// ── Silky Easing & Alpha Functions ────────────────────────────────────────
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function sinAlpha(t) {
  return Math.sin(Math.max(0, Math.min(1, t)) * Math.PI * 0.5);
}

// ── Helpers ──────────────────────────────────────────────────────────────

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

function getOrigin(originEvent, isMobile) {
  if (originEvent) {
    const target = originEvent.currentTarget || originEvent.target;
    if (target && typeof target.getBoundingClientRect === "function") {
      const rect = target.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return {
          x: Math.round(rect.left + rect.width / 2),
          y: Math.round(rect.top + rect.height / 2),
        };
      }
    }
    const touch = originEvent.touches?.[0] ?? originEvent.changedTouches?.[0];
    if (touch && typeof touch.clientX === "number" && touch.clientX > 0) {
      return { x: touch.clientX, y: touch.clientY };
    }
    if (typeof originEvent.clientX === "number" && originEvent.clientX > 0) {
      return { x: originEvent.clientX, y: originEvent.clientY };
    }
  }
  const w = document.documentElement.clientWidth || window.innerWidth;
  return {
    x: w - (isMobile ? 52 : 175),
    y: isMobile ? 38 : 44,
  };
}

// Deterministic pseudo-random hash
function hash(c, r, seed) {
  const n = Math.sin(c * 127.1 + r * 311.7 + seed * 74.3) * 43758.5453;
  return n - Math.floor(n);
}

// ── Core Animation ────────────────────────────────────────────────────────

function runPixelDissolve({ targetMode, currentTheme, originEvent, onSwap, duration }) {
  const W = document.documentElement.clientWidth || window.innerWidth;
  const H = window.innerHeight;
  const isMobile = W < 768;
  const { x: ox, y: oy } = getOrigin(originEvent, isMobile);

  // Responsive block sizes: mobile ~22px, desktop ~26-28px
  const blockSize = isMobile
    ? Math.max(22, Math.round(W / 16))
    : W < 1200
    ? Math.max(24, Math.round(W / 44))
    : Math.max(28, Math.round(W / 52));

  const cols = Math.ceil(W / blockSize);
  const rows = Math.ceil(H / blockSize);

  const targetColor = targetMode === "dark" ? "#171717" : "#ffffff";

  // Resolve active accent color from the 4 themes (Cobalt, Emerald, Violet, Amber)
  const activeKey =
    currentTheme ||
    (typeof document !== "undefined" && document.documentElement.getAttribute("data-theme")) ||
    "cobalt";
  const accentColor = ACCENT_MAP[activeKey] || ACCENT_MAP.cobalt;

  // ── Pre-calculate block distances, wave delays, and accent distribution ───
  const maxDist = Math.hypot(
    Math.max(ox, W - ox),
    Math.max(oy, H - oy)
  );

  const blocks = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = c * blockSize + blockSize * 0.5;
      const cy = r * blockSize + blockSize * 0.5;
      const dist = Math.hypot(cx - ox, cy - oy);
      const normDist = dist / (maxDist || 1);

      // Subtle organic jitter creates natural pixel diffusion
      const jitter = hash(c, r, 1) * 0.12;
      const delay = Math.min(1, normDist * 0.64 + jitter);

      // ~20% of blocks carry the active theme accent on wave edges
      const isAccent = hash(c, r, 7) < 0.22;

      blocks.push({
        x: c * blockSize,
        y: r * blockSize,
        delay,
        isAccent,
      });
    }
  }

  // ── Canvas Setup ─────────────────────────────────────────────────────────
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = [
    "position:fixed",
    "top:0",
    "left:0",
    "width:100%",
    "height:100%",
    "z-index:999999",
    "pointer-events:none",
    "touch-action:none",
    "-webkit-backface-visibility:hidden",
    "backface-visibility:hidden",
    "-webkit-transform:translate3d(0,0,0)",
    "transform:translate3d(0,0,0)",
  ].join(";");

  const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.75 : 2.0);
  canvas.width  = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    onSwap?.();
    isTransitioning = false;
    return;
  }
  ctx.scale(dpr, dpr);

  document.body.appendChild(canvas);

  // 50% cover wave, 50% reveal wave
  const half = duration * 0.5;
  const startTime = performance.now();
  let swapped = false;

  // Wide window span for velvety, continuous wave motion
  const windowSpan = 0.46;
  const spreadScale = 0.52;

  function frame(now) {
    const elapsed = now - startTime;

    ctx.clearRect(0, 0, W, H);

    if (elapsed <= half) {
      // ══ Phase 1: Blocks gently bloom outward to cover screen ════════
      const phaseT = elapsed / half; // 0 → 1

      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];
        const start = b.delay * spreadScale;
        const end   = start + windowSpan;

        if (phaseT <= start) continue;

        if (phaseT >= end) {
          // Fully covered solid block with +1px overlap to eliminate sub-pixel seams
          ctx.globalAlpha = 1;
          ctx.fillStyle = targetColor;
          ctx.fillRect(b.x, b.y, blockSize + 1, blockSize + 1);
        } else {
          // Softly blooming block with continuous easeInOut and sine alpha
          const blockT = (phaseT - start) / windowSpan;
          const scale  = easeInOutCubic(blockT);
          const size   = Math.ceil(blockSize * scale) + 1;
          const off    = Math.floor((blockSize - size) * 0.5);

          ctx.globalAlpha = Math.max(0, Math.min(1, sinAlpha(blockT) * 1.15));
          ctx.fillStyle = (b.isAccent && blockT < 0.40) ? accentColor : targetColor;
          ctx.fillRect(b.x + off, b.y + off, size, size);
        }
      }

    } else {
      // ══ Midpoint: theme swap fired beneath 100% solid coverage ══════
      if (!swapped) {
        swapped = true;
        try {
          onSwap?.();
        } catch (err) {
          console.error("[dissolve] swap:", err);
        }
      }

      // ══ Phase 2: Blocks gently dissolve outward in same momentum ═════
      const phaseT = (elapsed - half) / half; // 0 → 1

      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];
        const start = b.delay * spreadScale;
        const end   = start + windowSpan;

        if (phaseT >= end) continue; // fully dissolved into new theme

        if (phaseT <= start) {
          // Still solid
          ctx.globalAlpha = 1;
          ctx.fillStyle = targetColor;
          ctx.fillRect(b.x, b.y, blockSize + 1, blockSize + 1);
        } else {
          // Softly dissolving block revealing new theme from the background
          const blockT = (phaseT - start) / windowSpan;
          const scale  = 1 - easeInOutCubic(blockT);
          const size   = Math.ceil(blockSize * scale) + 1;
          const off    = Math.floor((blockSize - size) * 0.5);

          ctx.globalAlpha = Math.max(0, Math.min(1, sinAlpha(scale) * 1.15));
          ctx.fillStyle = (b.isAccent && scale < 0.45) ? accentColor : targetColor;
          ctx.fillRect(b.x + off, b.y + off, size, size);
        }
      }
    }

    if (elapsed < duration) {
      requestAnimationFrame(frame);
    } else {
      if (!swapped) onSwap?.();
      canvas.remove();
      isTransitioning = false;
    }
  }

  requestAnimationFrame(frame);
}

// ── Public API ─────────────────────────────────────────────────────────────

export function triggerPixelTransition({
  targetMode,
  currentTheme = "cobalt",
  originEvent = null,
  onSwap,
  duration = 1600,
}) {
  if (isTransitioning) return;

  if (prefersReducedMotion()) {
    onSwap?.();
    return;
  }

  isTransitioning = true;
  runPixelDissolve({ targetMode, currentTheme, originEvent, onSwap, duration });
}
