<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { QuickApp } from '@/shared/types/models';
import { useI18n } from '@/shared/i18n';

const props = defineProps<{
  modelValue: boolean;
  editing?: QuickApp | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  save: [value: { name: string; url: string; iconMode: 'favicon' | 'default' }];
}>();

const form = reactive({
  name: '',
  url: '',
  iconMode: 'favicon' as 'favicon' | 'default',
});
const { t } = useI18n();

watch(
  () => props.editing,
  (editing) => {
    form.name = editing?.name ?? '';
    form.url = editing?.url ?? '';
    form.iconMode = editing?.iconMode ?? 'favicon';
  },
  { immediate: true },
);

function close() {
  emit('update:modelValue', false);
}

function submit() {
  emit('save', {
    name: form.name,
    url: form.url,
    iconMode: form.iconMode,
  });
  close();
}
</script>

<template>
  <div v-if="modelValue" class="quick-app-editor__backdrop" @click.self="close">
    <div class="quick-app-editor">
      <h3>{{ editing ? t('quickApps.editTitle') : t('quickApps.addTitle') }}</h3>
      <label>
        {{ t('quickApps.name') }}
        <input v-model="form.name" type="text" />
      </label>
      <label>
        {{ t('quickApps.url') }}
        <input v-model="form.url" type="text" />
      </label>
      <label>
        {{ t('quickApps.icon') }}
        <select v-model="form.iconMode">
          <option value="favicon">{{ t('quickApps.useFavicon') }}</option>
          <option value="default">{{ t('quickApps.useDefaultIcon') }}</option>
        </select>
      </label>
      <div class="quick-app-editor__actions">
        <button type="button" @click="close">{{ t('common.cancel') }}</button>
        <button type="button" @click="submit">{{ t('common.save') }}</button>
      </div>
    </div>
  </div>
</template>
