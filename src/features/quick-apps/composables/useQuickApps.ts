import { computed, onMounted, ref } from 'vue';
import {
  createQuickApp,
  listQuickApps,
  removeQuickApp,
  reorderQuickApps,
  updateQuickApp,
  type QuickAppInput,
} from '@/features/quick-apps/services/quickAppsRepository';
import type { QuickApp } from '@/shared/types/models';

export function useQuickApps() {
  const quickApps = ref<QuickApp[]>([]);
  const isLoading = ref(false);

  async function load() {
    isLoading.value = true;
    quickApps.value = await listQuickApps();
    isLoading.value = false;
  }

  async function add(input: QuickAppInput) {
    await createQuickApp(input);
    await load();
  }

  async function update(id: string, patch: Partial<QuickAppInput>) {
    await updateQuickApp(id, patch);
    await load();
  }

  async function remove(id: string) {
    await removeQuickApp(id);
    await load();
  }

  async function reorder(fromId: string, toId: string) {
    if (fromId === toId) return;

    const current = quickApps.value.slice();
    const fromIndex = current.findIndex((item) => item.id === fromId);
    const toIndex = current.findIndex((item) => item.id === toId);
    if (fromIndex === -1 || toIndex === -1) return;

    const [item] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, item);
    await reorderQuickApps(current.map((entry) => entry.id));
    await load();
  }

  onMounted(load);

  return {
    quickApps,
    isLoading: computed(() => isLoading.value),
    load,
    add,
    update,
    remove,
    reorder,
  };
}
