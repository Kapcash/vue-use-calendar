import { computed, reactive, watch } from "vue";
import { Month, MonthlyCalendarComposable, MonthlyOptions, NormalizedCalendarOptions, MonthId } from "../types";
import { monthIdFromDate, monthIdFromYearMonth, monthFromMonthId, yearFromMonthId, generateMonth } from "../utils/month";
import { createNavigation } from "../core/navigation";
import { createSelectionState } from "../core/selection";

export function monthlyCalendar<T>(globalOptions: NormalizedCalendarOptions<T>) {
  return function useMonthlyCalendar(opts: MonthlyOptions = {}): MonthlyCalendarComposable<T> {
    const { infinite = true, fullWeeks = true } = opts;

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
    const { selectedIds, listeners, getOrCreateState } = createSelectionState<T>(
      globalOptions.preSelection,
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
    );

    // Pre-generate all months from startOn to maxDate when maxDate is set
    if (globalOptions.maxDate) {
      for (let id = startMonthId; id <= endMonthId; id++) {
        nav.ensureCached(id);
      }
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

    // Reactive state of current month/year for two-way binding
    const currentMonthAndYear = reactive({
      month: globalOptions.startOn.getMonth(),
      year: globalOptions.startOn.getFullYear(),
    });

    // Sync currentMonthAndYear when navigation changes
    watch(
      () => nav.currentPeriodId.value,
      (newId) => {
        const m = monthFromMonthId(newId);
        const y = yearFromMonthId(newId);
        if (currentMonthAndYear.month !== m || currentMonthAndYear.year !== y) {
          currentMonthAndYear.month = m;
          currentMonthAndYear.year = y;
        }
      },
    );

    // Sync navigation when currentMonthAndYear is mutated directly
    watch(
      currentMonthAndYear,
      (val) => {
        const clampedMonth = Math.min(11, Math.max(0, val.month));
        const newId = monthIdFromYearMonth(val.year, clampedMonth) as MonthId;
        if (newId !== nav.currentPeriodId.value) {
          nav.jumpTo(newId);
        }
      },
    );

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
      selectedDates,
      nextMonth,
      prevMonth,
      nextMonthEnabled: nav.nextEnabled,
      prevMonthEnabled: nav.prevEnabled,
      listeners,
    };
  };
}
