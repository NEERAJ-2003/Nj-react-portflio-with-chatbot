import { useEffect, useRef } from "react";

export default function DinoGame() {
  const canvasRef = useRef(null);
  const scoreRef = useRef(null);
  const highScoreRef = useRef(null);
  const restartBtnRef = useRef(null);
  const gameOverOverlayRef = useRef(null);
  const finalScoreRef = useRef(null);
  const newHighScoreBadgeRef = useRef(null);
  const overlayRestartBtnRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let dino, obstacles, speed, score, highScore, gameRunning, frame, mode;
    let scale = 1;
    let baseSpeed = 4;
    let speedTier = 0;
    let rafId;

    function resizeGameCanvas() {
      const cssW = canvas.clientWidth || canvas.offsetWidth || 320;
      let cssH;
      if (cssW < 380) cssH = 200;
      else if (cssW < 640) cssH = 240;
      else cssH = 280;

      const dpr = window.devicePixelRatio || 1;
      canvas.style.height = cssH + "px";
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      canvas.cssWidth = cssW;
      canvas.cssHeight = cssH;

      scale = Math.max(0.65, cssW / 650);
    }

    function init() {
      resizeGameCanvas();
      dino = { x: 50 * scale, y: 0, w: 40 * scale, h: 40 * scale, vy: 0, jumping: false };
      obstacles = [];
      speed = 4 * scale;
      baseSpeed = 4 * scale;
      speedTier = 0;
      score = 0;
      frame = 0;
      gameRunning = false;
      mode = "start";

      highScore = parseInt(localStorage.getItem("dinoHighScore") || "0", 10) || 0;
      if (highScoreRef.current) highScoreRef.current.innerText = highScore;
      if (scoreRef.current) scoreRef.current.innerText = "Score: 0";
    }

    let resizeTimeout;
    function onResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        resizeGameCanvas();
        if (dino) {
          dino.x = 50 * scale;
          dino.w = 40 * scale;
          dino.h = 40 * scale;
        }
        baseSpeed = (4 + speedTier * 1.2) * scale;
        speed = Math.max(speed, baseSpeed);
      }, 150);
    }
    window.addEventListener("resize", onResize);

    function jump() {
      if (mode === "over") {
        onRestart();
        return;
      }
      if (!dino.jumping && gameRunning) {
        dino.vy = 11 * scale;
        dino.jumping = true;
      }
      if (mode === "start") {
        gameRunning = true;
        mode = "play";
      }
    }

    function onKeydown(e) {
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "Enter" || e.code === "Space") {
        e.preventDefault();
        if (mode === "over") {
          onRestart();
        } else {
          jump();
        }
      }
    }
    document.addEventListener("keydown", onKeydown);
    canvas.addEventListener("click", jump);
    const onTouch = (e) => {
      e.preventDefault();
      jump();
    };
    canvas.addEventListener("touchstart", onTouch, { passive: false });

    function drawDino() {
      const H = canvas.cssHeight;
      let x = dino.x;
      let y = H - dino.h - dino.y;
      const s = scale;

      const dinoColor = mode === "over" ? "#ef4444" : "#22c55e";

      ctx.fillStyle = dinoColor;
      ctx.fillRect(x + 8 * s, y + 12 * s, 22 * s, 18 * s); // body
      ctx.fillRect(x + 24 * s, y + 2 * s, 14 * s, 14 * s); // head

      if (mode === "over") {
        // Knockout "X" eye
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5 * s;
        const ex = x + 31 * s;
        const ey = y + 5 * s;
        const sz = 5 * s;
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex + sz, ey + sz);
        ctx.moveTo(ex + sz, ey);
        ctx.lineTo(ex, ey + sz);
        ctx.stroke();
      } else {
        ctx.fillStyle = "#000";
        ctx.fillRect(x + 32 * s, y + 6 * s, 3 * s, 3 * s); // eye
      }

      ctx.fillStyle = dinoColor;
      ctx.fillRect(x + 30 * s, y + 12 * s, 6 * s, 2 * s); // mouth
      ctx.fillRect(x - 4 * s, y + 20 * s, 10 * s, 4 * s); // tail
      ctx.fillRect(x + 16 * s, y + 20 * s, 4 * s, 4 * s); // arms

      if (frame % 20 < 10 && mode !== "over") {
        ctx.fillRect(x + 12 * s, y + 30 * s, 5 * s, 10 * s);
        ctx.fillRect(x + 22 * s, y + 30 * s, 5 * s, 10 * s);
      } else {
        ctx.fillRect(x + 10 * s, y + 30 * s, 5 * s, 10 * s);
        ctx.fillRect(x + 24 * s, y + 30 * s, 5 * s, 10 * s);
      }
    }

    function spawnObstacle() {
      let type = Math.random();
      const W = canvas.cssWidth;
      if (type < 0.6) {
        obstacles.push({ x: W, w: 20 * scale, h: 40 * scale, y: 0 });
      } else {
        obstacles.push({ x: W, w: 30 * scale, h: 20 * scale, y: 60 * scale });
      }
    }

    function drawObstacles() {
      const H = canvas.cssHeight;
      ctx.fillStyle = "#a78bfa";

      obstacles.forEach((obs, i) => {
        obs.x -= speed;
        ctx.fillRect(obs.x, H - obs.h - obs.y, obs.w, obs.h);

        let dinoTop = H - dino.h - dino.y;
        let dinoBottom = dinoTop + dino.h;
        let obsTop = H - obs.h - obs.y;
        let obsBottom = obsTop + obs.h;

        if (
          dino.x < obs.x + obs.w &&
          dino.x + dino.w > obs.x &&
          dinoBottom > obsTop &&
          dinoTop < obsBottom
        ) {
          gameOver();
        }

        if (obs.x + obs.w < 0) obstacles.splice(i, 1);
      });
    }

    function drawBackground() {
      if (Math.floor(score / 500) % 2 === 0) {
        canvas.style.background = "#0f172a";
      } else {
        canvas.style.background = "#020617";
      }
    }

    function drawStartScreen() {
      const W = canvas.cssWidth;
      const H = canvas.cssHeight;
      ctx.save();
      ctx.textAlign = "center";
      const fontSize = Math.max(13, Math.round(15 * scale));
      ctx.font = `700 ${fontSize}px sans-serif`;
      ctx.fillStyle = "#699cff";
      ctx.shadowColor = "rgba(105, 156, 255, 0.4)";
      ctx.shadowBlur = 8;
      ctx.fillText("▶ Press SPACE / ENTER or TAP to Start", W / 2, H / 2 - 4);
      ctx.shadowBlur = 0;
      ctx.font = `500 ${Math.max(11, Math.round(12 * scale))}px sans-serif`;
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("Jump over obstacles to survive", W / 2, H / 2 + 20 * scale);
      ctx.restore();
    }

    function drawGameOver() {
      const W = canvas.cssWidth;
      const H = canvas.cssHeight;
      const grad = ctx.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, Math.max(W, H) * 0.7);
      grad.addColorStop(0, "rgba(239, 68, 68, 0.12)");
      grad.addColorStop(1, "rgba(12, 14, 18, 0.75)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    function update() {
      if (!gameRunning) return;

      dino.y += dino.vy;
      dino.vy -= 0.6 * scale;

      if (dino.y <= 0) {
        dino.y = 0;
        dino.jumping = false;
      }

      const spawnGap = Math.max(40, Math.floor(120 - (speed / scale) * 5));
      if (frame % spawnGap === 0) {
        spawnObstacle();
      }

      drawObstacles();

      speed += 0.02 * scale;
      if (frame % 5 === 0) {
        score++;
      }

      const newTier = Math.floor(score / 100);
      if (newTier > speedTier) {
        speedTier = newTier;
        baseSpeed = (4 + speedTier * 1.2) * scale;
        speed = baseSpeed;
      }

      if (scoreRef.current) scoreRef.current.innerText = "Score: " + score;
      frame++;
    }

    function gameOver() {
      gameRunning = false;
      mode = "over";

      const isNewHigh = score > highScore;
      if (isNewHigh) {
        highScore = score;
        localStorage.setItem("dinoHighScore", score);
        if (highScoreRef.current) highScoreRef.current.innerText = score;
      }

      if (finalScoreRef.current) {
        finalScoreRef.current.innerText = score;
      }

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

    restartBtnRef.current?.addEventListener("click", onRestart);
    overlayRestartBtnRef.current?.addEventListener("click", onRestart);

    function loop() {
      ctx.clearRect(0, 0, canvas.cssWidth, canvas.cssHeight);
      drawBackground();
      if (mode === "start") drawStartScreen();
      if (mode === "over") drawGameOver();
      drawDino();
      update();
      rafId = requestAnimationFrame(loop);
    }

    init();
    loop();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("keydown", onKeydown);
      canvas.removeEventListener("click", jump);
      canvas.removeEventListener("touchstart", onTouch);
      restartBtnRef.current?.removeEventListener("click", onRestart);
      overlayRestartBtnRef.current?.removeEventListener("click", onRestart);
    };
  }, []);

  return (
    <div className="glass-card p-6 md:p-8 rounded-3xl border border-primary/20 shadow-2xl">
      <div className="flex items-center justify-between pb-5 mb-5 border-b border-primary/15">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-xl">sports_esports</span>
          </div>
          <div>
            <h3 className="text-base font-bold font-headline text-on-surface">Dino Game</h3>
            <p className="text-[11px] font-label text-outline">Interactive Arcade</p>
          </div>
        </div>
        <span className="text-xs font-label px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
          <span>Can you survive?</span>
          <span>🦖</span>
        </span>
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
            className="hidden absolute inset-0 z-10 flex-col items-center justify-center bg-surface-container-lowest/85 backdrop-blur-md p-4 sm:p-6 text-center select-none"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-error/15 border border-error/30 text-error text-[11px] sm:text-xs font-mono font-bold tracking-widest uppercase mb-2 shadow-[0_0_15px_rgba(255,113,108,0.2)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-error"></span>
              </span>
              <span>Collision Detected</span>
              <span className="text-sm">💀</span>
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

            <button
              ref={overlayRestartBtnRef}
              className="group mt-1 px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-primary via-primary-dim to-tertiary-dim text-on-primary-container font-headline font-bold text-xs sm:text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm sm:text-base group-hover:rotate-180 transition-transform duration-500">replay</span>
              <span>Play Again</span>
            </button>

            <p className="text-[11px] text-outline font-label mt-2.5 hidden sm:block">
              Press <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/30 text-on-surface font-mono text-[10px]">Space</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/30 text-on-surface font-mono text-[10px]">Enter</kbd> to restart
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-3 text-sm font-label">
          <span ref={scoreRef} className="text-primary font-semibold">Score: 0</span>
          <span className="text-xs text-outline">
            High Score: <span ref={highScoreRef} className="text-on-surface font-semibold">0</span>
          </span>
        </div>

        <p className="text-[11px] font-label text-outline text-center mt-3">
          Press <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/30 text-on-surface font-mono text-[10px]">Space</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/30 text-on-surface font-mono text-[10px]">Enter</kbd> or Tap screen to jump
        </p>

        <button
          ref={restartBtnRef}
          className="hidden mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-primary to-tertiary-dim text-on-primary-container font-bold shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-base">replay</span>
          <span>Restart Game</span>
        </button>
      </div>
    </div>
  );
}
