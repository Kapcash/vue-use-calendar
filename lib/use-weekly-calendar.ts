import { computed, ref, ShallowReactive } from "vue";
import { WeeklyOptions, NormalizedCalendarOptions, WeeklyCalendarComposable, Week } from './types';
import { disableExtendedDates } from "./utils/utils";
import { ICalendarDate } from "./CalendarDate";
import { useComputeds, useSelectors } from "./reactiveDates";
import { endOfWeek, getWeek, startOfWeek } from "date-fns";
import { useNavigation } from "./use-navigation";
import { weekGenerators } from "./utils/utils.week";

const DEFAULT_MONTLY_OPTS: WeeklyOptions = {
  infinite: false,
};

export function weeklyCalendar<C extends ICalendarDate>(globalOptions: NormalizedCalendarOptions<C>) {
  const { generateConsecutiveDays, wrapByWeek, generateWeek } = weekGenerators(globalOptions);

  return function useWeeklyCalendar(opts?: WeeklyOptions): WeeklyCalendarComposable<C> {
    const { infinite } = { ...DEFAULT_MONTLY_OPTS, ...opts };

    const weeklyDays = generateConsecutiveDays(
      startOfWeek(globalOptions.from, { weekStartsOn: globalOptions.firstDayOfWeek }),
      endOfWeek(globalOptions.to!, { weekStartsOn: globalOptions.firstDayOfWeek }),
    );
    
    disableExtendedDates(weeklyDays, globalOptions.from, globalOptions.to!);
    
    const daysByWeeks = wrapByWeek(weeklyDays) as ShallowReactive<Week<C>[]>;
    const days = computed(() => daysByWeeks.flatMap(week => week.days));

    const currentWeekIndex = ref(0);

    const { currentWrapper, nextWrapper, prevWrapper, prevWrapperEnabled, nextWrapperEnabled } = useNavigation(
      daysByWeeks,
      (offset, currentWeek) => {
        const newMonthYear = currentWeek.value.days[0];
        return generateWeek({ year: newMonthYear.date.getFullYear(), weekNumber: getWeek(newMonthYear.date) }, {
          firstDayOfWeek: globalOptions.firstDayOfWeek,
        }) as Week<C>;
      },
      infinite);

    const computeds = useComputeds(days);

    return {
      currentWeek: currentWrapper,
      currentWeekIndex,
      days,
      weeks: daysByWeeks,
      nextWeek: nextWrapper,
      prevWeek: prevWrapper,
      prevWeekEnabled: prevWrapperEnabled,
      nextWeekEnabled: nextWrapperEnabled,
      selectedDates: computeds.selectedDates,
      listeners: useSelectors(days, computeds.selectedDates, computeds.betweenDates, computeds.hoveredDates),
    };
  };
}
