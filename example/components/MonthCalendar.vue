<template>
  <div class="calendar">
    <h2>Monthly infinite calendar picker</h2>
    <div class="row">
      Selection:
      <span
        v-for="selected of selectedDates"
        :key="selected.getTime()"
      >
        {{ selected.toLocaleDateString() }}
      </span>
    </div>

    <button @click="goToCurrentMonth">
      Today
    </button>
    <select v-model="currentMonthAndYear.year">
      <option
        v-for="year in years"
        :key="year"
        :value="year"
      >
        {{ year }}
      </option>
    </select>

    {{ months }}

    <div class="month">
      <div class="actions">
        <button
          :disabled="!prevMonthEnabled"
          @click="prevMonth"
        >
          -
        </button>

        {{ currentMonth.month + 1 }} - {{ currentMonth.year }}

        <button
          :disabled="!nextMonthEnabled"
          @click="nextMonth"
        >
          +
        </button>
      </div>
      <div class="weeknames grid">
        <span
          v-for="weekday of weekdays"
          :key="weekday"
        >{{ weekday }}</span>
      </div>
      <div class="grid">
        <CalendarCell
          v-for="day of currentMonth.days"
          :key="day.dayId"
          :day="day"
          @click="listeners.selectRange(day)"
          @mouseover="listeners.hoverRange(day)"
          @mouseleave="listeners.resetHover()"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import CalendarCell from './CalendarCell.vue';
import { useCalendar } from '../../lib/use-calendar';
import { addDays } from 'date-fns';
import { enGB } from 'date-fns/locale';

const now = new Date();
const disabledDates = [addDays(now, 12)];
const firstDayOfWeek = 1;

const { useMonthlyCalendar, useWeekdays, useMonthsList, useYearsList } = useCalendar({
  disabled: disabledDates,
  firstDayOfWeek,
  locale: enGB,
  preSelection: [addDays(now, 2), addDays(now, 4)],
});

const months = useMonthsList();
const years = useYearsList();

const { nextMonth, prevMonth, currentMonthAndYear, prevMonthEnabled, nextMonthEnabled, currentMonth, listeners, selectedDates } = useMonthlyCalendar({ infinite: true });
// selectedDates.value.splice(0, selectedDates.value.length, ...[new CalendarDate(2023, 5, 15), addDays(new CalendarDate(2023, 5, 15), 6) as CalendarDate]);
const weekdays = useWeekdays();

function goToCurrentMonth () {
  const today = new Date();
  currentMonthAndYear.month = today.getMonth();
  currentMonthAndYear.year = today.getFullYear();
}
</script>

<style scoped>
.calendar {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
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

.row {
  display: flex;
  gap: 8px;
}
</style>