<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { QuickApp } from '@/shared/types/models';

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
      <h3>{{ editing ? 'Edit Quick App' : 'Add Quick App' }}</h3>
      <label>
        Name
        <input v-model="form.name" type="text" />
      </label>
      <label>
        URL
        <input v-model="form.url" type="text" />
      </label>
      <label>
        Icon
        <select v-model="form.iconMode">
          <option value="favicon">Use favicon</option>
          <option value="default">Use default icon</option>
        </select>
      </label>
      <div class="quick-app-editor__actions">
        <button type="button" @click="close">Cancel</button>
        <button type="button" @click="submit">Save</button>
      </div>
    </div>
  </div>
</template>
