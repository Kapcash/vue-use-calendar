import { computed, shallowReactive, ref, ComputedRef } from "vue";

/**
 * Generic period navigation with a lazy Map-based cache.
 *
 * @param startId       - The initial period ID
 * @param generatePeriod - Factory to create a period on cache miss
 * @param infinite       - If true, no bounds checking
 * @param minId          - Minimum period ID (for finite mode)
 * @param maxId          - Maximum period ID (for finite mode)
 * @param maxCacheSize   - Maximum number of cached periods (evicts farthest from current)
 */
export function createNavigation<TId extends number, TPeriod>(
  startId: TId,
  generatePeriod: (id: TId) => TPeriod,
  infinite: boolean,
  minId?: TId,
  maxId?: TId,
  nextId?: (id: TId) => TId,
  prevId?: (id: TId) => TId,
  maxCacheSize = 13,
) {
  const currentPeriodId = ref<TId>(startId);
  const periodCache = shallowReactive(new Map<TId, TPeriod>());

  // Seed the cache with the start period
  periodCache.set(startId, generatePeriod(startId));

  const _nextId = nextId ?? ((id: TId) => (id + 1) as TId);
  const _prevId = prevId ?? ((id: TId) => (id - 1) as TId);

  function ensureCached(id: TId): TPeriod {
    if (!periodCache.has(id)) {
      periodCache.set(id, generatePeriod(id));
      evictIfNeeded();
    }
    return periodCache.get(id)!;
  }

  /**
   * Evicts the cached period farthest from the current period if cache size exceeds maxCacheSize.
   * 
   * How it works:
   * 1. If cache is within bounds, do nothing
   * 2. Find the cached period with the maximum distance from currentPeriodId
   * 3. Delete that farthest period from the cache
   */
  function evictIfNeeded() {
    if (periodCache.size <= maxCacheSize) { return; }
    const currentId = currentPeriodId.value;
    let farthestKey: TId | undefined;
    let farthestDist = -1;
    for (const key of periodCache.keys()) {
      const dist = Math.abs(key - currentId);
      if (dist > farthestDist) {
        farthestDist = dist;
        farthestKey = key;
      }
    }
    if (farthestKey !== undefined) {
      periodCache.delete(farthestKey);
    }
  }

  const currentPeriod: ComputedRef<TPeriod> = computed(() => {
    // ensureCached is called eagerly from next/prev/jumpTo, so this is just a lookup
    return periodCache.get(currentPeriodId.value)!;
  });

  const nextEnabled = computed(() => {
    if (infinite) { return true; }
    if (maxId === undefined) { return false; }
    return _nextId(currentPeriodId.value) <= maxId;
  });

  const prevEnabled = computed(() => {
    if (infinite) { return true; }
    if (minId === undefined) { return false; }
    return _prevId(currentPeriodId.value) >= minId;
  });

  function next() {
    const nid = _nextId(currentPeriodId.value);
    if (!infinite && maxId !== undefined && nid > maxId) { return; }
    ensureCached(nid);
    currentPeriodId.value = nid;
  }

  function prev() {
    const pid = _prevId(currentPeriodId.value);
    if (!infinite && minId !== undefined && pid < minId) { return; }
    ensureCached(pid);
    currentPeriodId.value = pid;
  }

  function jumpTo(id: TId) {
    ensureCached(id);
    currentPeriodId.value = id;
  }

  /** Get all cached periods, sorted by ID. */
  const allPeriods = computed(() => {
    void currentPeriodId.value;
    return Array.from(periodCache.entries())
      .sort(([a], [b]) => a - b)
      .map(([, v]) => v);
  });

  return {
    currentPeriodId,
    currentPeriod,
    allPeriods,
    nextEnabled,
    prevEnabled,
    next,
    prev,
    jumpTo,
    ensureCached,
  };
}
