# CalendarDay

The core data object representing a single calendar day. Created internally — never instantiated directly.

## Interface

```ts
interface CalendarDay<T = unknown> {
  /** The underlying Date (immutable) */
  readonly date: Date;

  /** Stable "YYYY-MM-DD" string ID */
  readonly id: string;

  /** Reactive UI state */
  readonly state: CalendarDayState;

  /** True for days from adjacent months when fullWeeks: true */
  readonly otherMonth: boolean;

  /** Custom metadata from the meta() option */
  readonly meta: T;

  /** True when this date equals today */
  readonly isToday: boolean;

  /** True for Saturday (6) or Sunday (0) */
  readonly isWeekend: boolean;

  /** 0 = Sunday … 6 = Saturday */
  readonly dayOfWeek: number;
}
```

## CalendarDayState

Each day has a `shallowReactive` state object that drives visual UI states:

```ts
interface CalendarDayState {
  selected: boolean;  // day is in the selection set
  hovered:  boolean;  // day is the active hover target in range mode
  between:  boolean;  // day is inside the selected/hovered range
  disabled: boolean;  // day is disabled (minDate, maxDate, or disabled array)
}
```

::: info Shared State
When `fullWeeks: true`, the same calendar day can appear as an `otherMonth` day in two adjacent months. Both instances **share the same `CalendarDayState` reference** — mutating the state in one month instantly updates the other.
:::

## Usage in Templates

```vue
<button
  v-for="day in currentMonth.days"
  :key="day.id"
  :class="{
    'selected':     day.state.selected,
    'between':      day.state.between,
    'hovered':      day.state.hovered,
    'today':        day.isToday,
    'weekend':      day.isWeekend,
    'disabled':     day.state.disabled,
    'other-month':  day.otherMonth,
  }"
  :disabled="day.state.disabled"
  @click="!day.state.disabled && listeners.selectSingle(day)"
>
  {{ day.date.getDate() }}
</button>
```

## The `id` Property

`day.id` is always a `"YYYY-MM-DD"` string. It is stable and sortable:

```ts
// Check if a specific date is selected
selectedDates.value.some(d => d.id === '2026-12-25');

// Sort days chronologically (already sorted in the grid, but useful externally)
days.sort((a, b) => a.id.localeCompare(b.id));
```

## Utility Functions

The following ID utility functions are exported from `vue-use-calendar`:

```ts
import {
  dayIdFromDate,          // (date: Date) => "YYYY-MM-DD"
  monthIdFromDate,        // (date: Date) => MonthId
  monthIdFromYearMonth,   // (year, month) => MonthId
  yearFromMonthId,        // (id: MonthId) => number
  monthFromMonthId,       // (id: MonthId) => number
  weekIdFromYearWeek,     // (year, week) => WeekId
  yearFromWeekId,         // (id: WeekId) => number
  weekFromWeekId,         // (id: WeekId) => number
} from 'vue-use-calendar';
```
