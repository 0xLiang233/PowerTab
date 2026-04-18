<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useTemplateRef } from 'vue';
import SearchBar from '@/components/search/SearchBar.vue';
import SearchCandidates from '@/components/search/SearchCandidates.vue';
import type { SearchCandidate, SearchEngine } from '@/shared/types/models';

const props = defineProps<{
  query: string;
  engine: SearchEngine;
  loading?: boolean;
  groups: Array<{ label: string; items: SearchCandidate[] }>;
  highlightedIndex: number;
}>();

const emit = defineEmits<{
  'update:query': [value: string];
  'update:engine': [engine: SearchEngine];
  move: [direction: 1 | -1];
  submit: [];
  select: [index: number];
}>();

const rootRef = useTemplateRef<HTMLElement>('rootRef');
const isExpanded = ref(true);

const query = computed({
  get: () => props.query,
  set: (value: string) => emit('update:query', value),
});

const showCandidates = computed(() => isExpanded.value && props.groups.length > 0);

function expand() {
  isExpanded.value = true;
}

function collapseOnOutsidePointer(event: PointerEvent) {
  const root = rootRef.value;
  const target = event.target;
  if (!(target instanceof Node) || !root) return;
  if (!root.contains(target)) {
    isExpanded.value = false;
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', collapseOnOutsidePointer);
});

onUnmounted(() => {
  document.removeEventListener('pointerdown', collapseOnOutsidePointer);
});
</script>

<template>
  <section ref="rootRef" class="search-section" :class="{ 'search-section--expanded': isExpanded }">
    <SearchBar
      v-model:query="query"
      :engine="engine"
      :loading="loading"
      @activate="expand"
      @update:engine="emit('update:engine', $event)"
      @move="emit('move', $event)"
      @submit="emit('submit')"
    />

    <div v-if="showCandidates" class="search-section__overlay">
      <SearchCandidates
        :groups="groups"
        :highlighted-index="highlightedIndex"
        @select="emit('select', $event)"
      />
    </div>
  </section>
</template>
