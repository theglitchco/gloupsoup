import { useEffect, useRef } from "react";
import logoSrc from "./gloup_blank_solo.svg";

/**
 * Gloup‑Soup fluid canvas — v2
 * 1. CONFIG                     – constants
 * 2. DOM + FONT SETUP           – font, mask, event listeners
 * 3. RESPONSIVE FONT            – keeps NFO box fitting view
 * 4. INIT BUFFERS / RESIZE      – canvas + low‑res field
 * 5. TRAIL PARAMS               – per‑blob motion factors
 * 6. SIMULATION STEP            – diffusion, trails, logo, explode
 * 7. DRAW                       – dither, logo pulse, text fade, hint, NFO
 * 8. MAIN LOOP + LISTENERS      – resize, mouse / gyro, click
 */

export default function GloupSoupFluidMultiTrail() {
  const canvasRef = useRef(null);

  /* ========== 1. CONFIG ========== */
  const SCALE          = 0.5;
  const TRAIL_COUNT    = 4;
  const TRAIL_RADIUS   = 6;
  const LOGO_BASE      = 150;
  const TEXT_DELAY     = 500;      // text appears after 0.5 s
  const TEXT_FADE_MS   = 1200;     // fade‑in duration
  const MAX_FONT_SIZE  = 20;
  const DISPERSE_MS    = 3000;
  const HINT_DELAY_MS  = 20000;
  const MOBILE_BREAK   = 768;      // viewport width under which we treat as phone

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

  useEffect(() => {
    /* -------- 2. DOM + FONT SETUP -------- */
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap";
    document.head.appendChild(link);

    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");

    let simW, simH, field, backCanvas, backCtx;
    let logoMask = null;

    const mouse = { x: 0.5, y: 0.5 };
    const deviceTilt = { x: 0, y: 0 }; // gyro influence

    /* state timers */
    let textStart   = Date.now() + TEXT_DELAY;
    let hintStart   = Date.now() + HINT_DELAY_MS;
    let explode     = false;
    let explodeTime = 0;

    /* -------- 2.1 SVG → mask -------- */
    const buildLogoMask = () => new Promise((resolve) => {
      const img = new Image();
      img.src = logoSrc;
      img.onload = () => {
        const tmp = document.createElement("canvas");
        tmp.width = LOGO_BASE;
        tmp.height = LOGO_BASE;
        tmp.getContext("2d").drawImage(img, 0, 0, LOGO_BASE, LOGO_BASE);
        const d = tmp.getContext("2d").getImageData(0, 0, LOGO_BASE, LOGO_BASE).data;
        logoMask = new Uint8Array(LOGO_BASE * LOGO_BASE);
        for (let i = 0; i < logoMask.length; i++) logoMask[i] = d[i * 4 + 3] > 128 ? 1 : 0;
        resolve();
      };
    });

    /* -------- 3. RESPONSIVE FONT -------- */
    let fontSize = 16, rowH = 18;
    const fitFont = () => {
      const longest = TEXT_LINES.reduce((m,l)=>Math.max(m,l.length),0);
      const byW = Math.floor((window.innerWidth - 40) / (longest*0.95));
      const byH = Math.floor((window.innerHeight - 40) / (TEXT_LINES.length*1.1));
      fontSize = Math.max(10, Math.min(MAX_FONT_SIZE, Math.min(byW,byH)));
      rowH = Math.floor(fontSize*1.1);
    };

    /* -------- 4. INIT BUFFERS -------- */
    const init = () => {
      fitFont();
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      simW = Math.floor(canvas.width  * SCALE);
      simH = Math.floor(canvas.height * SCALE);
      field = new Float32Array(simW * simH);
      backCanvas = Object.assign(document.createElement("canvas"),{width:simW,height:simH});
      backCtx = backCanvas.getContext("2d");
    };

    /* -------- 5. TRAILS -------- */
    const trails = Array.from({length:TRAIL_COUNT},(_,i)=>({
      f: 0.002 + i*0.0004,
      p: Math.random()*Math.PI*2,
      mx: 0.25 + 0.12*Math.sin(i*1.3),
      my: 0.25 + 0.12*Math.cos(i*0.9)
    }));

    /* -------- 6. SIM STEP -------- */
    const step = () => {
      const nxt = new Float32Array(simW*simH);
      for(let y=1;y<simH-1;y++)
        for(let x=1;x<simW-1;x++){
          const i=y*simW+x;
          nxt[i]=((field[i-1]+field[i+1]+field[i-simW]+field[i+simW])/4-nxt[i])*0.96;
        }

      const t=Date.now();
      const mx=(mouse.x+deviceTilt.x-0.5)*simW;
      const my=(mouse.y+deviceTilt.y-0.5)*simH;

      for(const tr of trails){
        const cx=Math.sin(t*tr.f+tr.p)*simW*0.3+simW/2+mx*tr.mx;
        const cy=Math.cos(t*tr.f*0.9+tr.p)*simH*0.3+simH/2+my*tr.my;
        const r=TRAIL_RADIUS;
        for(let oy=-r;oy<=r;oy++)
          for(let ox=-r;ox<=r;ox++)
            if(ox*ox+oy*oy<=r*r){
              const idx=((cy|0)+oy)*simW+((cx|0)+ox);
              if(idx>=0&&idx<nxt.length) nxt[idx]+=1.2;
            }
      }

      // logo pulse (heartbeat)
      if(logoMask){
        const pulse=0.85+0.15*Math.sin(t*0.003); // slow pulsate
        const logoW=Math.floor(simW*0.15), logoH=Math.floor(simH*0.15);
        for(let y=0;y<logoH;y++)
          for(let x=0;x<logoW;x++){
            const u=((x/logoW)*LOGO_BASE)|0;
            const v=((y/logoH)*LOGO_BASE)|0;
            if(logoMask[v*LOGO_BASE+u]) nxt[y*simW+x]=nxt[y*simW+x]*pulse+(1-pulse);
          }
      }

      // explode scatter
      if(explode){
        const prog=(Date.now()-explodeTime)/DISPERSE_MS;
        if(prog>=1){window.location.href="https://theglitch.co";return;}
        const maxShift=simW*0.35*prog;
        for(let y=0;y<simH;y++)
          for(let x=0;x<simW;x++){
            const idx=y*simW+x;
            const a=Math.random()*Math.PI*2;
            const r=Math.random()*maxShift;
            const sx=Math.min(simW-1,Math.max(0,Math.round(x+Math.cos(a)*r)));
            const sy=Math.min(simH-1,Math.max(0,Math.round(y+Math.sin(a)*r)));
            nxt[idx]=field[sy*simW+sx]*(1-prog);
          }
      }
      field=nxt;
    };

    /* -------- 7. DRAW -------- */
    const bayer=[15,135,45,165,195,75,225,105,60,180,30,150,240,120,210,90];
    const draw = () => {
      // 7.1 dither & upscale
      const img=backCtx.createImageData(simW,simH);
      for(let i=0;i<field.length;i++){
        const g=Math.min(255,field[i]*180);
        const x=i%simW, y=(i/simW)|0;
        const c=g>bayer[(y&3)*4+(x&3)]?255:0;
        const j=i*4;
        img.data[j]=img.data[j+1]=img.data[j+2]=c;
        img.data[j+3]=255;
      }
      backCtx.putImageData(img,0,0);
      ctx.imageSmoothingEnabled=false;
      ctx.drawImage(backCanvas,0,0,canvas.width,canvas.height);

      // 7.2 orbiting hint (skip on small screens)
      if(window.innerWidth>MOBILE_BREAK && Date.now()>=hintStart){
        const cx=mouse.x*canvas.width;
        const cy=mouse.y*canvas.height;
        ctx.font="14px 'Press Start 2P', monospace";
        ctx.fillStyle="white";
        const R=35; const rot=Date.now()*0.002; const n=HINT.length;
        for(let i=0;i<n;i++){
          const ang=(i/n)*Math.PI*2+rot;
          const wob=Math.sin(rot*3+i)*2;
          const x=cx+(R+wob)*Math.cos(ang)-4;
          const y=cy+(R+wob)*Math.sin(ang)-4;
          ctx.fillText(HINT[i],x,y);
        }
      }

      // 7.3 footer text (fade + slight jitter distortion)
      if(Date.now()>=textStart){
        const fade=Math.min(1,(Date.now()-textStart)/TEXT_FADE_MS);
        ctx.font=`${fontSize}px 'Press Start 2P', monospace`;
        ctx.fillStyle="white";
        const startY=canvas.height-rowH*TEXT_LINES.length-20;
        TEXT_LINES.forEach((l,i)=>{
          // per-line horizontal jitter that eases out as fade completes
          const jitter=(1-fade)*3*Math.sin(i*1.3+Date.now()*0.01);
          ctx.globalAlpha=fade;
          ctx.fillText(l,20+jitter,startY+i*rowH);
        });
        ctx.globalAlpha=1;
      }
    };

    /* -------- 8. MAIN LOOP + LISTENERS -------- */
    const loop=()=>{step();draw();requestAnimationFrame(loop);};

    const onResize=()=>init();
    window.addEventListener("resize",onResize);
    window.addEventListener("mousemove",e=>{
      mouse.x=e.clientX/window.innerWidth;
      mouse.y=e.clientY/window.innerHeight;
    });

    // gyro for phones
    const onOrient=(e)=>{
      const gamma=e.gamma||0; // left-right (-90 to 90)
      const beta =e.beta ||0; // front-back (-180 to 180)
      deviceTilt.x = gamma/180; // normalize ~ -0.5..0.5
      deviceTilt.y = beta /180;
    };
    if(window.DeviceOrientationEvent){
      window.addEventListener("deviceorientation",onOrient);
    }

    buildLogoMask().then(()=>{init();loop();});

    return ()=>{
      document.head.removeChild(link);
      window.removeEventListener("resize",onResize);
      window.removeEventListener("deviceorientation",onOrient);
      window.removeEventListener("click",onClick);
    };
  },[]);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full" />;
}
