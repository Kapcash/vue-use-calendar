import { isToday } from "date-fns";
import { Ref, ref } from "vue";
import { dateToMonthYear } from "../utils/utils";

export class CalendarDate extends Date {
  /** True if the date is from an adjacent month of the currently shown month */
  otherMonth: boolean = false;
  /** True if the date is not selectionable */
  disabled: Ref<boolean> = ref(false);
  /** True when the date is currently selected */
  isSelected: Ref<boolean> = ref(false);
  /** True when the date is between two selected dates */
  isBetween: Ref<boolean> = ref(false);
  /** True when the date is currently hovered */
  isHovered: Ref<boolean> = ref(false);
  
  _copied: boolean = false;

  constructor(...args: DateConstructorParameters) {
    // @ts-expect-error
    super(...args);
  }

  /** True if the date is the current date */
  get isToday(): boolean {
    return isToday(this);
  }

  get isWeekend(): boolean {
    const weekDay = this.getDay();
    return weekDay === 0 || weekDay > 6;
  }

  get monthYearIndex(): MonthYear {
    return dateToMonthYear(this);
  }

  get dayId(): string {
    return [this.getFullYear(), this.getMonth(), this.getDate()].join('-');
  }

  public copy () {
    const dateCopy = new CalendarDate(this);
    Object.assign(dateCopy, this);
    dateCopy._copied = true;
    return dateCopy;
  }
}

/**
 * 
 * @param customFactory Optional factory function to use a custom implementation of the CalendarDate class
 * @returns A factory function that generates a CalendarDate instance and optionally extends it with the custom factory parameter.
 */
export function generateCalendarFactory<C extends CalendarDate> (customFactory?: (c: CalendarDate) => C): CalendarFactory<C> {
  const extendFactory = customFactory || ((c: CalendarDate) => c as C);
  return function (...args: DateConstructorParameters): C {
    const date = new CalendarDate(...args);
    return extendFactory(date);
  };
}

export type DateConstructorParameters = 
  | ConstructorParameters<new () => Date>               // No arguments
  | ConstructorParameters<new (value: Date) => Date>    // Date argument (copy)
  | ConstructorParameters<new (value: number) => Date>  // Number argument (timestamp)
  | ConstructorParameters<new (value: string) => Date>  // String argument (ISO string)
  | ConstructorParameters<new (...args: [number, number, number, number?, number?, number?, number?]) => Date>; // Multiple numbers

export type CalendarFactory<C extends CalendarDate> = (...args: DateConstructorParameters) => C;

/** Unique index of a month. Two consecutive months will have a consecutive "MonthYear" index. */
export type MonthYear = number;