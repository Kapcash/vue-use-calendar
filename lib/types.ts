import { Locale } from "date-fns";
import { ComputedRef, ShallowReactive, ShallowRef } from "vue";
import { ICalendarDate } from "./CalendarDate";

type DateInput = Date | string;
export type FirstDayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type WeekdayInputFormat = 'i' | 'io' | 'ii' | 'iii' | 'iiii' | 'iiiii' | 'iiiiii';

export interface CalendarComposables<C extends ICalendarDate> {
  useWeekdays: (weekdayFormat?: WeekdayInputFormat) => WeekdaysComposable;
  useMonthlyCalendar: (opts?: MontlyOptions) => MonthlyCalendarComposable<C>;
  useWeeklyCalendar: () => WeeklyCalendarComposable;
  selectedDates: ComputedRef<Array<ICalendarDate>>;
  listeners: {
    selectSingle: (clickedDate: ICalendarDate) => void;
    selectMultiple: (clickedDate: ICalendarDate) => void;
    selectRange: (clickedDate: ICalendarDate) => void;
    hoverMultiple: (clickedDate: ICalendarDate) => void;
    resetHover: () => void;
  };
}

export interface CalendarOptions<C extends ICalendarDate = ICalendarDate> {
  from: DateInput;
  to?: DateInput;
  disabled: Array<DateInput>;
  firstDayOfWeek: FirstDayOfWeek;
  locale?: Locale;
  preSelection?: Array<Date> | Date;
  factory?: (date: ICalendarDate) => C;
}

export interface MontlyOptions {
  infinite?: boolean;
  otherMonthDays?: boolean;
}

export type Month = {
  month: number;
  year: number;
  days: ICalendarDate[];
};
export type Week = Array<ICalendarDate>;

export interface MonthlyCalendarComposable<C extends ICalendarDate> {
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
