/**
 * Fine Sand Disintegration & Scattering Engine
 * ─────────────────────────────────────────────────────────────────────────
 * Disintegrates chat message bubbles into hundreds of ultra-fine sand grains
 * that peel away in an erosion wave and scatter smoothly into the breeze.
 *
 * Physics:
 *   • Ultra-fine sand grains (1.2px - 2.2px) at high density (~220 grains/bubble)
 *   • Left-to-right erosion wave peeling the sand grains off the bubble
 *   • Gentle horizontal wind drift + subtle upward thermal turbulence
 *   • Paced at ~1150ms for a slow, silky, mesmerizing dissolution
 * ─────────────────────────────────────────────────────────────────────────
 */

export function triggerVaporize({ container, onComplete, accentColor = "#699cff" }) {
  if (!container) {
    onComplete?.();
    return;
  }

  const containerRect = container.getBoundingClientRect();
  const bubbles = container.querySelectorAll(".chat-msg");

  if (!bubbles.length) {
    onComplete?.();
    return;
  }

  // Create hardware-accelerated canvas overlay inside the chat box
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = [
    "position:absolute",
    "top:0",
    "left:0",
    "width:100%",
    "height:100%",
    "pointer-events:none",
    "z-index:30",
  ].join(";");

  const W = container.clientWidth;
  const H = container.clientHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    onComplete?.();
    return;
  }
  ctx.scale(dpr, dpr);

  container.appendChild(canvas);

  const sandGrains = [];

  // Sand color variations for natural textured granular look
  const SAND_GOLD = [
    accentColor,
    "#ffd166",
    "#f4a261",
    "#ffeaa7",
    "#fff3cd",
    "#e9c46a",
  ];

  const SAND_SILVER = [
    accentColor,
    "#cbd5e1",
    "#94a3b8",
    "#e2e8f0",
    "#f1f5f9",
    "#ffffff",
  ];

  bubbles.forEach((bubble) => {
    const rect = bubble.getBoundingClientRect();
    const bx = rect.left - containerRect.left;
    const by = rect.top - containerRect.top;
    const bw = rect.width;
    const bh = rect.height;

    const isUser = bubble.classList.contains("user");
    const palette = isUser ? SAND_GOLD : SAND_SILVER;

    // Dissolve the text bubble smoothly as sand peels away
    bubble.style.transition =
      "opacity 0.55s cubic-bezier(0.25, 1, 0.5, 1), transform 0.65s ease-out, filter 0.6s ease-out";
    bubble.style.transformOrigin = isUser ? "right center" : "left center";
    bubble.style.transform = "translateX(6px) translateY(-6px) scale(0.98)";
    bubble.style.opacity = "0";
    bubble.style.filter = "blur(6px) contrast(1.2)";

    // High density: ~180 to 260 micro grains per bubble for crisp fine sand texture
    const count = Math.min(260, Math.max(160, Math.round((bw * bh) / 36)));

    for (let i = 0; i < count; i++) {
      const px = bx + Math.random() * bw;
      const py = by + Math.random() * bh;

      // Erosion wave: sand peels away from left-to-right (0 to ~280ms delay)
      const horizontalRatio = Math.max(0, Math.min(1, (px - bx) / (bw || 1)));
      const startDelay = horizontalRatio * 260 + Math.random() * 90;

      // Color selection
      const color = palette[Math.floor(Math.random() * palette.length)];

      sandGrains.push({
        originX: px,
        originY: py,
        x: px,
        y: py,
        // Gentle wind carrying sand to the right and floating softly
        vx: Math.random() * 1.8 + 0.6,
        vy: -Math.random() * 1.2 - 0.3,
        // Micro grain sizes (1.2px to 2.2px)
        size: Math.random() * 1.2 + 1.2,
        alpha: Math.random() * 0.3 + 0.7,
        decay: Math.random() * 0.0016 + 0.0012, // slow decay for relaxed drift
        color,
        startDelay,
        flutterSpeed: Math.random() * 0.008 + 0.004,
        flutterPhase: Math.random() * Math.PI * 2,
      });
    }
  });

  const startTime = performance.now();
  const maxDuration = 1150; // slow, smooth, silky ~1.15s duration

  function render(now) {
    const elapsed = now - startTime;

    ctx.clearRect(0, 0, W, H);

    let aliveCount = 0;

    for (let i = 0; i < sandGrains.length; i++) {
      const g = sandGrains[i];

      // If grain hasn't started eroding yet, render it static in place
      if (elapsed < g.startDelay) {
        aliveCount++;
        ctx.fillStyle = g.color;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(g.originX, g.originY, g.size, g.size);
        continue;
      }

      // Time since this sand grain took flight into the breeze
      const flightTime = elapsed - g.startDelay;

      // Soft flutter and wind drift
      g.x += g.vx;
      g.y += g.vy + Math.sin(flightTime * g.flutterSpeed + g.flutterPhase) * 0.35;
      g.vx *= 0.995; // gentle air resistance
      g.vy += 0.008; // subtle natural gravity after initial upward lift

      g.alpha -= g.decay;

      if (g.alpha <= 0.01) continue;

      aliveCount++;

      ctx.fillStyle = g.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, g.alpha));

      // Draw crisp micro sand grain
      ctx.fillRect(g.x, g.y, g.size, g.size);
    }

    if (aliveCount > 0 && elapsed < maxDuration) {
      requestAnimationFrame(render);
    } else {
      canvas.remove();
      onComplete?.();
    }
  }

  requestAnimationFrame(render);
}
