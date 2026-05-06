import { useEffect, useRef } from 'react';
import logoSvgMarkup from '../assets/gloup_blank_solo.svg?raw';

const MATRIX = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const CANVAS_SIZE = 260;
const BACKGROUND_VALUE = 5;

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

    const render = (time) => {
      if (!active) {
        return;
      }

      sceneContext.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      const maxDimension = CANVAS_SIZE * 0.84;
      const leftExtent = sourceMetrics.centerX - sourceMetrics.x;
      const rightExtent = sourceMetrics.x + sourceMetrics.width - sourceMetrics.centerX;
      const topExtent = sourceMetrics.centerY - sourceMetrics.y;
      const bottomExtent = sourceMetrics.y + sourceMetrics.height - sourceMetrics.centerY;
      const scale = Math.min(
        maxDimension / (Math.max(leftExtent, rightExtent) * 2),
        maxDimension / (Math.max(topExtent, bottomExtent) * 2),
      );
      const drawWidth = sourceMetrics.width * scale;
      const drawHeight = sourceMetrics.height * scale;
      const offsetX = CANVAS_SIZE / 2 - leftExtent * scale;
      const offsetY = CANVAS_SIZE / 2 - topExtent * scale;
      const bandCount = 7;
      const bandHeight = drawHeight / bandCount;

      sceneContext.globalAlpha = 0.98;
      for (let bandIndex = 0; bandIndex < bandCount; bandIndex += 1) {
        const srcY = sourceMetrics.y + (bandIndex / bandCount) * sourceMetrics.height;
        const srcHeight = sourceMetrics.height / bandCount;
        const destY = offsetY + bandIndex * bandHeight;
        const waveA =
          Math.sin(time * 0.0009 + bandIndex * 0.9) * 0.34 +
          Math.cos(time * 0.00047 + bandIndex * 1.7) * 0.16;
        const waveB =
          Math.sin(time * 0.00063 + bandIndex * 1.31) * 0.22;
        const bandOffsetX = offsetX + waveA + waveB;
        const bandOffsetY =
          destY +
          Math.cos(time * 0.00052 + bandIndex * 1.11) * 0.12;

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

    image.src = logoSource.url;

    return () => {
      active = false;
      window.cancelAnimationFrame(frameId);
      URL.revokeObjectURL(logoSource.url);
    };
  }, []);

  return <canvas ref={canvasRef} className="logo-canvas" aria-label="Animated Gloup Soup logo" />;
}
