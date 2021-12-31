<template>
  <button
    class="calendar-cell"
    :class="{
      light: props.day.otherMonth,
      active: props.day.isSelected.value,
    }"
    :disabled="props.day.disabled.value"
  >
    {{ props.day.date.getDate() }}
  </button>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { CalendarDate } from '../../lib/CalendarDate';

const props = defineProps({
  day: { type: Object as PropType<CalendarDate>, required: true },
});
</script>

<style scoped>
button {
  border: 1px solid lightgray;
  border-radius: 5px;
  width: 30px;
  height: 30px;
  margin: 4px;
  background-color: hsl(0, 0%, 95%);
}
button:not(:disabled):hover {
  cursor: pointer;
  background-color: hsl(0, 0%, 98%);
}
button.light {
  background-color: lightgoldenrodyellow;
}
button.active {
  background-color: hsl(248, 53%, 58%);
}
button.active:hover {
  background-color: hsl(248, 73%, 73%);
}
</style>
