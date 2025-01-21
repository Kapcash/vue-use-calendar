<template>
  <div class="calendar">
    <h2>Weekly calendar picker</h2>
    <label>
      Jump to: 
      <input
        v-model.number="currentWeekIndex"
        placeholder="YYYYww"
        type="number"
        @change="jumpToWeek"
      >
    </label>
    <br>
    Selection: 
    <span 
      v-for="selected of selectedDates"
      :key="selected.toISOString()"
    >
      {{ selected.toLocaleDateString() }}
    </span>

    <div class="month">
      <div class="actions">
        <button
          :disabled="!prevWeekEnabled"
          @click="prevWeek"
        >
          -
        </button>

        {{ currentWeek.month + 1 }} - {{ currentWeek.year }} W:{{ currentWeek.weekNumber }}

        <button
          :disabled="!nextWeekEnabled"
          @click="nextWeek"
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
          v-for="day of currentWeek.days"
          :key="day.dayId"
          :day="day"
          @click="listeners.selectSingle(day)"
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
import { ref, watch } from 'vue';

const disabledDates = [addDays(new Date(), 10)];

const firstDayOfWeek = 2;

const { useWeeklyCalendar, useWeekdays } = useCalendar({
  // minDate: new Date(),
  // maxDate: addDays(new Date(), 26),
  // disabled: disabledDates,
  firstDayOfWeek,
  // locale: fr,
  // preSelection: [addDays(new Date(), 2)],
});

const { currentWeek, jumpTo, nextWeek, prevWeek, prevWeekEnabled, nextWeekEnabled, listeners, selectedDates } = useWeeklyCalendar({
  infinite: true,
});

const weekdays = useWeekdays();
const currentWeekIndex = ref(currentWeek.value.index);

const jumpToWeek = () => {
  jumpTo(currentWeekIndex.value);
};

watch(() => currentWeek.value, () => {
  currentWeekIndex.value = currentWeek.value.index;
}, { immediate: true, deep: true });
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