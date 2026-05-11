import { Locale } from "date-fns";
import { ComputedRef } from "vue";
import type { UnwrapNestedRefs } from "vue";

type Reactive<T> = UnwrapNestedRefs<T>;

// ── Date Input ──────────────────────────────────────────────────────

type DateInput = Date | string;

// ── Format types ────────────────────────────────────────────────────

export type FirstDayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type WeekdayInputFormat = 'i' | 'io' | 'ii' | 'iii' | 'iiii' | 'iiiii' | 'iiiiii';
export type MonthInputFormat = 'M' | 'Mo' | 'MM' | 'MMM' | 'MMMM' | 'MMMMM' | 'Lo' | 'LL' | 'LLL' | 'LLLL' | 'LLLLL';
export type YearInputFormat = `y${string}` | `Y${string}` | `R${string}` | `u${string}`;

// ── CalendarDay ─────────────────────────────────────────────────────

export interface CalendarDayState {
  selected: boolean;
  hovered: boolean;
  between: boolean;
  disabled: boolean;
}

/** Function that returns a shared CalendarDayState for a given day ID. */
export type StateProvider = (id: CalendarDayId, disabled: boolean) => CalendarDayState;

export type CalendarDayId = string;

export interface CalendarDay<T = unknown> {
  /** The underlying Date (immutable, treat as read-only) */
  readonly date: Date;
  /** Stable identity key, e.g. "2026-05-10" */
  readonly id: CalendarDayId;
  /** Reactive UI state */
  readonly state: CalendarDayState;
  /** Whether this day is from an adjacent month (for full-week displays) */
  readonly otherMonth: boolean;
  /** User-provided metadata computed via the `meta` option */
  readonly meta: T;
  /** True if this date is today */
  readonly isToday: boolean;
  /** True if Saturday (6) or Sunday (0) */
  readonly isWeekend: boolean;
  /** 0 = Sunday … 6 = Saturday */
  readonly dayOfWeek: number;
}

// ── Period identifiers ──────────────────────────────────────────────

/** Unique index of a month: year * 12 + month (0-indexed month). */
export type MonthId = number;

/** Unique index of a week: year * 100 + isoWeek. */
export type WeekId = number;

// ── Month / Week containers ─────────────────────────────────────────

export interface Month<T = unknown> {
  readonly id: MonthId;
  readonly month: number; // 0-11
  readonly year: number;
  readonly days: CalendarDay<T>[];
}

export interface Week<T = unknown> {
  readonly id: WeekId;
  readonly weekNumber: number;
  readonly month: number;
  readonly year: number;
  readonly days: CalendarDay<T>[];
}

// ── Options ─────────────────────────────────────────────────────────

export interface CalendarOptions<T = unknown> {
  startOn?: DateInput;
  minDate?: DateInput;
  maxDate?: DateInput;
  disabled?: Array<DateInput>;
  firstDayOfWeek?: FirstDayOfWeek;
  locale?: Locale;
  preSelection?: Array<Date> | Date;
  meta?: (date: Date) => T;
}

export interface NormalizedCalendarOptions<T = unknown> {
  startOn: Date;
  minDate?: Date;
  maxDate?: Date;
  disabled: Date[];
  firstDayOfWeek: FirstDayOfWeek;
  locale?: Locale;
  preSelection: Date[];
  meta: (date: Date) => T;
}

// ── Listeners ───────────────────────────────────────────────────────

export interface Listeners<T = unknown> {
  selectSingle: (day: CalendarDay<T>) => void;
  selectRange: (day: CalendarDay<T>) => void;
  selectMultiple: (day: CalendarDay<T>) => void;
  hoverRange: (day: CalendarDay<T>) => void;
  resetHover: () => void;
}

// ── Composable return types ─────────────────────────────────────────

export interface MonthlyOptions {
  infinite?: boolean;
  fullWeeks?: boolean;
}

export interface WeeklyOptions {
  infinite?: boolean;
}

export interface MonthlyCalendarComposable<T = unknown> {
  currentMonthAndYear: Reactive<{ month: number; year: number }>;
  currentMonth: ComputedRef<Month<T>>;
  months: ComputedRef<Month<T>[]>;
  days: ComputedRef<CalendarDay<T>[]>;
  selectedDates: ComputedRef<CalendarDay<T>[]>;
  nextMonth: () => void;
  prevMonth: () => void;
  nextMonthEnabled: ComputedRef<boolean>;
  prevMonthEnabled: ComputedRef<boolean>;
  listeners: Listeners<T>;
}

export interface WeeklyCalendarComposable<T = unknown> {
  currentWeek: ComputedRef<Week<T>>;
  weeks: ComputedRef<Week<T>[]>;
  days: ComputedRef<CalendarDay<T>[]>;
  selectedDates: ComputedRef<CalendarDay<T>[]>;
  nextWeek: () => void;
  prevWeek: () => void;
  nextWeekEnabled: ComputedRef<boolean>;
  prevWeekEnabled: ComputedRef<boolean>;
  listeners: Listeners<T>;
}

export interface CalendarComposables<T = unknown> {
  useMonthlyCalendar: (opts?: MonthlyOptions) => MonthlyCalendarComposable<T>;
  useWeeklyCalendar: (opts?: WeeklyOptions) => WeeklyCalendarComposable<T>;
  useWeekdays: (format?: WeekdayInputFormat) => string[];
  useMonthsList: (opts?: { format?: MonthInputFormat }) => string[];
  useYearsList: (opts?: YearsListOptions) => string[];
}

export interface YearsListOptions {
  format?: YearInputFormat;
  fromYear?: number;
  toYear?: number;
  amount?: number;
}

export type GeneratorComposable = Array<string>;
