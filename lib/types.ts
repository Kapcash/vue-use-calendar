import { Locale } from "date-fns";
import { ComputedRef, Ref, ShallowReactive } from "vue";
import { ICalendarDate } from "./CalendarDate";

type DateInput = Date | string;
export type FirstDayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type WeekdayInputFormat = 'i' | 'io' | 'ii' | 'iii' | 'iiii' | 'iiiii' | 'iiiiii';

// Calendar

export interface CalendarComposables<C extends ICalendarDate> {
  useWeekdays: (weekdayFormat?: WeekdayInputFormat) => WeekdaysComposable;
  useMonthlyCalendar: (opts?: MontlyOptions) => MonthlyCalendarComposable<C>;
  useWeeklyCalendar: (opts?: MontlyOptions) => WeeklyCalendarComposable<C>;
}

interface CalendarComposable<C extends ICalendarDate> {
  days: ComputedRef<Array<C>>;
  selectedDates: ComputedRef<Array<C>>;
  listeners: Listeners<C>;
}

export interface CalendarOptions<C extends ICalendarDate> {
  from: DateInput;
  to?: DateInput;
  disabled: Array<DateInput>;
  firstDayOfWeek: FirstDayOfWeek;
  locale?: Locale;
  preSelection?: Array<Date> | Date;
  factory?: (date: ICalendarDate) => C;
}

export interface NormalizedCalendarOptions<C extends ICalendarDate = ICalendarDate> {
  from: Date;
  to?: Date;
  disabled: Array<Date>;
  firstDayOfWeek: FirstDayOfWeek;
  locale?: Locale;
  preSelection?: Array<Date>;
  factory?: (date: ICalendarDate) => C;
}

export interface Computeds<C extends ICalendarDate> {
  selectedDates: ComputedRef<C[]>;
  hoveredDates: ComputedRef<C[]>;
  betweenDates: ComputedRef<C[]>;
}

export interface Listeners<C extends ICalendarDate> {
  selectSingle: (clickedDate: C) => void;
  selectRange: (clickedDate: C) => void;
  selectMultiple: (clickedDate: C) => void;
  hoverMultiple: (hoveredDate: C) => void;
  resetHover: () => void;
}

// Month

export interface MontlyOptions {
  infinite?: boolean;
  fullWeeks?: boolean;
}

export type Month<C extends ICalendarDate = ICalendarDate> = {
  month: number;
  year: number;
  days: C[];
};

export interface MonthlyCalendarComposable<C extends ICalendarDate> extends CalendarComposable<C> {
  currentMonthIndex: Ref<number>;
  currentMonth: ComputedRef<Month<C>>;
  months: ShallowReactive<Month<C>[]>;
  nextMonth: () => void;
  prevMonth: () => void;
  nextMonthEnabled: ComputedRef<boolean>;
  prevMonthEnabled: ComputedRef<boolean>;
}

// Week

export type Week<C extends ICalendarDate = ICalendarDate> = {
  days: Array<C>;
  weekNumber: number;
};

export interface WeeklyCalendarComposable<C extends ICalendarDate> extends CalendarComposable<C> {
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
  fullWeeks?: boolean;
}

export type WeekdaysComposable = Array<string>;
