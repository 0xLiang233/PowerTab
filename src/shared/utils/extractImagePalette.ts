export interface ImagePalette {
  background: string;
  backgroundStrong: string;
  border: string;
  accent: string;
  rowBackground: string;
  rowBorder: string;
  glow: string;
}

const paletteCache = new Map<string, Promise<ImagePalette>>();

const FALLBACK_PALETTES: ImagePalette[] = [
  createPaletteFromColor(252, 189, 153),
  createPaletteFromColor(178, 224, 205),
  createPaletteFromColor(185, 197, 255),
  createPaletteFromColor(203, 190, 255),
  createPaletteFromColor(255, 220, 169),
  createPaletteFromColor(191, 224, 255),
];

export function getFallbackPalette(seed: string): ImagePalette {
  const hash = hashString(seed || 'power-tab');
  return FALLBACK_PALETTES[Math.abs(hash) % FALLBACK_PALETTES.length];
}

export function extractImagePalette(imageUrl: string, seed = imageUrl): Promise<ImagePalette> {
  if (!imageUrl) {
    return Promise.resolve(getFallbackPalette(seed));
  }

  const cacheKey = `${seed}::${imageUrl}`;
  const cached = paletteCache.get(cacheKey);
  if (cached) return cached;

  const pending = loadPalette(imageUrl, seed).catch(() => getFallbackPalette(seed));
  paletteCache.set(cacheKey, pending);
  return pending;
}

async function loadPalette(imageUrl: string, seed: string): Promise<ImagePalette> {
  const image = await loadImage(imageUrl);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    return getFallbackPalette(seed);
  }

  const sampleSize = 32;
  canvas.width = sampleSize;
  canvas.height = sampleSize;
  context.clearRect(0, 0, sampleSize, sampleSize);
  context.drawImage(image, 0, 0, sampleSize, sampleSize);

  const { data } = context.getImageData(0, 0, sampleSize, sampleSize);

  let weightedR = 0;
  let weightedG = 0;
  let weightedB = 0;
  let totalWeight = 0;

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3] / 255;
    if (alpha < 0.15) continue;

    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];

    const { saturation, lightness } = rgbToHsl(red, green, blue);
    const vividnessWeight = 0.45 + saturation * 0.9 + (1 - Math.abs(lightness - 0.55));
    const weight = alpha * vividnessWeight;

    weightedR += red * weight;
    weightedG += green * weight;
    weightedB += blue * weight;
    totalWeight += weight;
  }

  if (totalWeight < 1) {
    return getFallbackPalette(seed);
  }

  const red = weightedR / totalWeight;
  const green = weightedG / totalWeight;
  const blue = weightedB / totalWeight;
  return createPaletteFromColor(red, green, blue);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    image.referrerPolicy = 'no-referrer';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load image: ${src}`));
    image.src = src;
  });
}

function createPaletteFromColor(red: number, green: number, blue: number): ImagePalette {
  const { hue, saturation, lightness } = rgbToHsl(red, green, blue);
  const adjustedHue = Number.isFinite(hue) ? hue : 245;
  const adjustedSaturation = clamp(saturation * 0.5 + 0.12, 0.18, 0.45);
  const adjustedLightness = clamp(lightness * 0.15 + 0.94, 0.93, 0.97);

  const bg = hslToRgb(adjustedHue, adjustedSaturation, adjustedLightness);
  const bgStrong = hslToRgb(adjustedHue - 6, clamp(adjustedSaturation * 0.9, 0.15, 0.4), clamp(adjustedLightness - 0.02, 0.91, 0.95));
  const border = hslToRgb(adjustedHue, clamp(adjustedSaturation * 0.4, 0.08, 0.2), clamp(adjustedLightness - 0.05, 0.85, 0.92));
  const accent = hslToRgb(adjustedHue, clamp(adjustedSaturation * 1.1, 0.35, 0.65), clamp(adjustedLightness - 0.35, 0.45, 0.65));
  const rowBackground = hslToRgb(adjustedHue, clamp(adjustedSaturation * 0.1, 0, 0.05), 1);
  const rowBorder = hslToRgb(adjustedHue, clamp(adjustedSaturation * 0.1, 0.02, 0.08), 0.96);
  const glow = hslToRgb(adjustedHue - 15, clamp(adjustedSaturation * 0.7, 0.15, 0.35), clamp(adjustedLightness + 0.01, 0.94, 0.99));

  return {
    background: toRgba(bg, 0.6),
    backgroundStrong: toRgba(bgStrong, 0.75),
    border: toRgba(border, 0.2),
    accent: toRgba(accent, 0.95),
    rowBackground: toRgba(rowBackground, 1),
    rowBorder: toRgba(rowBorder, 0.25),
    glow: toRgba(glow, 0.3),
  };
}

function rgbToHsl(red: number, green: number, blue: number) {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const lightness = (max + min) / 2;

  if (delta === 0) {
    return { hue: 0, saturation: 0, lightness };
  }

  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue = 0;

  switch (max) {
    case r:
      hue = ((g - b) / delta) % 6;
      break;
    case g:
      hue = (b - r) / delta + 2;
      break;
    default:
      hue = (r - g) / delta + 4;
      break;
  }

  hue *= 60;
  if (hue < 0) hue += 360;
  return { hue, saturation, lightness };
}

function hslToRgb(hue: number, saturation: number, lightness: number) {
  const normalizedHue = ((hue % 360) + 360) % 360;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs(((normalizedHue / 60) % 2) - 1));
  const m = lightness - chroma / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (normalizedHue < 60) {
    r = chroma;
    g = x;
  } else if (normalizedHue < 120) {
    r = x;
    g = chroma;
  } else if (normalizedHue < 180) {
    g = chroma;
    b = x;
  } else if (normalizedHue < 240) {
    g = x;
    b = chroma;
  } else if (normalizedHue < 300) {
    r = x;
    b = chroma;
  } else {
    r = chroma;
    b = x;
  }

  return {
    red: Math.round((r + m) * 255),
    green: Math.round((g + m) * 255),
    blue: Math.round((b + m) * 255),
  };
}

function toRgba(color: { red: number; green: number; blue: number }, alpha: number) {
  return `rgba(${color.red}, ${color.green}, ${color.blue}, ${alpha})`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return hash;
}
