# Multiple Selection

Click individual dates to toggle them on and off. There is no range concept — each click independently adds or removes a date.

<DemoMultiple />

## Code

```vue
<template>
  <div>
    <!-- Selection summary -->
    <div v-if="selectedDates.length">
      {{ selectedDates.length }} date{{ selectedDates.length !== 1 ? 's' : '' }} selected
      <button @click="clearSelection()">Clear</button>
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
          selected:    day.state.selected,
          today:       day.isToday,
          'other-month': day.otherMonth,
          disabled:    day.state.disabled,
        }"
        :disabled="day.state.disabled"
        @click="listeners.selectMultiple(day)"
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
  mode: 'multiple',
});

const {
  currentMonth,
  currentMonthAndYear,
  prevMonth,
  nextMonth,
  prevMonthEnabled,
  nextMonthEnabled,
  selectedDates,
  clearSelection,
  listeners,
} = useMonthlyCalendar({ infinite: true, fullWeeks: true });

const weekdays   = useWeekdays('iiiiii');
const monthNames = useMonthsList();
const monthName  = computed(() => monthNames[currentMonthAndYear.month]);
</script>
```
