/**
 * Ultra-Smooth Monochrome Pixel Dissolve Theme Transition
 * ─────────────────────────────────────────────────────────────────────────
 * Engineered for maximum smoothness (120 FPS / 60 FPS mobile):
 *   • Pure Monochrome: Matte black (#171717) & crisp white (#ffffff) with
 *     continuous opacity modulation — zero color flashes or binary flips.
 *   • True Butter-Smooth Easing: Full S-curve easeInOutCubic with zero velocity
 *     at both start and end, eliminating popping or abrupt cutoffs.
 *   • Two-Stage Fluid Wave:
 *       1. Cover Wave (0 → 50%): Pixel blocks bloom outward from the toggle
 *          with soft S-curve scaling, seamlessly solidifying the viewport.
 *       2. Midpoint (50%): Theme swaps beneath a 100% solid matte overlay.
 *       3. Reveal Wave (50 → 100%): Pixel blocks gently dissolve outward with
 *          matching S-curve decay.
 *       4. Tail-end Vapor Fade: Canvas opacity softly fades over the final 8%
 *          for an imperceptible, feather-soft exit.
 *   • Paced at 1100ms for a relaxed, cinematic, luxury feel on both mobile & desktop.
 *   • Hardware-accelerated canvas with sub-pixel closure and DPR capping.
 * ─────────────────────────────────────────────────────────────────────────
 */

let isTransitioning = false;

// ── S-Curve Easing (Zero velocity at start and end for butter softness) ────
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
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
    const touch = originEvent.touches?.[0] ?? originEvent.changedTouches?.[0];
    if (touch && typeof touch.clientX === "number") {
      return { x: touch.clientX, y: touch.clientY };
    }
    if (typeof originEvent.clientX === "number" && originEvent.clientX > 0) {
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

      // Organic subtle jitter creates natural digital dispersion
      const jitter = hash(c, r, 1) * 0.12;
      const delay = Math.min(1, normDist * 0.66 + jitter);

      // Subtle base opacity variation for textured dithering without color shifts
      const baseAlpha = 0.88 + hash(c, r, 2) * 0.12;

      blocks.push({
        x: c * blockSize,
        y: r * blockSize,
        delay,
        baseAlpha,
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
    "will-change:opacity,transform",
    "opacity:1",
    "transition:opacity 0.08s ease-out",
  ].join(";");

  const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 2 : 2.5);
  canvas.width  = Math.round(W * dpr);
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

  // Wide window span for velvety, continuous wave motion
  const windowSpan = 0.42;
  const spreadScale = 0.56;

  function frame(now) {
    const elapsed = now - startTime;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = targetColor;

    if (elapsed <= half) {
      // ══ Phase 1: Blocks gently bloom outward to cover screen ════════
      const phaseT = elapsed / half; // 0 → 1

      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];
        const start = b.delay * spreadScale;
        const end   = start + windowSpan;

        if (phaseT <= start) continue;

        if (phaseT >= end) {
          // Fully covered solid block
          ctx.globalAlpha = 1;
          ctx.fillRect(b.x, b.y, blockSize + 0.8, blockSize + 0.8);
        } else {
          // Softly blooming block with continuous easeInOut
          const blockT = (phaseT - start) / windowSpan;
          const scale  = easeInOutCubic(blockT);
          const size   = blockSize * scale + 0.8;
          const off    = (blockSize - size) * 0.5;

          ctx.globalAlpha = b.baseAlpha + (1 - b.baseAlpha) * scale;
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
        const end   = start + windowSpan;

        if (phaseT >= end) continue; // fully dissolved

        if (phaseT <= start) {
          // Still solid
          ctx.globalAlpha = 1;
          ctx.fillRect(b.x, b.y, blockSize + 0.8, blockSize + 0.8);
        } else {
          // Softly shrinking block with matching continuous easeInOut
          const blockT = (phaseT - start) / windowSpan;
          const scale  = 1 - easeInOutCubic(blockT);
          const size   = blockSize * scale + 0.8;
          const off    = (blockSize - size) * 0.5;

          ctx.globalAlpha = b.baseAlpha + (1 - b.baseAlpha) * scale;
          ctx.fillRect(b.x + off, b.y + off, size, size);
        }
      }
    }

    // Feather-soft exit over the final 8% of total duration
    if (elapsed > duration * 0.92) {
      const tailProgress = (elapsed - duration * 0.92) / (duration * 0.08);
      canvas.style.opacity = String(Math.max(0, 1 - tailProgress));
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
  duration = 1500,
}) {
  if (isTransitioning) return;

  if (prefersReducedMotion()) {
    onSwap?.();
    return;
  }

  isTransitioning = true;
  runPixelDissolve({ targetMode, originEvent, onSwap, duration });
}
