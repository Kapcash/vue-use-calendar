import { ComputedRef, ShallowRef } from "vue";
import { CalendarDate } from "./CalendarDate";

type DateInput = Date | string;
export type FirstDayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;


export interface CalendarComposables {
  useWeekdays: () => WeekdaysComposable;
  useMonthlyCalendar: () => MonthlyCalendarComposable;
  useWeeklyCalendar: () => WeeklyCalendarComposable;
  [key: string]: any;
}

export interface CalendarOptions {
  from: DateInput;
  to?: DateInput;
  disabled: Array<DateInput>;
  firstDayOfWeek: FirstDayOfWeek;
  preSelection?: Array<Date> | Date;
}

export type Month = {
  month: number;
  year: number;
  days: CalendarDate[];
};
export type Week = Array<CalendarDate>;

export interface MonthlyCalendarComposable {
  currentMonth: ShallowRef<Month>;
  months: Array<Month>;
  nextMonth: () => void;
  prevMonth: () => void;
  nextMonthEnabled: ComputedRef<boolean>;
  prevMonthEnabled: ComputedRef<boolean>;
}

export interface WeeklyCalendarComposable {
  weeks: Array<Week>;
}

export type WeekdaysComposable = Array<string>;
