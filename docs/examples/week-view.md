# Week View

A horizontal 7-day strip with week-by-week navigation. Click any day to select it.

<DemoWeekCalendar />

## Code

```vue
<template>
  <div>
    <!-- Navigation -->
    <div>
      <button :disabled="!prevWeekEnabled" @click="prevWeek">‹</button>
      <span>Week {{ currentWeekAndYear.weekNumber }}, {{ currentWeekAndYear.year }}</span>
      <button :disabled="!nextWeekEnabled" @click="nextWeek">›</button>
    </div>

    <!-- Weekday headers -->
    <div class="grid">
      <span v-for="wd in weekdays" :key="wd">{{ wd }}</span>
    </div>

    <!-- 7 day cells -->
    <div class="grid">
      <button
        v-for="day in currentWeek.days"
        :key="day.id"
        :class="{
          selected: day.state.selected,
          today:    day.isToday,
          weekend:  day.isWeekend,
          disabled: day.state.disabled,
        }"
        :disabled="day.state.disabled"
        @click="listeners.selectSingle(day)"
      >
        <span class="day-num">{{ day.date.getDate() }}</span>
        <span class="day-month">{{ day.date.toLocaleDateString(undefined, { month: 'short' }) }}</span>
      </button>
    </div>

    <p v-if="selectedDates.length">
      Selected: {{ selectedDates[0].date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }) }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useCalendar } from 'vue-use-calendar';

const { useWeeklyCalendar, useWeekdays } = useCalendar({ mode: 'single' });

const {
  currentWeek,
  currentWeekAndYear,
  prevWeek,
  nextWeek,
  prevWeekEnabled,
  nextWeekEnabled,
  selectedDates,
  listeners,
} = useWeeklyCalendar({ infinite: true });

const weekdays = useWeekdays('iiiiii');
</script>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
button { display: flex; flex-direction: column; align-items: center; }
button.selected { background: teal; color: white; }
button.today    { outline: 1.5px solid teal; }
.day-num  { font-weight: 600; }
.day-month { font-size: 10px; opacity: 0.7; }
</style>
```
