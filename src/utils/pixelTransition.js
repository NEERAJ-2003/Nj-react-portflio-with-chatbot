/**
 * Pixel Ripple Dark / Light Mode Transition
 * ─────────────────────────────────────────────────────────────────────────
 * Dual-layer synchronized mode transition:
 *   1. View Transitions API:
 *      Captures old and new snapshots with document.startViewTransition().
 *      Animates ::view-transition-new(root) with clip-path: circle(0px at X Y)
 *      growing to circle(maxR at X Y) using the Web Animations API on
 *      documentElement, revealing the new mode outward from the toggle origin.
 *
 *   2. Canvas Pixel Ripple Overlay:
 *      A full-screen fixed canvas renders a dithered ring of pixel squares
 *      surrounding the expanding clip boundary.
 *      - Grid cells of 10px (12px on mobile)
 *      - u = |dist - r| / band (skipped if u >= 1)
 *      - f = (1 - u) * (0.7 + 0.5 * hash(cellX, cellY))
 *      - square size = cell * min(1, f * 1.15) (skipped if size < 1.2px)
 *      - band = 22% of shorter screen side, growing in with min(1, 0.3 + p * 2.5)
 *      - Alpha = min(1, 0.55 + 0.45 * f)
 *      - Precomputed 96-entry lookup table cycling through 5 shades of the
 *        active accent theme (Cobalt, Emerald, Violet, Amber)
 *      - Timing: 2000ms with easing p = 1 - (1 - t)^2.2
 *      - Frame 0 drawn synchronously on click for instant zero-lag feedback
 * ─────────────────────────────────────────────────────────────────────────
 */

let isTransitioning = false;
let currentAnim = null;

// ── Accent Theme Definitions ──────────────────────────────────────────────
const ACCENT_MAP = {
  cobalt: "#699cff",
  emerald: "#00f5a0",
  violet: "#bf5af2",
  amber: "#ffb020",
};

// ── Color Utilities & 96-Entry LUT Generation ─────────────────────────────
function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerpRgb(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

/**
 * Builds a 5-shade palette per accent:
 * [s0: lighter tint, s1: light-mid blend, s2: base, s3: dark-mid blend, s4: darker shade]
 */
function buildPalette(baseHex) {
  const base = hexToRgb(baseHex);
  const white = [255, 255, 255];
  const dark = [
    Math.round(base[0] * 0.22),
    Math.round(base[1] * 0.22),
    Math.round(base[2] * 0.22),
  ];

  const s0 = lerpRgb(base, white, 0.55); // lighter tint
  const s1 = lerpRgb(base, white, 0.24); // in-between light
  const s2 = base;                       // base
  const s3 = lerpRgb(base, dark, 0.36);  // in-between dark
  const s4 = lerpRgb(base, dark, 0.72);  // darker shade

  return [s0, s1, s2, s3, s4];
}

/**
 * Precomputes a 96-entry color lookup table smoothly cycling through the 5 shades.
 */
function build96Lut(baseHex) {
  const [s0, s1, s2, s3, s4] = buildPalette(baseHex);
  // Smooth cyclic loop: s0 -> s1 -> s2 -> s3 -> s4 -> s3 -> s2 -> s1 -> (loops to s0)
  const cycle = [s0, s1, s2, s3, s4, s3, s2, s1];
  const lut = [];
  const segCount = 8;
  const segLen = 96 / segCount; // 12 entries per segment

  for (let i = 0; i < 96; i++) {
    const seg = Math.floor(i / segLen);
    const frac = (i % segLen) / segLen;
    const c1 = cycle[seg];
    const c2 = cycle[(seg + 1) % segCount];
    const rgb = lerpRgb(c1, c2, frac);
    lut[i] = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
  }
  return lut;
}

const LUT_TABLES = {
  cobalt: build96Lut(ACCENT_MAP.cobalt),
  emerald: build96Lut(ACCENT_MAP.emerald),
  violet: build96Lut(ACCENT_MAP.violet),
  amber: build96Lut(ACCENT_MAP.amber),
};

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

// Deterministic fast bitwise integer hash -> [0, 1)
function hash(cx, cy) {
  let h = (cx * 374761393 + cy * 668265263) ^ 0x5bf03635;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// Easing: Smooth S-curve (zero initial velocity for a gentle, buttery bloom, smoothly gliding outward)
function easeProgress(t) {
  return t * t * (3 - 2 * t);
}

// ── Public API ─────────────────────────────────────────────────────────────
export function triggerPixelTransition({
  targetMode: _targetMode,
  currentTheme = "cobalt",
  originEvent = null,
  onSwap,
  duration: _duration = 2000,
}) {
  // Ignore double clicks while an animation is in flight
  if (isTransitioning) return;

  // Fallback: if startViewTransition missing or prefers-reduced-motion, swap immediately
  if (
    typeof document === "undefined" ||
    typeof document.startViewTransition !== "function" ||
    prefersReducedMotion()
  ) {
    onSwap?.();
    return;
  }

  isTransitioning = true;

  const DURATION = 2000;

  const W = document.documentElement.clientWidth || window.innerWidth;
  const H = window.innerHeight;
  const isMobile = W < 768;
  const { x: originX, y: originY } = getOrigin(originEvent, isMobile);

  const cell = isMobile ? 12 : 10;
  const cols = Math.ceil(W / cell);
  const rows = Math.ceil(H / cell);

  const shorterSide = Math.min(W, H);
  const baseBand = shorterSide * 0.22;

  // maxR: distance to farthest screen corner + band (ensures ring fully clears viewport)
  const maxCornerDist = Math.hypot(
    Math.max(originX, W - originX),
    Math.max(originY, H - originY)
  );
  const maxR = maxCornerDist + baseBand;

  // Active theme color lookup table
  const activeKey =
    currentTheme ||
    (typeof document !== "undefined" && document.documentElement.getAttribute("data-theme")) ||
    "cobalt";
  const lut = LUT_TABLES[activeKey] || LUT_TABLES.cobalt;

  // ── Fixed Canvas Overlay Setup ───────────────────────────────────────────
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = [
    "position:fixed",
    "top:0",
    "left:0",
    "width:100%",
    "height:100%",
    "pointer-events:none",
    "z-index:9999999",
    "border:none",
    "padding:0",
    "margin:0",
    "background:transparent",
  ].join(";");

  // Promote to top layer where supported for seamless view transition stacking
  try {
    canvas.setAttribute("popover", "manual");
  } catch {}

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    onSwap?.();
    isTransitioning = false;
    return;
  }
  ctx.scale(dpr, dpr);

  document.documentElement.appendChild(canvas);
  try {
    if (typeof canvas.showPopover === "function") {
      canvas.showPopover();
    }
  } catch {}

  // ── Render function for a given progress p [0, 1] ─────────────────────────
  function render(p) {
    ctx.clearRect(0, 0, W, H);

    const band = baseBand * Math.min(1, 0.08 + Math.sqrt(p) * 1.15);
    const r = p * maxR;

    // Optimization: only iterate cells inside the bounding box of the active ring
    const maxRingR = r + band;
    const minCol = Math.max(0, Math.floor((originX - maxRingR) / cell));
    const maxCol = Math.min(cols - 1, Math.ceil((originX + maxRingR) / cell));
    const minRow = Math.max(0, Math.floor((originY - maxRingR) / cell));
    const maxRow = Math.min(rows - 1, Math.ceil((originY + maxRingR) / cell));

    for (let cy = minRow; cy <= maxRow; cy++) {
      const y = cy * cell + cell * 0.5;
      const dy = y - originY;
      const dy2 = dy * dy;

      for (let cx = minCol; cx <= maxCol; cx++) {
        const x = cx * cell + cell * 0.5;
        const dx = x - originX;
        const dist = Math.sqrt(dx * dx + dy2);

        // u = |dist - r| / band (skip if u >= 1)
        const diff = Math.abs(dist - r);
        const u = diff / band;
        if (u >= 1) continue;

        // Size with randomized dither modulation
        const f = (1 - u) * (0.7 + 0.5 * hash(cx, cy));
        const sqSize = cell * Math.min(1, f * 1.15);
        if (sqSize < 1.2) continue;

        // Angle around origin with subtle radial distance shift
        const angle = Math.atan2(dy, dx);
        const normAngle = (angle + Math.PI) / (2 * Math.PI);
        const distShift = (dist - r) / (band * 3);
        let tAngle = (normAngle + distShift) % 1;
        if (tAngle < 0) tAngle += 1;
        const lutIdx = Math.floor(tAngle * 96) % 96;

        // Alpha calculation
        const alpha = Math.min(1, 0.55 + 0.45 * f);

        ctx.globalAlpha = alpha;
        ctx.fillStyle = lut[lutIdx];
        ctx.fillRect(x - sqSize * 0.5, y - sqSize * 0.5, sqSize, sqSize);
      }
    }
  }

  // Draw Frame 0 synchronously on click so there is no initial lag
  render(0);

  let cleanedUp = false;
  let rafId = null;

  function cleanup() {
    if (cleanedUp) return;
    cleanedUp = true;

    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (canvas && canvas.parentNode) {
      canvas.remove();
    }
    if (currentAnim) {
      try {
        currentAnim.cancel();
      } catch {}
      currentAnim = null;
    }
    isTransitioning = false;
  }

  // ── 1. Start View Transition ─────────────────────────────────────────────
  let transition;
  try {
    transition = document.startViewTransition(() => {
      onSwap?.();
    });
  } catch {
    onSwap?.();
    cleanup();
    return;
  }

  const startTime = performance.now();

  // ── 2. Animate ::view-transition-new(root) via Web Animations API ─────────
  transition.ready
    .then(() => {
      if (cleanedUp) return;

      const steps = 80;
      const keyframes = [];
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const p = easeProgress(t);
        const radius = p * maxR;
        keyframes.push({
          clipPath: `circle(${radius.toFixed(2)}px at ${originX}px ${originY}px)`,
        });
      }

      currentAnim = document.documentElement.animate(keyframes, {
        duration: DURATION,
        easing: "linear",
        pseudoElement: "::view-transition-new(root)",
        fill: "forwards",
      });

      // Synchronize WAAPI with elapsed time so both layers are in lockstep
      const elapsedSoFar = performance.now() - startTime;
      currentAnim.currentTime = Math.min(DURATION, elapsedSoFar);
    })
    .catch(() => {
      cleanup();
    });

  transition.finished.finally(() => {
    cleanup();
  });

  // ── 3. Synchronized Canvas rAF Loop ──────────────────────────────────────
  function frame(now) {
    if (cleanedUp) return;

    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / DURATION);
    const p = easeProgress(t);

    render(p);

    if (t < 1) {
      rafId = requestAnimationFrame(frame);
    } else {
      cleanup();
    }
  }

  rafId = requestAnimationFrame(frame);
}
