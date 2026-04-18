<script setup lang="ts">
import TabGroupCard from '@/components/tabs/TabGroupCard.vue';
import type { TabEntity, TabGroup } from '@/shared/types/models';

defineProps<{
  groups: TabGroup[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  focus: [tab: TabEntity];
  closeTab: [tab: TabEntity];
  closeGroup: [group: TabGroup];
  closeDuplicates: [group: TabGroup];
}>();
</script>

<template>
  <section class="tabs-section">
    <header class="section-header">
      <div>
        <h2>Open Tabs</h2>
        <p v-if="loading">Refreshing current tabs…</p>
        <p v-else>{{ groups.length }} groups</p>
      </div>
    </header>

    <div v-if="groups.length" class="tabs-section__groups">
      <TabGroupCard
        v-for="group in groups"
        :key="group.id"
        :group="group"
        @focus="emit('focus', $event)"
        @close-tab="emit('closeTab', $event)"
        @close-group="emit('closeGroup', $event)"
        @close-duplicates="emit('closeDuplicates', $event)"
      />
    </div>

    <div v-else class="tabs-section__empty">No open web tabs right now.</div>
  </section>
</template>
