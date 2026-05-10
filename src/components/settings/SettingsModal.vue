<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue';
import { LANGUAGE_LABELS } from '@/shared/i18n/messages';
import { useI18n } from '@/shared/i18n';
import type { Language, StylePreset } from '@/shared/types/models';

const props = defineProps<{
  modelValue: boolean;
  enableTabSwitcher: boolean;
  stylePreset: StylePreset;
  language: Language;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'update:enable-tab-switcher': [value: boolean];
  'update:style-preset': [value: StylePreset];
  'update:language': [value: Language];
}>();

const { t } = useI18n();

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
          <p class="settings-modal__eyebrow">{{ t('settings.title') }}</p>
          <h2 id="settings-modal-title">{{ t('settings.title') }}</h2>
        </div>
        <button type="button" class="tab-action-icon" :title="t('settings.close')" :aria-label="t('settings.close')" @click="close">
          ×
        </button>
      </div>

      <section class="settings-group">
        <div class="settings-group__header">
          <h3>{{ t('settings.appearance.title') }}</h3>
          <p>{{ t('settings.appearance.description') }}</p>
        </div>

        <label class="settings-field">
          <span class="settings-field__label">{{ t('settings.stylePreset.label') }}</span>
          <span class="settings-field__description">{{ t('settings.stylePreset.description') }}</span>
          <select
            class="settings-select"
            :value="stylePreset"
            @change="emit('update:style-preset', ($event.target as HTMLSelectElement).value as StylePreset)"
          >
            <option value="mock-v1">{{ t('settings.stylePreset.mockV1') }}</option>
            <option value="classic">{{ t('settings.stylePreset.classic') }}</option>
          </select>
        </label>

        <label class="settings-field">
          <span class="settings-field__label">{{ t('settings.language.label') }}</span>
          <span class="settings-field__description">{{ t('settings.language.description') }}</span>
          <select
            class="settings-select"
            :value="language"
            @change="emit('update:language', ($event.target as HTMLSelectElement).value as Language)"
          >
            <option v-for="(label, value) in LANGUAGE_LABELS" :key="value" :value="value">
              {{ label }}
            </option>
          </select>
        </label>
      </section>

      <section class="settings-group">
        <div class="settings-group__header">
          <h3>{{ t('settings.tabs.title') }}</h3>
          <p>{{ t('settings.tabs.description') }}</p>
        </div>

        <label class="settings-toggle">
          <div class="settings-toggle__content">
            <span class="settings-toggle__title">{{ t('settings.quickSwitcher.title') }}</span>
            <span class="settings-toggle__description">
              {{ t('settings.quickSwitcher.description') }}
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
