import { computed } from "vue";
import { Week, WeeklyCalendarComposable, WeeklyOptions, NormalizedCalendarOptions, WeekId } from "../types";
import { createNavigation } from "../core/navigation";
import { createSelectionState } from "../core/selection";
import { weekIdFromDate, generateWeek, makeNextWeekId, makePrevWeekId } from "../utils/week";

const DEFAULT_WEEKLY_OPTS: WeeklyOptions = {
  infinite: false,
};

export function weeklyCalendar<T>(globalOptions: NormalizedCalendarOptions<T>) {
  return function useWeeklyCalendar(opts?: WeeklyOptions): WeeklyCalendarComposable<T> {
    const { infinite } = { ...DEFAULT_WEEKLY_OPTS, ...opts };

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
    const { selectedIds, listeners, getOrCreateState } = createSelectionState<T>(
      globalOptions.preSelection,
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

    const weeks = computed(() => nav.allPeriods.value);

    const days = computed(() => {
      return weeks.value.flatMap(w => w.days);
    });

    const selectedDates = computed(() => days.value.filter(d => selectedIds.has(d.id)));


    return {
      currentWeek: nav.currentPeriod,
      weeks,
      days,
      selectedDates,
      nextWeek: () => { nav.next(); },
      prevWeek: () => { nav.prev(); },
      nextWeekEnabled: nav.nextEnabled,
      prevWeekEnabled: nav.prevEnabled,
      listeners,
    };
  };
}
