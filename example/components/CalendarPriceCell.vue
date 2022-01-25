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
      }"
      :disabled="props.day.disabled.value"
      @click="$emit('click')"
    > 
      <p>{{ props.day.date.getDate() }}</p>
      <p
        v-if="props.day.price"
        class="price"
      >
        {{ props.day.price }}€
      </p>
    </button>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { CustomDate } from './CustomDate';

const props = defineProps({
  day: { type: Object as PropType<CustomDate>, required: true },
});

defineEmits({
  click: null,
  mouseover: null,
  mouseleave: null,
});
</script>

<style scoped>
p {
  margin: 0
}
.price {
  color: goldenrod;
}
.wrap {
  padding: 4px;
}
button {
  border: 1px solid lightgray;
  border-radius: 5px;
  width: 50px;
  height: 50px;
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
