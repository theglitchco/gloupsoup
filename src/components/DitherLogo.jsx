import { useEffect, useRef } from 'react';
import logoSvgMarkup from '../assets/gloup_blank_solo.svg?raw';

const MATRIX = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const CANVAS_SIZE = 1260;
const BACKGROUND_VALUE = 5;
const CANVAS_EXPANSION = 3.75;
const SHRINK_STEP = 0.025;
const MIN_SHRINK_SCALE = 0.4;

function buildLogoSource(svgMarkup) {
  const parser = new DOMParser();
  const document = parser.parseFromString(svgMarkup, 'image/svg+xml');
  const svg = document.documentElement;
  const viewBox = svg.getAttribute('viewBox')?.trim().split(/[\s,]+/).map(Number) ?? [];
  const [, , viewBoxWidth = 512, viewBoxHeight = 512] = viewBox;

  if (!svg.getAttribute('width')) {
    svg.setAttribute('width', String(viewBoxWidth));
  }

  if (!svg.getAttribute('height')) {
    svg.setAttribute('height', String(viewBoxHeight));
  }

  if (!svg.getAttribute('preserveAspectRatio')) {
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  }

  const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  return {
    height: viewBoxHeight,
    url,
    width: viewBoxWidth,
  };
}

export default function DitherLogo() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { alpha: false });
    const sceneCanvas = document.createElement('canvas');
    const sceneContext = sceneCanvas.getContext('2d', { willReadFrequently: true });
    const image = new Image();
    const logoSource = buildLogoSource(logoSvgMarkup);

    let frameId = 0;
    let active = true;
    let sourceMetrics = null;
    let comets = [];
    let explosions = [];
    let nextCometId = 0;
    let shrinkCount = 0;

    const getCometPose = (comet, time, orbitRadius) => {
      const elapsed = Math.max(0, time - comet.bornAt);
      const launchProgress = Math.min(elapsed / comet.launchDuration, 1);
      const launchEase = 1 - (1 - launchProgress) ** 3;
      const meanAnomaly =
        comet.startAngle +
        comet.direction * elapsed * comet.angularVelocity +
        Math.sin(elapsed * comet.phaseDriftSpeed + comet.phase) * 0.08;
      const eccentricity = comet.eccentricity;
      const eccentricAnomaly =
        meanAnomaly +
        eccentricity * Math.sin(meanAnomaly) * (1 + eccentricity * Math.cos(meanAnomaly));
      const semiMajor = orbitRadius * comet.orbitScale + comet.radiusOffset;
      const semiMinor = semiMajor * Math.sqrt(1 - eccentricity * eccentricity);
      const orbitalX = semiMajor * (Math.cos(eccentricAnomaly) - eccentricity);
      const orbitalY = semiMinor * Math.sin(eccentricAnomaly);
      const argumentOfPeriapsis =
        comet.periapsisAngle + elapsed * comet.precessionSpeed + Math.sin(elapsed * 0.00041 + comet.phase) * 0.06;
      const rotatedX =
        orbitalX * Math.cos(argumentOfPeriapsis) - orbitalY * Math.sin(argumentOfPeriapsis);
      const rotatedY =
        orbitalX * Math.sin(argumentOfPeriapsis) + orbitalY * Math.cos(argumentOfPeriapsis);
      const worldX =
        rotatedX +
        Math.sin(elapsed * comet.driftSpeedA + comet.phase) * comet.driftAmountA;
      const planarY =
        rotatedY +
        Math.cos(elapsed * comet.driftSpeedB + comet.phase * 0.7) * comet.driftAmountB;
      const worldY =
        planarY * Math.cos(comet.inclination) +
        Math.cos(elapsed * comet.verticalSpeed + comet.phase) * comet.verticalAmplitude;
      const z =
        planarY * Math.sin(comet.inclination) +
        Math.sin(elapsed * comet.depthSpeed + comet.phase) * comet.depthWobble;
      const nearPlane = 26;
      const safeDenominator = Math.max(nearPlane, comet.focalLength - z);
      const perspective = comet.focalLength / safeDenominator;
      const x = worldX * perspective * launchEase;
      const y = worldY * perspective * launchEase;
      const depthRange = semiMajor * Math.sin(comet.inclination) + comet.depthWobble;
      const depth = Math.min(1, Math.max(0, (z + depthRange) / (depthRange * 2)));
      const scale = (0.44 + depth * 0.92) * perspective;
      const visibility = Math.min(1, Math.max(0.22, (comet.focalLength - z) / 96));

      return {
        angle: argumentOfPeriapsis + eccentricAnomaly,
        depth,
        perspective,
        scale,
        visibility,
        x,
        y,
        z,
      };
    };

    const spawnExplosion = (x, y, scale, createdAt) => {
      explosions = [
        ...explosions,
        {
          createdAt,
          particles: Array.from({ length: 8 }, (_, index) => ({
            angle: (Math.PI * 2 * index) / 8 + Math.random() * 0.35,
            distance: 8 + Math.random() * 10,
            scale: 0.6 + Math.random() * 0.6,
          })),
          scale,
          x,
          y,
        },
      ];
    };

    const spawnComet = () => {
      const now = performance.now();

      if (1 - shrinkCount * SHRINK_STEP > MIN_SHRINK_SCALE) {
        shrinkCount += 1;
      }

      if (comets.length >= 10) {
        const [expiredComet, ...remainingComets] = comets;
        const expiredPose = getCometPose(expiredComet, now, CANVAS_SIZE * 0.48);
        spawnExplosion(expiredPose.x, expiredPose.y, expiredPose.scale, now);
        comets = remainingComets;
      }

      comets = [
        ...comets,
        {
          angularVelocity: 0.00135 + Math.random() * 0.00075,
          bornAt: now,
          depthSpeed: 0.00065 + Math.random() * 0.00035,
          depthWobble: 1.5 + Math.random() * 3.5,
          driftAmountA: 2 + Math.random() * 4,
          driftAmountB: 1 + Math.random() * 3,
          driftSpeedA: 0.0007 + Math.random() * 0.0006,
          driftSpeedB: 0.0009 + Math.random() * 0.0008,
          direction: Math.random() > 0.5 ? 1 : -1,
          eccentricity: 0.16 + Math.random() * 0.28,
          focalLength: 156 + Math.random() * 28,
          id: nextCometId,
          inclination: 0.52 + Math.random() * 0.34,
          launchDuration: 680 + Math.random() * 220,
          orbitScale: 0.96 + Math.random() * 0.14,
          phase: Math.random() * Math.PI * 2,
          periapsisAngle: Math.random() * Math.PI * 2,
          phaseDriftSpeed: 0.00045 + Math.random() * 0.00035,
          precessionSpeed: (Math.random() - 0.5) * 0.00018,
          radiusOffset: Math.random() * 12 - 6,
          startAngle: -Math.PI / 2 + (Math.random() - 0.5) * 0.28,
          tilt: (Math.random() - 0.5) * 0.32,
          verticalAmplitude: 0.8 + Math.random() * 1.8,
          verticalSpeed: 0.00055 + Math.random() * 0.00035,
        },
      ];
      nextCometId += 1;
    };

    const handleKeyDown = (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }

      event.preventDefault();
      spawnComet();
    };

    const extractSourceBounds = () => {
      const sampleCanvas = document.createElement('canvas');
      const sampleSize = 512;
      const padding = 24;
      const sourceWidth = logoSource.width;
      const sourceHeight = logoSource.height;
      sampleCanvas.width = sampleSize;
      sampleCanvas.height = sampleSize;
      const sampleContext = sampleCanvas.getContext('2d', { willReadFrequently: true });
      sampleContext.clearRect(0, 0, sampleSize, sampleSize);
      sampleContext.drawImage(image, 0, 0, sampleSize, sampleSize);

      const pixels = sampleContext.getImageData(0, 0, sampleSize, sampleSize).data;
      let minX = sampleSize;
      let minY = sampleSize;
      let maxX = 0;
      let maxY = 0;

      for (let y = 0; y < sampleSize; y += 1) {
        for (let x = 0; x < sampleSize; x += 1) {
          const alpha = pixels[(y * sampleSize + x) * 4 + 3];
          if (alpha < 3) {
            continue;
          }
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }

      minX = Math.max(0, minX - padding);
      minY = Math.max(0, minY - padding);
      maxX = Math.min(sampleSize - 1, maxX + padding);
      maxY = Math.min(sampleSize - 1, maxY + padding);

      const boundsX = (minX / sampleSize) * sourceWidth;
      const boundsY = (minY / sampleSize) * sourceHeight;
      const boundsWidth = ((maxX - minX + 1) / sampleSize) * sourceWidth;
      const boundsHeight = ((maxY - minY + 1) / sampleSize) * sourceHeight;

      sourceMetrics = {
        x: boundsX,
        y: boundsY,
        width: boundsWidth,
        height: boundsHeight,
        centerX: boundsX + boundsWidth / 2,
        centerY: boundsY + boundsHeight / 2,
      };
    };

    const ditherScene = () => {
      const imageData = sceneContext.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      const pixels = imageData.data;

      for (let y = 0; y < CANVAS_SIZE; y += 1) {
        for (let x = 0; x < CANVAS_SIZE; x += 1) {
          const pixelIndex = (y * CANVAS_SIZE + x) * 4;
          const alpha = pixels[pixelIndex + 3] / 255;

          if (alpha < 0.025) {
            pixels[pixelIndex] = BACKGROUND_VALUE;
            pixels[pixelIndex + 1] = BACKGROUND_VALUE;
            pixels[pixelIndex + 2] = BACKGROUND_VALUE;
            pixels[pixelIndex + 3] = 255;
            continue;
          }

          const luminance = pixels[pixelIndex] * alpha;
          const threshold = MATRIX[y % 4][x % 4] * 14;
          const on = luminance > threshold ? 255 : BACKGROUND_VALUE;
          pixels[pixelIndex] = on;
          pixels[pixelIndex + 1] = on;
          pixels[pixelIndex + 2] = on;
          pixels[pixelIndex + 3] = 255;
        }
      }

      context.putImageData(imageData, 0, 0);
    };

    const drawComet = (comet, time, centerX, centerY, orbitRadius) => {
      const pose = getCometPose(comet, time, orbitRadius);
      const headRadius = Math.min(11, 2.15 + pose.scale * 1.85);
      const trailOpacity = (0.18 + pose.depth * 0.38) * pose.visibility;

      sceneContext.save();
      sceneContext.translate(centerX, centerY);
      sceneContext.rotate(comet.tilt);
      sceneContext.lineCap = 'round';
      sceneContext.lineJoin = 'round';

      for (let index = 0; index < 16; index += 1) {
        const sampleTime = time - index * 42;
        if (sampleTime < comet.bornAt) {
          continue;
        }

        const current = getCometPose(comet, sampleTime, orbitRadius);
        const next = getCometPose(comet, Math.max(comet.bornAt, sampleTime - 42), orbitRadius);
        const segmentFade = (1 - index / 16) * trailOpacity;
        sceneContext.strokeStyle = `rgba(255, 255, 255, ${segmentFade})`;
        sceneContext.lineWidth = Math.min(8.5, Math.max(1.15, headRadius * (1 - index / 18)));
        sceneContext.beginPath();
        sceneContext.moveTo(current.x, current.y);
        sceneContext.lineTo(next.x, next.y);
        sceneContext.stroke();
      }

      const headGradient = sceneContext.createRadialGradient(
        pose.x - headRadius * 0.35,
        pose.y - headRadius * 0.45,
        headRadius * 0.2,
        pose.x,
        pose.y,
        headRadius * 1.35,
      );
      headGradient.addColorStop(0, `rgba(255, 255, 255, ${pose.visibility})`);
      headGradient.addColorStop(0.35, `rgba(228, 228, 228, ${0.98 * pose.visibility})`);
      headGradient.addColorStop(0.72, `rgba(132, 132, 132, ${0.94 * pose.visibility})`);
      headGradient.addColorStop(1, 'rgba(34, 34, 34, 0)');
      sceneContext.fillStyle = headGradient;
      sceneContext.beginPath();
      sceneContext.arc(pose.x, pose.y, headRadius, 0, Math.PI * 2);
      sceneContext.fill();

      sceneContext.fillStyle = `rgba(255, 255, 255, ${(0.84 + pose.depth * 0.1) * pose.visibility})`;
      sceneContext.beginPath();
      sceneContext.arc(
        pose.x - headRadius * 0.22,
        pose.y - headRadius * 0.3,
        Math.max(0.9, headRadius * 0.24),
        0,
        Math.PI * 2,
      );
      sceneContext.fill();
      sceneContext.restore();
    };

    const drawExplosions = (time, centerX, centerY) => {
      explosions = explosions.filter((explosion) => time - explosion.createdAt < 520);

      for (const explosion of explosions) {
        const progress = Math.min((time - explosion.createdAt) / 520, 1);
        const fade = 1 - progress;

        sceneContext.save();
        sceneContext.translate(centerX + explosion.x, centerY + explosion.y);
        sceneContext.strokeStyle = `rgba(255, 255, 255, ${fade * 0.65})`;
        sceneContext.lineWidth = 1.3;

        for (const particle of explosion.particles) {
          const distance = particle.distance * progress * explosion.scale;
          const x = Math.cos(particle.angle) * distance;
          const y = Math.sin(particle.angle) * distance * 0.7;
          sceneContext.beginPath();
          sceneContext.moveTo(x * 0.42, y * 0.42);
          sceneContext.lineTo(x, y);
          sceneContext.stroke();
        }

        sceneContext.restore();
      }
    };

    const drawLogoBands = (time, bandCount, bandHeight, drawWidth, offsetX, offsetY) => {
      sceneContext.globalAlpha = 0.98;
      for (let bandIndex = 0; bandIndex < bandCount; bandIndex += 1) {
        const srcY = sourceMetrics.y + (bandIndex / bandCount) * sourceMetrics.height;
        const srcHeight = sourceMetrics.height / bandCount;
        const destY = offsetY + bandIndex * bandHeight;
        const waveA =
          Math.sin(time * 0.0009 + bandIndex * 0.9) * 0.34 +
          Math.cos(time * 0.00047 + bandIndex * 1.7) * 0.16;
        const waveB = Math.sin(time * 0.00063 + bandIndex * 1.31) * 0.22;
        const bandOffsetX = offsetX + waveA + waveB;
        const bandOffsetY = destY + Math.cos(time * 0.00052 + bandIndex * 1.11) * 0.12;

        sceneContext.drawImage(
          image,
          sourceMetrics.x,
          srcY,
          sourceMetrics.width,
          srcHeight,
          bandOffsetX,
          bandOffsetY,
          drawWidth,
          bandHeight + 0.6,
        );
      }
    };

    const render = (time) => {
      if (!active) {
        return;
      }

      sceneContext.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      const shrinkScale = Math.max(MIN_SHRINK_SCALE, 1 - shrinkCount * SHRINK_STEP);
      const maxDimension = CANVAS_SIZE * (0.84 / CANVAS_EXPANSION);
      const leftExtent = sourceMetrics.centerX - sourceMetrics.x;
      const rightExtent = sourceMetrics.x + sourceMetrics.width - sourceMetrics.centerX;
      const topExtent = sourceMetrics.centerY - sourceMetrics.y;
      const bottomExtent = sourceMetrics.y + sourceMetrics.height - sourceMetrics.centerY;
      const scale = Math.min(
        maxDimension / (Math.max(leftExtent, rightExtent) * 2),
        maxDimension / (Math.max(topExtent, bottomExtent) * 2),
      );
      const orbitWidth = sourceMetrics.width * scale;
      const orbitHeight = sourceMetrics.height * scale;
      const drawWidth = orbitWidth * shrinkScale;
      const drawHeight = orbitHeight * shrinkScale;
      const offsetX = CANVAS_SIZE / 2 - leftExtent * scale * shrinkScale;
      const offsetY = CANVAS_SIZE / 2 - topExtent * scale * shrinkScale;
      const centerX = CANVAS_SIZE / 2;
      const centerY = CANVAS_SIZE / 2 - drawHeight * 0.075;
      const bandCount = 7;
      const bandHeight = drawHeight / bandCount;
      const orbitRadius = Math.max(orbitWidth, orbitHeight) * 0.49;
      const cometLayers = comets.map((comet) => ({
        comet,
        pose: getCometPose(comet, time, orbitRadius),
      }));
      const backComets = cometLayers.filter(({ pose }) => pose.z < 0);
      const frontComets = cometLayers.filter(({ pose }) => pose.z >= 0);

      for (const { comet } of backComets) {
        drawComet(comet, time, centerX, centerY, orbitRadius);
      }

      drawLogoBands(time, bandCount, bandHeight, drawWidth, offsetX, offsetY);

      for (const { comet } of frontComets) {
        drawComet(comet, time, centerX, centerY, orbitRadius);
      }

      drawExplosions(time, centerX, centerY);
      ditherScene();
      frameId = window.requestAnimationFrame(render);
    };

    image.onload = () => {
      canvas.width = CANVAS_SIZE;
      canvas.height = CANVAS_SIZE;
      sceneCanvas.width = CANVAS_SIZE;
      sceneCanvas.height = CANVAS_SIZE;
      context.imageSmoothingEnabled = false;
      sceneContext.imageSmoothingEnabled = true;
      extractSourceBounds();
      render(0);
    };

    canvas.addEventListener('click', spawnComet);
    canvas.addEventListener('keydown', handleKeyDown);
    image.src = logoSource.url;

    return () => {
      active = false;
      canvas.removeEventListener('click', spawnComet);
      canvas.removeEventListener('keydown', handleKeyDown);
      window.cancelAnimationFrame(frameId);
      URL.revokeObjectURL(logoSource.url);
    };
  }, []);

  return (
    <div className="logo-stage">
      <canvas
        ref={canvasRef}
        className="logo-canvas"
        aria-label="Animated Gloup Soup logo"
        role="button"
        tabIndex={0}
      />
    </div>
  );
}
