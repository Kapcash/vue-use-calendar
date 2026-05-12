# Basic Month View

A simple single-selection monthly calendar with prev/next navigation.

<DemoBasicMonth />

## Code

```vue
<template>
  <div>
    <!-- Navigation -->
    <div class="nav">
      <button :disabled="!prevMonthEnabled" @click="prevMonth">‹</button>
      <span>{{ monthNames[currentMonthAndYear.month] }} {{ currentMonthAndYear.year }}</span>
      <button :disabled="!nextMonthEnabled" @click="nextMonth">›</button>
    </div>

    <!-- Weekday headers -->
    <div class="grid">
      <span v-for="wd in weekdays" :key="wd">{{ wd }}</span>
    </div>

    <!-- Day cells -->
    <div class="grid">
      <button
        v-for="day in currentMonth.days"
        :key="day.id"
        :class="{
          selected:    day.state.selected,
          today:       day.isToday,
          weekend:     day.isWeekend,
          disabled:    day.state.disabled,
          'other-month': day.otherMonth,
        }"
        :disabled="day.state.disabled"
        @click="listeners.selectSingle(day)"
      >
        {{ day.date.getDate() }}
      </button>
    </div>

    <p v-if="selectedDates.length">
      Selected: {{ selectedDates[0].date.toLocaleDateString() }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCalendar } from 'vue-use-calendar';

const { useMonthlyCalendar, useWeekdays, useMonthsList } = useCalendar({
  mode: 'single',
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
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(7, 36px);
  gap: 2px;
}

button.selected { background: teal; color: white; }
button.today    { outline: 1.5px solid teal; }
button.disabled { opacity: 0.4; cursor: not-allowed; }
button.other-month { opacity: 0.4; }
button.weekend:not(.selected) { color: teal; }
</style>
```
