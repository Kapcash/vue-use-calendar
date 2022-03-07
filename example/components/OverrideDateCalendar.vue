<template>
  <div class="calendar">
    <h2>Override with price</h2>

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
        <CalendarPriceCell
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
import CalendarPriceCell from './CalendarPriceCell.vue';
import { CustomDate } from './CustomDate';
import { useCalendar } from '../../lib/use-calendar';
import { ICalendarDate } from '../../lib/models/CalendarDate';
import { addDays, addMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

const disabledDates = [addDays(new Date(), 10)];

const firstDayOfWeek = 1;

const pricesByDay = [
  { day: addDays(new Date(), 3).toLocaleDateString(), price: 10 },
  { day: addDays(new Date(), 4).toLocaleDateString(), price: 99 },
  { day: addDays(new Date(), 6).toLocaleDateString(), price: 50 },
];

const { useMonthlyCalendar, useWeekdays } = useCalendar({
  minDate: new Date(),
  maxDate: addMonths(new Date(), 2),
  disabled: disabledDates,
  firstDayOfWeek,
  locale: fr,
  preSelection: [new Date(), addDays(new Date(), 6)],
  factory: (calendarDate: ICalendarDate) => {
    const priceObj = pricesByDay.find(price => price.day === calendarDate.date.toLocaleDateString());
    const customDate: CustomDate = {
      ...calendarDate,
      price: priceObj?.price || 0,
    };
    return customDate;
  },
});

const { nextMonth, prevMonth, prevMonthEnabled, nextMonthEnabled, currentMonth, listeners } = useMonthlyCalendar({ infinite: false });

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