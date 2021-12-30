<template>
  <button class="calendar-cell" :class="{ light: day.otherMonth }" :disabled="day.disabled.value">
    {{ day.date.getDate() }}
  </button>
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import { CalendarDate } from '../../lib/CalendarDate';

const { day } = defineProps({
  day: { type: Object as PropType<CalendarDate>, required: true }
})
</script>

<style scoped>
button {
  border: 1px solid lightgray;
  border-radius: 5px;
  width: 30px;
  height: 30px;
  background-color: hsl(0, 0%, 95%);
}
button:not(:disabled):hover {
  background-color: hsl(0, 0%, 98%);
}
.light {
  background-color: lightgoldenrodyellow;
}
</style>
