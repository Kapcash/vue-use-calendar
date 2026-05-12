# useWeeklyCalendar

Returns a weekly calendar view with 7 days per week and week-by-week navigation.

## Signature (simplified)

```ts
function useWeeklyCalendar(opts?: WeeklyOptions): WeeklyCalendarComposable<T>
```

The function is returned by `useCalendar()` and inherits the global `T` generic.

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `infinite` | `boolean` | `false` | `true` = free navigation; `false` = bounded by global `minDate`/`maxDate`. |

## Return Value

### View State

| Property | Type | Description |
|----------|------|-------------|
| `currentWeek` | `ComputedRef<Week<T>>` | The currently displayed week. |
| `currentWeekAndYear` | `Reactive<{ year: number; weekNumber: number }>` | Reactive view of the current week/year. Supports two-way binding: setting one of its value will effectively trigger a week navigation |
| `weeks` | `ComputedRef<Week<T>[]>` | All cached weeks. |
| `days` | `ComputedRef<CalendarDay<T>[]>` | Flat list of all cached days. |

### Navigation

| Property | Type | Description |
|----------|------|-------------|
| `nextWeek` | `() => void` | Navigate to the next week. |
| `prevWeek` | `() => void` | Navigate to the previous week. |
| `nextWeekEnabled` | `ComputedRef<boolean>` | `false` when at `maxDate` boundary. |
| `prevWeekEnabled` | `ComputedRef<boolean>` | `false` when at `minDate` boundary. |

### Selection

| Property | Type | Description |
|----------|------|-------------|
| `selectedDates` | `ComputedRef<CalendarDay<T>[]>` | Currently selected days, sorted by date. |
| `listeners` | `{ selectSingle, selectMultiple, selectRange, hoverRange, resetHover}` | Selection event handlers, narrowed by mode. |
| `selectDate` | `(date: Date) => void` | Programmatically select a date. |
| `clearSelection` | `() => void` | Clear all selected dates. |

## `currentWeekAndYear` Setters

```ts
// Jump to a specific ISO week
currentWeekAndYear.year = 2027;
currentWeekAndYear.weekNumber = 1;
```

## Week ID Format

Weeks use a `WeekId = year * 100 + isoWeek` numeric identifier. For example, ISO week 3 of 2026 → `202603`. This is stable, sortable, and human-readable.

Year boundaries are handled automatically — navigating past week 52 (or 53 if applicable) wraps to week 1 of the next year.

## Usage

```ts
const { useWeeklyCalendar, useWeekdays } = useCalendar({ mode: 'single' });

const {
  currentWeek,
  currentWeekAndYear,
  nextWeek,
  prevWeek,
  nextWeekEnabled,
  prevWeekEnabled,
  selectedDates,
  listeners,
} = useWeeklyCalendar({ infinite: true });
```

```vue
<template>
  <div>
    <button :disabled="!prevWeekEnabled" @click="prevWeek">‹</button>
    <span>Week {{ currentWeekAndYear.weekNumber }}, {{ currentWeekAndYear.year }}</span>
    <button :disabled="!nextWeekEnabled" @click="nextWeek">›</button>

    <div class="grid">
      <button
        v-for="day in currentWeek.days"
        :key="day.id"
        :class="{ selected: day.state.selected }"
        @click="listeners.selectSingle(day)"
      >
        {{ day.date.getDate() }}
      </button>
    </div>
  </div>
</template>
```
