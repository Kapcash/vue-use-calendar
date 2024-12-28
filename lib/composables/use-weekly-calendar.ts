import { computed, ref, ShallowReactive, watchEffect } from "vue";
import { WeeklyOptions, NormalizedCalendarOptions, WeeklyCalendarComposable, Week } from '../types';
import { disableOutOfRangeDates } from "../utils/utils";
import { CalendarDate } from "../models/CalendarDate";
import { useDaysComputeds, useSelectors } from "./reactiveDates";
import { endOfWeek, startOfWeek } from "date-fns";
import { useNavigation } from "./use-navigation";
import { weekGenerators } from "../utils/utils.week";

const DEFAULT_MONTLY_OPTS: WeeklyOptions = {
  infinite: false,
};

export function weeklyCalendar<C extends CalendarDate>(globalOptions: NormalizedCalendarOptions<C>) {
  const { generateConsecutiveDays, wrapByWeek, generateWeek } = weekGenerators(globalOptions);

  return function useWeeklyCalendar(opts?: WeeklyOptions): WeeklyCalendarComposable<C> {
    const { infinite } = { ...DEFAULT_MONTLY_OPTS, ...opts };

    const weeklyDays = generateConsecutiveDays(
      startOfWeek(globalOptions.startOn, { weekStartsOn: globalOptions.firstDayOfWeek }),
      endOfWeek(globalOptions.maxDate || globalOptions.startOn, { weekStartsOn: globalOptions.firstDayOfWeek }),
    );
    
    disableOutOfRangeDates(weeklyDays, globalOptions.minDate, globalOptions.maxDate);
    
    const daysByWeeks = wrapByWeek(weeklyDays) as ShallowReactive<Week<C>[]>;
    const days = computed(() => daysByWeeks.flatMap(week => week.days));

    watchEffect(() => {
      disableOutOfRangeDates(weeklyDays, globalOptions.minDate, globalOptions.maxDate);
    });

    const currentWeekIndex = ref(0);

    const { currentWrapper, nextWrapper, prevWrapper, prevWrapperEnabled, nextWrapperEnabled } = useNavigation(
      daysByWeeks,
      (newWeekIndex, currentWeek) => {
        const year = parseInt(newWeekIndex.toString().slice(0, 4), 10);
        const weekNumber = parseInt(newWeekIndex.toString().slice(4), 10);
        return generateWeek({ year, weekNumber }, {
          firstDayOfWeek: globalOptions.firstDayOfWeek,
        }) as Week<C>;
      },
      infinite);

    const computeds = useDaysComputeds(days);
    const { selection, ...selectors } = useSelectors(days, computeds.betweenDates, computeds.hoveredDates);

    return {
      currentWeek: currentWrapper,
      currentWeekIndex,
      days,
      weeks: daysByWeeks,
      nextWeek: nextWrapper,
      prevWeek: prevWrapper,
      prevWeekEnabled: prevWrapperEnabled,
      nextWeekEnabled: nextWrapperEnabled,
      selectedDates: selection,
      listeners: selectors,
    };
  };
}
