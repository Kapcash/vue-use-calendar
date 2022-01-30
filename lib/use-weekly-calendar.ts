import { computed, ref, ShallowReactive } from "vue";
import { startOfMonth, endOfMonth } from "date-fns";
import { WeeklyOptions, NormalizedCalendarOptions, WeeklyCalendarComposable, Week } from './types';
import { generateDays, wrapByWeek } from "./utils";
import { ICalendarDate } from "./CalendarDate";
import { useComputeds, useSelectors } from "./computeds";

const DEFAULT_MONTLY_OPTS: WeeklyOptions = {
  infinite: false,
  fullWeeks: true,
};

export function weeklyCalendar<C extends ICalendarDate>(globalOptions: NormalizedCalendarOptions<C>) {
  return function useWeeklyCalendar(opts?: WeeklyOptions): WeeklyCalendarComposable<C> {
    const { infinite, fullWeeks } = { ...DEFAULT_MONTLY_OPTS, ...opts };

    let weeklyDays = generateDays(
      startOfMonth(globalOptions.from),
      endOfMonth(globalOptions.to!),
      globalOptions.disabled,
      globalOptions.preSelection,
    );

    if (globalOptions.factory) {
      weeklyDays = weeklyDays.map(globalOptions.factory);
    }

    const daysByWeeks = wrapByWeek(weeklyDays, fullWeeks!, globalOptions.firstDayOfWeek) as ShallowReactive<Week<C>[]>;
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
