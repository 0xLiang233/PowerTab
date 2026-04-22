<script setup lang="ts">
import { computed } from 'vue';
import type { TabEntity } from '@/shared/types/models';
import { getDisplayUrl } from '@/shared/utils/url';

const props = defineProps<{
  tab: TabEntity;
  isDuplicate: boolean;
  isSaved?: boolean;
}>();

const emit = defineEmits<{
  focus: [tab: TabEntity];
  close: [tab: TabEntity];
  addReadLater: [tab: TabEntity];
}>();

const displayUrl = computed(() => getDisplayUrl(props.tab.url));
</script>

<template>
  <div class="tab-row" :class="{ 'tab-row--duplicate': isDuplicate }">
    <button type="button" class="tab-row__main" :title="tab.url" @click="emit('focus', tab)">
      <span class="tab-row__title">{{ tab.title }}</span>
      <span class="tab-row__url">{{ displayUrl }}</span>
    </button>
    <button
      type="button"
      class="tab-action-icon"
      :class="{ 'tab-action-icon--active': isSaved }"
      :aria-label="isSaved ? 'Saved to read later' : 'Save to read later'"
      :title="isSaved ? 'Saved to read later' : 'Save to read later'"
      @click="emit('addReadLater', tab)"
    >
      <span aria-hidden="true">{{ isSaved ? '•' : '+' }}</span>
    </button>
    <button
      type="button"
      class="tab-action-icon tab-action-icon--danger"
      aria-label="Close tab"
      title="Close tab"
      @click="emit('close', tab)"
    >
      <span aria-hidden="true">×</span>
    </button>
  </div>
</template>
