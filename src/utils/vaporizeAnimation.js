/**
 * Fine Sand Disintegration & Text Convergence Engine
 * ─────────────────────────────────────────────────────────────────────────
 * 1. Disintegrates chat message bubbles into hundreds of ultra-fine sand grains
 *    peeling away in an erosion wave and drifting into the breeze.
 * 2. The sand grains animatically swirl, curve, and converge into the center
 *    to assemble and generate the Claude-style greeting text:
 *    "✦ [Greeting], Neeraj" + "Ask me anything about the portfolio"
 * 3. Once fully formed with a luminous sand shimmer, cleanly hands over
 *    to the real DOM greeting component.
 * ─────────────────────────────────────────────────────────────────────────
 */

function sampleGreetingTextTargets(W, H, greetingText) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const offscreen = document.createElement("canvas");
  offscreen.width = Math.round(W * dpr);
  offscreen.height = Math.round(H * dpr);
  const offCtx = offscreen.getContext("2d");
  if (!offCtx) return [];

  offCtx.scale(dpr, dpr);
  offCtx.textAlign = "center";
  offCtx.textBaseline = "middle";

  const centerY = H / 2 - 12;

  // Title: e.g. "✦ Good evening, Neeraj"
  const fullTitle = `✦  ${greetingText}`;
  offCtx.fillStyle = "#ffffff";
  offCtx.font = '700 20px "Manrope", -apple-system, sans-serif';
  offCtx.fillText(fullTitle, W / 2, centerY);

  // Measure title to identify the star icon area
  const titleMetrics = offCtx.measureText(fullTitle);
  const starThresholdX = W / 2 - titleMetrics.width / 2 + 28;

  // Subtitle
  offCtx.font = '400 12px "Space Grotesk", -apple-system, sans-serif';
  offCtx.fillText("Ask me anything about the portfolio", W / 2, centerY + 28);

  const imgW = Math.round(W * dpr);
  const imgH = Math.round(H * dpr);
  const imgData = offCtx.getImageData(0, 0, imgW, imgH);
  const data = imgData.data;
  const targets = [];

  // Sample every ~2px in logical coords
  const step = Math.max(2, Math.round(2 * dpr));

  for (let py = 0; py < imgH; py += step) {
    for (let px = 0; px < imgW; px += step) {
      const idx = (py * imgW + px) * 4;
      const alpha = data[idx + 3];
      if (alpha > 75) {
        const x = px / dpr;
        const y = py / dpr;
        const isTitle = y < centerY + 14;
        const isStar = isTitle && x < starThresholdX;

        targets.push({
          x,
          y,
          isTitle,
          isStar,
        });
      }
    }
  }

  // Shuffle targets so particles fill the letters randomly rather than top-to-bottom
  for (let i = targets.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = targets[i];
    targets[i] = targets[j];
    targets[j] = temp;
  }

  return targets;
}

export function triggerVaporize({
  container,
  onComplete,
  accentColor = "#699cff",
  greetingText = "Good evening, Neeraj",
}) {
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

  // Fade out any action buttons and extra elements immediately
  const extras = container.querySelectorAll("button, .typing-dots, .freya-teaser-pill");
  extras.forEach((el) => {
    el.style.transition = "opacity 0.25s ease";
    el.style.opacity = "0";
  });

  const W = container.clientWidth;
  const H = container.clientHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  // Reset scroll to top cleanly for greeting centering
  container.scrollTop = 0;

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

  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    onComplete?.();
    return;
  }
  ctx.scale(dpr, dpr);
  container.appendChild(canvas);

  const isLightMode =
    typeof document !== "undefined" &&
    document.documentElement.getAttribute("data-mode") === "light";

  // Pre-generate target points that spell out the greeting
  const targetPoints = sampleGreetingTextTargets(W, H, greetingText);

  // Sand color variations for natural textured granular look
  const SAND_GOLD = [accentColor, "#ffd166", "#f4a261", "#ffeaa7", "#fff3cd", "#e9c46a"];
  const SAND_SILVER = [accentColor, "#cbd5e1", "#94a3b8", "#e2e8f0", "#f1f5f9", "#ffffff"];

  const sandGrains = [];
  const bubbleList = Array.from(bubbles);

  // Calculate total grains needed to guarantee complete, sharp text coverage
  const totalGrainsNeeded = Math.max(targetPoints.length + 120, bubbleList.length * 200);

  // Dissolve DOM message bubbles smoothly with blur and scale
  bubbleList.forEach((bubble) => {
    bubble.style.transition =
      "opacity 0.45s cubic-bezier(0.25, 1, 0.5, 1), transform 0.55s ease-out, filter 0.5s ease-out";
    const isUser = bubble.classList.contains("user");
    bubble.style.transformOrigin = isUser ? "right center" : "left center";
    bubble.style.transform = "translateX(4px) translateY(-4px) scale(0.98)";
    bubble.style.opacity = "0";
    bubble.style.filter = "blur(6px)";
  });

  // Distribute sand grains across the bubble bounds
  for (let i = 0; i < totalGrainsNeeded; i++) {
    const bubble = bubbleList[i % bubbleList.length];
    const rect = bubble.getBoundingClientRect();
    const bx = rect.left - containerRect.left;
    const by = rect.top - containerRect.top;
    const bw = Math.max(10, rect.width);
    const bh = Math.max(10, rect.height);

    const isUser = bubble.classList.contains("user");
    const palette = isUser ? SAND_GOLD : SAND_SILVER;

    const px = bx + Math.random() * bw;
    const py = by + Math.random() * bh;

    // Left-to-right peeling wave
    const horizontalRatio = Math.max(0, Math.min(1, (px - bx) / bw));
    const startDelay = horizontalRatio * 240 + Math.random() * 80;

    const target = i < targetPoints.length ? targetPoints[i] : null;

    // Target colors based on dark/light mode
    let targetColor = isLightMode ? "#0f172a" : "#f5f5f7";
    if (target?.isStar) {
      targetColor = accentColor;
    } else if (!target?.isTitle) {
      targetColor = isLightMode ? "#64748b" : "#a1a1aa";
    }

    sandGrains.push({
      originX: px,
      originY: py,
      x: px,
      y: py,
      scatterX: px,
      scatterY: py,
      // Initial wind drift velocities
      vx: (Math.random() - 0.2) * 1.6 + 0.8,
      vy: -Math.random() * 1.5 - 0.4,
      size: Math.random() * 0.9 + 1.3,
      alpha: Math.random() * 0.25 + 0.75,
      color: palette[Math.floor(Math.random() * palette.length)],
      startDelay,
      gatherDelay: 480 + Math.random() * 260,
      convergeDuration: 850 + Math.random() * 320,
      arcOffset: (Math.random() - 0.5) * 50,
      flutterSpeed: Math.random() * 0.008 + 0.004,
      flutterPhase: Math.random() * Math.PI * 2,
      target,
      targetColor,
    });
  }

  const startTime = performance.now();
  const totalDuration = 2250; // Full cinematic duration

  function render(now) {
    const elapsed = now - startTime;
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < sandGrains.length; i++) {
      const g = sandGrains[i];

      // 1. Static in place before erosion peels off
      if (elapsed < g.startDelay) {
        ctx.fillStyle = g.color;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(g.originX, g.originY, g.size, g.size);
        continue;
      }

      // 2. Flight / Wind Drift Phase
      if (elapsed < g.gatherDelay) {
        const flightTime = elapsed - g.startDelay;
        g.x += g.vx;
        g.y += g.vy + Math.sin(flightTime * g.flutterSpeed + g.flutterPhase) * 0.32;
        g.vx *= 0.992;
        g.vy += 0.006;
        g.scatterX = g.x;
        g.scatterY = g.y;

        ctx.fillStyle = g.color;
        ctx.globalAlpha = g.alpha;
        ctx.fillRect(g.x, g.y, g.size, g.size);
        continue;
      }

      // 3. Convergence / Combine Phase into Greeting Text
      if (g.target) {
        const gatherElapsed = elapsed - g.gatherDelay;
        const p = Math.min(1, gatherElapsed / g.convergeDuration);

        // Smooth cubic-out easing
        const ease = 1 - Math.pow(1 - p, 3.2);

        // Graceful curved flight path toward target letter
        const arc = Math.sin(p * Math.PI) * g.arcOffset;
        g.x = g.scatterX + (g.target.x - g.scatterX) * ease + Math.cos(p * Math.PI * 0.5) * (g.arcOffset * 0.3);
        g.y = g.scatterY + (g.target.y - g.scatterY) * ease + arc;

        // Transition particle color to text letter color as it locks into place
        if (p > 0.65) {
          ctx.fillStyle = g.targetColor;
          ctx.globalAlpha = Math.min(1, 0.4 + ease * 0.6);
        } else {
          ctx.fillStyle = g.color;
          ctx.globalAlpha = Math.max(0.2, g.alpha * (1 - p * 0.3));
        }

        // Subtle shimmer once formed
        const isFormed = p >= 1;
        const currentSize = isFormed ? 1.65 : g.size;

        ctx.fillRect(g.x, g.y, currentSize, currentSize);
      } else {
        // Extra dust without target fades softly into the breeze
        g.x += g.vx * 0.4;
        g.y += g.vy * 0.4;
        g.alpha -= 0.016;

        if (g.alpha > 0.01) {
          ctx.fillStyle = g.color;
          ctx.globalAlpha = Math.max(0, g.alpha);
          ctx.fillRect(g.x, g.y, g.size, g.size);
        }
      }
    }

    // Gentle fade out at the very end to seamlessly hand off to real DOM
    if (elapsed > 2050) {
      canvas.style.opacity = Math.max(0, (totalDuration - elapsed) / 200);
    }

    if (elapsed < totalDuration) {
      requestAnimationFrame(render);
    } else {
      canvas.remove();
      onComplete?.();
    }
  }

  requestAnimationFrame(render);
}
