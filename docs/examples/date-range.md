# Date Range Picker

Select a start and end date. Hover previews the range between the first pick and the cursor.

<DemoRangePicker />

## Key Points

- Use `mode: 'range'` — TypeScript narrows `listeners` to `selectRange`, `hoverRange`, `resetHover` only.
- Add `@mouseover="listeners.hoverRange(day)"` and `@mouseleave="listeners.resetHover()"` to enable the hover preview.
- Days inside the range get `day.state.between = true`; the endpoint being hovered gets `day.state.hovered = true`.
- On the third click (after a complete range), the range resets and a new start is picked.

## Code

```vue
<template>
  <div>
    <!-- Selection display -->
    <div v-if="selectedDates.length">
      From {{ fmt(selectedDates[0].date) }}
      <template v-if="selectedDates.length >= 2">
        → {{ fmt(selectedDates[selectedDates.length - 1].date) }}
      </template>
    </div>

    <!-- Navigation -->
    <div>
      <button :disabled="!prevMonthEnabled" @click="prevMonth">‹</button>
      <span>{{ monthName }} {{ currentMonthAndYear.year }}</span>
      <button :disabled="!nextMonthEnabled" @click="nextMonth">›</button>
    </div>

    <!-- Grid -->
    <div class="grid">
      <span v-for="wd in weekdays" :key="wd">{{ wd }}</span>
    </div>
    <div class="grid">
      <button
        v-for="day in currentMonth.days"
        :key="day.id"
        :class="{
          selected: day.state.selected,
          between:  day.state.between,
          hovered:  day.state.hovered,
          disabled: day.state.disabled,
        }"
        :disabled="day.state.disabled"
        @click="listeners.selectRange(day)"
        @mouseover="listeners.hoverRange(day)"
        @mouseleave="listeners.resetHover()"
      >
        {{ day.date.getDate() }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCalendar } from 'vue-use-calendar';

const { useMonthlyCalendar, useWeekdays, useMonthsList } = useCalendar({
  mode: 'range',
});

const {
  currentMonth,
  currentMonthAndYear,
  prevMonth,
  nextMonth,
  prevMonthEnabled,
  nextMonthEnabled,
  selectedDates,
  listeners,
} = useMonthlyCalendar({ infinite: true, fullWeeks: true });

const weekdays   = useWeekdays('iiiiii');
const monthNames = useMonthsList();
const monthName  = computed(() => monthNames[currentMonthAndYear.month]);

const fmt = (date: Date) => date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
</script>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(7, 36px); gap: 2px; }
button.selected { background: teal; color: white; }
button.between  { background: rgba(13, 148, 136, 0.15); border-radius: 0; }
button.hovered  { background: rgba(13, 148, 136, 0.25); }
</style>
```
