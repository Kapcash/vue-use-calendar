import { computed, shallowReactive, ref, toValue, ComputedRef, MaybeRefOrGetter } from "vue";

/**
 * Generic period navigation with a lazy Map-based cache.
 *
 * @param startId        - The initial period ID
 * @param generatePeriod - Factory to create a period on cache miss
 * @param infinite        - If true, no bounds checking
 * @param minId           - Minimum period ID (for finite mode)
 * @param maxId           - Maximum period ID (for finite mode)
 * @param maxCacheSize    - Maximum number of cached periods (evicts farthest from current)
 * @param canEvict        - Optional predicate; return false to pin a period in the cache.
 *                          Falls back to evicting the absolute farthest if all entries are pinned.
 * @param windowSize      - Number of consecutive periods to display simultaneously. Defaults to 1.
 * @param step            - Number of periods to advance/retreat per navigation call. Defaults to 1.
 */
export function createNavigation<TId extends number, TPeriod>(
  startId: TId,
  generatePeriod: (id: TId) => TPeriod,
  infinite: MaybeRefOrGetter<boolean>,
  minId?: TId,
  maxId?: TId,
  nextId?: (id: TId) => TId,
  prevId?: (id: TId) => TId,
  maxCacheSize = 13,
  canEvict?: (id: TId) => boolean,
  windowSize = 1,
  step = 1,
) {
  const currentPeriodId = ref<TId>(startId);
  const periodCache = shallowReactive(new Map<TId, TPeriod>());

  const _nextId = nextId ?? ((id: TId) => (id + 1) as TId);
  const _prevId = prevId ?? ((id: TId) => (id - 1) as TId);

  function ensureCached(id: TId): TPeriod {
    if (!periodCache.has(id)) {
      periodCache.set(id, generatePeriod(id));
      evictIfNeeded(id);
    }
    return periodCache.get(id)!;
  }

  /** Ensures all `windowSize` consecutive periods starting at `fromId` are cached. */
  function ensureWindow(fromId: TId): void {
    let id = fromId;
    for (let i = 0; i < windowSize; i++) {
      ensureCached(id);
      if (i < windowSize - 1) { id = _nextId(id); }
    }
  }

  // Seed the initial window (requires _nextId to be initialized first)
  ensureWindow(startId);

  /**
   * Evicts the cached period farthest from `referenceId` if cache size exceeds maxCacheSize.
   * Periods where `canEvict(id)` returns false are skipped; if all entries are pinned the
   * absolute farthest is evicted as a last resort so the cache never grows unboundedly.
   */
  function evictIfNeeded(referenceId: TId = currentPeriodId.value) {
    if (periodCache.size <= maxCacheSize) { return; }
    let farthestKey: TId | undefined;
    let farthestDist = -1;
    let farthestEvictableKey: TId | undefined;
    let farthestEvictableDist = -1;
    for (const key of periodCache.keys()) {
      const dist = Math.abs(key - referenceId);
      if (dist > farthestDist) {
        farthestDist = dist;
        farthestKey = key;
      }
      if ((!canEvict || canEvict(key)) && dist > farthestEvictableDist) {
        farthestEvictableDist = dist;
        farthestEvictableKey = key;
      }
    }
    // Prefer a non-pinned entry; fall back to the absolute farthest
    const toEvict = farthestEvictableKey ?? farthestKey;
    if (toEvict !== undefined) {
      periodCache.delete(toEvict);
    }
  }

  const currentPeriod: ComputedRef<TPeriod> = computed(() => {
    // ensureCached is called eagerly from next/prev/jumpTo, so this is just a lookup
    return periodCache.get(currentPeriodId.value)!;
  });

  const nextEnabled = computed(() => {
    if (toValue(infinite)) { return true; }
    if (maxId === undefined) { return false; }
    // The last visible period after stepping forward must still be within bounds.
    let id = currentPeriodId.value;
    for (let i = 0; i < step + windowSize - 1; i++) { id = _nextId(id); }
    return id <= maxId;
  });

  const prevEnabled = computed(() => {
    if (toValue(infinite)) { return true; }
    if (minId === undefined) { return false; }
    // After stepping back, the new start of the window must be within bounds.
    let id = currentPeriodId.value;
    for (let i = 0; i < step; i++) { id = _prevId(id); }
    return id >= minId;
  });

  function next() {
    let nid = currentPeriodId.value;
    for (let i = 0; i < step; i++) { nid = _nextId(nid); }
    if (!toValue(infinite) && maxId !== undefined) {
      let lastVisible = nid;
      for (let i = 0; i < windowSize - 1; i++) { lastVisible = _nextId(lastVisible); }
      if (lastVisible > maxId) { return; }
    }
    ensureWindow(nid);
    currentPeriodId.value = nid;
  }

  function prev() {
    let pid = currentPeriodId.value;
    for (let i = 0; i < step; i++) { pid = _prevId(pid); }
    if (!toValue(infinite) && minId !== undefined && pid < minId) { return; }
    ensureWindow(pid);
    currentPeriodId.value = pid;
  }

  function jumpTo(id: TId) {
    ensureWindow(id);
    currentPeriodId.value = id;
  }

  /** Clear the entire cache and re-seed only the current period. */
  function resetCache() {
    periodCache.clear();
    periodCache.set(currentPeriodId.value, generatePeriod(currentPeriodId.value));
  }

  /** Get all cached periods, sorted by ID. */
  const allPeriods = computed(() => {
    void currentPeriodId.value;
    return Array.from(periodCache.entries())
      .sort(([a], [b]) => a - b)
      .map(([, v]) => v);
  });

  /** Get exactly `windowSize` consecutive periods starting at the current period. */
  const visiblePeriods = computed(() => {
    void currentPeriodId.value;
    const result: TPeriod[] = [];
    let id = currentPeriodId.value;
    for (let i = 0; i < windowSize; i++) {
      const period = periodCache.get(id);
      if (period !== undefined) { result.push(period); }
      if (i < windowSize - 1) { id = _nextId(id); }
    }
    return result;
  });

  return {
    currentPeriodId,
    currentPeriod,
    allPeriods,
    visiblePeriods,
    nextEnabled,
    prevEnabled,
    next,
    prev,
    jumpTo,
    ensureCached,
    resetCache,
  };
}
