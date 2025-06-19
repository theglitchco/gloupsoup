import { useEffect, useRef } from "react";
import logoSrc from "./gloup_blank_solo.svg";

/**
 * GLOUP SOUP FLUID‑TRAIL CANVAS
 * ----------------------------------------------
 * SECTION MAP  (search for tags when editing)
 *   1. CONFIG
 *   2. DOM + FONT SETUP
 *   3. RESPONSIVE FONT HELPER
 *   4. INIT BUFFERS / RESIZE
 *   5. TRAIL PARAMETERS
 *   6. SIMULATION STEP
 *   7. DRAW (dither, logo, text, hint)
 *   8. MAIN LOOP + LISTENERS
 * ----------------------------------------------
 */

export default function GloupSoupFluidMultiTrail() {
  const canvasRef = useRef(null);

  /* === 1. CONFIG ==================================== */
  const SCALE = 0.5;            // low‑res scale factor
  const TRAIL_COUNT = 4;        // number of animated blobs
  const TRAIL_RADIUS = 6;       // blob radius (simulation pixels)
  const LOGO_BASE = 150;        // raster size of SVG logo mask
  const TEXT_DELAY = 500;       // ms before NFO text shows
  const MAX_FONT_SIZE = 20;     // clamp for responsive NFO font
  const DISPERSE_MS = 3000;     // explode animation duration
  const HINT_DELAY = 20000;     // ms before "CLICK FOR MORE" appears

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
  const HINT = "CLICK FOR MORE        ";

  /* === 2. DOM + FONT SETUP ========================== */
  useEffect(() => {
    // load pixel font once
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap";
    document.head.appendChild(link);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // simulation buffers
    let simW, simH, field, backCanvas, backCtx;
    let logoMask = null;

    // UI/runtime state
    const mouse = { x: 0.5, y: 0.5 };
    let showText = false;
    setTimeout(() => (showText = true), TEXT_DELAY);
    const hintStart = Date.now() + HINT_DELAY;

    // explode state
    let explode = false, explodeTime = 0;

    /* === 2.1 SVG → mask ================================= */
    const buildLogoMask = () => new Promise((res) => {
      const img = new Image();
      img.src = logoSrc;
      img.onload = () => {
        const tmp = document.createElement("canvas");
        tmp.width = LOGO_BASE;
        tmp.height = LOGO_BASE;
        tmp.getContext("2d").drawImage(img, 0, 0, LOGO_BASE, LOGO_BASE);
        const data = tmp.getContext("2d").getImageData(0, 0, LOGO_BASE, LOGO_BASE).data;
        logoMask = new Uint8Array(LOGO_BASE * LOGO_BASE);
        for (let i = 0; i < logoMask.length; i++) logoMask[i] = data[i * 4 + 3] > 128 ? 1 : 0;
        res();
      };
    });

    /* === 3. RESPONSIVE FONT HELPER ===================== */
    let fontSize = 16, rowH = 18;
    const fitFont = () => {
      const longest = TEXT_LINES.reduce((m, l) => Math.max(m, l.length), 0);
      const byW = Math.floor((window.innerWidth - 40) / (longest * 0.95));
      const byH = Math.floor((window.innerHeight - 40) / (TEXT_LINES.length * 1.1));
      fontSize = Math.max(10, Math.min(MAX_FONT_SIZE, Math.min(byW, byH)));
      rowH = Math.floor(fontSize * 1.1);
    };

    /* === 4. INIT BUFFERS / RESIZE ====================== */
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

    /* === 5. TRAIL PARAMETERS =========================== */
    const trails = Array.from({ length: TRAIL_COUNT }, (_, i) => ({
      f: 0.002 + i * 0.0004,
      p: i * Math.PI * 0.5,
      mx: 0.25 + 0.12 * Math.sin(i * 1.3), // horizontal influence factor
      my: 0.25 + 0.12 * Math.cos(i * 0.9), // vertical influence factor
    }));

    /* === 6. SIMULATION STEP ============================ */
    const step = () => {
      const nxt = new Float32Array(simW * simH);
      // basic diffusion
      for (let y = 1; y < simH - 1; y++)
        for (let x = 1; x < simW - 1; x++) {
          const i = y * simW + x;
          nxt[i] = ((field[i - 1] + field[i + 1] + field[i - simW] + field[i + simW]) / 4 - nxt[i]) * 0.96;
        }
      const t = Date.now();
      const mx = (mouse.x - 0.5) * simW;
      const my = (mouse.y - 0.5) * simH;

      // deposit energy for each trail
      for (const tr of trails) {
        const cx = Math.sin(t * tr.f + tr.p) * simW * 0.3 + simW / 2 + mx * tr.mx;
        const cy = Math.cos(t * tr.f * 0.9 + tr.p) * simH * 0.3 + simH / 2 + my * tr.my;
        const r = TRAIL_RADIUS;
        for (let oy = -r; oy <= r; oy++)
          for (let ox = -r; ox <= r; ox++)
            if (ox * ox + oy * oy <= r * r) {
              const idx = ((cy | 0) + oy) * simW + ((cx | 0) + ox);
              if (idx >= 0 && idx < nxt.length) nxt[idx] += 1.2;
            }
      }

      // subtle logo brighten mask
      if (logoMask) {
        const logoW = Math.floor(simW * 1), logoH = Math.floor(simH * 0.7);
        for (let y = 0; y < logoH; y++)
          for (let x = 0; x < logoW; x++) {
            const u = ((x / logoW) * LOGO_BASE) | 0;
            const v = ((y / logoH) * LOGO_BASE) | 0;
            if (logoMask[v * LOGO_BASE + u]) nxt[y * simW + x] = nxt[y * simW + x] * 0.9 + 0.1;
          }
      }

      // explode scatter + redirect
      if (explode) {
        const prog = (Date.now() - explodeTime) / DISPERSE_MS;
        if (prog >= 1) { window.location.href = "https://theglitch.co"; return; }
        const maxShift = simW * 0.35 * prog;
        for (let y = 0; y < simH; y++)
          for (let x = 0; x < simW; x++) {
            const idx = y * simW + x;
            const a = Math.random() * Math.PI * 2;
            const r = Math.random() * maxShift;
            const sx = Math.min(simW - 1, Math.max(0, Math.round(x + Math.cos(a) * r)));
            const sy = Math.min(simH - 1, Math.max(0, Math.round(y + Math.sin(a) * r)));
            nxt[idx] = field[sy * simW + sx] * (1 - prog);
          }
      }

      field = nxt;
    };

    /* === 7. DRAW ====================================== */
    const bayer = [15, 135, 45, 165, 195, 75, 225, 105, 60, 180, 30, 150, 240, 120, 210, 90];
    const draw = () => {
      // 7.1 dither low-res field -> image
      const img = backCtx.createImageData(simW, simH);
      for (let i = 0; i < field.length; i++) {
        const g = Math.min(255, field[i] * 180);
        const x = i % simW, y = (i / simW) | 0;
        const c = g > bayer[(y & 3) * 4 + (x & 3)] ? 255 : 0;
        const j = i * 4;
        img.data[j] = img.data[j + 1] = img.data[j + 2] = c;
        img.data[j + 3] = 255;
      }
      backCtx.putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(backCanvas, 0, 0, canvas.width, canvas.height);

      // 7.2 circular hint after delay
      if (Date.now() >= hintStart) {
        const cx = mouse.x * canvas.width;
        const cy = mouse.y * canvas.height;
        ctx.font = "14px 'Press Start 2P', monospace";
        ctx.fillStyle = "white";
        const R = 35;
        const rot = Date.now() * 0.002;
        const n = HINT.length;
        for (let i = 0; i < n; i++) {
          const ang = (i / n) * Math.PI * 2 + rot;
          const wob = Math.sin(rot * 3 + i) * 2;
          const x = cx + (R + wob) * Math.cos(ang) - 4;
          const y = cy + (R + wob) * Math.sin(ang) - 4;
          ctx.fillText(HINT[i], x, y);
        }
      }

      // 7.3 footer NFO text
      if (showText) {
        ctx.font = `${fontSize}px 'Press Start 2P', monospace`;
        ctx.fillStyle = "white";
        const startY = canvas.height - rowH * TEXT_LINES.length - 20;
        TEXT_LINES.forEach((l, i) => ctx.fillText(l, 20, startY + i * rowH));
      }
    };

    /* === 8. MAIN LOOP + LISTENERS ===================== */
    const loop = () => { step(); draw(); requestAnimationFrame(loop); };

    const onResize = () => init();
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = e.clientY / window.innerHeight;
    });

    buildLogoMask().then(() => { init(); loop(); });

    return () => {
      document.head.removeChild(link);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("click", onClick);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full" />;
}
