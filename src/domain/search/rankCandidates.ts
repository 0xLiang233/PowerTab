import type { SearchCandidate } from '@/shared/types/models';

export function rankCandidates(candidates: SearchCandidate[]): SearchCandidate[] {
  return candidates.slice().sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.title.localeCompare(b.title);
  });
}
