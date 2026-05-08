<script setup lang="ts">
import { computed } from 'vue';
import TabRow from '@/components/tabs/TabRow.vue';
import { getClosableDuplicateTabIds } from '@/domain/tabs/findDuplicates';
import { useTabGroupPalette } from '@/features/tabs/composables/useTabGroupPalette';
import type { TabEntity, TabGroup } from '@/shared/types/models';
import { getHostnameInitial } from '@/shared/utils/url';

const props = defineProps<{
  group: TabGroup;
  savedReadLaterUrls?: string[];
}>();

const emit = defineEmits<{
  focus: [tab: TabEntity];
  closeTab: [tab: TabEntity];
  closeGroup: [group: TabGroup];
  closeDuplicates: [group: TabGroup];
  addReadLater: [tab: TabEntity];
}>();

const closableDuplicateCount = computed(() => getClosableDuplicateTabIds(props.group.tabs).length);

const groupFaviconUrl = computed(() => props.group.tabs.find((tab) => tab.favIconUrl)?.favIconUrl);
const groupFallbackLabel = computed(() => getHostnameInitial(props.group.domain || props.group.label));
const groupPalette = useTabGroupPalette({
  faviconUrl: groupFaviconUrl,
  seed: computed(() => props.group.domain || props.group.label || props.group.id),
});
</script>

<template>
  <section class="tab-group-card" :style="groupPalette.style.value">
    <header class="tab-group-card__header">
      <div class="tab-group-card__summary">
        <div class="tab-group-card__title-row">
          <img
            v-if="groupFaviconUrl"
            class="tab-group-card__favicon"
            :src="groupFaviconUrl"
            alt=""
            aria-hidden="true"
          />
          <span v-else class="tab-group-card__favicon tab-group-card__favicon--fallback">{{ groupFallbackLabel }}</span>
          <h3 :title="group.label">{{ group.label }}</h3>
        </div>
        <p>{{ group.tabs.length }} tabs</p>
      </div>
      <div class="tab-group-card__actions">
        <button
          v-if="closableDuplicateCount"
          type="button"
          class="tab-action-pill"
          :aria-label="`Close ${closableDuplicateCount} duplicate tabs`"
          :title="`Close ${closableDuplicateCount} duplicate tabs`"
          @click="emit('closeDuplicates', group)"
        >
          <span aria-hidden="true">×</span>
          <span>{{ closableDuplicateCount }}</span>
        </button>
        <button
          type="button"
          class="tab-action-icon tab-action-icon--danger"
          aria-label="Close group"
          title="Close group"
          @click="emit('closeGroup', group)"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </header>

    <div class="tab-group-card__rows">
      <TabRow
        v-for="tab in group.tabs"
        :key="tab.id"
        :tab="tab"
        :is-duplicate="group.duplicateUrls.includes(tab.normalizedUrl)"
        :is-saved="savedReadLaterUrls?.includes(tab.normalizedUrl)"
        @focus="emit('focus', $event)"
        @close="emit('closeTab', $event)"
        @add-read-later="emit('addReadLater', $event)"
      />
    </div>
  </section>
</template>
