import { isToday } from "date-fns";
import { Ref, ref } from "vue";

export interface ICalendarDate {
  readonly date: Date;
  otherMonth: boolean;
  disabled: Ref<boolean>;
  isSelected: Ref<boolean>;
  isBetween: Ref<boolean>;
  isHovered: Ref<boolean>;

  isToday: boolean;
  isWeekend: boolean;
  
  monthYearIndex: number;
  dayId: string;
}

export function calendarFactory (...args: any[]): ICalendarDate {
  // @ts-ignore
  const date = new Date(...args);
  const weekDay = date.getDay();
  return {
    date,
    isToday: isToday(date),
    isWeekend: weekDay === 0 || weekDay > 6,
    otherMonth: false,
    disabled: ref(false),
    isSelected: ref(false),
    isBetween: ref(false),
    isHovered: ref(false),
    monthYearIndex: date.getFullYear() * 12 + date.getMonth(),
    dayId: [date.getFullYear(), date.getMonth(), date.getDate()].join('-'),
  };
}

export function yearFromMonthYear(monthYear: number) {
  return Math.floor(monthYear / 12);
}

export function monthFromMonthYear(monthYear: number) {
  return monthYear % 12;
}
