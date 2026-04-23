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
    <label class="search-input-shell">
      <span class="search-input-shell__icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <input
        ref="inputRef"
        v-model="queryModel"
        class="search-input"
        type="text"
        placeholder="Search, open a URL, or jump to an open tab"
        @focus="emit('activate')"
        @keydown="onKeydown"
      />
      <span v-if="props.loading" class="search-loading">Matching…</span>
    </label>

    <div class="search-engine-shell">
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
      <span class="search-engine-shell__chevron" aria-hidden="true">⌄</span>
    </div>
  </div>
</template>
