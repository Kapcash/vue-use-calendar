<template>
  <div class="date-picker">
    <h2>Date picker example</h2>
    <div v-if="selectedDates.length > 0">
      Selection: {{ selectedDates?.[0]?.date?.toLocaleDateString() }}
    </div>
    <div>Current month: {{ currentMonth.month + 1 }} - {{ currentMonth.year }}</div>

    <div>
      <div class="weeknames grid">
        <span
          v-for="weekday of weekdays"
          :key="weekday"
        >{{ weekday }}</span>
      </div>
  
      <div
        v-for="month of months"
        :key="month.month + month.year"
        class="month"
      >
        {{ month.month + 1 }} - {{ month.year }}
        <div class="grid">
          <CalendarCell
            v-for="day of month.days"
            :key="day.dayId"
            :day="day"
            @click="listeners.selectSingle(day)"
            @mouseleave="listeners.resetHover()"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import CalendarCell from './CalendarCell.vue';
import { useCalendar } from '../../lib/use-calendar';
import { addDays, addMonths } from 'date-fns';

const disabledDates = [addDays(new Date(), 3)];
const preselectionDates = [addDays(new Date(), 5)];

const firstDayOfWeek = 1;

const { useMonthlyCalendar, useWeekdays } = useCalendar({
  minDate: new Date(),
  maxDate: addMonths(new Date(), 2),
  disabled: disabledDates,
  firstDayOfWeek,
  preSelection: preselectionDates,
});

const { months, currentMonth, listeners, selectedDates } = useMonthlyCalendar();

const weekdays = useWeekdays();
</script>

<style scoped>
.date-picker {
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