<template>
  <button class="calendar-cell" :disabled="day.disabled.value">
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

<style lang="sass" scoped>
</style>
