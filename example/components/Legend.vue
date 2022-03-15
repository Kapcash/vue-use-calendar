<template>
  <div class="legend">
    <label>
      <CalendarCell :day="todayCell" />
      Today cell
    </label>
    <label>
      <CalendarCell :day="otherMonthCell" />
      Other month cell
    </label>
    <label>
      <CalendarCell :day="otherMonthCellLinked" />
      Other month cell linked to another cell
    </label>
  </div>
</template>

<script setup lang="ts">
import { startOfMonth, addMonths } from 'date-fns';
import CalendarCell from './CalendarCell.vue';
import { generateCalendarFactory } from '../../lib/models/CalendarDate';

const calendarFactory = generateCalendarFactory();
const referenceDay = new Date(2022, 4, 15);
const todayCell = calendarFactory(referenceDay);
todayCell.isToday = true;

const otherMonthCell = calendarFactory(startOfMonth(addMonths(referenceDay, 1)));
otherMonthCell.otherMonth = true;

const otherMonthCellLinked = calendarFactory(otherMonthCell.date);
otherMonthCellLinked.otherMonth = true;
otherMonthCellLinked._copied = true;
</script>

<style scoped>
.legend {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;

  background-color: rgb(241, 241, 241);
  padding: 16px;
  border-radius: 4px;
}

.legend > * {
  display: flex;
  gap: 8px;
  align-items: baseline;
}
</style>
