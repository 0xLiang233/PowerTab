<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { formatReadLaterAge, getReadLaterAgeTone } from '@/domain/read-later/age';
import type { ReadLaterItem } from '@/shared/types/models';
import { getDisplayUrl, getHostnameInitial } from '@/shared/utils/url';

const props = defineProps<{
  items: ReadLaterItem[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  open: [item: ReadLaterItem];
  remove: [item: ReadLaterItem];
}>();

const now = ref(Date.now());
let timerId = 0;

const viewItems = computed(() =>
  props.items.map((item) => ({
    ...item,
    ageLabel: formatReadLaterAge(item.createdAt, now.value),
    tone: getReadLaterAgeTone(item.createdAt, now.value),
    displayUrl: getDisplayUrl(item.url),
    fallbackLabel: getHostnameInitial(item.hostname),
  })),
);

onMounted(() => {
  timerId = window.setInterval(() => {
    now.value = Date.now();
  }, 60_000);
});

onBeforeUnmount(() => {
  window.clearInterval(timerId);
});
</script>

<template>
  <section class="read-later-section">
    <header class="section-header read-later-section__header">
      <div>
        <h2>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="color: #6a5cff">
            <path d="M5 3C3.89543 3 3 3.89543 3 5V21L12 17.5L21 21V5C21 3.89543 20.1046 3 19 3H5Z" />
          </svg>
          Read Later
        </h2>
        <p v-if="loading">Refreshing saved reads…</p>
        <p v-else>{{ items.length }} saved items</p>
      </div>
    </header>

    <div v-if="viewItems.length" class="read-later-section__list">
      <article
        v-for="item in viewItems"
        :key="item.id"
        class="read-later-card"
        :class="`read-later-card--${item.tone}`"
      >
        <button
          type="button"
          class="read-later-card__main"
          :title="item.url"
          @click="emit('open', item)"
        >
          <span class="read-later-card__meta">
            <img
              v-if="item.favIconUrl"
              class="read-later-card__favicon"
              :src="item.favIconUrl"
              alt=""
              aria-hidden="true"
            />
            <span v-else class="read-later-card__favicon read-later-card__favicon--fallback">
              {{ item.fallbackLabel }}
            </span>
            <span class="read-later-card__copy">
              <span class="read-later-card__topline">
                <span class="read-later-card__title">{{ item.title }}</span>
                <span class="read-later-card__age">{{ item.ageLabel }}</span>
              </span>
              <span class="read-later-card__url">{{ item.displayUrl }}</span>
            </span>
          </span>
        </button>

        <button
          type="button"
          class="tab-action-icon tab-action-icon--danger"
          aria-label="Remove from read later"
          title="Remove from read later"
          @click="emit('remove', item)"
        >
          <span aria-hidden="true">×</span>
        </button>
      </article>
    </div>

    <div v-else class="tabs-section__empty read-later-section__empty">
      <div class="read-later-section__empty-illustration" aria-hidden="true">
        <svg width="84" height="84" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 3C3.89543 3 3 3.89543 3 5V21L12 17.5L21 21V5C21 3.89543 20.1046 3 19 3H5Z" fill="rgba(106, 92, 255, 0.06)" stroke="#6a5cff" stroke-width="1.2" stroke-linejoin="round" />
          <path d="M9 10L12 13L15 10" stroke="#6a5cff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.4" />
        </svg>
      </div>
      <div class="read-later-section__empty-copy">
        <strong>Read Later</strong>
        <span>Save tabs here to revisit them later, even after the browser restarts.</span>
      </div>
    </div>
  </section>
</template>
