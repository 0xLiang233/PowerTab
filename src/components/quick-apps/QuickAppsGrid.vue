<script setup lang="ts">
import { ref } from 'vue';
import { createQuickAppFallbackIcon, resolveQuickAppIcon } from '@/domain/quick-apps/resolveQuickAppIcon';
import type { QuickApp } from '@/shared/types/models';
import { useI18n } from '@/shared/i18n';

const props = defineProps<{
  quickApps: QuickApp[];
  managing: boolean;
}>();

const emit = defineEmits<{
  open: [quickApp: QuickApp];
  edit: [quickApp: QuickApp];
  remove: [quickApp: QuickApp];
  reorder: [fromId: string, toId: string];
  create: [];
}>();

const draggedId = ref<string | null>(null);
const dropTargetId = ref<string | null>(null);
const { t } = useI18n();

function onIconError(quickApp: QuickApp, event: Event) {
  const target = event.target as HTMLImageElement;
  target.src = createQuickAppFallbackIcon(quickApp.url);
}

function handleOpen(quickApp: QuickApp) {
  if (props.managing) {
    emit('edit', quickApp);
    return;
  }
  emit('open', quickApp);
}

function handleDragStart(quickApp: QuickApp, event: DragEvent) {
  draggedId.value = quickApp.id;
  dropTargetId.value = quickApp.id;
  event.dataTransfer?.setData('text/plain', quickApp.id);
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
  }
}

function handleDragOver(quickApp: QuickApp, event: DragEvent) {
  if (!draggedId.value || draggedId.value === quickApp.id) return;
  event.preventDefault();
  dropTargetId.value = quickApp.id;
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
}

function handleDrop(quickApp: QuickApp, event: DragEvent) {
  event.preventDefault();
  if (!draggedId.value || draggedId.value === quickApp.id) {
    resetDragState();
    return;
  }
  emit('reorder', draggedId.value, quickApp.id);
  resetDragState();
}

function handleDragEnd() {
  resetDragState();
}

function resetDragState() {
  draggedId.value = null;
  dropTargetId.value = null;
}
</script>

<template>
  <div class="quick-apps-grid">
    <button type="button" class="quick-app quick-app--create" @click="emit('create')">
      <span class="quick-app__icon quick-app__icon--create" aria-hidden="true"></span>
      <span class="quick-app__name">{{ t('quickApps.add') }}</span>
    </button>

    <div
      v-for="quickApp in props.quickApps"
      :key="quickApp.id"
      class="quick-app-shell"
      :class="{
        'quick-app-shell--managing': props.managing,
        'quick-app-shell--dragging': draggedId === quickApp.id,
        'quick-app-shell--drop-target': dropTargetId === quickApp.id && draggedId !== quickApp.id,
      }"
      :draggable="props.managing"
      @dragstart="handleDragStart(quickApp, $event)"
      @dragover="handleDragOver(quickApp, $event)"
      @drop="handleDrop(quickApp, $event)"
      @dragend="handleDragEnd"
    >
      <button
        type="button"
        class="quick-app"
        :draggable="props.managing"
        :title="props.managing ? t('quickApps.manageShortcut') : quickApp.name"
        @click="handleOpen(quickApp)"
        @dragstart="handleDragStart(quickApp, $event)"
        @dragend="handleDragEnd"
      >
        <span v-if="props.managing" class="quick-app__drag-cue" aria-hidden="true">⋮⋮</span>
        <img
          class="quick-app__icon"
          :src="resolveQuickAppIcon(quickApp)"
          :alt="quickApp.name"
          @error="onIconError(quickApp, $event)"
        />
        <span class="quick-app__name">{{ quickApp.name }}</span>
      </button>

      <div v-if="props.managing" class="quick-app__actions">
        <button
          type="button"
          class="quick-app__action-button quick-app__action-button--danger"
          :title="t('quickApps.deleteAction')"
          :aria-label="t('quickApps.deleteAction')"
          @click="emit('remove', quickApp)"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>
