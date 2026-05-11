import { computed, reactive, shallowReactive } from "vue";
import { CalendarDay, CalendarDayState, Listeners, StateProvider } from "../types";
import { dayIdFromDate } from "../utils/date";

/**
 * Centralized selection and hover state management.
 *
 * Owns a `stateMap` — a Map<string, CalendarDayState> that is the single
 * source of truth for per-day UI state. All CalendarDay objects with the same
 * `id` share the **same** state reference via `getOrCreateState()`.
 *
 * Range computations use lexicographic ID comparison ("YYYY-MM-DD") over the
 * stateMap keys, so duplicate entries from otherMonth padding never distort ranges.
 *
 * `selectedDates` is intentionally NOT returned here — it depends on the full
 * day list, which doesn't exist yet when createSelectionState is called. Each
 * composable computes it from `selectedIds` after navigation is wired up.
 */
export function createSelectionState<T>(preSelection: Date[]) {
  // Populate from preSelection
  const preSelectedIds = preSelection.map(dayIdFromDate);

  const selectedIds = reactive(new Set<string>(preSelectedIds));
  const hoveredIds = reactive(new Set<string>());
  const stateMap = new Map<string, CalendarDayState>();

  // ── State provider (shared with calendar-day creation) ───────────

  /**
   * Returns the shared CalendarDayState for a given day ID.
   * Creates one if it doesn't exist yet, seeded with the correct initial
   * selected/disabled values.
   */
  const getOrCreateState: StateProvider = (id: string, disabled: boolean): CalendarDayState => {
    let state = stateMap.get(id);
    if (!state) {
      state = shallowReactive<CalendarDayState>({
        selected: selectedIds.has(id),
        hovered: hoveredIds.has(id),
        between: false,
        disabled,
      });
      stateMap.set(id, state);
    }
    return state;
  };

  // ── Derived computeds ────────────────────────────────────────────

  /** Compute the set of day IDs strictly between the two selected endpoints.
   *  Uses lexicographic ID comparison ("YYYY-MM-DD") instead of array indices,
   *  so duplicate entries from otherMonth padding don't cause wrong ranges. */
  const betweenIds = computed<Set<string>>(() => {
    if (selectedIds.size !== 2) {
      return new Set();
    }
    const [id0, id1] = Array.from(selectedIds);
    const [lo, hi] = id0 < id1 ? [id0, id1] : [id1, id0];
    const result = new Set<string>();
    for (const [id] of stateMap) {
      if (id > lo && id < hi) {
        result.add(id);
      }
    }
    return result;
  });

  // ── State sync helpers ───────────────────────────────────────────

  function syncAllStates() {
    const between = betweenIds.value;
    for (const [id, state] of stateMap) {
      state.selected = selectedIds.has(id);
      state.hovered = hoveredIds.has(id);
      state.between = between.has(id);
    }
  }

  // ── Listeners ────────────────────────────────────────────────────

  function selectSingle(day: CalendarDay<T>) {
    if (day.state.disabled) { return; }
    const wasSelected = selectedIds.has(day.id);
    selectedIds.clear();
    if (!wasSelected) {
      selectedIds.add(day.id);
    }
    syncAllStates();
  }

  function selectRange(day: CalendarDay<T>) {
    if (day.state.disabled) { return; }
    if (selectedIds.size >= 2) {
      selectedIds.clear();
    }
    if (selectedIds.has(day.id)) {
      selectedIds.delete(day.id);
    } else {
      selectedIds.add(day.id);
    }
    hoveredIds.clear();
    syncAllStates();
  }

  function selectMultiple(day: CalendarDay<T>) {
    if (day.state.disabled) { return; }
    if (selectedIds.has(day.id)) {
      selectedIds.delete(day.id);
    } else {
      selectedIds.add(day.id);
    }
    syncAllStates();
  }

  function hoverRange(day: CalendarDay<T>) {
    if (selectedIds.size !== 1) { return; }
    hoveredIds.clear();

    const selectedId = Array.from(selectedIds)[0];
    const hovId = day.id;
    const [lo, hi] = selectedId < hovId ? [selectedId, hovId] : [hovId, selectedId];

    for (const [id] of stateMap) {
      if (id > lo && id < hi) {
        hoveredIds.add(id);
      }
    }
    hoveredIds.add(day.id);
    syncAllStates();
  }

  function resetHover() {
    hoveredIds.clear();
    syncAllStates();
  }

  const listeners: Listeners<T> = {
    selectSingle,
    selectRange,
    selectMultiple,
    hoverRange,
    resetHover,
  };

  return {
    selectedIds,
    listeners,
    getOrCreateState,
  };
}
