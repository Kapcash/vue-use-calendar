import { computed, reactive } from "vue";
import { Month, MonthlyCalendarComposable, MonthlyOptions, NormalizedCalendarOptions, MonthId, SelectionMode } from "../types";
import { monthIdFromDate, monthIdFromYearMonth, monthFromMonthId, yearFromMonthId, generateMonth } from "../utils/month";
import { createNavigation } from "../core/navigation";
import { createSelectionState } from "../core/selection";

export function monthlyCalendar<T, M extends SelectionMode | undefined = undefined>(globalOptions: NormalizedCalendarOptions<T, M>) {
  return function useMonthlyCalendar(opts: MonthlyOptions = {}): MonthlyCalendarComposable<T, M> {
    const { infinite = false, fullWeeks = true } = opts;

    const startMonthId: MonthId = monthIdFromDate(globalOptions.startOn);

    // Determine finite bounds
    let minMonthId: MonthId | undefined;
    let maxMonthId: MonthId | undefined;
    if (!infinite) {
      minMonthId = startMonthId;
      maxMonthId = globalOptions.maxDate
        ? monthIdFromDate(globalOptions.maxDate) as MonthId
        : startMonthId;
    }

    // Compute required cache size based on the date range
    const endMonthId = globalOptions.maxDate
      ? monthIdFromDate(globalOptions.maxDate) as MonthId
      : startMonthId;
    const preGenerateCount = endMonthId - startMonthId + 1;
    const cacheSize = Math.max(13, preGenerateCount);

    // Create selection state — getOrCreateState is needed by generateMonth
    const { selectedIds, listeners, getOrCreateState, selectDate, clearSelection } = createSelectionState<T, M>(
      globalOptions.preSelection,
      globalOptions.mode,
    );

    const nav = createNavigation<MonthId, Month<T>>(
      startMonthId,
      (id) => generateMonth(id, globalOptions, fullWeeks, getOrCreateState),
      infinite,
      minMonthId,
      maxMonthId,
      undefined,
      undefined,
      cacheSize,
      // Pin months that contain a selected day so navigating away doesn't drop the selection.
      (id) => {
        for (const dayId of selectedIds) {
          const year = parseInt(dayId.substring(0, 4));
          const month = parseInt(dayId.substring(5, 7)) - 1; // 0-indexed
          if (monthIdFromYearMonth(year, month) === id) { return false; }
        }
        return true;
      },
    );

    // Pre-generate all months from startOn to maxDate when maxDate is set
    if (globalOptions.maxDate) {
      for (let id = startMonthId; id <= endMonthId; id++) {
        nav.ensureCached(id);
      }
    }

    // Eagerly cache months that contain pre-selected dates so selectedDates is
    // accurate even for dates that haven't been navigated to yet.
    for (const date of globalOptions.preSelection) {
      const id = monthIdFromDate(date) as MonthId;
      nav.ensureCached(id);
    }

    // Flat list of all days across all cached months
    const days = computed(() => {
      return nav.allPeriods.value.flatMap(m => m.days);
    });

    // Pure days = days without otherMonth padding
    const pureDays = computed(() => {
      return days.value.filter(d => !d.otherMonth);
    });

    const selectedDates = computed(() => pureDays.value.filter(d => selectedIds.has(d.id)));

    // Reactive currentMonthAndYear backed by nav — getter/setter removes watch loops.
    const currentMonthAndYear = reactive({
      get month() { return monthFromMonthId(nav.currentPeriodId.value); },
      set month(value: number) {
        const clamped = Math.min(11, Math.max(0, value));
        const newId = monthIdFromYearMonth(currentMonthAndYear.year, clamped) as MonthId;
        if (newId !== nav.currentPeriodId.value) { nav.jumpTo(newId); }
      },
      get year() { return yearFromMonthId(nav.currentPeriodId.value); },
      set year(value: number) {
        const newId = monthIdFromYearMonth(value, currentMonthAndYear.month) as MonthId;
        if (newId !== nav.currentPeriodId.value) { nav.jumpTo(newId); }
      },
    });

    // Sorted list of all cached months
    const months = computed(() => nav.allPeriods.value);

    function nextMonth() {
      nav.next();
    }

    function prevMonth() {
      nav.prev();
    }

    return {
      currentMonth: nav.currentPeriod,
      currentMonthAndYear,
      months,
      days,
      pureDays,
      selectedDates,
      nextMonth,
      prevMonth,
      nextMonthEnabled: nav.nextEnabled,
      prevMonthEnabled: nav.prevEnabled,
      listeners,
      selectDate,
      clearSelection,
    };
  };
}

