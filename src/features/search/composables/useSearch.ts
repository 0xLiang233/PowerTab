import { computed, ref, watch, type Ref } from 'vue';
import { buildSearchCandidates, executeSearchCandidate } from '@/features/search/services/searchService';
import type { QuickApp, SearchCandidate, SearchEngine } from '@/shared/types/models';

interface UseSearchOptions {
  quickApps: Ref<QuickApp[]>;
  engine: Ref<SearchEngine>;
  onAfterExecute?: () => void | Promise<void>;
}

export function useSearch(options: UseSearchOptions) {
  const query = ref('');
  const candidates = ref<SearchCandidate[]>([]);
  const highlightedIndex = ref(0);
  const isLoading = ref(false);
  let requestId = 0;

  watch([query, options.quickApps, options.engine], async () => {
    const currentQuery = query.value.trim();
    requestId += 1;
    const localRequestId = requestId;

    if (!currentQuery) {
      candidates.value = [];
      highlightedIndex.value = 0;
      isLoading.value = false;
      return;
    }

    isLoading.value = true;
    const nextCandidates = await buildSearchCandidates(currentQuery, {
      quickApps: options.quickApps.value,
      engine: options.engine.value,
    });

    if (localRequestId !== requestId) return;

    candidates.value = nextCandidates;
    highlightedIndex.value = 0;
    isLoading.value = false;
  }, { deep: true });

  const groupedCandidates = computed(() => {
    const groups = new Map<string, SearchCandidate[]>();
    for (const candidate of candidates.value) {
      const existing = groups.get(candidate.group) ?? [];
      existing.push(candidate);
      groups.set(candidate.group, existing);
    }
    return [...groups.entries()].map(([label, items]) => ({ label, items }));
  });

  const highlightedCandidate = computed(() => candidates.value[highlightedIndex.value] ?? null);

  function moveHighlight(direction: 1 | -1) {
    if (candidates.value.length === 0) return;
    highlightedIndex.value = (highlightedIndex.value + direction + candidates.value.length) % candidates.value.length;
  }

  async function executeHighlighted() {
    const candidate = highlightedCandidate.value;
    if (!candidate) return;
    await executeSearchCandidate(candidate);
    await options.onAfterExecute?.();
  }

  async function executeCandidateAt(index: number) {
    highlightedIndex.value = index;
    await executeHighlighted();
  }

  return {
    query,
    candidates,
    groupedCandidates,
    highlightedIndex,
    highlightedCandidate,
    isLoading,
    moveHighlight,
    executeHighlighted,
    executeCandidateAt,
  };
}
