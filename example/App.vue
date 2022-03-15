<template>
  <div class="column">
    <label>
      Change example:
      <select v-model="calendarComponent">
        <option
          v-for="name of options"
          :key="name.name"
          :value="name.component"
        >
          {{ name.name }}
        </option>
      </select>
    </label>

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

    <Transition
      name="slide-left"
      mode="out-in"
    >
      <KeepAlive>
        <component :is="calendarComponent" />
      </KeepAlive>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue';
import DatePicker from './components/DatePicker.vue';
import MonthCalendar from './components/MonthCalendar.vue';
import WeekCalendar from './components/WeekCalendar.vue';
import OverrideDateCalendar from './components/OverrideDateCalendar.vue';
import CalendarCell from './components/CalendarCell.vue';
import { generateCalendarFactory } from '../lib/models/CalendarDate';
import { startOfMonth, addMonths } from 'date-fns';

const calendarNames = [DatePicker, MonthCalendar, WeekCalendar, OverrideDateCalendar] as const;
const options = [
  { name: 'Simple date picker', component: DatePicker },
  { name: 'Classic month calendar (range)', component: MonthCalendar },
  { name: 'Weekly calendar', component: WeekCalendar },
  { name: 'Custom date object calendar', component: OverrideDateCalendar },
];

type CalendarName = typeof calendarNames[number];

const calendarComponent: Ref<CalendarName> = ref(DatePicker);

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

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.legend {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;

  background-color: rgb(241, 241, 241);
  padding: 16px;
}

.legend > * {
  display: flex;
  gap: 8px;
  align-items: baseline;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.20s ease-in-out;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(-30%);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(30%);
}
</style>
