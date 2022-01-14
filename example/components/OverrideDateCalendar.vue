<template>
  <div class="calendar">
    <h2>Monthly calendar picker example</h2>
    Selection: 
    <div 
      v-for="selected of selectedDates"
      :key="selected.dayId"
    >
      {{ selected.date }}
    </div>

    <div class="month">
      <span class="actions">
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
      </span>
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
import { addDays, addMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CustomDate } from './CustomDate';


const disabledDates = [addDays(new Date(), 10)];

const firstDayOfWeek = 1;


const pricesByDay = [
  { day: '22/01/2022', price: 10 },
  { day: '24/01/2022', price: 99 },
];

const { useMonthlyCalendar, useWeekdays, listeners, selectedDates } = useCalendar({
  from: new Date(),
  to: addMonths(new Date(), 2),
  disabled: disabledDates,
  firstDayOfWeek,
  locale: fr,
  preSelection: [new Date(), addDays(new Date(), 6)],
  calendarClass: new CustomDate(),
  factory: (...args: any[]) => {
    const calendarDate = new CustomDate(...args);
    const priceObj = pricesByDay.find(price => price.day === calendarDate.date.toLocaleDateString());
    calendarDate.setPrice(priceObj?.price || 0);
    return calendarDate;
  },
});

const { nextMonth, prevMonth, prevMonthEnabled, nextMonthEnabled, currentMonth, days } = useMonthlyCalendar({ infinite: true });

const t = days.value[0];

// days.value.forEach((day) => {
//   day.price
// });

const weekdays = useWeekdays();
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
</style>