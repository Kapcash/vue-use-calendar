<template>
  <div class="calendar">
    <h2>Monthly infinite calendar picker</h2>
    <div class="row">
      Selection:
      <span
        v-for="selected of selectedDates"
        :key="selected.dayId"
      >
        {{ selected.date.toLocaleDateString() }}
      </span>
    </div>

    <button @click="goToCurrentMonth">Today</button>
    <select v-model="currentMonthAndYear.year">
      <option
        v-for="year in years"
        :key="year"
        :value="year"
      >
        {{ year }}
      </option>
    </select>

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
          @mouseover="listeners.hoverMultiple(day)"
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
import { fr } from 'date-fns/locale';

const disabledDates = [addDays(new Date(), 12)];
const firstDayOfWeek = 1;

const years = Array.from(new Array(100)).map((_, i) => 1950 + i);

const { useMonthlyCalendar, useWeekdays } = useCalendar({
  from: new Date(),
  // to: addMonths(new Date(), 2),
  disabled: disabledDates,
  firstDayOfWeek,
  locale: fr,
  preSelection: [new Date(), addDays(new Date(), 6)],
});

const { nextMonth, prevMonth, currentMonthAndYear, prevMonthEnabled, nextMonthEnabled, currentMonth, listeners, selectedDates } = useMonthlyCalendar({ infinite: true });

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