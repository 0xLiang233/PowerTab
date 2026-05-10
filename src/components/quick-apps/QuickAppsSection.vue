<script setup lang="ts">
import { ref } from 'vue';
import QuickAppEditor from '@/components/quick-apps/QuickAppEditor.vue';
import QuickAppsGrid from '@/components/quick-apps/QuickAppsGrid.vue';
import type { QuickApp } from '@/shared/types/models';
import type { QuickAppInput } from '@/features/quick-apps/services/quickAppsRepository';
import { useI18n } from '@/shared/i18n';

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
const managing = ref(false);
const { t } = useI18n();

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

function handleRemove(quickApp: QuickApp) {
  if (!window.confirm(t('quickApps.deleteConfirm', { name: quickApp.name }))) return;
  emit('remove', quickApp);
}
</script>

<template>
  <section class="quick-apps-section">
    <header class="section-header">
      <div>
        <h2>{{ t('quickApps.title') }}</h2>
        <p>{{ t('quickApps.description') }}</p>
      </div>
      <button
        type="button"
        class="section-header__action"
        :class="{ 'section-header__action--active': managing }"
        @click="managing = !managing"
      >
        {{ managing ? t('quickApps.doneManaging') : t('quickApps.manage') }}
      </button>
    </header>

    <QuickAppsGrid
      :quick-apps="props.quickApps"
      :managing="managing"
      @open="emit('open', $event)"
      @edit="openEdit"
      @remove="handleRemove"
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
