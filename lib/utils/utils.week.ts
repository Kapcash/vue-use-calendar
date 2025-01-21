import { endOfWeek, getWeek, setWeek, startOfWeek } from "date-fns";
import { ICalendarDate } from "../models/CalendarDate";
import { NormalizedCalendarOptions, Week } from "../types";
import { chunk, generators } from "./utils";

export interface WeekId {
  weekNumber: number;
  year: number;
}

export function weekGenerators<C extends ICalendarDate> (globalOptions: NormalizedCalendarOptions<C>) {
  const { generateConsecutiveDays } = generators(globalOptions);

  function weekFactory (weekDays: Array<C>): Week {
    const getNbWeek = (day: C) => getWeek(day.date, { weekStartsOn: globalOptions.firstDayOfWeek });

    return {
      days: weekDays,
      weekNumber: getNbWeek(weekDays[0]),
      month: weekDays[0].date.getMonth(),
      year: weekDays[0].date.getFullYear(),
      index: parseInt(weekDays[0].date.getFullYear().toString() + getNbWeek(weekDays[0]).toString().padStart(2, '0'), 10),
    };
  }

  function wrapByWeek (days: Array<C>): Array<Week> {
    const firstStartOfWeek = days.findIndex(day => day.date.getDay() === globalOptions.firstDayOfWeek);
    const weeks = [
      days.slice(0, firstStartOfWeek),
      ...chunk(days.slice(firstStartOfWeek), 7),
    ]
      .filter(chunk => chunk.length > 0)
      .map(weekFactory);
    return weeks;
  }

  function generateWeek (weekYearId: WeekId): Week {
    const weekRefDay = setWeek(new Date(weekYearId.year, 0, 0), weekYearId.weekNumber, { weekStartsOn: globalOptions.firstDayOfWeek });
    const weekDays: C[] = generateConsecutiveDays(
      startOfWeek(weekRefDay, { weekStartsOn: globalOptions.firstDayOfWeek }), 
      endOfWeek(weekRefDay, { weekStartsOn: globalOptions.firstDayOfWeek }),
    );
    const newWeek: Week = weekFactory(weekDays);
    return newWeek;
  }

  return {
    generateConsecutiveDays,
    generateWeek,
    wrapByWeek,
  };
}