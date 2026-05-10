<script setup lang="ts">
import { computed } from 'vue';
import type { TabEntity } from '@/shared/types/models';
import { getDisplayUrl } from '@/shared/utils/url';
import { useI18n } from '@/shared/i18n';

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
const { t } = useI18n();
</script>

<template>
  <div class="tab-row" :class="{ 'tab-row--duplicate': isDuplicate }">
    <button type="button" class="tab-row__main" :title="tab.url" @click="emit('focus', tab)">
      <span class="tab-row__meta">
        <span class="tab-row__copy">
          <span class="tab-row__title">{{ tab.title }}</span>
          <span class="tab-row__url">{{ displayUrl }}</span>
        </span>
      </span>
    </button>
    <button
      type="button"
      class="tab-action-icon"
      :class="{ 'tab-action-icon--active': isSaved }"
      :aria-label="isSaved ? t('tabs.savedReadLater') : t('tabs.saveReadLater')"
      :title="isSaved ? t('tabs.savedReadLater') : t('tabs.saveReadLater')"
      @click="emit('addReadLater', tab)"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          v-if="isSaved"
          d="M5 3C3.89543 3 3 3.89543 3 5V21L12 17.5L21 21V5C21 3.89543 20.1046 3 19 3H5Z"
          fill="currentColor"
        />
        <path
          v-else
          d="M5 5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21L12 17.5L5 21V5Z"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    <button
      type="button"
      class="tab-action-icon tab-action-icon--danger"
      :aria-label="t('tabs.closeTab')"
      :title="t('tabs.closeTab')"
      @click="emit('close', tab)"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6 6L18 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</template>
