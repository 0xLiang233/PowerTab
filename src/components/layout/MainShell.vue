<script setup lang="ts">
const emit = defineEmits<{
  'open-settings': [];
}>();
</script>

<template>
  <main class="main-shell">
    <header class="hero">
      <div class="hero__brand-row">
        <div class="hero__brand-mark" aria-hidden="true">⚡</div>
        <div class="hero__brand-copy">
          <div class="hero__title-row">
            <p class="hero__eyebrow">Power Tab</p>
            <h1>Keep your open tabs useful.</h1>
          </div>
          <p class="hero__subtitle">
            Reuse what is already open, launch what you need next, and clear the rest.
          </p>
        </div>
      </div>
      <button
        type="button"
        class="hero__settings"
        title="Open settings"
        aria-label="Open settings"
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
