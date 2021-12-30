import { Ref, ref } from "vue";

export class CalendarDate {
  readonly date: Date
  otherMonth: boolean = false
  disabled: Ref<boolean> = ref(false)
  isSelected: Ref<boolean> = ref(false)
  isHovered: Ref<boolean> = ref(false)

  constructor ();
  constructor (date: Date);
  constructor (value: number | string);
  constructor (year: number, month: number, date?: number, hours?: number, minutes?: number, seconds?: number, ms?: number);

  constructor (...args: any[]) {
    // @ts-ignore
    this.date = new Date(...args)
  }

  get weekend (): boolean {
    const weekDay = this.date.getDay()
    return weekDay === 0 || weekDay > 6
  }

  get monthYearIndex (): number {
    return this.date.getFullYear() * 12 + this.date.getMonth()
  }

  static yearFromMonthYear(monthYear: number) {
    return Math.floor(monthYear / 12)
  }

  static monthFromMonthYear(monthYear: number) {
    return monthYear % 12
  }
}
