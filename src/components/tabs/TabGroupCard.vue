<script setup lang="ts">
import { computed } from 'vue';
import TabRow from '@/components/tabs/TabRow.vue';
import { getClosableDuplicateTabIds } from '@/domain/tabs/findDuplicates';
import type { TabEntity, TabGroup } from '@/shared/types/models';

const props = defineProps<{
  group: TabGroup;
}>();

const emit = defineEmits<{
  focus: [tab: TabEntity];
  closeTab: [tab: TabEntity];
  closeGroup: [group: TabGroup];
  closeDuplicates: [group: TabGroup];
}>();

const closableDuplicateCount = computed(() => getClosableDuplicateTabIds(props.group.tabs).length);

const groupFaviconUrl = computed(() => props.group.tabs.find((tab) => tab.favIconUrl)?.favIconUrl);
</script>

<template>
  <section class="tab-group-card">
    <header class="tab-group-card__header">
      <div>
        <div class="tab-group-card__title-row">
          <img
            v-if="groupFaviconUrl"
            class="tab-group-card__favicon"
            :src="groupFaviconUrl"
            alt=""
            aria-hidden="true"
          />
          <h3>{{ group.label }}</h3>
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
        @focus="emit('focus', $event)"
        @close="emit('closeTab', $event)"
      />
    </div>
  </section>
</template>
