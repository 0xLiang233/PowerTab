<script setup lang="ts">
import { computed } from 'vue';
import type { SearchCandidate } from '@/shared/types/models';

const props = defineProps<{
  groups: Array<{ label: string; items: SearchCandidate[] }>;
  highlightedIndex: number;
}>();

const emit = defineEmits<{
  select: [index: number];
}>();

const indexedGroups = computed(() => {
  let currentIndex = 0;
  return props.groups.map((group) => ({
    label: group.label,
    items: group.items.map((candidate) => ({
      candidate,
      index: currentIndex++,
    })),
  }));
});
</script>

<template>
  <div v-if="indexedGroups.length" class="search-candidates">
    <div v-for="group in indexedGroups" :key="group.label" class="candidate-group">
      <div class="candidate-group__title">{{ group.label }}</div>
      <button
        v-for="item in group.items"
        :key="item.candidate.id"
        class="candidate-item"
        :class="{ 'candidate-item--active': highlightedIndex === item.index }"
        type="button"
        @click="emit('select', item.index)"
      >
        <span class="candidate-item__title">{{ item.candidate.title }}</span>
        <span v-if="item.candidate.subtitle" class="candidate-item__subtitle">{{ item.candidate.subtitle }}</span>
      </button>
    </div>
  </div>
</template>
