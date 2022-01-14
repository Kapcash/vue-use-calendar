import { Locale } from "date-fns";
import { ComputedRef, ShallowReactive, ShallowRef } from "vue";
import { CalendarDate } from "./CalendarDate";

type DateInput = Date | string;
export type FirstDayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type WeekdayInputFormat = 'i' | 'io' | 'ii' | 'iii' | 'iiii' | 'iiiii' | 'iiiiii';

export type Constructor<T extends CalendarDate> = { new (...args: any[]): T };
export type CalendarFactory<C extends CalendarDate = CalendarDate> = (...args: any[]) => C;

export interface CalendarComposables {
  useWeekdays: (weekdayFormat?: WeekdayInputFormat) => WeekdaysComposable;
  useMonthlyCalendar: (opts?: MontlyOptions) => MonthlyCalendarComposable;
  useWeeklyCalendar: () => WeeklyCalendarComposable;
  selectedDates: ComputedRef<Array<CalendarDate>>;
  listeners: {
    selectSingle: (clickedDate: CalendarDate) => void;
    selectMultiple: (clickedDate: CalendarDate) => void;
    selectRange: (clickedDate: CalendarDate) => void;
    hoverMultiple: (clickedDate: CalendarDate) => void;
    resetHover: () => void;
  };
}

export interface CalendarOptions<C extends CalendarDate = CalendarDate> {
  from: DateInput;
  to?: DateInput;
  disabled: Array<DateInput>;
  firstDayOfWeek: FirstDayOfWeek;
  locale?: Locale;
  preSelection?: Array<Date> | Date;
  calendarClass: C;
  factory?: CalendarFactory<C>;
}

export interface MontlyOptions {
  infinite?: boolean;
  otherMonthDays?: boolean;
}

export type Month = {
  month: number;
  year: number;
  days: CalendarDate[];
};
export type Week = Array<CalendarDate>;

export interface MonthlyCalendarComposable<C extends CalendarDate> {
  currentMonth: ShallowRef<Month>;
  months: ShallowReactive<Month[]>;
  nextMonth: () => void;
  prevMonth: () => void;
  days: ComputedRef<Array<C>>;
  nextMonthEnabled: ComputedRef<boolean>;
  prevMonthEnabled: ComputedRef<boolean>;
}

export interface WeeklyCalendarComposable {
  weeks: Array<Week>;
}

export type WeekdaysComposable = Array<string>;
