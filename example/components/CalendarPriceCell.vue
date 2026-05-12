<template>
  <div class="cell-wrap">
    <button
      class="cell"
      :class="{
        'cell--other-month': day.otherMonth,
        'cell--selected': day.state.selected,
        'cell--hovered': day.state.hovered,
        'cell--between': day.state.between,
        'cell--today': day.isToday,
        'cell--has-price': day.meta?.price,
      }"
      :disabled="day.state.disabled"
      @click="$emit('click')"
    > 
      <p>{{ day.date.getDate() }}</p>
      <p
        v-if="day.meta?.price"
        class="price-tag"
      >
        {{ day.meta.price }}€
      </p>
    </button>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { CalendarDay } from '../../lib/types';
import { PriceMeta } from './CustomDate';

const props = defineProps({
  day: { type: Object as PropType<CalendarDay<PriceMeta>>, required: true },
});

defineEmits({
  click: null,
});
</script>

<style scoped>
p {
  margin: 0;
}

.price-tag {
  font-size: 0.6rem;
  color: #d97706;
  font-weight: 600;
}

.cell-wrap {
  padding: 1px;
}

.cell {
  width: 100%;
  aspect-ratio: 1;
  min-height: 42px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: #1e293b;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
}

.cell:not(:disabled):hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  cursor: pointer;
}

.cell--other-month {
  color: #cbd5e1;
}

.cell--today {
  border-color: #6366f1;
  color: #6366f1;
  font-weight: 700;
}

.cell:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.cell--hovered:not(:disabled) {
  background: #ddd6fe;
  border-color: #a78bfa;
}

.cell--between:not(:disabled) {
  background: #ede9fe;
  border-radius: 0;
}

.cell--between:not(:disabled):hover {
  background: #ddd6fe;
}

.cell--selected {
  background: #6366f1 !important;
  color: white !important;
  border-color: #4f46e5 !important;
  border-radius: 8px !important;
}

.cell--selected .price-tag {
  color: #e0e7ff;
}

.cell--selected:hover {
  background: #4f46e5 !important;
}

.cell--has-price {
  border-bottom: 2px solid #d97706;
}

.cell--has-price.cell--selected {
  border-bottom-color: #fbbf24;
}
</style>
