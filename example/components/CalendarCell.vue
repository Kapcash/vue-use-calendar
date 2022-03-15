<template>
  <div
    class="wrap"
    @mouseover="$emit('mouseover')"
    @mouseleave="$emit('mouseleave')"
  >
    <button
      class="calendar-cell"
      :class="{
        light: props.day.otherMonth,
        active: props.day.isSelected.value,
        hover: props.day.isHovered.value,
        between: props.day.isBetween.value,
        today: props.day.isToday,
        red: props.day._copied,
      }"
      :disabled="props.day.disabled.value"
      @click="$emit('click')"
    > 
      {{ props.day.date.getDate() }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { ICalendarDate } from '../../lib/models/CalendarDate';

const props = defineProps({
  day: { type: Object as PropType<ICalendarDate>, required: true },
});

defineEmits({
  click: null,
  mouseover: null,
  mouseleave: null,
});
</script>

<style scoped>
.wrap {
  padding: 4px;
}
button {
  border: 1px solid lightgray;
  border-radius: 5px;
  width: 30px;
  height: 30px;
  background-color: hsl(0, 0%, 95%);
}
button:not(:disabled):hover {
  cursor: pointer;
  background-color: hsl(0, 0%, 98%);
}
button.today {
  background-color: rgb(255, 200, 237);
}
button.light {
  background-color: lightgoldenrodyellow;
}
button.red {
  color: red;
}
button.red:disabled {
  color: lightsalmon;
}
button:not(:disabled).hover {
  background-color: hsl(157, 75%, 78%);
}
button.hover:not(:disabled):hover {
  background-color: hsl(157, 47%, 66%);
}
button:not(:disabled).between {
  background-color: hsl(36, 75%, 78%);
}
button.between:not(:disabled):hover {
  background-color: hsl(36, 47%, 66%);
}
button.active {
  background-color: hsl(248, 53%, 58%) !important;
}
button.active:hover {
  background-color: hsl(248, 73%, 73%);
}
</style>
