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

  _copied: boolean;
}

export type CalendarFactory<C extends ICalendarDate> = (...args: any[]) => C;

export function generateCalendarFactory<C extends ICalendarDate> (customFactory?: (c: ICalendarDate) => C) {
  const extendFactory = customFactory || ((c: ICalendarDate) => c as C);
  return function (...args: any[]): C {
    // @ts-ignore
    const date = new Date(...args);
    const weekDay = date.getDay();
    return extendFactory({
      date,
      isToday: isToday(date),
      isWeekend: weekDay === 0 || weekDay > 6,
      otherMonth: false,
      disabled: ref(false),
      isSelected: ref(false),
      isBetween: ref(false),
      isHovered: ref(false),
      monthYearIndex: dateToMonthYear(date),
      dayId: [date.getFullYear(), date.getMonth(), date.getDate()].join('-'),
      _copied: false,
    });
  };
}

/** Return a shallow copy that will keep the same property ref pointers */
export function copyCalendarDate<C extends ICalendarDate> (date: C): C {
  return { ...date, _copied: true };
}

export function dateToMonthYear(dateOrYear: Date | number, month?: number) {
  if (typeof dateOrYear === 'number') {
    return dateOrYear * 12 + (month || 0);
  } else {
    return dateOrYear.getFullYear() * 12 + dateOrYear.getMonth();
  }
}

export function yearFromMonthYear(monthYear: number) {
  return Math.floor(monthYear / 12);
}

export function monthFromMonthYear(monthYear: number) {
  return monthYear % 12;
}
