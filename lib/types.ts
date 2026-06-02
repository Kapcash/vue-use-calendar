import { Locale } from "date-fns";
import { ComputedRef, MaybeRefOrGetter } from "vue";
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
  isRangeStart: boolean;
  isRangeEnd: boolean;
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

// ── Selection mode ──────────────────────────────────────────────────

export type SelectionMode = 'single' | 'range' | 'multiple';

export interface SingleSelectionHandlers<T = unknown> {
  selectSingle: (day: CalendarDay<T>) => void;
}

export interface RangeSelectionHandlers<T = unknown> {
  selectRange: (day: CalendarDay<T>) => void;
  hoverRange: (day: CalendarDay<T>) => void;
  resetHover: () => void;
}

export interface MultipleSelectionHandlers<T = unknown> {
  selectMultiple: (day: CalendarDay<T>) => void;
}

/** Narrows the handlers object to only the methods valid for the given mode.
 *  When mode is `undefined` (no mode specified), all handlers are exposed. */
export type ModeHandlers<T, M extends SelectionMode | undefined> =
  M extends 'single' ? SingleSelectionHandlers<T> :
  M extends 'range' ? RangeSelectionHandlers<T> :
  M extends 'multiple' ? MultipleSelectionHandlers<T> :
  SelectionHandlers<T>;

// ── Selection handlers ──────────────────────────────────────────────

/** All selection handlers. Returned when no mode is specified. */
export interface SelectionHandlers<T = unknown> {
  selectSingle: (day: CalendarDay<T>) => void;
  selectRange: (day: CalendarDay<T>) => void;
  selectMultiple: (day: CalendarDay<T>) => void;
  hoverRange: (day: CalendarDay<T>) => void;
  resetHover: () => void;
}

// ── Options ─────────────────────────────────────────────────────────

export interface CalendarOptions<T = unknown> {
  startOn?: MaybeRefOrGetter<DateInput | undefined>;
  minDate?: MaybeRefOrGetter<DateInput | undefined>;
  maxDate?: MaybeRefOrGetter<DateInput | undefined>;
  disabled?: MaybeRefOrGetter<Array<DateInput> | undefined> | ((date: Date) => boolean);
  firstDayOfWeek?: MaybeRefOrGetter<FirstDayOfWeek | undefined>;
  locale?: MaybeRefOrGetter<Locale | undefined>;
  preSelection?: MaybeRefOrGetter<Array<Date> | Date | undefined>;
  meta?: (date: Date) => T;
}

export interface NormalizedCalendarOptions<T = unknown> {
  startOn: Date;
  minDate?: Date;
  maxDate?: Date;
  /** Set of "YYYY-MM-DD" day ID strings for O(1) disabled lookup. */
  disabledIds: Set<string>;
  /** Function-based disabled predicate. Called per-day when provided. */
  disabledFn?: (date: Date) => boolean;
  firstDayOfWeek: FirstDayOfWeek;
  locale?: Locale;
  preSelection: Date[];
  meta: (date: Date) => T;
}

// ── Composable return types ─────────────────────────────────────────

export interface MonthlyOptions<M extends SelectionMode | undefined = undefined, T = unknown> {
  infinite?: boolean;
  fullWeeks?: boolean;
  mode?: M;
  /** Number of consecutive months to display simultaneously. Defaults to 1. */
  count?: number;
  /** Number of months to advance/retreat per navigation step. Defaults to 1. */
  step?: number;
  /** Minimum number of days in a range selection (inclusive of endpoints). Only applies to range mode. */
  minRange?: number;
  /** Maximum number of days in a range selection (inclusive of endpoints). Only applies to range mode. */
  maxRange?: number;
  /** Maximum number of selected days in multiple mode. */
  maxSelections?: number;
  /** Callback invoked whenever the selection changes. */
  onSelect?: (selectedDates: CalendarDay<T>[]) => void;
}

export interface WeeklyOptions<M extends SelectionMode | undefined = undefined, T = unknown> {
  infinite?: boolean;
  mode?: M;
  /** Number of consecutive weeks to display simultaneously. Defaults to 1. */
  count?: number;
  /** Number of weeks to advance/retreat per navigation step. Defaults to 1. */
  step?: number;
  /** Minimum number of days in a range selection (inclusive of endpoints). Only applies to range mode. */
  minRange?: number;
  /** Maximum number of days in a range selection (inclusive of endpoints). Only applies to range mode. */
  maxRange?: number;
  /** Maximum number of selected days in multiple mode. */
  maxSelections?: number;
  /** Callback invoked whenever the selection changes. */
  onSelect?: (selectedDates: CalendarDay<T>[]) => void;
}

export interface MonthlyCalendarComposable<T = unknown, M extends SelectionMode | undefined = undefined> {
  currentMonthAndYear: Reactive<{ month: number; year: number }>;
  currentMonth: ComputedRef<Month<T>>;
  months: ComputedRef<Month<T>[]>;
  visibleMonths: ComputedRef<Month<T>[]>;
  days: ComputedRef<CalendarDay<T>[]>;
  pureDays: ComputedRef<CalendarDay<T>[]>;
  selectedDates: ComputedRef<CalendarDay<T>[]>;
  nextMonth: () => void;
  prevMonth: () => void;
  nextMonthEnabled: ComputedRef<boolean>;
  prevMonthEnabled: ComputedRef<boolean>;
  listeners: ModeHandlers<T, M>;
  selectDate: (date: Date) => void;
  clearSelection: () => void;
}

export interface WeeklyCalendarComposable<T = unknown, M extends SelectionMode | undefined = undefined> {
  currentWeek: ComputedRef<Week<T>>;
  currentWeekAndYear: Reactive<{ year: number; weekNumber: number }>;
  weeks: ComputedRef<Week<T>[]>;
  visibleWeeks: ComputedRef<Week<T>[]>;
  days: ComputedRef<CalendarDay<T>[]>;
  selectedDates: ComputedRef<CalendarDay<T>[]>;
  nextWeek: () => void;
  prevWeek: () => void;
  nextWeekEnabled: ComputedRef<boolean>;
  prevWeekEnabled: ComputedRef<boolean>;
  listeners: ModeHandlers<T, M>;
  selectDate: (date: Date) => void;
  clearSelection: () => void;
}

export interface CalendarComposables<T = unknown> {
  useMonthlyCalendar: <M extends SelectionMode | undefined = undefined>(opts?: MonthlyOptions<M, T>) => MonthlyCalendarComposable<T, M>;
  useWeeklyCalendar: <M extends SelectionMode | undefined = undefined>(opts?: WeeklyOptions<M, T>) => WeeklyCalendarComposable<T, M>;
  useWeekdays: (format?: MaybeRefOrGetter<WeekdayInputFormat>) => ComputedRef<string[]>;
  useMonthsList: (opts?: { format?: MaybeRefOrGetter<MonthInputFormat> }) => ComputedRef<string[]>;
  useYearsList: (opts?: YearsListOptions) => ComputedRef<string[]>;
}

export interface YearsListOptions {
  format?: MaybeRefOrGetter<YearInputFormat>;
  fromYear?: MaybeRefOrGetter<number>;
  toYear?: MaybeRefOrGetter<number>;
  amount?: MaybeRefOrGetter<number>;
}

/** Plain string array returned by static generator composables (useWeekdays, useYearsList, etc.). */
export type StringList = Array<string>;
