import { useEffect, useRef } from "react";

// Mulberry32 seeded pseudo-random number generator for replayable runs
function createRng(seed) {
  let s = seed >>> 0;
  return function () {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Snappy S-curve easing for 0.25s gravity flip transit
function flipEase(p) {
  return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
}

// Linear color interpolation between two hex colors (#rrggbb)
function lerpColor(c1, c2, t) {
  const clampedT = Math.max(0, Math.min(1, t));
  const r1 = parseInt(c1.slice(1, 3), 16), g1 = parseInt(c1.slice(3, 5), 16), b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16), g2 = parseInt(c2.slice(3, 5), 16), b2 = parseInt(c2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * clampedT);
  const g = Math.round(g1 + (g2 - g1) * clampedT);
  const b = Math.round(b1 + (b2 - b1) * clampedT);
  return `rgb(${r}, ${g}, ${b})`;
}

// Hand-designed obstacle patterns (chunks) provably solvable with >= 0.15s human reaction margin
const PATTERN_LIBRARY = [
  {
    id: "floor_single",
    name: "Floor Spike",
    entryLane: "floor",
    exitLane: "ceiling",
    length: 360,
    obstacles: [{ lane: "floor", x: 150, w: 26, h: 42 }],
  },
  {
    id: "ceil_single",
    name: "Ceiling Spike",
    entryLane: "ceiling",
    exitLane: "floor",
    length: 360,
    obstacles: [{ lane: "ceiling", x: 150, w: 26, h: 42 }],
  },
  {
    id: "floor_ceil_shift",
    name: "Alternating Lanes",
    entryLane: "floor",
    exitLane: "floor",
    length: 560,
    obstacles: [
      { lane: "floor", x: 130, w: 26, h: 42 },
      { lane: "ceiling", x: 340, w: 26, h: 42 },
    ],
  },
  {
    id: "ceil_floor_shift",
    name: "Alternating Lanes (Inverted)",
    entryLane: "ceiling",
    exitLane: "ceiling",
    length: 560,
    obstacles: [
      { lane: "ceiling", x: 130, w: 26, h: 42 },
      { lane: "floor", x: 340, w: 26, h: 42 },
    ],
  },
  {
    id: "zigzag",
    name: "Zigzag Rhythm",
    entryLane: "floor",
    exitLane: "ceiling",
    length: 740,
    obstacles: [
      { lane: "floor", x: 130, w: 26, h: 42 },
      { lane: "ceiling", x: 340, w: 26, h: 42 },
      { lane: "floor", x: 550, w: 26, h: 42 },
    ],
  },
  {
    id: "tunnel_window",
    name: "Tunnel Window",
    entryLane: "floor",
    exitLane: "ceiling",
    length: 580,
    obstacles: [
      { lane: "ceiling", x: 60, w: 130, h: 42 },
      { lane: "floor", x: 300, w: 130, h: 42 },
    ],
  },
  {
    id: "midair_hazard",
    name: "Midair Minefield",
    entryLane: "floor",
    exitLane: "floor",
    length: 520,
    obstacles: [
      { lane: "midair", x: 150, w: 32, y: 75, h: 70 },
      { lane: "floor", x: 330, w: 26, h: 42 },
    ],
  },
  {
    id: "double_flip",
    name: "Rapid Double-Flip",
    entryLane: "floor",
    exitLane: "floor",
    length: 540,
    obstacles: [
      { lane: "floor", x: 120, w: 26, h: 42 },
      { lane: "ceiling", x: 300, w: 26, h: 42 },
    ],
  },
  {
    id: "narrow_corridor",
    name: "Narrow Gap Chute",
    entryLane: "floor",
    exitLane: "ceiling",
    length: 480,
    obstacles: [
      { lane: "ceiling", x: 120, w: 75, h: 42 },
      { lane: "floor", x: 280, w: 85, h: 42 },
    ],
  },
];

// Phase metadata and themes
const PHASES = [
  { name: "STANDARD", title: "Standard Protocol", color: "#699cff", bg: "#0b0f19" },
  { name: "ECHO", title: "Phase 1: Echo // Holographic Prediction", color: "#22d3ee", bg: "#041822" },
  { name: "BLACKOUT", title: "Phase 2: Blackout // Spotlight Radius", color: "#cbd5e1", bg: "#030712" },
  { name: "MIRROR", title: "Phase 3: Mirror // 100ms Input Lag", color: "#c084fc", bg: "#150826" },
  { name: "DECOYS", title: "Phase 4: Decoys // Fake Holograms", color: "#facc15", bg: "#1a1304" },
  { name: "PULSE", title: "Phase 5: Pulse // 120 BPM Oscillation", color: "#f43f5e", bg: "#1f091c" },
];

export default function DinoGame() {
  const canvasRef = useRef(null);
  const scoreRef = useRef(null);
  const highScoreRef = useRef(null);
  const restartBtnRef = useRef(null);
  const gameOverOverlayRef = useRef(null);
  const finalScoreRef = useRef(null);
  const newHighScoreBadgeRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Game constants
    const BASE_SPEED = 4.8; // Target standard speed at score >= 100
    const WARMUP_SPEED = 3.3; // Completely constant slow speed until score reaches 100
    const FLIP_FRAMES = 15; // 0.25s at 60fps
    const FIXED_STEP = 1000 / 60; // 60 updates/sec fixed timestep

    // Mutable game state
    let scale = 1;
    let trackHeight = 220;
    let ceilY = 16;
    let floorY = 166;
    let dinoW = 34;
    let dinoH = 34;

    let dino = null;
    let obstacles = [];
    let particles = [];
    let trail = [];
    let floatingTexts = [];

    let score = 0;
    let distanceScore = 0;
    let bonusScore = 0;
    let highScore = 0;
    let frame = 0;
    let gameRunning = false;
    let mode = "start"; // "start" | "play" | "slowmo" | "over"
    let slowmoFrames = 0;

    let rng = null;
    let currentSeed = 1337;
    let nextSpawnX = 0;
    let currentLane = "floor";

    // Mutation phase tracking
    let activePhases = ["STANDARD"];
    let nextMutationScore = 100;
    let bannerFrames = 0;
    let bannerText = "";
    let bannerSub = "";
    let mirrorQueue = []; // For 100ms delayed inputs

    // Polish & Dynamic Background Polarity
    let screenShake = 0;
    let flashAlpha = 0;
    let bgTransition = 0.0; // 0.0 = dark/black, 1.0 = light/white
    let bgTargetTransition = 0.0;
    let nextBgFlipFrame = 350;

    // Fixed timestep loop controls
    let rafId = null;
    let lastTime = performance.now();
    let accumulator = 0;

    function resizeGameCanvas() {
      const cssW = canvas.clientWidth || canvas.offsetWidth || 320;
      let cssH;
      if (cssW < 380) cssH = 200;
      else if (cssW < 640) cssH = 240;
      else cssH = 270;

      const dpr = window.devicePixelRatio || 1;
      canvas.style.height = cssH + "px";
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      canvas.cssWidth = cssW;
      canvas.cssHeight = cssH;

      scale = Math.max(0.7, Math.min(1.15, cssW / 600));
      trackHeight = cssH;
      ceilY = 16 * scale;
      dinoW = 34 * scale;
      dinoH = 34 * scale;
      floorY = trackHeight - 16 * scale - dinoH;

      if (dino) {
        dino.x = 54 * scale;
        dino.w = dinoW;
        dino.h = dinoH;
        if (!dino.inFlip) {
          dino.y = dino.surface === "floor" ? floorY : ceilY;
        }
      }
    }

    function init(seed = Math.floor(Math.random() * 900000 + 100000)) {
      resizeGameCanvas();
      currentSeed = seed;
      rng = createRng(currentSeed);

      dino = {
        x: 54 * scale,
        y: floorY,
        w: dinoW,
        h: dinoH,
        surface: "floor", // "floor" | "ceiling"
        targetSurface: "floor",
        inFlip: false,
        flipProgress: 0,
        flipStartFrame: 0,
        angle: 0,
        targetAngle: 0,
      };

      obstacles = [];
      particles = [];
      trail = [];
      floatingTexts = [];
      mirrorQueue = [];

      score = 0;
      distanceScore = 0;
      bonusScore = 0;
      frame = 0;
      gameRunning = false;
      mode = "start";
      slowmoFrames = 0;
      screenShake = 0;
      flashAlpha = 0;
      bgTransition = 0.0;
      bgTargetTransition = 0.0;
      nextBgFlipFrame = 350 + Math.floor(rng() * 400);

      activePhases = ["STANDARD"];
      nextMutationScore = 100;
      bannerFrames = 0;
      currentLane = "floor";
      nextSpawnX = canvas.cssWidth + 100 * scale;

      highScore = parseInt(localStorage.getItem("dinoHighScore") || "0", 10) || 0;
      if (highScoreRef.current) highScoreRef.current.innerText = highScore;
      if (scoreRef.current) scoreRef.current.innerText = "Score: 0";
    }

    let resizeTimeout;
    function onResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeGameCanvas, 120);
    }
    window.addEventListener("resize", onResize);

    // Gravity Flip Trigger
    function triggerFlip() {
      if (mode === "over") {
        onRestart();
        return;
      }
      if (mode === "start") {
        mode = "play";
        gameRunning = true;
        return;
      }
      if (!gameRunning || mode !== "play") return;

      // Mutation Phase 3: Mirror adds 100ms (6 physics ticks) input delay
      const isMirrorPhase = getActivePhases().includes("MIRROR");
      if (isMirrorPhase) {
        mirrorQueue.push(frame + 6);
        return;
      }

      executeFlip();
    }

    function executeFlip() {
      // Rule: Flipping mid-air is not allowed. Every flip is a commitment!
      if (!dino || dino.inFlip) return;

      const fromFloor = dino.surface === "floor";
      dino.inFlip = true;
      dino.flipProgress = 0;
      dino.flipStartFrame = frame;
      dino.targetSurface = fromFloor ? "ceiling" : "floor";
      dino.targetAngle = fromFloor ? Math.PI : 0;

      // Particle burst on takeoff
      spawnTakeoffParticles(dino.x + dino.w / 2, fromFloor ? floorY + dino.h : ceilY);
    }

    function onKeydown(e) {
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        triggerFlip();
      }
    }
    document.addEventListener("keydown", onKeydown);

    function onCanvasClick() {
      triggerFlip();
    }
    canvas.addEventListener("click", onCanvasClick);

    function onCanvasTouch(e) {
      e.preventDefault();
      triggerFlip();
    }
    canvas.addEventListener("touchstart", onCanvasTouch, { passive: false });

    // Spawner: picks hand-designed chunks from seeded RNG
    function spawnChunk() {
      // Find candidate patterns matching the current corridor exit lane
      const candidates = PATTERN_LIBRARY.filter(
        (p) => p.entryLane === currentLane || p.entryLane === "any"
      );
      const chosen = candidates[Math.floor(rng() * candidates.length)] || PATTERN_LIBRARY[0];
      currentLane = chosen.exitLane;

      const active = getActivePhases();
      const isDecoysPhase = active.includes("DECOYS");
      const isEchoPhase = active.includes("ECHO");
      const isPulsePhase = active.includes("PULSE");

      chosen.obstacles.forEach((obsDef, index) => {
        // In DECOYS phase: 45% chance; otherwise if score >= 100: 15% random surprise decoy!
        const isDecoy = (isDecoysPhase && rng() < 0.45) || (score >= 100 && rng() < 0.15);

        // In ECHO phase: 100%; otherwise if score >= 100: 20% random ghost preview!
        const isEcho = isEchoPhase || (score >= 100 && rng() < 0.2);

        // In PULSE phase: 100%; otherwise if score >= 100: 15% random pulse!
        const isPulse = isPulsePhase || (score >= 100 && rng() < 0.15);

        obstacles.push({
          x: nextSpawnX + obsDef.x * scale,
          w: obsDef.w * scale,
          h: obsDef.h * scale,
          lane: obsDef.lane,
          yRatio: obsDef.y !== undefined ? obsDef.y / 220 : 0.4,
          isDecoy,
          isEcho,
          isPulse,
          pulseOffset: index * 1.2,
          scoredNearMiss: false,
        });
      });

      // Advance spawn position with safety buffer
      const buffer = (80 + rng() * 40) * scale;
      nextSpawnX += chosen.length * scale + buffer;
    }

    function getActivePhases() {
      return activePhases;
    }

    function rollRandomMutation() {
      const MUTATION_POOL = ["ECHO", "BLACKOUT", "MIRROR", "DECOYS", "PULSE"];

      let chosen;
      // After score 400, 35% chance to roll a stacked dual mutation
      if (score >= 400 && rng() < 0.35) {
        const i1 = Math.floor(rng() * MUTATION_POOL.length);
        let i2 = Math.floor(rng() * (MUTATION_POOL.length - 1));
        if (i2 >= i1) i2++;
        chosen = [MUTATION_POOL[i1], MUTATION_POOL[i2]];
      } else {
        // Pick 1 random mutation different from the current one
        const available = MUTATION_POOL.filter((p) => !activePhases.includes(p));
        const pick = available[Math.floor(rng() * available.length)] || MUTATION_POOL[0];
        chosen = [pick];
      }

      activePhases = chosen;
      // Set next mutation score: 80 to 120 points later
      nextMutationScore = score + 80 + Math.floor(rng() * 40);

      // Trigger 1.5s warning banner
      const primaryPhase = chosen[0];
      const phaseObj = PHASES.find((p) => p.name === primaryPhase) || PHASES[0];
      bannerFrames = 90; // 1.5s at 60fps
      bannerText =
        chosen.length > 1
          ? `MUTATION OVERLOAD // ${chosen.join(" + ")}`
          : `MUTATION // ${phaseObj.name}`;
      bannerSub = phaseObj.title;
      screenShake = 7;
      flashAlpha = 0.35;
    }

    function checkPhaseTransition() {
      if (score >= nextMutationScore) {
        rollRandomMutation();
      }
    }

    // Particle helpers
    function spawnTakeoffParticles(x, y) {
      for (let i = 0; i < 7; i++) {
        particles.push({
          x,
          y,
          vx: (rng() - 0.5) * 4 * scale,
          vy: (rng() - 0.5) * 3 * scale,
          life: 14,
          maxLife: 14,
          color: "#699cff",
          size: 2.5 * scale,
        });
      }
    }

    function spawnLandingParticles(x, y, surface) {
      screenShake = 2.5;
      const vyDir = surface === "floor" ? -1 : 1;
      for (let i = 0; i < 10; i++) {
        particles.push({
          x: x + (rng() - 0.5) * 20 * scale,
          y,
          vx: (rng() - 0.5) * 6 * scale,
          vy: rng() * 3 * vyDir * scale,
          life: 18,
          maxLife: 18,
          color: "#22c55e",
          size: 2 * scale,
        });
      }
    }

    function spawnNearMissParticles(x, y) {
      for (let i = 0; i < 12; i++) {
        particles.push({
          x,
          y,
          vx: (rng() - 0.5) * 5 * scale,
          vy: (rng() - 0.5) * 5 * scale,
          life: 20,
          maxLife: 20,
          color: "#facc15",
          size: 3 * scale,
        });
      }
    }

    // ─── PURE UPDATE LOOP (Decoupled from Draw) ───
    function update() {
      if (mode === "slowmo") {
        slowmoFrames--;
        if (slowmoFrames <= 0) {
          triggerGameOver();
        }
        return;
      }

      if (!gameRunning || mode !== "play") return;

      frame++;
      // Dynamic random black/white background polarity flip
      if (frame >= nextBgFlipFrame) {
        bgTargetTransition = bgTargetTransition === 0 ? 1 : 0;
        // Schedule next random flip in 350 to 750 frames (~6 to 12.5 seconds)
        nextBgFlipFrame = frame + Math.floor(350 + rng() * 400);
        flashAlpha = 0.2;
      }
      bgTransition += (bgTargetTransition - bgTransition) * 0.04;

      // Constant slow speed until score 100 (flat, no ramp from 0 to 100)
      let currentSpeed;
      if (score < 100) {
        currentSpeed = WARMUP_SPEED * scale;
      } else if (score < 120) {
        // Smooth transition over 20 points at score 100 during Echo warning banner
        const t = (score - 100) / 20;
        currentSpeed = (WARMUP_SPEED + (BASE_SPEED - WARMUP_SPEED) * t) * scale;
      } else {
        currentSpeed = BASE_SPEED * scale;
      }

      // Handle queued delayed inputs for Mirror phase
      if (mirrorQueue.length > 0 && mirrorQueue[0] <= frame) {
        mirrorQueue.shift();
        executeFlip();
      }

      // Physics: Gravity Flip Interpolation
      if (dino.inFlip) {
        dino.flipProgress++;
        const p = Math.min(1, dino.flipProgress / FLIP_FRAMES);
        const ease = flipEase(p);

        if (dino.targetSurface === "ceiling") {
          dino.y = floorY - (floorY - ceilY) * ease;
          dino.angle = Math.PI * ease;
        } else {
          dino.y = ceilY + (floorY - ceilY) * ease;
          dino.angle = Math.PI * (1 - ease);
        }

        // Landing event
        if (dino.flipProgress >= FLIP_FRAMES) {
          dino.inFlip = false;
          dino.surface = dino.targetSurface;
          dino.y = dino.surface === "floor" ? floorY : ceilY;
          dino.angle = dino.surface === "floor" ? 0 : Math.PI;
          spawnLandingParticles(dino.x + dino.w / 2, dino.surface === "floor" ? floorY + dino.h : ceilY, dino.surface);
        }
      }

      // Record ghost trail
      if (frame % 2 === 0) {
        trail.push({ x: dino.x, y: dino.y, angle: dino.angle, alpha: 0.45 });
        if (trail.length > 8) trail.shift();
      }
      trail.forEach((t) => (t.alpha -= 0.05));

      // Spawner check: O(1) per frame
      if (nextSpawnX < canvas.cssWidth + 300 * scale) {
        spawnChunk();
      }

      // Obstacle movement and collision: O(k) for k visible obstacles
      const dinoHitBox = {
        x: dino.x + 6 * scale,
        y: dino.y + 4 * scale,
        w: dino.w - 12 * scale,
        h: dino.h - 8 * scale,
      };

      for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        obs.x -= currentSpeed;

        // Pulse Phase: vertical rhythmic oscillation
        let pulseYOffset = 0;
        if (obs.isPulse) {
          pulseYOffset = Math.sin((frame * 0.1) + obs.pulseOffset) * 16 * scale;
        }

        // Compute AABB bounds
        let obsTop, obsBottom;
        if (obs.lane === "floor") {
          obsTop = trackHeight - 16 * scale - obs.h + pulseYOffset;
          obsBottom = trackHeight - 16 * scale;
        } else if (obs.lane === "ceiling") {
          obsTop = 16 * scale;
          obsBottom = 16 * scale + obs.h + pulseYOffset;
        } else {
          // Midair
          const midY = trackHeight * obs.yRatio + pulseYOffset;
          obsTop = midY - obs.h / 2;
          obsBottom = midY + obs.h / 2;
        }
        obs.calculatedTop = obsTop;
        obs.calculatedBottom = obsBottom;

        // Collision Check (Decoys are harmless holograms)
        if (!obs.isDecoy) {
          const overlapsX = dinoHitBox.x < obs.x + obs.w && dinoHitBox.x + dinoHitBox.w > obs.x;
          const overlapsY = dinoHitBox.y < obsBottom && dinoHitBox.y + dinoHitBox.h > obsTop;

          if (overlapsX && overlapsY) {
            startDeathSlowMo();
            return;
          }
        }

        // Near-Miss Bonus Detection: within 14px vertical margin
        if (!obs.isDecoy && !obs.scoredNearMiss && obs.x + obs.w < dinoHitBox.x) {
          const verticalDist = Math.min(
            Math.abs(dinoHitBox.y + dinoHitBox.h - obsTop),
            Math.abs(dinoHitBox.y - obsBottom)
          );
          if (verticalDist < 16 * scale) {
            obs.scoredNearMiss = true;
            bonusScore += 50;
            score = distanceScore + bonusScore;
            flashAlpha = 0.25;
            spawnNearMissParticles(obs.x + obs.w, (obsTop + obsBottom) / 2);
            floatingTexts.push({
              x: dino.x + dino.w,
              y: dino.y,
              text: "+50 NEAR MISS",
              alpha: 1,
              life: 30,
            });
          }
        }
      }

      // Safe reverse pruning of offscreen obstacles: O(k)
      for (let i = obstacles.length - 1; i >= 0; i--) {
        if (obstacles[i].x + obstacles[i].w < -60 * scale) {
          obstacles.splice(i, 1);
        }
      }

      // Distance scoring: constant fixed progression
      if (frame % 4 === 0) {
        distanceScore++;
        score = distanceScore + bonusScore;
      }

      // Check mutation phase changes
      checkPhaseTransition();

      if (bannerFrames > 0) bannerFrames--;
      if (screenShake > 0) screenShake *= 0.88;
      if (flashAlpha > 0) flashAlpha = Math.max(0, flashAlpha - 0.03);

      // Particle update
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
      }

      // Floating text update
      for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y -= 0.8 * scale;
        ft.alpha -= 0.03;
        ft.life--;
        if (ft.life <= 0) floatingTexts.splice(i, 1);
      }

      // Sync score HUD
      if (scoreRef.current) {
        const active = getActivePhases();
        const phaseTag = score < 100 ? "SLOW" : active.join("+");
        scoreRef.current.innerText = `Score: ${score} · [${phaseTag}]`;
      }
    }

    function startDeathSlowMo() {
      mode = "slowmo";
      slowmoFrames = 28; // 28 slow-motion ticks
      screenShake = 16;
      flashAlpha = 0.55;
    }

    function triggerGameOver() {
      gameRunning = false;
      mode = "over";

      const isNewHigh = score > highScore;
      if (isNewHigh) {
        highScore = score;
        localStorage.setItem("dinoHighScore", score);
        if (highScoreRef.current) highScoreRef.current.innerText = score;
      }

      if (finalScoreRef.current) finalScoreRef.current.innerText = score;

      if (newHighScoreBadgeRef.current) {
        if (isNewHigh && score > 0) {
          newHighScoreBadgeRef.current.classList.remove("hidden");
          newHighScoreBadgeRef.current.classList.add("inline-flex");
        } else {
          newHighScoreBadgeRef.current.classList.add("hidden");
          newHighScoreBadgeRef.current.classList.remove("inline-flex");
        }
      }

      if (gameOverOverlayRef.current) {
        gameOverOverlayRef.current.classList.remove("hidden");
        gameOverOverlayRef.current.classList.add("flex");
      }

      if (restartBtnRef.current) restartBtnRef.current.classList.remove("hidden");
    }

    function onRestart() {
      if (gameOverOverlayRef.current) {
        gameOverOverlayRef.current.classList.add("hidden");
        gameOverOverlayRef.current.classList.remove("flex");
      }
      if (restartBtnRef.current) restartBtnRef.current.classList.add("hidden");
      init();
      mode = "play";
      gameRunning = true;
    }

    // ─── PURE DRAW LOOP ───
    function draw() {
      const W = canvas.cssWidth;
      const H = canvas.cssHeight;
      const s = scale;

      ctx.save();

      // Screen shake translation
      if (screenShake > 0.3) {
        const sx = (rng() - 0.5) * screenShake * 2;
        const sy = (rng() - 0.5) * screenShake * 2;
        ctx.translate(sx, sy);
      }

      // Background Theme: Smooth Lerp between Phase Dark Theme and Paper White
      const active = getActivePhases();
      const primaryPhase = active[0];
      const phaseObj = PHASES.find((p) => p.name === primaryPhase) || PHASES[0];

      ctx.fillStyle = lerpColor(phaseObj.bg, "#ffffff", bgTransition);
      ctx.fillRect(0, 0, W, H);

      // Pulse Phase Background Beat Waves
      if (active.includes("PULSE")) {
        const beat = (Math.sin(frame * 0.1) + 1) / 2;
        const waveColor =
          bgTransition > 0.5
            ? `rgba(225, 29, 72, ${0.12 + beat * 0.14})`
            : `rgba(244, 63, 94, ${0.08 + beat * 0.12})`;
        ctx.strokeStyle = waveColor;
        ctx.lineWidth = 1.5;
        for (let x = (-(frame * 2.5) % 40); x < W; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, H);
          ctx.stroke();
        }
      }

      // Draw Rails (Floor and Ceiling Tracks)
      const railFill =
        bgTransition > 0.5 ? "rgba(15, 23, 42, 0.10)" : "rgba(105, 156, 255, 0.18)";
      ctx.fillStyle = railFill;
      ctx.fillRect(0, ceilY - 4 * s, W, 4 * s);
      ctx.fillRect(0, floorY + dinoH, W, 4 * s);

      ctx.strokeStyle = lerpColor(phaseObj.color, "#0f172a", bgTransition);
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.moveTo(0, ceilY);
      ctx.lineTo(W, ceilY);
      ctx.moveTo(0, floorY + dinoH);
      ctx.lineTo(W, floorY + dinoH);
      ctx.stroke();

      // Draw Dino Trail
      trail.forEach((t) => {
        if (t.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = t.alpha * 0.5;
        ctx.translate(t.x + dinoW / 2, t.y + dinoH / 2);
        ctx.rotate(t.angle);
        ctx.fillStyle = lerpColor("#699cff", "#0f172a", bgTransition);
        ctx.fillRect(-dinoW / 2 + 6 * s, -dinoH / 2 + 10 * s, dinoW - 12 * s, dinoH - 12 * s);
        ctx.restore();
      });

      // Draw Obstacles (with Echo & Decoys support)
      obstacles.forEach((obs) => {
        const top = obs.calculatedTop;
        const bottom = obs.calculatedBottom;
        const h = bottom - top;

        // Phase 1: Echo Ghost Preview
        if (obs.isEcho) {
          ctx.save();
          ctx.globalAlpha = 0.28;
          ctx.strokeStyle = lerpColor("#22d3ee", "#0891b2", bgTransition);
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(obs.x + 35 * s, top, obs.w, h);
          ctx.restore();
        }

        ctx.save();
        if (obs.isDecoy) {
          // Decoy: hollow glowing outline only
          ctx.strokeStyle = lerpColor("#facc15", "#ca8a04", bgTransition);
          ctx.lineWidth = 1.5 * s;
          ctx.setLineDash([3, 3]);
          ctx.strokeRect(obs.x, top, obs.w, h);
          ctx.fillStyle = bgTransition > 0.5 ? "rgba(202, 138, 4, 0.12)" : "rgba(250, 204, 21, 0.12)";
          ctx.fillRect(obs.x, top, obs.w, h);
        } else if (obs.lane === "midair") {
          // Midair hazard: Energy Mine with rotating core
          const cx = obs.x + obs.w / 2;
          const cy = top + h / 2;
          ctx.fillStyle = "#f43f5e";
          ctx.shadowColor = "rgba(244, 63, 94, 0.5)";
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(cx, cy, obs.w / 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = bgTransition > 0.5 ? "#0f172a" : "#ffffff";
          ctx.lineWidth = 1.5 * s;
          ctx.beginPath();
          ctx.arc(cx, cy, obs.w * 0.75, frame * 0.08, frame * 0.08 + Math.PI);
          ctx.stroke();
        } else {
          // Solid floor / ceiling hazard
          const isFloor = obs.lane === "floor";
          const grad = ctx.createLinearGradient(0, top, 0, bottom);
          if (isFloor) {
            grad.addColorStop(0, "#f43f5e");
            grad.addColorStop(1, "#881337");
          } else {
            grad.addColorStop(0, "#881337");
            grad.addColorStop(1, "#f43f5e");
          }
          ctx.fillStyle = grad;
          ctx.fillRect(obs.x, top, obs.w, h);

          // Glowing hazard tip
          ctx.fillStyle = bgTransition > 0.5 ? "#4c0519" : "#fecdd3";
          if (isFloor) ctx.fillRect(obs.x, top, obs.w, 3 * s);
          else ctx.fillRect(obs.x, bottom - 3 * s, obs.w, 3 * s);
        }
        ctx.restore();
      });

      // Draw Dino Sprite (Rotates upside-down on ceiling)
      if (dino) {
        ctx.save();
        ctx.translate(dino.x + dino.w / 2, dino.y + dino.h / 2);
        ctx.rotate(dino.angle);
        ctx.translate(-dino.w / 2, -dino.h / 2);

        const normalColor = lerpColor("#22c55e", "#15803d", bgTransition);
        const dinoColor = mode === "over" || mode === "slowmo" ? "#ef4444" : normalColor;
        ctx.fillStyle = dinoColor;

        // Dino Body & Head
        ctx.fillRect(8 * s, 10 * s, 20 * s, 16 * s); // Torso
        ctx.fillRect(22 * s, 2 * s, 12 * s, 12 * s); // Head
        ctx.fillRect(28 * s, 10 * s, 6 * s, 2 * s);  // Snout
        ctx.fillRect(0, 16 * s, 8 * s, 4 * s);       // Tail
        ctx.fillRect(16 * s, 16 * s, 4 * s, 4 * s);  // Arm

        // Knockout "X" eye or normal pupil
        if (mode === "over" || mode === "slowmo") {
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.5 * s;
          ctx.beginPath();
          ctx.moveTo(27 * s, 4 * s);
          ctx.lineTo(31 * s, 8 * s);
          ctx.moveTo(31 * s, 4 * s);
          ctx.lineTo(27 * s, 8 * s);
          ctx.stroke();
        } else {
          ctx.fillStyle = "#000000";
          ctx.fillRect(28 * s, 5 * s, 3 * s, 3 * s);
        }

        // Animated Walking Legs
        const legAnim = Math.floor(frame / 6) % 2 === 0 && !dino.inFlip && mode === "play";
        if (legAnim) {
          ctx.fillRect(10 * s, 26 * s, 4 * s, 8 * s);
          ctx.fillRect(20 * s, 26 * s, 4 * s, 8 * s);
        } else {
          ctx.fillRect(8 * s, 26 * s, 4 * s, 8 * s);
          ctx.fillRect(22 * s, 26 * s, 4 * s, 8 * s);
        }

        ctx.restore();
      }

      // Phase 2: Blackout Spotlight Mask
      if (active.includes("BLACKOUT") && dino) {
        const cx = dino.x + dino.w / 2;
        const cy = dino.y + dino.h / 2;
        const radius = 135 * s;

        const maskGrad = ctx.createRadialGradient(cx, cy, radius * 0.45, cx, cy, radius);
        if (bgTransition > 0.5) {
          maskGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
          maskGrad.addColorStop(0.85, "rgba(255, 255, 255, 0.88)");
          maskGrad.addColorStop(1, "rgba(255, 255, 255, 0.98)");
        } else {
          maskGrad.addColorStop(0, "rgba(3, 7, 18, 0)");
          maskGrad.addColorStop(0.85, "rgba(3, 7, 18, 0.88)");
          maskGrad.addColorStop(1, "rgba(3, 7, 18, 0.98)");
        }

        ctx.fillStyle = maskGrad;
        ctx.fillRect(0, 0, W, H);
      }

      // Draw Particles
      particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
      ctx.globalAlpha = 1;

      // Draw Floating Bonus Texts
      floatingTexts.forEach((ft) => {
        ctx.save();
        ctx.font = `bold ${Math.round(11 * s)}px monospace`;
        ctx.fillStyle = `rgba(250, 204, 21, ${ft.alpha})`;
        ctx.shadowColor = "rgba(250, 204, 21, 0.8)";
        ctx.shadowBlur = 6;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      // Flash Effect (Near-Miss or Collision)
      if (flashAlpha > 0.01) {
        ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
        ctx.fillRect(0, 0, W, H);
      }

      // ─── Canvas HUD ───
      ctx.save();
      ctx.font = `700 ${Math.round(10 * s)}px monospace`;
      ctx.fillStyle = lerpColor(phaseObj.color, "#0f172a", bgTransition);
      const hudPhaseText =
        score < 100
          ? `SPEED: SLOW // SCORE: ${score}/100`
          : `PHASE // ${active.join(" + ")}`;
      ctx.fillText(hudPhaseText, 12 * s, 12 * s);

      ctx.textAlign = "right";
      ctx.fillStyle = lerpColor("#94a3b8", "#64748b", bgTransition);
      ctx.fillText(`SEED #${currentSeed}`, W - 12 * s, 12 * s);
      ctx.restore();

      // 1.5s On-Screen Warning Banner
      if (bannerFrames > 0) {
        ctx.save();
        const bannerAlpha = Math.min(1, bannerFrames / 20);
        ctx.fillStyle =
          bgTransition > 0.5
            ? `rgba(255, 255, 255, ${bannerAlpha * 0.92})`
            : `rgba(0, 0, 0, ${bannerAlpha * 0.8})`;
        ctx.fillRect(0, H / 2 - 28 * s, W, 56 * s);

        ctx.strokeStyle = lerpColor(phaseObj.color, "#0f172a", bgTransition);
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.moveTo(0, H / 2 - 28 * s);
        ctx.lineTo(W, H / 2 - 28 * s);
        ctx.moveTo(0, H / 2 + 28 * s);
        ctx.lineTo(W, H / 2 + 28 * s);
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.font = `black ${Math.round(14 * s)}px sans-serif`;
        ctx.fillStyle = lerpColor(phaseObj.color, "#0f172a", bgTransition);
        ctx.fillText(bannerText, W / 2, H / 2 - 4 * s);

        ctx.font = `500 ${Math.round(10 * s)}px monospace`;
        ctx.fillStyle = lerpColor("#e2e8f0", "#334155", bgTransition);
        ctx.fillText(bannerSub, W / 2, H / 2 + 14 * s);
        ctx.restore();
      }

      // Start Screen
      if (mode === "start") {
        ctx.save();
        ctx.textAlign = "center";
        ctx.font = `700 ${Math.max(13, Math.round(15 * s))}px sans-serif`;
        ctx.fillStyle = lerpColor("#699cff", "#1d4ed8", bgTransition);
        ctx.shadowColor =
          bgTransition > 0.5 ? "rgba(29, 78, 216, 0.3)" : "rgba(105, 156, 255, 0.5)";
        ctx.shadowBlur = 8;
        ctx.fillText("Press SPACE / ENTER or TAP to Flip Gravity", W / 2, H / 2 - 6 * s);
        ctx.shadowBlur = 0;
        ctx.font = `500 ${Math.max(10, Math.round(11 * s))}px sans-serif`;
        ctx.fillStyle = lerpColor("#94a3b8", "#475569", bgTransition);
        ctx.fillText("Run on floor & ceiling · Flip between lanes · Avoid hazards", W / 2, H / 2 + 18 * s);
        ctx.restore();
      }

      ctx.restore();
    }

    // ─── FIXED TIMESTEP MAIN LOOP (Deterministic on 60Hz, 120Hz, 144Hz) ───
    function loop(currentTime) {
      let delta = currentTime - lastTime;
      if (delta > 250) delta = 250; // Clamp delta to avoid spiral of death on tab freeze
      lastTime = currentTime;
      accumulator += delta;

      while (accumulator >= FIXED_STEP) {
        update();
        accumulator -= FIXED_STEP;
      }

      draw();
      rafId = requestAnimationFrame(loop);
    }

    restartBtnRef.current?.addEventListener("click", onRestart);
    gameOverOverlayRef.current?.addEventListener("click", onRestart);

    init();
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("keydown", onKeydown);
      canvas.removeEventListener("click", onCanvasClick);
      canvas.removeEventListener("touchstart", onCanvasTouch);
      restartBtnRef.current?.removeEventListener("click", onRestart);
      gameOverOverlayRef.current?.removeEventListener("click", onRestart);
    };
  }, []);

  return (
    <div className="glass-card p-4 sm:p-6 md:p-8 rounded-3xl border border-primary/20 shadow-2xl min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-primary/15 min-w-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-lg sm:text-xl">sports_esports</span>
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold font-headline text-on-surface truncate">
              Dino Gravity Runner
            </h3>
            <p className="text-[10px] sm:text-[11px] font-label text-outline truncate">
              Zero-G Arcade · Fixed Speed · Pattern Mutations
            </p>
          </div>
        </div>
      </div>

      <div className="w-full bg-surface-container-highest/60 rounded-2xl p-4 border border-outline-variant/20">
        <div className="relative w-full rounded-xl overflow-hidden select-none">
          <canvas
            ref={canvasRef}
            className="w-full block rounded-xl cursor-pointer"
            style={{ touchAction: "manipulation" }}
          />

          {/* Polished Arcade Game Over Overlay */}
          <div
            ref={gameOverOverlayRef}
            className="hidden absolute inset-0 z-10 flex-col items-center justify-center bg-surface-container-lowest/85 backdrop-blur-md p-4 sm:p-6 text-center select-none cursor-pointer"
            title="Click to restart"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-error/15 border border-error/30 text-error text-[11px] sm:text-xs font-mono font-bold tracking-widest uppercase mb-2 shadow-[0_0_15px_rgba(255,113,108,0.2)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-error"></span>
              </span>
              <span>Collision Detected</span>
            </div>

            <h4 className="text-2xl sm:text-3xl md:text-4xl font-black font-headline tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-400 to-amber-300 drop-shadow-[0_2px_12px_rgba(239,68,68,0.45)] mb-1">
              GAME OVER
            </h4>

            <div className="flex items-center justify-center gap-2.5 my-2.5 text-xs sm:text-sm font-label flex-wrap">
              <span className="px-3 py-1 rounded-lg bg-surface-container-high/90 border border-outline-variant/30 text-on-surface shadow-sm">
                Final Score: <strong ref={finalScoreRef} className="text-primary font-bold ml-1">0</strong>
              </span>
              <span
                ref={newHighScoreBadgeRef}
                className="hidden px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.25)] animate-pulse"
              >
                <span>🏆 New Record!</span>
              </span>
            </div>

            {/* Restart button — inside the overlay, below final score */}
            <button
              ref={restartBtnRef}
              className="hidden mt-5 px-8 py-2.5 rounded-xl bg-gradient-to-r from-primary to-tertiary-dim text-on-primary-container font-bold shadow-lg hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
            >
              <span className="material-symbols-outlined text-base">replay</span>
              <span>Restart Game</span>
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center mt-3 text-sm font-label">
          <span ref={scoreRef} className="text-primary font-semibold">Score: 0</span>
          <span className="text-xs text-outline">
            High Score: <span ref={highScoreRef} className="text-on-surface font-semibold">0</span>
          </span>
        </div>

        <p className="text-[11px] font-label text-outline text-center mt-3">
          Press <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/30 text-on-surface font-mono text-[10px]">Space</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/30 text-on-surface font-mono text-[10px]">Enter</kbd> or Tap screen to flip gravity
        </p>

      </div>
    </div>
  );
}
