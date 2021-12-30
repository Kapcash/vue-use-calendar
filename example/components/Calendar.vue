<template>
  <div class="hello">
    <div>{{ currentMonth + 1 }} - {{ currentYear }}</div>
    <div class="weeknames grid">
      <span v-for="weekday of weekdays">{{ weekday }}</span>
    </div>
    <div v-for="month of months" class="month">
      {{ month.month + 1 }} - {{ month.year }}
      <div class="grid">
        <CalendarCell v-for="day of month.days" :day="day" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import CalendarCell from './CalendarCell.vue'
import { useMonthlyCalendar, useWeekdays } from '../../lib/use-calendar'
import { addDays, addMonths } from 'date-fns';

const disabledDates = [addDays(new Date(), 10)]

const firstDayOfWeek = 1

const { months, currentMonth, currentYear } = useMonthlyCalendar({
  from: new Date(),
  to: addMonths(new Date(), 2),
  disabled: disabledDates,
  firstDayOfWeek,
})

const weekdays = useWeekdays(firstDayOfWeek)
</script>

<style scoped>
.hello {
  max-width: 500px;
}

.month {
  margin-top: 16px;
}
.weeknames {
  display: inline;
}
.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  justify-items: center;
}
</style>