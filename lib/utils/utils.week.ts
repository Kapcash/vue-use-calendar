import { endOfWeek, getWeek, startOfWeek } from "date-fns";
import { ICalendarDate } from "../CalendarDate";
import { NormalizedCalendarOptions, Week } from "../types";
import { generators } from "./utils";

export interface WeekId {
  weekNumber: number;
  year: number;
}

export function weekGenerators<C extends ICalendarDate> (globalOptions: NormalizedCalendarOptions<C>) {
  const { generateConsecutiveDays } = generators(globalOptions);

  function wrapByWeek (days: Array<ICalendarDate>) {
    const getNbWeek = (day: ICalendarDate) => getWeek(day.date, { weekStartsOn: globalOptions.firstDayOfWeek });
  
    function chunk<T> (arr: Array<T>, size = 7) {
      return Array(Math.ceil(arr.length / size)).fill(null).map((_, i) => {
        return arr.slice(i * size, i * size + size);
      });
    }
  
    const firstStartOfWeek = days.findIndex(day => day.date.getDay() === globalOptions.firstDayOfWeek);
    const weeks = [days.slice(0, firstStartOfWeek), ...chunk(days.slice(firstStartOfWeek))].filter(chunk => chunk.length > 0);
  
    const weeksObj: Week[] = weeks.map(days => ({
      weekNumber: getNbWeek(days[0]),
      month: days[0].date.getMonth(),
      year: days[0].date.getFullYear(),
      days,
    }));
    return weeksObj;
  }

  function generateWeek (weekYearId: WeekId, options: Partial<any>): Week {
    const newWeek: Week = {
      ...weekYearId,
      month: 1,
      days: [],
    };
    const weekRefDay = new Date(newWeek.year, newWeek.month);
    const weekDays: ICalendarDate[] = generateConsecutiveDays(startOfWeek(weekRefDay), endOfWeek(weekRefDay));

    newWeek.days = weekDays;
    return newWeek;
  }

  return {
    generateConsecutiveDays,
    generateWeek,
    wrapByWeek,
  };
}