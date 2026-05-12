# Getting Started

## Installation

::: code-group
```sh [npm]
npm install vue-use-calendar
```
```sh [yarn]
yarn add vue-use-calendar
```
```sh [pnpm]
pnpm add vue-use-calendar
```
:::

`date-fns` v4 is a direct dependency and is installed automatically. Vue 3 (`>=3.4`) is a peer dependency and must already be in your project.

## Your First Calendar

Below is a minimal monthly calendar with single-date selection (the styles are omitted in the example).

```vue
<template>
  <div>
    <button :disabled="nextMonthEnabled" @click="prevMonth">‹</button>
    {{ currentMonthAndYear.month + 1 }} / {{ currentMonthAndYear.year }}
    <button :disabled="prevMonthEnabled" @click="nextMonth">›</button>

    <div>
      <button
        v-for="day in currentMonth.days"
        :key="day.id"
        :disabled="day.state.disabled"
        :style="{ fontWeight: day.state.selected ? 'bold' : 'normal' }"
        @click="listeners.selectSingle(day)"
      >
        {{ day.date.getDate() }}
      </button>
    </div>

    <p>Selected: {{ selectedDates[0]?.date.toLocaleDateString() ?? 'none' }}</p>
  </div>
</template>

<script setup lang="ts">
import { useCalendar } from 'vue-use-calendar';

// Top level composable with common parameters.
const { useMonthlyCalendar } = useCalendar({ mode: 'single' });

// Wrapping level composable (week, month...)
const {
  currentMonth,
  currentMonthAndYear,
  prevMonth,
  nextMonth,
  nextMonthEnabled,
  prevMonthEnabled,
  selectedDates,
  listeners,
} = useMonthlyCalendar({ infinite: true, fullWeeks: true });
</script>
```

Here's the same calendar rendered with some arbitrary styles:

<DemoBasicMonth />

## Understanding the API Shape

All composables follow the same two-step pattern:

```ts
// Step 1: Create global options (shared state, selection mode, locale…)
const { useMonthlyCalendar, useWeeklyCalendar, useWeekdays, useMonthsList } = useCalendar({
  mode: 'single',       // 'single' | 'range' | 'multiple'
  locale: enGB,         // any date-fns Locale
  firstDayOfWeek: 1,    // 0 = Sunday … 6 = Saturday
  disabled: [someDate],
  minDate: new Date(),
  maxDate: addMonths(new Date(), 3),
  preSelection: [today],
  meta: (date) => ({ price: getPriceFor(date) }), // attach custom data per day
});

// Step 2: Instantiate the view you need
const { currentMonth, nextMonth, prevMonth, selectedDates, listeners } = useMonthlyCalendar({
  infinite: true,   // true = navigate freely; false = bounded by min/maxDate
  fullWeeks: true,  // true = pad weeks from adjacent months (otherMonth days)
});
```

## Next Steps

- [Monthly Calendar](/guide/monthly-calendar) — navigation, `fullWeeks`, `infinite`
- [Selection Modes](/guide/selection-modes) — single, range, multiple with live demos
- [Date Bounds & Disabled](/guide/date-bounds) — `minDate`, `maxDate`, `disabled`
- [Localization](/guide/localization) — locale, `firstDayOfWeek`
- [Custom Metadata](/guide/custom-metadata) — attaching prices, availability, or any data to days
