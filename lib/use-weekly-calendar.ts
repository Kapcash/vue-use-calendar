import { computed, ref, ShallowReactive } from "vue";
import { WeeklyOptions, NormalizedCalendarOptions, WeeklyCalendarComposable, Week } from './types';
import { disableExtendedDates, generateDays, wrapByWeek } from "./utils";
import { ICalendarDate } from "./CalendarDate";
import { useComputeds, useSelectors } from "./computeds";
import { endOfWeek, startOfWeek } from "date-fns";

const DEFAULT_MONTLY_OPTS: WeeklyOptions = {
  infinite: false,
};

export function weeklyCalendar<C extends ICalendarDate>(globalOptions: NormalizedCalendarOptions<C>) {
  return function useWeeklyCalendar(opts?: WeeklyOptions): WeeklyCalendarComposable<C> {
    const { infinite } = { ...DEFAULT_MONTLY_OPTS, ...opts };

    let weeklyDays = generateDays(
      startOfWeek(globalOptions.from, { weekStartsOn: globalOptions.firstDayOfWeek }),
      endOfWeek(globalOptions.to!, { weekStartsOn: globalOptions.firstDayOfWeek }),
      globalOptions.disabled,
      globalOptions.preSelection,
    );
    disableExtendedDates(weeklyDays, globalOptions.from, globalOptions.to!);
    if (globalOptions.factory) {
      weeklyDays = weeklyDays.map(globalOptions.factory);
    }

    if (globalOptions.factory) {
      weeklyDays = weeklyDays.map(globalOptions.factory);
    }

    const daysByWeeks = wrapByWeek(weeklyDays, globalOptions.firstDayOfWeek) as ShallowReactive<Week<C>[]>;
    const days = computed(() => daysByWeeks.flatMap(week => week.days));

    const currentWeekIndex = ref(0);

    const currentWeek = computed(() => daysByWeeks[currentWeekIndex.value]);
    const prevWeekEnabled = computed(() => infinite || currentWeekIndex.value > 0);
    const nextWeekEnabled = computed(() => infinite || currentWeekIndex.value < (daysByWeeks.length - 1));
    
    // function genWeek (WeekIndex: number) {
    //   const newWeek = daysByWeeks[WeekIndex];
    //   const isNext = WeekIndex > currentWeekIndex.value;
    //   if (!newWeek) {
    //     const newWeekYear = currentWeek.value.days[10].weekYearIndex + (isNext ? 1 : -1);
    //     const newWeek = generateWeek(newWeekYear, globalOptions.firstDayOfWeek) as Week<C>;
    //     isNext ? daysByWeeks.push(newWeek) : daysByWeeks.unshift(newWeek);
    //   }
    // }

    function nextWeek () {
      const newWeekndex = currentWeekIndex.value + 1;
      // if (infinite) {
      //   genWeek(newWeekndex);
      // }
      if (nextWeekEnabled.value) {
        currentWeekIndex.value = newWeekndex;
      }
    }

    function prevWeek () {
      const newWeekndex = currentWeekIndex.value - 1;
      // if (infinite) {
      //   genWeek(newWeekndex);
      // }
      if (prevWeekEnabled.value) {
        currentWeekIndex.value = Math.max(0, newWeekndex);
      }
    }

    const computeds = useComputeds(days);

    return {
      currentWeek,
      currentWeekIndex,
      days,
      weeks: daysByWeeks,
      nextWeek,
      prevWeek,
      prevWeekEnabled,
      nextWeekEnabled,
      selectedDates: computeds.selectedDates,
      listeners: useSelectors(days, computeds.selectedDates, computeds.betweenDates, computeds.hoveredDates),
    };
  };
}
