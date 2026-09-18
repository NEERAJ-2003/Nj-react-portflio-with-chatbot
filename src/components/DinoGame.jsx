import { useEffect, useRef } from "react";

export default function DinoGame() {
  const canvasRef = useRef(null);
  const scoreRef = useRef(null);
  const highScoreRef = useRef(null);
  const restartBtnRef = useRef(null);

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
      if (cssW < 380) cssH = 140;
      else if (cssW < 640) cssH = 170;
      else cssH = 200;

      const dpr = window.devicePixelRatio || 1;
      canvas.style.height = cssH + "px";
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      canvas.cssWidth = cssW;
      canvas.cssHeight = cssH;

      scale = cssW / 700;
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

      highScore = localStorage.getItem("dinoHighScore") || 0;
      if (highScoreRef.current) highScoreRef.current.innerText = highScore;
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
        jump();
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

      ctx.fillStyle = "#22c55e";
      ctx.fillRect(x + 8 * s, y + 12 * s, 22 * s, 18 * s); // body
      ctx.fillRect(x + 24 * s, y + 2 * s, 14 * s, 14 * s); // head

      ctx.fillStyle = "#000";
      ctx.fillRect(x + 32 * s, y + 6 * s, 3 * s, 3 * s); // eye

      ctx.fillStyle = "#22c55e";
      ctx.fillRect(x + 30 * s, y + 12 * s, 6 * s, 2 * s); // mouth
      ctx.fillRect(x - 4 * s, y + 20 * s, 10 * s, 4 * s); // tail
      ctx.fillRect(x + 16 * s, y + 20 * s, 4 * s, 4 * s); // arms

      if (frame % 20 < 10) {
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
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      const fontSize = Math.max(12, Math.round(16 * scale));
      ctx.font = "bold " + fontSize + "px sans-serif";
      ctx.fillText("Press ENTER or TAP to Start", W / 2, 45 * scale + 40);
      ctx.fillText("(use ENTER to Play)", W / 2, 45 * scale + 65);
      ctx.textAlign = "left";
    }

    function drawGameOver() {
      const W = canvas.cssWidth;
      ctx.fillStyle = "red";
      ctx.textAlign = "center";
      const fontSize = Math.max(13, Math.round(18 * scale));
      ctx.font = "bold " + fontSize + "px sans-serif";
      ctx.fillText("Game Over \uD83D\uDC80", W / 2, 50 * scale + 40);
      ctx.textAlign = "left";
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

      if (score > highScore) {
        localStorage.setItem("dinoHighScore", score);
      }

      if (restartBtnRef.current) restartBtnRef.current.classList.remove("hidden");
    }

    function onRestart() {
      init();
      mode = "play";
      gameRunning = true;
      if (restartBtnRef.current) restartBtnRef.current.classList.add("hidden");
    }
    restartBtnRef.current?.addEventListener("click", onRestart);

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
        <canvas ref={canvasRef} className="w-full block rounded-xl cursor-pointer" style={{ touchAction: "manipulation" }} />

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
          className="hidden mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-primary to-tertiary-dim text-on-primary-container font-bold shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
        >
          Restart Game
        </button>
      </div>
    </div>
  );
}
