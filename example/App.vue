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

    <Legend />

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
import { Ref, shallowRef } from 'vue';
import Legend from './components/Legend.vue';
import DatePicker from './components/DatePicker.vue';
import MonthCalendar from './components/MonthCalendar.vue';
import WeekCalendar from './components/WeekCalendar.vue';
import OverrideDateCalendar from './components/OverrideDateCalendar.vue';

const calendarNames = [DatePicker, MonthCalendar, WeekCalendar, OverrideDateCalendar] as const;
const options = [
  { name: 'Simple date picker', component: DatePicker },
  { name: 'Classic month calendar (range)', component: MonthCalendar },
  { name: 'Weekly calendar', component: WeekCalendar },
  { name: 'Custom date object calendar', component: OverrideDateCalendar },
];

type CalendarName = typeof calendarNames[number];

const calendarComponent: Ref<CalendarName> = shallowRef(MonthCalendar);
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

select {
  border-radius: 4px;
  padding: 4px;
  border-color: #858585;
}

.column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
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
