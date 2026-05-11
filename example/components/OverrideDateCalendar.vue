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
          :key="day.id"
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
import CalendarPriceCell from './CalendarPriceCell.vue';
import { PriceMeta } from './CustomDate';
import { useCalendar } from '../../lib/use-calendar';
import { addDays, addMonths } from 'date-fns';
import { enGB } from 'date-fns/locale';

const disabledDates = [addDays(new Date(), 10)];

const firstDayOfWeek = 1;

const pricesByDay = [
  { day: addDays(new Date(), 3).toLocaleDateString(), price: 10 },
  { day: addDays(new Date(), 4).toLocaleDateString(), price: 99 },
  { day: addDays(new Date(), 6).toLocaleDateString(), price: 50 },
];

const { useMonthlyCalendar, useWeekdays } = useCalendar<PriceMeta>({
  minDate: new Date(),
  maxDate: addMonths(new Date(), 2),
  disabled: disabledDates,
  firstDayOfWeek,
  locale: enGB,
  preSelection: [new Date(), addDays(new Date(), 6)],
  meta: (date: Date) => {
    const priceObj = pricesByDay.find(price => price.day === date.toLocaleDateString());
    return { price: priceObj?.price || 0 };
  },
  mode: 'range',
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