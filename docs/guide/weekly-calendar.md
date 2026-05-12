# Weekly Calendar

`useWeeklyCalendar` renders a single-week strip with 7 days and navigation by week.

## Basic Usage

```ts
import { useCalendar } from 'vue-use-calendar';

const { useWeeklyCalendar, useWeekdays } = useCalendar({ mode: 'single' });

const {
  // Current view
  currentWeek,          // ComputedRef<Week<T>>
  currentWeekAndYear,   // Reactive<{ year: number, weekNumber: number }> with setter support
  weeks,                // ComputedRef<Week<T>[]> — all cached weeks

  // Days
  days,                 // ComputedRef<CalendarDay<T>[]> — flat list of all cached days

  // Navigation
  nextWeek,             // () => void
  prevWeek,             // () => void
  nextWeekEnabled,      // ComputedRef<boolean>
  prevWeekEnabled,      // ComputedRef<boolean>

  // Selection
  selectedDates,        // ComputedRef<CalendarDay<T>[]>
  listeners,            // ModeHandlers<T, M>
  selectDate,           // (date: Date) => void
  clearSelection,       // () => void
} = useWeeklyCalendar({ infinite: true });
```

## The `Week<T>` Object

```ts
interface Week<T> {
  id: number;             // WeekId = year * 100 + isoWeek
  weekNumber: number;     // ISO week number (1–53)
  month: number;          // 0-indexed month of the first day of the week
  year: number;
  days: CalendarDay<T>[]; // always exactly 7 days
}
```

## Navigation

### Simple next/prev

```ts
const { nextWeek, prevWeek, nextWeekEnabled, prevWeekEnabled } = useWeeklyCalendar();
```

### Jump to week/year

`currentWeekAndYear` uses the same getter/setter pattern as `currentMonthAndYear`:

```ts
// Jump to week 1 of 2027
currentWeekAndYear.year = 2027;
currentWeekAndYear.weekNumber = 1;
```

## Year-Boundary Behaviour

ISO weeks crossing a year boundary are handled automatically. For example, when navigating from week 52 of 2026, `nextWeek()` correctly advances to week 1 of 2027 (or week 53 if the year has one).

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `infinite` | `boolean` | `false` | When `true`, navigate with no bounds. When `false`, bounded by global `minDate`/`maxDate`. |

::: info Note
Weekly calendar has no `fullWeeks` option — every week is always exactly 7 days with no padding concept.
:::

## Live Demo

<DemoWeekCalendar />
