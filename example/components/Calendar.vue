<template>
  <div class="calendar">
    <div v-if="selectedDate">Selection: {{ selectedDate?.date }}</div>
    <div>Current month: {{ currentMonth + 1 }} - {{ currentYear }}</div>
    <div class="weeknames grid">
      <span v-for="weekday of weekdays">{{ weekday }}</span>
    </div>
    <div v-for="month of months" class="month">
      {{ month.month + 1 }} - {{ month.year }}
      <div class="grid">
        <CalendarCell
          v-for="day of month.days"
          :day="day"
          @click="listeners.select(day)" 
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import CalendarCell from './CalendarCell.vue'
import { useCalendar } from '../../lib/use-calendar'
import { addDays, addMonths } from 'date-fns';

const disabledDates = [addDays(new Date(), 10)]

const firstDayOfWeek = 1

const { useMonthlyCalendar, useWeekdays, listeners, selectedDate } = useCalendar({
  from: new Date(),
  to: addMonths(new Date(), 2),
  disabled: disabledDates,
  firstDayOfWeek,
})

const { months, currentMonth, currentYear } = useMonthlyCalendar()

const weekdays = useWeekdays()
</script>

<style scoped>
.calendar {
  display: flex;
  flex-direction: column;
  align-items: center;
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