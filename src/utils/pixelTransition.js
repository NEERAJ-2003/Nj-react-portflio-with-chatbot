/**
 * Butter-Smooth Monochrome Pixel Dissolve Theme Transition
 * ─────────────────────────────────────────────────────────────────────────
 * Features:
 *   • Pure Monochrome: Black (#171717) & White (#ffffff) with subtle grayscale
 *     shading for depth — zero rainbow colors.
 *   • Relaxed & Butter-Smooth: ~900ms duration with wide wave overlaps
 *     so the pixel blocks glide gracefully instead of snapping quickly.
 *   • Fluid Two-Stage Motion:
 *       1. Cover Wave (0 → 50%): Pixel blocks gently bloom outward from the
 *          clicked toggle, covering the screen in a solid layer.
 *       2. Midpoint (50%): Theme swaps invisibly beneath the solid canvas.
 *       3. Reveal Wave (50 → 100%): Pixel blocks gently dissolve outward in the
 *          same graceful momentum, unveiling the new theme.
 *   • Hardware-accelerated canvas with sub-pixel margin to eliminate line gaps.
 *   • Adaptive block sizes for mobile (<768px), tablet, and desktop viewports.
 *   • Respects prefers-reduced-motion (instant swap without animation).
 * ─────────────────────────────────────────────────────────────────────────
 */

let isTransitioning = false;

// ── Monochrome Palettes (Pure Black, Slate & Crisp White) ─────────────────
const MONO_DARK_PALETTE = [
  "#171717",
  "#1f1f1f",
  "#141414",
  "#262626",
  "#1a1a1a",
];

const MONO_LIGHT_PALETTE = [
  "#ffffff",
  "#f7f8fa",
  "#f0f2f5",
  "#fafbfc",
  "#eef0f3",
];

// ── Silky Easing Functions ────────────────────────────────────────────────
// Smooth cubic curves for gradual start and gentle settling
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t) => t * t * t;

// ── Helpers ──────────────────────────────────────────────────────────────

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

function getOrigin(originEvent, isMobile) {
  if (originEvent) {
    const touch = originEvent.touches?.[0] ?? originEvent.changedTouches?.[0];
    if (touch) return { x: touch.clientX, y: touch.clientY };
    if (typeof originEvent.clientX === "number") {
      return { x: originEvent.clientX, y: originEvent.clientY };
    }
  }
  return {
    x: window.innerWidth - (isMobile ? 52 : 175),
    y: isMobile ? 38 : 44,
  };
}

// Deterministic hash based on grid coords (stable across frames)
function hash(c, r, seed) {
  const n = Math.sin(c * 127.1 + r * 311.7 + seed * 74.3) * 43758.5453;
  return n - Math.floor(n);
}

// ── Core Animation ────────────────────────────────────────────────────────

function runPixelDissolve({ targetMode, originEvent, onSwap, duration }) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const isMobile = W < 768;
  const { x: ox, y: oy } = getOrigin(originEvent, isMobile);

  // Chunky, tactile pixel block size optimized for each device
  const blockSize = isMobile
    ? Math.max(18, Math.round(W / 20))
    : W < 1200
      ? Math.max(24, Math.round(W / 44))
      : Math.max(28, Math.round(W / 52));

  const cols = Math.ceil(W / blockSize);
  const rows = Math.ceil(H / blockSize);

  const targetColor = targetMode === "dark" ? "#171717" : "#ffffff";
  const palette = targetMode === "dark" ? MONO_DARK_PALETTE : MONO_LIGHT_PALETTE;

  // ── Pre-calculate block distances and wave delays ────────────────────────
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
      const delay = Math.min(1, normDist * 0.68 + jitter);

      const shadeIdx = Math.floor(hash(c, r, 2) * palette.length);
      const shade = palette[shadeIdx];

      blocks.push({
        x: c * blockSize,
        y: r * blockSize,
        delay,
        shade,
      });
    }
  }

  // ── Canvas Setup ─────────────────────────────────────────────────────────
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = [
    "position:fixed",
    "inset:0",
    "width:100vw",
    "height:100vh",
    "z-index:999999",
    "pointer-events:none",
    "will-change:transform",
  ].join(";");

  const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 2 : 2.5);
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);

  const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
  if (!ctx) {
    onSwap?.();
    isTransitioning = false;
    return;
  }
  ctx.scale(dpr, dpr);

  document.body.appendChild(canvas);

  // Halfway point: 50% cover wave, 50% reveal wave
  const half = duration * 0.5;
  const startTime = performance.now();
  let swapped = false;

  // Window of transition per block (wide = silky smooth gradual bloom)
  const windowSpan = 0.38;
  const spreadScale = 0.58;

  function frame(now) {
    const elapsed = now - startTime;

    ctx.clearRect(0, 0, W, H);

    if (elapsed <= half) {
      // ══ Phase 1: Blocks gently bloom outward to cover screen ════════
      const phaseT = elapsed / half; // 0 → 1

      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];
        const start = b.delay * spreadScale;
        const end = start + windowSpan;

        if (phaseT <= start) continue;

        if (phaseT >= end) {
          // Fully expanded block
          ctx.fillStyle = targetColor;
          ctx.fillRect(b.x, b.y, blockSize + 0.8, blockSize + 0.8);
        } else {
          // Expanding block with smooth ease-out
          const blockT = (phaseT - start) / windowSpan;
          const scale = easeOutCubic(blockT);
          const size = blockSize * scale + 0.8;
          const off = (blockSize - size) * 0.5;

          ctx.fillStyle = blockT < 0.25 ? b.shade : targetColor;
          ctx.fillRect(b.x + off, b.y + off, size, size);
        }
      }

    } else {
      // ══ Midpoint: theme swap fired beneath solid coverage ═══════════
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
        const end = start + windowSpan;

        if (phaseT >= end) continue; // fully dissolved

        if (phaseT <= start) {
          // Still solid
          ctx.fillStyle = targetColor;
          ctx.fillRect(b.x, b.y, blockSize + 0.8, blockSize + 0.8);
        } else {
          // Shrinking / dissolving block
          const blockT = (phaseT - start) / windowSpan;
          const scale = 1 - easeInCubic(blockT);
          const size = blockSize * scale + 0.8;
          const off = (blockSize - size) * 0.5;

          ctx.fillStyle = scale > 0.8 ? targetColor : b.shade;
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
  originEvent = null,
  onSwap,
  duration = 1100,
}) {
  if (isTransitioning) return;

  if (prefersReducedMotion()) {
    onSwap?.();
    return;
  }

  isTransitioning = true;

  // Gentle, luxurious timing: ~820ms on mobile, ~900ms on desktop
  const isMobile = window.innerWidth < 768;
  const dur = isMobile ? Math.round(duration * 0.9) : duration;

  runPixelDissolve({ targetMode, originEvent, onSwap, duration: dur });
}
