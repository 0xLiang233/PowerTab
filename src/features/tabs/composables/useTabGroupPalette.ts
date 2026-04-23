import { computed, onMounted, shallowRef, toValue, watchEffect } from 'vue';
import type { CSSProperties, MaybeRefOrGetter } from 'vue';
import { extractImagePalette, getFallbackPalette } from '@/shared/utils/extractImagePalette';

export function useTabGroupPalette(options: {
  faviconUrl: MaybeRefOrGetter<string | undefined>;
  seed: MaybeRefOrGetter<string>;
}) {
  const style = computed<CSSProperties>(() => {
    const seed = toValue(options.seed);
    const faviconUrl = toValue(options.faviconUrl);
    const fallback = paletteStore.value.get(cacheKey(seed, faviconUrl)) ?? getFallbackPalette(seed);

    return {
      '--group-card-bg': fallback.background,
      '--group-card-bg-strong': fallback.backgroundStrong,
      '--group-card-border': fallback.border,
      '--group-card-accent': fallback.accent,
      '--group-card-row-bg': fallback.rowBackground,
      '--group-card-row-border': fallback.rowBorder,
      '--group-card-glow': fallback.glow,
    } as CSSProperties;
  });

  async function ensurePalette() {
    const seed = toValue(options.seed);
    const faviconUrl = toValue(options.faviconUrl);
    const key = cacheKey(seed, faviconUrl);
    if (paletteStore.value.has(key)) return;

    const palette = faviconUrl ? await extractImagePalette(faviconUrl, seed) : getFallbackPalette(seed);
    paletteStore.value.set(key, palette);
    paletteStore.value = new Map(paletteStore.value);
  }

  onMounted(() => {
    void ensurePalette();
  });

  watchEffect(() => {
    void ensurePalette();
  });

  return {
    style,
  };
}

const paletteStore = shallowRef(new Map<string, Awaited<ReturnType<typeof extractImagePalette>>>());

function cacheKey(seed: string, faviconUrl: string | undefined) {
  return `${seed}::${faviconUrl ?? 'fallback'}`;
}
