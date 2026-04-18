<script setup lang="ts">
const emit = defineEmits<{
  'open-settings': [];
}>();
</script>

<template>
  <main class="main-shell">
    <header class="hero">
      <div>
        <p class="hero__eyebrow">Power Tab</p>
        <h1>Keep your open tabs useful.</h1>
        <p class="hero__subtitle">
          Reuse what is already open, launch what you need next, and clear the rest.
        </p>
      </div>
      <button
        type="button"
        class="hero__settings"
        title="Open settings"
        aria-label="Open settings"
        @click="emit('open-settings')"
      >
        ⚙
      </button>
    </header>

    <section class="main-shell__search">
      <slot name="search" />
    </section>

    <section class="main-shell__quick-apps">
      <slot name="quick-apps" />
    </section>

    <section class="main-shell__tabs">
      <slot name="tabs" />
    </section>
  </main>
</template>
