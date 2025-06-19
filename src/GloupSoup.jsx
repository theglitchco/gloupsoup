import { useEffect, useRef } from "react";
import logoSrc from "./gloup_blank_solo.svg";

/**
 * GloupSoupFluidMultiTrail
 * ----------------------------------------------------
 */
export default function GloupSoupFluidMultiTrail() {
  /* --------------------------------------------------
   * CONFIG
   * -------------------------------------------------- */
  const SCALE = 0.5;            // simulation resolution
  const TRAIL_COUNT = 4;        // number of trails
  const TRAIL_RADIUS = 6;       // injection radius (low‑res px)
  const TRAIL_DECAY = 0.96;     // ↑ shorter, ↓ longer trails
  const HEAD_INTENSITY = .2;   // brightness of comet heads only
  const LOGO_BASE = 150;        // logo mask sampling grid
  const TEXT_DELAY = 500;       // ms until footer starts fading in
  const MAX_FONT_SIZE = 20;     // cap for responsive footer font
  const DISPERSE_MS = 3000;     // explode → redirect duration

  /* --------------------------------------------------
   * STATIC TEXT
   * -------------------------------------------------- */
  const TEXT_LINES = [
    "───────────────────────────────────────────────────────",
    "GLOUP SOUP INCUBATOR",
    "VOLUME 4 STARTS 22nd APRIL 2025",
    "COME AND MAKE FILMS",
    "ONE WORD THEME · 2 WEEKS DEADLINE",
    "IG @GLOUP.SOUP",
    "CONTACT@THEGLITCH.CO",
    "THEGLITCH.CO · HACKNEY WICK.",
    "───────────────────────────────────────────────────────",
  ];

  /* Orbiting hint – hidden on touch / narrow screens */
  const SHOW_HINT =
    typeof window !== "undefined" &&
    !matchMedia("(pointer: coarse)").matches &&
    window.innerWidth >= 768;
  const HINT = SHOW_HINT ? "CLICK FOR MORE        " : "";

  /* --------------------------------------------------
   * BOILERPLATE
   * -------------------------------------------------- */
  const canvasRef = useRef(null);

  useEffect(() => {
    /* ----------------------------------------------
     * INITIALISATION
     * ----------------------------------------------*/
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap";
    document.head.appendChild(link);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let simW, simH, field, backCanvas, backCtx;
    let logoMask = null;
    const mouse = { x: 0.5, y: 0.5 };

    /* footer fade‑in timing */
    const textStart = Date.now() + TEXT_DELAY;
    let showText = false;

    /* explode vars */
    let explode = false;
    let explodeTime = 0;

    /* click triggers explode */
    const onClick = () => {
      explode = true;
      explodeTime = Date.now();
    };
    window.addEventListener("click", onClick);

    /* ----------------------------------------------
     * SVG → MASK
     * ----------------------------------------------*/
    const buildLogoMask = () =>
      new Promise((res) => {
        const img = new Image();
        img.src = logoSrc;
        img.onload = () => {
          const tmp = document.createElement("canvas");
          tmp.width = LOGO_BASE;
          tmp.height = LOGO_BASE;
          tmp.getContext("2d").drawImage(img, 0, 0, LOGO_BASE, LOGO_BASE);
          const d = tmp.getContext("2d").getImageData(0, 0, LOGO_BASE, LOGO_BASE).data;
          logoMask = new Float32Array(LOGO_BASE * LOGO_BASE);
          for (let i = 0; i < logoMask.length; i++) logoMask[i] = d[i * 4 + 3] > 128 ? 1 : 0;
          res();
        };
      });

    /* responsive footer font */
    let fontSize = 16;
    let rowH = 18;
    const fitFont = () => {
      const longest = TEXT_LINES.reduce((m, l) => Math.max(m, l.length), 0);
      const byW = Math.floor((window.innerWidth - 40) / (longest * 0.95));
      const byH = Math.floor((window.innerHeight - 40) / (TEXT_LINES.length * 1.1));
      fontSize = Math.max(10, Math.min(MAX_FONT_SIZE, Math.min(byW, byH)));
      rowH = Math.floor(fontSize * 1.1);
    };

    /* ----------------------------------------------
     * CANVAS + FIELD SETUP
     * ----------------------------------------------*/
    const init = () => {
      fitFont();
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      simW = Math.floor(canvas.width * SCALE);
      simH = Math.floor(canvas.height * SCALE);
      field = new Float32Array(simW * simH);
      backCanvas = Object.assign(document.createElement("canvas"), { width: simW, height: simH });
      backCtx = backCanvas.getContext("2d");
    };

    /* ----------------------------------------------
     * TRAILS CONFIGURATION
     * ----------------------------------------------*/
    const trails = Array.from({ length: TRAIL_COUNT }, (_, i) => ({
      f: 0.002 + i * 0.0004,       // frequency
      p: i * Math.PI * 0.5,        // phase
      mx: 0.25 + 0.12 * Math.sin(i * 1.3),
      my: 0.25 + 0.12 * Math.cos(i * 0.9),
    }));

    /* ----------------------------------------------
     * SIM STEP
     * ----------------------------------------------*/
    const step = () => {
      const nxt = new Float32Array(simW * simH);

      /* diffusion & decay */
      for (let y = 1; y < simH - 1; y++)
        for (let x = 1; x < simW - 1; x++) {
          const i = y * simW + x;
          nxt[i] = ((field[i - 1] + field[i + 1] + field[i - simW] + field[i + simW]) / 4 - nxt[i]) * TRAIL_DECAY;
        }

      const t = Date.now();
      const mx = (mouse.x - 0.5) * simW;
      const my = (mouse.y - 0.5) * simH;

      /* inject comet heads */
      for (const tr of trails) {
        const cx = Math.sin(t * tr.f + tr.p) * simW * 0.3 + simW / 2 + mx * tr.mx;
        const cy = Math.cos(t * tr.f * 0.9 + tr.p) * simH * 0.3 + simH / 2 + my * tr.my;
        const r = TRAIL_RADIUS;
        for (let oy = -r; oy <= r; oy++)
          for (let ox = -r; ox <= r; ox++)
            if (ox * ox + oy * oy <= r * r) {
              const idx = ((cy | 0) + oy) * simW + ((cx | 0) + ox);
              if (idx >= 0 && idx < nxt.length) nxt[idx] += HEAD_INTENSITY;
            }
      }

      /* logo mask */
      if (logoMask) {
        const logoW = Math.floor(simW * 1);
        const logoH = Math.floor(simH * 0.7);
        for (let y = 0; y < logoH; y++)
          for (let x = 0; x < logoW; x++) {
            const u = Math.floor((x / logoW) * LOGO_BASE);
            const v = Math.floor((y / logoH) * LOGO_BASE);
            if (logoMask[v * LOGO_BASE + u]) {
              const fi = y * simW + x;
              nxt[fi] = nxt[fi] * 0.85 + 0.15;
            }
          }
      }

      /* explode → redirect */
      if (explode) {
        const prog = (Date.now() - explodeTime) / DISPERSE_MS;
        if (prog >= 1) {
          window.location.href = "https://theglitch.co";
          return;
        }
        const maxShift = simW * 0.3 * prog;
        for (let y = 0; y < simH; y++)
          for (let x = 0; x < simW; x++) {
            const idx = y * simW + x;
            const ang = Math.random() * Math.PI * 2;
            const rad = Math.random() * maxShift;
            const sx = Math.min(simW - 1, Math.max(0, Math.round(x + Math.cos(ang) * rad)));
            const sy = Math.min(simH - 1, Math.max(0, Math.round(y + Math.sin(ang) * rad)));
            nxt[idx] = field[sy * simW + sx] * (1 - prog);
          }
      }
      field = nxt;
    };

    /* ----------------------------------------------
     * RENDERING
     * ----------------------------------------------*/
    const b4 = [15, 135, 45, 165, 195, 75, 225, 105, 60, 180, 30, 150, 240, 120, 210, 90];

    const draw = () => {
      /* simulation → dithered bitmap */
      const img = backCtx.createImageData(simW, simH);
      const d = img.data;
      for (let i = 0; i < field.length; i++) {
        const v = Math.min(255, field[i] * 180);
        const x = i % simW,
          y = (i / simW) | 0;
        const col = v > b4[(y & 3) * 4 + (x & 3)] ? 255 : 0;
        const j = i * 4;
        d[j] = d[j + 1] = d[j + 2] = col;
        d[j + 3] = 255;
      }
      backCtx.putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(backCanvas, 0, 0, canvas.width, canvas.height);

      /* orbiting desktop hint */
      if (HINT) {
        const baseX = mouse.x * canvas.width;
        const baseY = mouse.y * canvas.height;
        ctx.font = "10px 'Press Start 2P', monospace";
        const radius = 50;
        const t = Date.now() * 0.0005;
        const len = HINT.length;
        for (let i = 0; i < len; i++) {
          const ang = (i / len) * Math.PI * 2 + t;
          const jitter = Math.sin(t * 3 + i) * 4;
          const x = baseX + (radius + jitter) * Math.cos(ang) - 4;
          const y = baseY + (radius + jitter) * Math.sin(ang) - 4;
          const alpha = Math.min(1, Math.max(0, (Date.now() - textStart - i * 80) / 400));
          ctx.globalAlpha = alpha;
          ctx.fillStyle = "white";
          ctx.fillText(HINT[i], x, y);
        }
        ctx.globalAlpha = 1;
      }

      /* footer – jittery fade */
      if (Date.now() >= textStart) showText = true;
      if (showText) {
        ctx.font = `${fontSize}px 'Press Start 2P', monospace`;
        ctx.textBaseline = "top";
        const startY = canvas.height - TEXT_LINES.length * rowH - 20;
        const t = Date.now();
        TEXT_LINES.forEach((l, i) => {
          const alpha = Math.min(1, Math.max(0, (t - textStart - i * 120) / 800));
          const jAmp = (1 - alpha) * 4;
          const jX = Math.sin((t + i * 57) * 0.02) * jAmp;
          const jY = Math.cos((t + i * 85) * 0.02) * jAmp;
          ctx.globalAlpha = alpha;
          ctx.fillStyle = "white";
          ctx.fillText(l, 20 + jX, startY + i * rowH + jY);
        });
        ctx.globalAlpha = 1;
      }
    };

    /* ----------------------------------------------
     * MAIN LOOP
     * ----------------------------------------------*/
    const loop = () => {
      step();
      draw();
      requestAnimationFrame(loop);
    };

    /* ----------------------------------------------
     * EVENT LISTENERS
     * ----------------------------------------------*/
    const onResize = () => init();
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = e.clientY / window.innerHeight;
    });

    /* kick off */
    buildLogoMask().then(() => {
      init();
      loop();
    });

    /* cleanup */
    return () => {
      document.head.removeChild(link);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("click", onClick);
    };
  }, []);

  /* --------------------------------------------------
   * RENDER (React)
   * -------------------------------------------------- */
  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full" />;
}
