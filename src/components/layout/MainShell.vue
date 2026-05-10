<script setup lang="ts">
import { useI18n } from '@/shared/i18n';

const emit = defineEmits<{
  'open-settings': [];
}>();

const { t } = useI18n();
</script>

<template>
  <main class="main-shell">
    <header class="hero">
      <div class="hero__brand-row">
        <div class="hero__brand-mark" aria-hidden="true">⚡</div>
        <div class="hero__brand-copy">
          <div class="hero__title-row">
            <p class="hero__eyebrow">Power Tab</p>
            <h1>{{ t('app.tagline') }}</h1>
          </div>
          <p class="hero__subtitle">
            {{ t('app.subtitle') }}
          </p>
        </div>
      </div>
      <button
        type="button"
        class="hero__settings"
        :title="t('settings.open')"
        :aria-label="t('settings.open')"
        @click="emit('open-settings')"
      >
        <span class="hero__settings-icon" aria-hidden="true">⚙</span>
      </button>
    </header>

    <section class="main-shell__quick-apps">
      <slot name="quick-apps" />
    </section>

    <section class="main-shell__tabs">
      <slot name="tabs" />
    </section>
  </main>
</template>
