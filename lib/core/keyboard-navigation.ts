import { ref, Ref } from "vue";
import { addDays } from "date-fns";
import { CalendarDayState } from "../types";
import { dayIdFromDate } from "../utils/date";

export type FocusDirection = 'up' | 'down' | 'left' | 'right';

export interface KeyboardNavigation {
  /** The day ID currently focused, or null if no focus. */
  focusedDayId: Ref<string | null>;
  /** Move focus in the given direction. left/right = ±1 day, up/down = ±7 days. Skips disabled days. */
  moveFocus: (direction: FocusDirection) => void;
  /** Move focus to today's date. */
  focusToday: () => void;
  /** Trigger selection on the currently focused day. */
  selectFocused: () => void;
}

interface KeyboardNavigationDeps {
  stateMap: Map<string, CalendarDayState>;
  selectDate: (date: Date) => void;
  navigateNext: () => void;
  navigatePrev: () => void;
  /** Returns the IDs of days currently in view (visible periods). */
  getVisibleDayIds: () => string[];
}

const DIRECTION_OFFSETS: Record<FocusDirection, number> = {
  left: -1,
  right: 1,
  up: -7,
  down: 7,
};

const MAX_SKIP_ATTEMPTS = 60;

export function createKeyboardNavigation(deps: KeyboardNavigationDeps): KeyboardNavigation {
  const { stateMap, selectDate, navigateNext, navigatePrev, getVisibleDayIds } = deps;

  const focusedDayId = ref<string | null>(null);

  function moveFocus(direction: FocusDirection) {
    const offset = DIRECTION_OFFSETS[direction];
    const startId = focusedDayId.value;

    if (!startId) {
      // If no focus yet, focus the first visible non-disabled day
      const visibleIds = getVisibleDayIds();
      const firstEnabled = visibleIds.find(id => {
        const state = stateMap.get(id);
        return state && !state.disabled;
      });
      focusedDayId.value = firstEnabled ?? visibleIds[0] ?? null;
      return;
    }

    const startDate = new Date(startId + 'T00:00:00');
    let targetDate = addDays(startDate, offset);
    let targetId = dayIdFromDate(targetDate);

    // Skip disabled days in the same direction
    let attempts = 0;
    while (attempts < MAX_SKIP_ATTEMPTS) {
      const state = stateMap.get(targetId);
      if (!state || !state.disabled) { break; }
      targetDate = addDays(targetDate, offset > 0 ? 1 : -1);
      targetId = dayIdFromDate(targetDate);
      attempts++;
    }

    // Check if target is within cached days; if not, navigate
    if (!stateMap.has(targetId)) {
      if (offset > 0) { navigateNext(); }
      else { navigatePrev(); }
    }

    focusedDayId.value = targetId;
  }

  function focusToday() {
    const todayId = dayIdFromDate(new Date());
    focusedDayId.value = todayId;
  }

  function selectFocused() {
    if (!focusedDayId.value) { return; }
    const date = new Date(focusedDayId.value + 'T00:00:00');
    selectDate(date);
  }

  return {
    focusedDayId,
    moveFocus,
    focusToday,
    selectFocused,
  };
}
