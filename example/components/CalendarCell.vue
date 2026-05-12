<template>
  <div
    class="cell-wrap"
    @mouseover="$emit('mouseover')"
    @mouseleave="$emit('mouseleave')"
  >
    <button
      class="cell"
      :class="{
        'cell--other-month': day.otherMonth,
        'cell--selected': day.state.selected,
        'cell--hovered': day.state.hovered,
        'cell--between': day.state.between,
        'cell--today': day.isToday,
        'cell--weekend': day.isWeekend,
      }"
      :disabled="day.state.disabled"
      @click="$emit('click')"
    > 
      {{ day.date.getDate() }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { CalendarDay } from '../../lib/types';

defineProps({
  day: { type: Object as PropType<CalendarDay>, required: true },
});

defineEmits({
  click: null,
  mouseover: null,
  mouseleave: null,
});
</script>

<style scoped>
.cell-wrap {
  padding: 1px;
}

.cell {
  width: 100%;
  aspect-ratio: 1;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: #1e293b;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cell:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.cell--other-month {
  color: #cbd5e1;
}

.cell--today {
  border-color: #6366f1;
  color: #6366f1;
  font-weight: 700;
}

.cell--weekend:not(.cell--other-month):not(.cell--selected):not(:disabled) {
  color: #7c3aed;
}

.cell:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.cell--hovered:not(:disabled) {
  background: #ddd6fe;
  border-color: #a78bfa;
  color: #4c1d95;
}

.cell--between:not(:disabled) {
  background: #ede9fe;
  border-radius: 0;
  color: #5b21b6;
}

.cell--between:not(:disabled):hover {
  background: #ddd6fe;
}

.cell--selected {
  background: #6366f1 !important;
  color: white !important;
  border-color: #4f46e5 !important;
  font-weight: 700;
  border-radius: 8px !important;
}

.cell--selected:hover {
  background: #4f46e5 !important;
}
</style>
