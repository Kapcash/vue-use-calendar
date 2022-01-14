<template>
  <div class="line">
    <DatePicker />
    <MonthCalendar />
    <OverrideDateCalendar />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DatePicker from './components/DatePicker.vue';
import MonthCalendar from './components/MonthCalendar.vue';
import OverrideDateCalendar from './components/OverrideDateCalendar.vue';

export default defineComponent({
  name: 'App',
  components: {
    MonthCalendar,
    OverrideDateCalendar,
    DatePicker,
  },
});
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

.line {
  display: flex;
  justify-content: center;
  gap: 50px;
}
</style>
