# Monthly Calendar

`useMonthlyCalendar` renders a month-grid view with navigation and selection state.

## Basic Usage

```ts
import { useCalendar } from 'vue-use-calendar';

const { useMonthlyCalendar, useWeekdays, useMonthsList, useYearsList } = useCalendar({
  mode: 'single',
});

const {
  // Current view
  currentMonth,          // ComputedRef<Month<T>> — the active month object
  currentMonthAndYear,   // Reactive<{ month: number, year: number }> with setter support
  months,                // ComputedRef<Month<T>[]> — all cached months

  // Days
  days,                  // ComputedRef<CalendarDay<T>[]> — all days incl. otherMonth padding
  pureDays,              // ComputedRef<CalendarDay<T>[]> — same without otherMonth days

  // Navigation
  nextMonth,             // () => void
  prevMonth,             // () => void
  nextMonthEnabled,      // ComputedRef<boolean>
  prevMonthEnabled,      // ComputedRef<boolean>

  // Selection
  selectedDates,         // ComputedRef<CalendarDay<T>[]>
  listeners,             // ModeHandlers<T, M>
  selectDate,            // (date: Date) => void — programmatic selection
  clearSelection,        // () => void
} = useMonthlyCalendar({ infinite: true, fullWeeks: true });
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `infinite` | `boolean` | `false` | When `true`, navigation has no bounds. When `false`, bounded by `minDate`/`maxDate` from global options. |
| `fullWeeks` | `boolean` | `true` | Pad each month with days from adjacent months to form complete 7-day rows. Those days have `otherMonth: true`. |

## The `Month<T>` Object

```ts
interface Month<T> {
  id: number;              // MonthId = year * 12 + month
  month: number;           // 0-indexed (0 = January)
  year: number;
  days: CalendarDay<T>[]; // all days in the month (+ padding if fullWeeks)
  startOffset: number;     // how many empty cells before day 1 (for CSS grid-column-start)
}
```

## Navigation

### Simple next/prev

```ts
const { nextMonth, prevMonth, nextMonthEnabled, prevMonthEnabled } = useMonthlyCalendar();
```

```vue
<button :disabled="!prevMonthEnabled" @click="prevMonth">‹ Prev</button>
<button :disabled="!nextMonthEnabled" @click="nextMonth">Next ›</button>
```

### Jump to month/year

`currentMonthAndYear` is a reactive object with **getter/setter** properties. Setting `.month` or `.year` instantly jumps the calendar:

```ts
// Jump to December 2026
currentMonthAndYear.month = 11; // 0-indexed
currentMonthAndYear.year = 2026;
```

This is perfect for `<select>` dropdowns:

```vue
<select v-model.number="currentMonthAndYear.month">
  <option v-for="(name, i) in monthNames" :key="i" :value="i">{{ name }}</option>
</select>
<select v-model.number="currentMonthAndYear.year">
  <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
</select>
```

## The `fullWeeks` Option

When `fullWeeks: true` (default), months are padded with trailing and leading days from adjacent months so every row is exactly 7 cells:

```
Mon Tue Wed Thu Fri Sat Sun
 30  31   1   2   3   4   5   ← days 30-31 are from prev month (otherMonth: true)
  6   7   8   9  10  11  12
...
```

These padding days have `day.otherMonth === true` — useful for styling them differently or filtering them out with `pureDays`.

::: tip Shared State
When `fullWeeks: true`, the same date can appear in two adjacent months as an `otherMonth` day. Both copies **share the same reactive state** — selecting a day in one month instantly reflects in the other.
:::

When `fullWeeks: false`, each month only includes its own days. The `startOffset` property on `Month` tells you how many empty columns to add before the first day (useful for `grid-column-start`):

```vue
<div
  v-for="(day, i) in month.days"
  :key="day.id"
  :style="i === 0 && month.startOffset ? { gridColumnStart: month.startOffset + 1 } : undefined"
>
```

## Live Demo

<DemoBasicMonth />
