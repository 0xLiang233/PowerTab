<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue';
import { SEARCH_ENGINE_LABELS } from '@/shared/constants/search';
import type { SearchEngine } from '@/shared/types/models';

const queryModel = defineModel<string>('query', { required: true });
const props = defineProps<{
  engine: SearchEngine;
  loading?: boolean;
}>();

const emit = defineEmits<{
  'update:engine': [engine: SearchEngine];
  submit: [];
  move: [direction: 1 | -1];
  activate: [];
}>();

const inputRef = useTemplateRef<HTMLInputElement>('inputRef');

onMounted(() => {
  inputRef.value?.focus();
  emit('activate');
});

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    emit('move', 1);
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault();
    emit('move', -1);
  }
  if (event.key === 'Enter') {
    event.preventDefault();
    emit('submit');
  }
}
</script>

<template>
  <div class="search-bar" @pointerdown="emit('activate')">
    <input
      ref="inputRef"
      v-model="queryModel"
      class="search-input"
      type="text"
      placeholder="Search, open a URL, or jump to an open tab"
      @focus="emit('activate')"
      @keydown="onKeydown"
    />

    <select
      class="search-engine"
      :value="props.engine"
      @focus="emit('activate')"
      @change="emit('update:engine', ($event.target as HTMLSelectElement).value as SearchEngine)"
    >
      <option v-for="(label, value) in SEARCH_ENGINE_LABELS" :key="value" :value="value">
        {{ label }}
      </option>
    </select>

    <span v-if="props.loading" class="search-loading">Matching…</span>
  </div>
</template>
