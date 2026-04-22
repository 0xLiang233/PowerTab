<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import TabGroupCard from '@/components/tabs/TabGroupCard.vue';
import type { TabEntity, TabGroup } from '@/shared/types/models';

const props = defineProps<{
  groups: TabGroup[];
  loading?: boolean;
  powerTabDuplicateCount?: number;
}>();

const emit = defineEmits<{
  focus: [tab: TabEntity];
  closeTab: [tab: TabEntity];
  closeGroup: [group: TabGroup];
  closeDuplicates: [group: TabGroup];
  closePowerTabDuplicates: [];
}>();

const groupsRef = ref<HTMLElement | null>(null);
let resizeObserver: ResizeObserver | null = null;
let masonryFrame = 0;

function applyMasonry() {
  const container = groupsRef.value;
  if (!container) return;

  const styles = window.getComputedStyle(container);
  const rowHeight = Number.parseFloat(styles.getPropertyValue('grid-auto-rows'));
  const gap = Number.parseFloat(styles.getPropertyValue('gap'));
  if (!rowHeight) return;

  const items = container.querySelectorAll<HTMLElement>('.tabs-section__group-item');
  items.forEach((item) => {
    const card = item.firstElementChild as HTMLElement | null;
    if (!card) return;
    const height = card.getBoundingClientRect().height;
    const rows = Math.max(1, Math.ceil((height + gap) / (rowHeight + gap)));
    item.style.setProperty('--tabs-group-rows', String(rows));
  });
}

function scheduleMasonry() {
  if (masonryFrame) {
    cancelAnimationFrame(masonryFrame);
  }
  masonryFrame = requestAnimationFrame(() => {
    masonryFrame = 0;
    applyMasonry();
  });
}

async function refreshMasonry() {
  await nextTick();
  scheduleMasonry();

  resizeObserver?.disconnect();
  if (!groupsRef.value) return;

  resizeObserver = new ResizeObserver(() => {
    scheduleMasonry();
  });

  const cards = groupsRef.value.querySelectorAll<HTMLElement>('.tabs-section__group-item > .tab-group-card');
  cards.forEach((card) => {
    resizeObserver?.observe(card);
  });
}

watch(
  () => props.groups.map((group) => `${group.id}:${group.tabs.length}`).join('|'),
  () => {
    void refreshMasonry();
  },
  { immediate: true },
);

onMounted(() => {
  window.addEventListener('resize', scheduleMasonry);
  void refreshMasonry();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', scheduleMasonry);
  resizeObserver?.disconnect();
  if (masonryFrame) {
    cancelAnimationFrame(masonryFrame);
  }
});
</script>

<template>
  <section class="tabs-section">
    <header class="section-header tabs-section__header">
      <div class="tabs-section__header-top">
        <h2>Open Tabs</h2>
        <button
          v-if="powerTabDuplicateCount"
          type="button"
          class="tab-action-pill"
          :aria-label="`Close ${powerTabDuplicateCount} extra Power Tab pages`"
          :title="`Close ${powerTabDuplicateCount} extra Power Tab pages`"
          @click="emit('closePowerTabDuplicates')"
        >
          <span aria-hidden="true">×</span>
          <span>Close extra Power Tabs {{ powerTabDuplicateCount }}</span>
        </button>
      </div>
      <p v-if="loading">Refreshing current tabs…</p>
      <p v-else>{{ groups.length }} groups</p>
    </header>

    <div v-if="groups.length" ref="groupsRef" class="tabs-section__groups">
      <div v-for="group in groups" :key="group.id" class="tabs-section__group-item">
        <TabGroupCard
          :group="group"
          @focus="emit('focus', $event)"
          @close-tab="emit('closeTab', $event)"
          @close-group="emit('closeGroup', $event)"
          @close-duplicates="emit('closeDuplicates', $event)"
        />
      </div>
    </div>

    <div v-else class="tabs-section__empty">No open web tabs right now.</div>
  </section>
</template>
