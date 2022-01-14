import { isToday } from "date-fns";
import { Ref, ref } from "vue";

export class CalendarDate {
  readonly date: Date;
  otherMonth = false;
  disabled: Ref<boolean> = ref(false);
  isSelected: Ref<boolean> = ref(false);
  isBetween: Ref<boolean> = ref(false);
  isHovered: Ref<boolean> = ref(false);

  isToday: boolean;
  isWeekend: boolean;

  constructor ();
  constructor (date: Date);
  constructor (value: number | string);
  constructor (...args: number[]);

  constructor (...args: any[]) {
    // @ts-ignore
    this.date = new Date(...args);
    this.isToday = isToday(this.date);
    
    const weekDay = this.date.getDay();
    this.isWeekend = weekDay === 0 || weekDay > 6;
  }

  get monthYearIndex (): number {
    return this.date.getFullYear() * 12 + this.date.getMonth();
  }

  get dayId (): string {
    return [this.date.getFullYear(), this.date.getMonth(), this.date.getDate()].join('-');
  }

  static yearFromMonthYear(monthYear: number) {
    return Math.floor(monthYear / 12);
  }

  static monthFromMonthYear(monthYear: number) {
    return monthYear % 12;
  }
}
