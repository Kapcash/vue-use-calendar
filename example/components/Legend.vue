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
  </div>
</template>

<script setup lang="ts">
import { startOfMonth, addMonths, startOfDay } from 'date-fns';
import CalendarCell from './CalendarCell.vue';
import { createCalendarDay } from '../../lib/core/calendar-day';
import type { NormalizedCalendarOptions } from '../../lib/types';

const defaultOptions: NormalizedCalendarOptions = {
  startOn: startOfDay(new Date()),
  disabled: [],
  firstDayOfWeek: 0,
  locale: undefined,
  meta: () => undefined,
};

const referenceDay = new Date(2022, 4, 15);
const todayCell = createCalendarDay(new Date(), defaultOptions);

const otherMonthCell = createCalendarDay(
  startOfMonth(addMonths(referenceDay, 1)),
  defaultOptions,
  { otherMonth: true },
);
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
