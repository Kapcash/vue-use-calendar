# All Types

Complete TypeScript type reference for `vue-use-calendar`.

## Core Types

### `CalendarDay<T>`

```ts
interface CalendarDay<T = unknown> {
  readonly date: Date;
  readonly id: string;                // "YYYY-MM-DD"
  readonly state: CalendarDayState;
  readonly otherMonth: boolean;
  readonly meta: T;
  readonly isToday: boolean;
  readonly isWeekend: boolean;
  readonly dayOfWeek: number;         // 0 = Sun … 6 = Sat
}
```

### `CalendarDayState`

```ts
interface CalendarDayState {
  selected: boolean;
  hovered:  boolean;
  between:  boolean;
  disabled: boolean;
}
```

### `Month<T>`

```ts
interface Month<T = unknown> {
  readonly id: MonthId;       // year * 12 + month
  readonly month: number;     // 0-indexed
  readonly year: number;
  readonly days: CalendarDay<T>[];
  readonly startOffset: number; // number of empty cells before day 1
}
```

### `Week<T>`

```ts
interface Week<T = unknown> {
  readonly id: WeekId;        // year * 100 + isoWeek
  readonly weekNumber: number;
  readonly month: number;
  readonly year: number;
  readonly days: CalendarDay<T>[]; // always 7 days
}
```

## ID Types

```ts
type MonthId = number;  // year * 12 + month (0-indexed)
type WeekId  = number;  // year * 100 + isoWeek
```

## Selection Types

### `SelectionMode`

```ts
type SelectionMode = 'single' | 'range' | 'multiple';
```

### `SelectionHandlers<T>`

Full set of handlers (returned when no `mode` is specified):

```ts
interface SelectionHandlers<T = unknown> {
  selectSingle:   (day: CalendarDay<T>) => void;
  selectRange:    (day: CalendarDay<T>) => void;
  selectMultiple: (day: CalendarDay<T>) => void;
  hoverRange:     (day: CalendarDay<T>) => void;
  resetHover:     () => void;
}
```

### `ModeHandlers<T, M>`

Narrowed handler set based on selection mode:

```ts
type ModeHandlers<T, M extends SelectionMode | undefined> =
  M extends 'single'   ? SingleSelectionHandlers<T>   :
  M extends 'range'    ? RangeSelectionHandlers<T>    :
  M extends 'multiple' ? MultipleSelectionHandlers<T> :
  SelectionHandlers<T>;

interface SingleSelectionHandlers<T> {
  selectSingle: (day: CalendarDay<T>) => void;
}

interface RangeSelectionHandlers<T> {
  selectRange: (day: CalendarDay<T>) => void;
  hoverRange:  (day: CalendarDay<T>) => void;
  resetHover:  () => void;
}

interface MultipleSelectionHandlers<T> {
  selectMultiple: (day: CalendarDay<T>) => void;
}
```

## Options Types

### `CalendarOptions<T>`

```ts
interface CalendarOptions<T = unknown> {
  startOn?:        Date | string;
  minDate?:        Date | string;
  maxDate?:        Date | string;
  disabled?:       Array<Date | string>;
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  locale?:         Locale;             // date-fns Locale
  preSelection?:   Date[] | Date;
  meta?:           (date: Date) => T;
  mode?:           M;
}
```

### `MonthlyOptions`

```ts
interface MonthlyOptions {
  infinite?:  boolean; // default: false
  fullWeeks?: boolean; // default: true
}
```

### `WeeklyOptions`

```ts
interface WeeklyOptions {
  infinite?: boolean; // default: false
}
```

### `YearsListOptions`

```ts
interface YearsListOptions {
  format?:   string;  // date-fns format token, default: 'yyyy'
  fromYear?: number;  // default: current year
  toYear?:   number;  // default: fromYear + 10
  amount?:   number;  // default: 10 (used when toYear omitted)
}
```

## Format Types

```ts
type FirstDayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

type WeekdayInputFormat = 'i' | 'io' | 'ii' | 'iii' | 'iiii' | 'iiiii' | 'iiiiii';

type MonthInputFormat =
  | 'M' | 'Mo' | 'MM' | 'MMM' | 'MMMM' | 'MMMMM'
  | 'Lo' | 'LL' | 'LLL' | 'LLLL' | 'LLLLL';

type YearInputFormat = `y${string}` | `Y${string}` | `R${string}` | `u${string}`;
```
