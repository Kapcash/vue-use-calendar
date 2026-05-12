# Date Picker (Bounded)

All available months are stacked vertically — ideal for a mobile-style date picker. `minDate` and `maxDate` define the navigable window; one date is pre-selected, and one is disabled.

<DemoDatePicker />

## Key Points

- `infinite: false` (default) — the calendar only generates months within `[minDate, maxDate]`.
- Use `months` (not `currentMonth`) to render all months at once.
- When `fullWeeks: false`, use `month.startOffset` to offset the first day in the CSS grid.
- `preSelection` sets the initial selection without requiring user interaction.

## Code

```vue
<template>
  <div>
    <p v-if="selectedDates.length">
      Selected: {{ selectedDates[0].date.toLocaleDateString() }}
    </p>

    <!-- Fixed weekday header -->
    <div class="grid">
      <span v-for="wd in weekdays" :key="wd">{{ wd }}</span>
    </div>

    <!-- All months stacked -->
    <div v-for="month in months" :key="month.id" class="month-block">
      <h3>{{ monthNames[month.month] }} {{ month.year }}</h3>

      <div class="grid">
        <button
          v-for="(day, i) in month.days"
          :key="day.id"
          :style="i === 0 && month.startOffset
            ? { gridColumnStart: month.startOffset + 1 }
            : undefined"
          :class="{
            selected: day.state.selected,
            today:    day.isToday,
            disabled: day.state.disabled,
          }"
          :disabled="day.state.disabled"
          @click="listeners.selectSingle(day)"
        >
          {{ day.date.getDate() }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { addDays, addMonths } from 'date-fns';
import { useCalendar } from 'vue-use-calendar';

const now = new Date();

const { useMonthlyCalendar, useWeekdays, useMonthsList } = useCalendar({
  minDate: now,
  maxDate: addMonths(now, 2),
  disabled: [addDays(now, 3)],
  preSelection: [addDays(now, 7)],
  mode: 'single',
});

// infinite: false (default) — bounded by min/maxDate
// fullWeeks: false — no padding, use month.startOffset instead
const { months, selectedDates, listeners } = useMonthlyCalendar({ fullWeeks: false });

const weekdays   = useWeekdays('iiiiii');
const monthNames = useMonthsList();
</script>
```
