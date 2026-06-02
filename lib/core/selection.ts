import { computed, reactive, shallowReactive, watchEffect } from "vue";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { CalendarDay, CalendarDayState, ModeHandlers, SelectionHandlers, SelectionMode, StateProvider } from "../types";
import { dayIdFromDate } from "../utils/date";

export interface SelectionConstraints {
  minRange?: number;
  maxRange?: number;
  maxSelections?: number;
}

/**
 * Centralized selection and hover state management.
 *
 * Owns a `stateMap` — a shallowReactive Map<string, CalendarDayState> that is
 * the single source of truth for per-day UI state. All CalendarDay objects with
 * the same `id` share the **same** state reference via `getOrCreateState()`.
 *
 * Range computations use lexicographic ID comparison ("YYYY-MM-DD") over the
 * stateMap keys, so duplicate entries from otherMonth padding never distort ranges.
 *
 * State updates are targeted — only the IDs that actually change state are touched,
 * keeping hover and selection fast even for large calendars.
 *
 * `betweenIds` reacts to both `selectedIds` and `stateMap` (which is shallowReactive),
 * so days in newly navigated months are immediately flagged as `between: true` without
 * requiring a user interaction.
 */
export function createSelectionState<T, M extends SelectionMode | undefined = undefined>(
  preSelection: Date[],
  mode?: M,
  constraints: SelectionConstraints = {},
) {
  const { minRange, maxRange, maxSelections } = constraints;
  const preSelectedIds = preSelection.map(dayIdFromDate);

  const selectedIds = reactive(new Set<string>(preSelectedIds));
  const hoveredIds = reactive(new Set<string>());
  // shallowReactive so computed()s that iterate it re-run when entries are added/removed
  const stateMap = shallowReactive(new Map<string, CalendarDayState>());

  // ── State provider (shared with calendar-day creation) ───────────

  const getOrCreateState: StateProvider = (id: string, disabled: boolean): CalendarDayState => {
    let state = stateMap.get(id);
    if (!state) {
      state = shallowReactive<CalendarDayState>({
        selected: selectedIds.has(id),
        hovered: hoveredIds.has(id),
        between: false,
        disabled,
        isRangeStart: false,
        isRangeEnd: false,
      });
      stateMap.set(id, state);
    }
    return state;
  };

  // ── Derived computeds ────────────────────────────────────────────

  /** Compute the set of day IDs strictly between the two selected endpoints.
   *  Reacts to both selectedIds and stateMap, so newly navigated months that
   *  fall within the range get flagged immediately without a user interaction. */
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

  // ── Reactive between-state sync ──────────────────────────────────

  // watchEffect with flush: 'sync' propagates between-state to the stateMap
  // immediately on every reactive change (no component flush cycle to wait for).
  // This ensures between-state is accurate synchronously after any selection change
  // and also re-runs when new days are added to stateMap via navigation.
  let prevBetweenIds = new Set<string>();
  let prevRangeStartId: string | null = null;
  let prevRangeEndId: string | null = null;

  function syncBetweenState(next: Set<string>) {
    for (const id of prevBetweenIds) {
      if (!next.has(id)) {
        const state = stateMap.get(id);
        if (state) { state.between = false; }
      }
    }
    for (const id of next) {
      const state = stateMap.get(id);
      if (state) { state.between = true; }
    }
    prevBetweenIds = new Set(next);
  }

  function syncRangeEndpoints() {
    let newStartId: string | null = null;
    let newEndId: string | null = null;
    if (selectedIds.size === 2) {
      const [id0, id1] = Array.from(selectedIds);
      [newStartId, newEndId] = id0 < id1 ? [id0, id1] : [id1, id0];
    }
    if (prevRangeStartId && prevRangeStartId !== newStartId) {
      const state = stateMap.get(prevRangeStartId);
      if (state) { state.isRangeStart = false; }
    }
    if (prevRangeEndId && prevRangeEndId !== newEndId) {
      const state = stateMap.get(prevRangeEndId);
      if (state) { state.isRangeEnd = false; }
    }
    if (newStartId) {
      const state = stateMap.get(newStartId);
      if (state) { state.isRangeStart = true; }
    }
    if (newEndId) {
      const state = stateMap.get(newEndId);
      if (state) { state.isRangeEnd = true; }
    }
    prevRangeStartId = newStartId;
    prevRangeEndId = newEndId;
  }

  watchEffect(() => {
    syncBetweenState(betweenIds.value);
    syncRangeEndpoints();
  }, { flush: 'sync' });

  // ── Targeted state helpers ───────────────────────────────────────

  function setSelected(id: string, value: boolean) {
    const state = stateMap.get(id);
    if (state) { state.selected = value; }
  }

  function clearHoverStates() {
    for (const id of hoveredIds) {
      const state = stateMap.get(id);
      if (state) { state.hovered = false; }
    }
    hoveredIds.clear();
  }

  // ── Listeners ────────────────────────────────────────────────────

  function selectSingle(day: CalendarDay<T>) {
    if (day.state.disabled) { return; }
    const wasSelected = selectedIds.has(day.id);
    // Deselect all currently selected
    for (const id of selectedIds) {
      setSelected(id, false);
    }
    selectedIds.clear();
    if (!wasSelected) {
      selectedIds.add(day.id);
      setSelected(day.id, true);
    }
  }

  function selectRange(day: CalendarDay<T>) {
    if (day.state.disabled) { return; }
    if (selectedIds.size >= 2) {
      for (const id of selectedIds) {
        setSelected(id, false);
      }
      selectedIds.clear();
    }
    if (selectedIds.has(day.id)) {
      selectedIds.delete(day.id);
      setSelected(day.id, false);
    } else {
      // Validate range constraints before accepting second endpoint
      if (selectedIds.size === 1) {
        const existingId = selectedIds.values().next().value as string;
        const rangeLength = Math.abs(differenceInCalendarDays(parseISO(day.id), parseISO(existingId))) + 1;
        if (minRange !== undefined && rangeLength < minRange) { return; }
        if (maxRange !== undefined && rangeLength > maxRange) { return; }
      }
      selectedIds.add(day.id);
      setSelected(day.id, true);
    }
    clearHoverStates();
  }

  function selectMultiple(day: CalendarDay<T>) {
    if (day.state.disabled) { return; }
    if (selectedIds.has(day.id)) {
      selectedIds.delete(day.id);
      setSelected(day.id, false);
    } else {
      if (maxSelections !== undefined && selectedIds.size >= maxSelections) { return; }
      selectedIds.add(day.id);
      setSelected(day.id, true);
    }
  }

  function hoverRange(day: CalendarDay<T>) {
    if (selectedIds.size !== 1) { return; }
    clearHoverStates();

    const selectedId = selectedIds.values().next().value as string;
    let hovId = day.id;

    // Clamp hover to maxRange distance from the anchor
    if (maxRange !== undefined) {
      const anchorDate = parseISO(selectedId);
      const hoverDate = parseISO(hovId);
      const dist = Math.abs(differenceInCalendarDays(hoverDate, anchorDate)) + 1;
      if (dist > maxRange) {
        const direction = hoverDate > anchorDate ? 1 : -1;
        const clampedDate = new Date(anchorDate);
        clampedDate.setDate(clampedDate.getDate() + direction * (maxRange - 1));
        hovId = dayIdFromDate(clampedDate);
      }
    }

    const [lo, hi] = selectedId < hovId ? [selectedId, hovId] : [hovId, selectedId];

    for (const [id, state] of stateMap) {
      if (id > lo && id < hi) {
        hoveredIds.add(id);
        state.hovered = true;
      }
    }
    // Hover the effective target day
    const targetState = stateMap.get(hovId);
    if (targetState) {
      hoveredIds.add(hovId);
      targetState.hovered = true;
    }
  }

  function resetHover() {
    clearHoverStates();
  }

  // ── Programmatic API ─────────────────────────────────────────────

  function selectDate(date: Date) {
    const id = dayIdFromDate(date);
    const state = stateMap.get(id);
    // Disabled check via stateMap if the day is rendered, otherwise allow
    if (state?.disabled) { return; }
    const fakeDay: CalendarDay<T> = { id, state: state ?? { selected: false, hovered: false, between: false, disabled: false } } as CalendarDay<T>;
    switch (mode) {
      case 'single': return selectSingle(fakeDay);
      case 'range': return selectRange(fakeDay);
      case 'multiple': return selectMultiple(fakeDay);
      default: return selectSingle(fakeDay);
    }
  }

  function clearSelection() {
    for (const id of selectedIds) {
      setSelected(id, false);
    }
    selectedIds.clear();
    clearHoverStates();
  }

  // ── Build handlers narrowed by mode ─────────────────────────────

  const allHandlers: SelectionHandlers<T> = {
    selectSingle,
    selectRange,
    selectMultiple,
    hoverRange,
    resetHover,
  };

  const listeners: ModeHandlers<T, M> = (
    mode === 'single' ? { selectSingle } :
    mode === 'range' ? { selectRange, hoverRange, resetHover } :
    mode === 'multiple' ? { selectMultiple } :
    allHandlers
  ) as ModeHandlers<T, M>;

  return {
    selectedIds,
    listeners,
    getOrCreateState,
    stateMap,
    selectDate,
    clearSelection,
  };
}

