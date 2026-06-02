import { computed, reactive, watch, watchEffect } from "vue";
import { Week, WeeklyCalendarComposable, WeeklyOptions, NormalizedCalendarOptions, WeekId, SelectionMode } from "../types";
import { createNavigation } from "../core/navigation";
import { createSelectionState } from "../core/selection";
import { weekIdFromDate, weekFromWeekId, yearFromWeekId, generateWeek, makeNextWeekId, makePrevWeekId } from "../utils/week";
import { isDateDisabled } from "../utils/date";

const DEFAULT_WEEKLY_OPTS = {
  infinite: false,
};

export function weeklyCalendar<T>(globalOptions: NormalizedCalendarOptions<T>) {
  return function useWeeklyCalendar<M extends SelectionMode | undefined = undefined>(opts?: WeeklyOptions<M, T>): WeeklyCalendarComposable<T, M> {
    const { infinite, mode, count = 1, step = 1, minRange, maxRange, maxSelections, onSelect } = { ...DEFAULT_WEEKLY_OPTS, ...opts };

    const startWeekId = weekIdFromDate(globalOptions.startOn, globalOptions.firstDayOfWeek);

    let minWeekId: WeekId | undefined;
    let maxWeekId: WeekId | undefined;
    if (!infinite) {
      minWeekId = startWeekId;
      maxWeekId = globalOptions.maxDate
        ? weekIdFromDate(globalOptions.maxDate, globalOptions.firstDayOfWeek)
        : startWeekId;
    }

    // Create selection state — getOrCreateState is needed by generateWeek
    const { selectedIds, listeners, getOrCreateState, selectDate, clearSelection } = createSelectionState<T, M>(
      globalOptions.preSelection,
      mode as M,
      { minRange, maxRange, maxSelections },
    );

    const nextWeekId = makeNextWeekId(globalOptions.firstDayOfWeek);
    const prevWeekId = makePrevWeekId(globalOptions.firstDayOfWeek);

    const nav = createNavigation<WeekId, Week<T>>(
      startWeekId,
      (id) => generateWeek(id, globalOptions, getOrCreateState),
      !!infinite,
      minWeekId,
      maxWeekId,
      nextWeekId,
      prevWeekId,
      undefined,
      // Pin weeks that contain a selected day so navigating away doesn't drop the selection.
      (id) => {
        for (const dayId of selectedIds) {
          const year = parseInt(dayId.substring(0, 4));
          const month = parseInt(dayId.substring(5, 7)) - 1;
          const day = parseInt(dayId.substring(8, 10));
          if (weekIdFromDate(new Date(year, month, day), globalOptions.firstDayOfWeek) === id) { return false; }
        }
        return true;
      },
      count,
      step,
    );

    // Pre-generate all weeks in finite mode
    if (!infinite && globalOptions.maxDate) {
      const endId = weekIdFromDate(globalOptions.maxDate, globalOptions.firstDayOfWeek);
      let id = startWeekId;
      while (id <= endId) {
        nav.ensureCached(id);
        id = nextWeekId(id);
      }
    }

    // Eagerly cache weeks that contain pre-selected dates so selectedDates is
    // accurate even for dates that haven't been navigated to yet.
    for (const date of globalOptions.preSelection) {
      const id = weekIdFromDate(date, globalOptions.firstDayOfWeek);
      nav.ensureCached(id);
    }

    const weeks = computed(() => nav.allPeriods.value);

    const days = computed(() => {
      return weeks.value.flatMap(w => w.days);
    });

    // Keep disabled states in sync for already-cached days when reactive options change.
    watchEffect(() => {
      const disabledIds = globalOptions.disabledIds;
      const minDate = globalOptions.minDate;
      const maxDate = globalOptions.maxDate;
      const disabledFn = globalOptions.disabledFn;
      for (const day of days.value) {
        day.state.disabled = isDateDisabled(day.date, disabledIds, minDate, maxDate, disabledFn);
      }
    });

    const selectedDates = computed(() => days.value.filter(d => selectedIds.has(d.id)));

    // Fire onSelect callback when selection changes
    if (onSelect) {
      watch(selectedDates, (val) => { onSelect(val); }, { flush: 'sync' });
    }

    // Reactive currentWeekAndYear backed by nav — getter/setter removes watch loops.
    const currentWeekAndYear = reactive({
      get weekNumber() { return weekFromWeekId(nav.currentPeriodId.value); },
      set weekNumber(value: number) {
        const newId = (yearFromWeekId(nav.currentPeriodId.value) * 100 + value) as WeekId;
        if (newId !== nav.currentPeriodId.value) { nav.jumpTo(newId); }
      },
      get year() { return yearFromWeekId(nav.currentPeriodId.value); },
      set year(value: number) {
        const newId = (value * 100 + currentWeekAndYear.weekNumber) as WeekId;
        if (newId !== nav.currentPeriodId.value) { nav.jumpTo(newId); }
      },
    });

    return {
      currentWeek: nav.currentPeriod,
      currentWeekAndYear,
      weeks,
      visibleWeeks: nav.visiblePeriods,
      days,
      selectedDates,
      nextWeek: () => { nav.next(); },
      prevWeek: () => { nav.prev(); },
      nextWeekEnabled: nav.nextEnabled,
      prevWeekEnabled: nav.prevEnabled,
      listeners,
      selectDate,
      clearSelection,
    };
  };
}

