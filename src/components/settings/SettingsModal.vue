<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue';

const props = defineProps<{
  modelValue: boolean;
  enableTabSwitcher: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'update:enable-tab-switcher': [value: boolean];
}>();

function close() {
  emit('update:modelValue', false);
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close();
  }
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeydown);
      return;
    }
    document.removeEventListener('keydown', handleKeydown);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div v-if="modelValue" class="settings-modal__backdrop" @click.self="close">
    <div class="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-modal-title">
      <div class="settings-modal__header">
        <div>
          <p class="settings-modal__eyebrow">Settings</p>
          <h2 id="settings-modal-title">Settings</h2>
        </div>
        <button type="button" class="tab-action-icon" title="Close settings" aria-label="Close settings" @click="close">
          ×
        </button>
      </div>

      <section class="settings-group">
        <div class="settings-group__header">
          <h3>Tabs</h3>
          <p>Configure how tab-related features behave across the extension.</p>
        </div>

        <label class="settings-toggle">
          <div class="settings-toggle__content">
            <span class="settings-toggle__title">Enable Quick Tab Switcher</span>
            <span class="settings-toggle__description">
              Show a keyboard-driven tab switcher overlay on supported pages when the extension shortcut is triggered.
            </span>
          </div>
          <input
            :checked="enableTabSwitcher"
            type="checkbox"
            @change="emit('update:enable-tab-switcher', ($event.target as HTMLInputElement).checked)"
          />
        </label>
      </section>
    </div>
  </div>
</template>
