import { Locale } from "date-fns";
import { ComputedRef, Ref, ShallowReactive } from "vue";
import { CalendarFactory, CalendarDate } from "./models/CalendarDate";
import { useYearsList } from "./composables/use-years-list";
import { useMonthsList } from "./composables/use-months-list";
import { useWeekdays } from "./composables/use-weekdays";

type DateInput = Date | string;
export type FirstDayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type WeekdayInputFormat = 'i' | 'io' | 'ii' | 'iii' | 'iiii' | 'iiiii' | 'iiiiii';
export type MonthInputFormat = 'M' | 'Mo' | 'MM' | 'MMM' | 'MMMM' | 'MMMMM' | 'Month' | 'Lo' | 'LL' | 'LLL' | 'LLLL' | 'LLLLL';
export type YearInputFormat = `y${string}` | `Y${string}` | `R${string}` | `u${string}`;

export interface CalendarComposables<C extends CalendarDate> {
  useMonthlyCalendar: (opts?: MontlyOptions) => MonthlyCalendarComposable<C>;
  useWeeklyCalendar: (opts?: MontlyOptions) => WeeklyCalendarComposable<C>;
  useWeekdays: ReturnType<typeof useWeekdays>;
  useMonthsList: ReturnType<typeof useMonthsList>;
  useYearsList: ReturnType<typeof useYearsList>;
}

interface CalendarComposable<C extends CalendarDate> {
  days: ComputedRef<Array<C>>;
  selectedDates: Array<C>;
  listeners: Listeners<C>;
}

export interface CalendarOptions<C extends CalendarDate = CalendarDate> {
  startOn?: DateInput;
  minDate?: DateInput;
  maxDate?: DateInput;
  disabled?: Array<DateInput>;
  firstDayOfWeek?: FirstDayOfWeek;
  locale?: Locale;
  preSelection?: Array<Date> | Date;
  factory?: (date: CalendarDate) => C;
}

export interface NormalizedCalendarOptions<C extends CalendarDate = CalendarDate> {
  startOn: Date;
  minDate?: Date;
  maxDate?: Date;
  disabled: Array<Date>;
  firstDayOfWeek: FirstDayOfWeek;
  locale?: Locale;
  preSelection: Array<Date>;
  factory: CalendarFactory<C>;
}

export interface Computeds<C extends CalendarDate> {
  /** All the dates, without the copies */
  pureDates: ComputedRef<C[]>;
  selectedDates: ComputedRef<C[]>;
  hoveredDates: ComputedRef<C[]>;
  betweenDates: ComputedRef<C[]>;
}

export interface Listeners<C extends CalendarDate> {
  selectSingle: (clickedDate: C) => void;
  selectRange: (clickedDate: C) => void;
  selectMultiple: (clickedDate: C) => void;
  hoverRange: (hoveredDate: C) => void;
  resetHover: () => void;
}

export interface Selectors<C extends CalendarDate> extends Listeners<C> {
  selection: Array<C>;
}

// Month

export interface MontlyOptions {
  infinite?: boolean;
  fullWeeks?: boolean;
}

export interface WrappedDays<C extends CalendarDate = CalendarDate> {
  days: Array<C>;
  index: number;
}

export class Month<C extends CalendarDate = CalendarDate> implements WrappedDays<C> {
  days: Array<C> = [];
  month: number;
  year: number;
  index: number;

  constructor (month: number, year: number, days: Array<C>) {
    this.month = month;
    this.year = year;
    this.index = month + year * 12;
    this.days = days;
  }

  public isAfter(anotherMonth: Month): boolean {
    return this.year > anotherMonth.year || (this.year === anotherMonth.year && this.month > anotherMonth.month);
  }
  
  public isBefore(anotherMonth: Month): boolean {
    return this.year < anotherMonth.year || (this.year === anotherMonth.year && this.month < anotherMonth.month);
  }
}

export interface MonthlyCalendarComposable<C extends CalendarDate> extends CalendarComposable<C> {
  currentMonthAndYear: ShallowReactive<{ month: number; year: number }>;
  currentMonth: ComputedRef<Month<C>>;
  months: ShallowReactive<Month<C>[]>;
  nextMonth: () => void;
  prevMonth: () => void;
  nextMonthEnabled: ComputedRef<boolean>;
  prevMonthEnabled: ComputedRef<boolean>;
}

// Week

export interface Week<C extends CalendarDate = CalendarDate> extends WrappedDays<C> {
  weekNumber: number;
  month: number;
  year: number;
}

export interface WeeklyCalendarComposable<C extends CalendarDate> extends CalendarComposable<C> {
  weeks: Array<Week<C>>;
  currentWeekIndex: Ref<number>;
  currentWeek: ComputedRef<Week<C>>;
  nextWeek: () => void;
  prevWeek: () => void;
  nextWeekEnabled: ComputedRef<boolean>;
  prevWeekEnabled: ComputedRef<boolean>;
}

export interface WeeklyOptions {
  infinite?: boolean;
}

export type GeneratorComposable = Array<string>;
