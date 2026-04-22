import { computed, ref } from 'vue';
import type { ReadLaterItem, TabEntity } from '@/shared/types/models';
import {
  listReadLaterItems,
  openReadLaterItem,
  removeReadLaterItem,
  saveTabForLater,
} from '@/features/read-later/services/readLaterService';

export function useReadLater() {
  const items = ref<ReadLaterItem[]>([]);
  const isLoading = ref(false);

  async function refresh() {
    isLoading.value = true;
    items.value = await listReadLaterItems();
    isLoading.value = false;
  }

  async function add(tab: TabEntity) {
    await saveTabForLater(tab);
    await refresh();
  }

  async function remove(id: string) {
    await removeReadLaterItem(id);
    await refresh();
  }

  async function open(item: ReadLaterItem) {
    await openReadLaterItem(item);
  }

  void refresh();

  return {
    items: computed(() => items.value),
    isLoading: computed(() => isLoading.value),
    refresh,
    add,
    remove,
    open,
  };
}
