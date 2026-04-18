<script setup lang="ts">
import { ref } from 'vue';
import QuickAppEditor from '@/components/quick-apps/QuickAppEditor.vue';
import QuickAppsGrid from '@/components/quick-apps/QuickAppsGrid.vue';
import type { QuickApp } from '@/shared/types/models';
import type { QuickAppInput } from '@/features/quick-apps/services/quickAppsRepository';

const props = defineProps<{
  quickApps: QuickApp[];
}>();

const emit = defineEmits<{
  open: [quickApp: QuickApp];
  add: [input: QuickAppInput];
  update: [id: string, patch: Partial<QuickAppInput>];
  remove: [quickApp: QuickApp];
  reorder: [fromId: string, toId: string];
}>();

const editorOpen = ref(false);
const editing = ref<QuickApp | null>(null);

function openCreate() {
  editing.value = null;
  editorOpen.value = true;
}

function openEdit(quickApp: QuickApp) {
  editing.value = quickApp;
  editorOpen.value = true;
}

function handleSave(input: QuickAppInput) {
  if (editing.value) {
    emit('update', editing.value.id, input);
  } else {
    emit('add', input);
  }
}
</script>

<template>
  <section class="quick-apps-section">
    <header class="section-header">
      <div>
        <h2>Quick Apps</h2>
        <p>App-like shortcuts that always open a new tab.</p>
      </div>
    </header>

    <QuickAppsGrid
      :quick-apps="props.quickApps"
      @open="emit('open', $event)"
      @edit="openEdit"
      @remove="emit('remove', $event)"
      @reorder="(fromId, toId) => emit('reorder', fromId, toId)"
      @create="openCreate"
    />

    <QuickAppEditor
      v-model="editorOpen"
      :editing="editing"
      @save="handleSave"
    />
  </section>
</template>
