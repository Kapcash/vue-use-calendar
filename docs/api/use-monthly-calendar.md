# useMonthlyCalendar

Returns a monthly calendar view with navigation, selection state, and day access.

## Signature (simplified)

```ts
/**
 * @params opts Optional monthly calendar specific options.
 */
function useMonthlyCalendar(opts?: MonthlyOptions): MonthlyCalendarComposable<T>
```

The function is returned by `useCalendar()` and inherits the global `T` generic.

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `infinite` | `boolean` | `false` | `true` = free navigation; `false` = bounded by global `minDate`/`maxDate`. |
| `fullWeeks` | `boolean` | `true` | Pad months with adjacent-month days to form complete 7-day rows. |

## Return Value

### View State

| Property | Type | Description |
|----------|------|-------------|
| `currentMonth` | `ComputedRef<Month<T>>` | The currently displayed month object. |
| `currentMonthAndYear` | `Reactive<{ month: number; year: number }>` | Reactive view of the current month/year. Supports two-way binding: setting one of its value will effectively trigger a month navigation |
| `months` | `ComputedRef<Month<T>[]>` | All cached month objects (useful for date picker "list all" mode). |
| `days` | `ComputedRef<CalendarDay<T>[]>` | Flat list of all days across all cached month objects (including `otherMonth` padding). |
| `pureDays` | `ComputedRef<CalendarDay<T>[]>` | Same as `days` but without the `otherMonth` padding days. If `otherMonth === false`, the `days === pureDays` |

### Navigation

| Property | Type | Description |
|----------|------|-------------|
| `nextMonth` | `() => void` | Navigate to the next month. |
| `prevMonth` | `() => void` | Navigate to the previous month. |
| `nextMonthEnabled` | `ComputedRef<boolean>` | `false` when at `maxDate` boundary. |
| `prevMonthEnabled` | `ComputedRef<boolean>` | `false` when at `minDate` boundary. |

### Selection

| Property | Type | Description |
|----------|------|-------------|
| `selectedDates` | `ComputedRef<CalendarDay<T>[]>` | Currently selected days, sorted by date. |
| `listeners` |  `{ selectSingle, selectMultiple, selectRange, hoverRange, resetHover}` | Selection event handlers, narrowed by mode. |
| `selectDate` | `(date: Date) => void` | Programmatically select a date by `Date` object. |
| `clearSelection` | `() => void` | Clear all selected dates. |

## `currentMonthAndYear` Setters

Setting `.month` or `.year` calls `nav.jumpTo()` under the hood — ideal for `<select>` dropdowns:

```vue
<select v-model.number="currentMonthAndYear.month">
  <option v-for="(name, i) in monthNames" :key="i" :value="i">{{ name }}</option>
</select>
<select v-model.number="currentMonthAndYear.year">
  <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
</select>
```

## Usage

```ts
const { useMonthlyCalendar, useWeekdays } = useCalendar({ mode: 'single' });

const {
  currentMonth,
  currentMonthAndYear,
  months,
  days,
  pureDays,
  nextMonth,
  prevMonth,
  nextMonthEnabled,
  prevMonthEnabled,
  selectedDates,
  listeners,
  selectDate,
  clearSelection,
} = useMonthlyCalendar({ infinite: true, fullWeeks: true });
```

```vue
<template>
  <div>
    <button :disabled="!prevMonthEnabled" @click="prevMonth">‹</button>
    <span>{{ currentMonthAndYear.month + 1 }}/{{ currentMonthAndYear.year }}</span>
    <button :disabled="!nextMonthEnabled" @click="nextMonth">›</button>

    <div class="grid">
      <button
        v-for="day in currentMonth.days"
        :key="day.id"
        :class="{ selected: day.state.selected, 'other-month': day.otherMonth }"
        :disabled="day.state.disabled"
        @click="listeners.selectSingle(day)"
      >
        {{ day.date.getDate() }}
      </button>
    </div>
  </div>
</template>
```
