import { startOfWeek, endOfWeek, getWeek, getWeekYear, addDays } from "date-fns";
import { Week, NormalizedCalendarOptions, WeekId, StateProvider, FirstDayOfWeek } from "../types";
import { generateConsecutiveDays } from "../core/calendar-day";

// ── Week ID arithmetic ───────────────────────────────────────────────────────

/**
 * The numeric base used to pack year and week number into a single integer WeekId.
 * Chosen as 100 because ISO week numbers never exceed 53, leaving no risk of collision
 * (e.g. week 3 of 2026 → 202603). This also makes the ID human-readable and sortable
 * with plain numeric comparison.
 */
const WEEK_ID_RADIX = 100;

/** Compute WeekId from year and ISO week number: year * WEEK_ID_RADIX + week. */
export function weekIdFromYearWeek(year: number, week: number): WeekId {
  return year * WEEK_ID_RADIX + week;
}

/** Extract year from WeekId. */
export function yearFromWeekId(weekId: WeekId): number {
  return Math.floor(weekId / WEEK_ID_RADIX);
}

/** Extract week number from WeekId. */
export function weekFromWeekId(weekId: WeekId): number {
  return weekId % WEEK_ID_RADIX;
}

/**
 * Compute WeekId from a Date.
 */
export function weekIdFromDate(date: Date, firstDayOfWeek: FirstDayOfWeek): WeekId {
  const week = getWeek(date, { weekStartsOn: firstDayOfWeek });
  const year = getWeekYear(date, { weekStartsOn: firstDayOfWeek });
  return weekIdFromYearWeek(year, week);
}

/**
 * Generate a Week object for a given WeekId.
 */
export function generateWeek<T>(
  weekId: WeekId,
  options: NormalizedCalendarOptions<T>,
  stateProvider?: StateProvider,
): Week<T> {
  const weekNumber = weekFromWeekId(weekId);

  // Approximate the date for this week: Jan 1 of the year + (weekNumber - 1) * 7 days
  // Then find the actual week start/end
  const approxDate = approximateDateInWeek(weekId);
  const weekStart = startOfWeek(approxDate, { weekStartsOn: options.firstDayOfWeek });
  const weekEnd = endOfWeek(approxDate, { weekStartsOn: options.firstDayOfWeek });

  const days = generateConsecutiveDays(weekStart, weekEnd, options, undefined, stateProvider);

  return {
    id: weekId,
    weekNumber,
    month: days[0].date.getMonth(),
    year: days[0].date.getFullYear(),
    days,
  };
}

/**
 * Returns a date that falls somewhere within the given week.
 * Used as an anchor for ±7 day arithmetic in makeNextWeekId / makePrevWeekId.
 */
function approximateDateInWeek(weekId: WeekId): Date {
  const year = yearFromWeekId(weekId);
  const weekNumber = weekFromWeekId(weekId);
  return new Date(year, 0, 1 + (weekNumber - 1) * 7);
}

/**
 * Returns a function that advances a WeekId by one week.
 * Uses +7 days date arithmetic — correct across all year boundaries and
 * years with 52 or 53 ISO weeks without any hardcoded week count.
 */
export function makeNextWeekId(firstDayOfWeek: FirstDayOfWeek): (weekId: WeekId) => WeekId {
  return (weekId) => weekIdFromDate(addDays(approximateDateInWeek(weekId), 7), firstDayOfWeek);
}

/**
 * Returns a function that moves a WeekId back by one week.
 * Uses -7 days date arithmetic — correct across all year boundaries and
 * years with 52 or 53 ISO weeks without any hardcoded week count.
 */
export function makePrevWeekId(firstDayOfWeek: FirstDayOfWeek): (weekId: WeekId) => WeekId {
  return (weekId) => weekIdFromDate(addDays(approximateDateInWeek(weekId), -7), firstDayOfWeek);
}
