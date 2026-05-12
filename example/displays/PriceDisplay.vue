<template>
  <div class="price-display">
    <!-- Selection summary -->
    <div class="selection-bar">
      <template v-if="selectedDates.length === 0">
        <span class="no-selection">Pick check-in date</span>
      </template>
      <template v-else>
        <div class="booking-summary">
          <div class="booking-date">
            <span class="booking-date-label">Check-in</span>
            <span class="booking-date-value">{{ formatDate(selectedDates[0].date) }}</span>
          </div>
          <span class="booking-arrow">→</span>
          <div class="booking-date">
            <span class="booking-date-label">Check-out</span>
            <span class="booking-date-value">
              {{ selectedDates.length >= 2 ? formatDate(selectedDates[selectedDates.length - 1].date) : 'Select date' }}
            </span>
          </div>
          <div v-if="selectedDates.length >= 2" class="booking-total">
            <span class="booking-total-label">Total</span>
            <span class="booking-total-value">{{ totalPrice }}€</span>
          </div>
        </div>
      </template>
    </div>

    <!-- Month navigation -->
    <div class="calendar-nav">
      <button class="nav-btn" :disabled="!prevMonthEnabled" @click="prevMonth">‹</button>
      <div class="nav-center">
        <select v-model.number="currentMonthAndYear.month" class="nav-select">
          <option v-for="(name, i) in monthNames" :key="i" :value="i">{{ name }}</option>
        </select>
        <select v-model.number="currentMonthAndYear.year" class="nav-select">
          <option v-for="y in yearRange" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
      <button class="nav-btn" :disabled="!nextMonthEnabled" @click="nextMonth">›</button>
    </div>

    <!-- Weekday headers -->
    <div class="weekday-row">
      <span v-for="wd in weekdays" :key="wd" class="weekday">{{ wd }}</span>
    </div>

    <!-- Calendar grid -->
    <div class="calendar-grid">
      <CalendarPriceCell
        v-for="(day, i) in currentMonth.days"
        :key="day.id"
        :day="day"
        :style="i === 0 && gridOffset() ? { gridColumnStart: gridOffset() + 1 } : undefined"
        @click="listeners.selectRange(day)"
        @mouseover="listeners.hoverRange(day)"
        @mouseleave="listeners.resetHover()"
      />
    </div>

    <!-- Price legend -->
    <div class="price-legend">
      <span class="legend-item">
        <span class="legend-dot legend-dot--price"></span>
        Bottom border = has price
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { format } from 'date-fns';
import type { Locale } from 'date-fns';
import { useCalendar } from '../../lib/use-calendar';
import CalendarPriceCell from '../components/CalendarPriceCell.vue';
import type { FirstDayOfWeek } from '../../lib/types';
import type { PriceMeta } from '../components/CustomDate';

const props = defineProps<{
  minDate?: Date;
  maxDate?: Date;
  disabled: Date[];
  firstDayOfWeek: FirstDayOfWeek;
  locale?: Locale;
  preSelection: Date[];
  infinite: boolean;
  fullWeeks: boolean;
  prices: Array<{ date: Date; price: number }>;
}>();

const { useMonthlyCalendar, useWeekdays, useMonthsList } = useCalendar<PriceMeta>({
  minDate: props.minDate,
  maxDate: props.maxDate,
  disabled: props.disabled,
  firstDayOfWeek: props.firstDayOfWeek,
  locale: props.locale,
  preSelection: props.preSelection,
  mode: 'range',
  meta: (date: Date) => {
    const key = date.toLocaleDateString();
    const entry = props.prices.find(p => p.date.toLocaleDateString() === key);
    return { price: entry?.price ?? 0 };
  },
});

const {
  currentMonth,
  nextMonth,
  prevMonth,
  prevMonthEnabled,
  nextMonthEnabled,
  currentMonthAndYear,
  listeners,
  selectedDates,
} = useMonthlyCalendar({ infinite: props.infinite, fullWeeks: props.fullWeeks });

const weekdays = useWeekdays();
const monthNames = useMonthsList();

const minYear = computed(() => props.minDate?.getFullYear() ?? new Date().getFullYear() - 1);
const maxYear = computed(() => props.maxDate?.getFullYear() ?? new Date().getFullYear() + 10);
const yearRange = computed(() => {
  const years: number[] = [];
  for (let y = minYear.value; y <= maxYear.value; y++) years.push(y);
  return years;
});

const totalPrice = computed(() => {
  if (selectedDates.value.length < 2) return 0;
  return selectedDates.value.reduce((sum, d) => sum + (d.meta?.price ?? 0), 0);
});

function formatDate(date: Date) {
  return format(date, 'MMM d, yyyy');
}

function gridOffset(): number {
  const days = currentMonth.value.days;
  if (!days.length) return 0;
  return (days[0].dayOfWeek - props.firstDayOfWeek + 7) % 7;
}
</script>

<style scoped>
.price-display {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 16px;
}

.selection-bar {
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.85rem;
  min-height: 48px;
  display: flex;
  align-items: center;
}

.no-selection {
  color: #94a3b8;
  font-style: italic;
}

.booking-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  width: 100%;
}

.booking-date {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.booking-date-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.booking-date-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
}

.booking-arrow {
  color: #94a3b8;
  font-size: 1.2rem;
}

.booking-total {
  margin-left: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.booking-total-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.booking-total-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #d97706;
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-center {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 6px;
}

.nav-select {
  padding: 5px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #1e293b;
  background: white;
  cursor: pointer;
}

.nav-btn {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  width: 34px;
  height: 34px;
  font-size: 1.3rem;
  cursor: pointer;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.12s;
  flex-shrink: 0;
}

.nav-btn:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #6366f1;
  color: #6366f1;
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.weekday-row {
  display: grid;
  grid-template-columns: repeat(7, 44px);
  width: fit-content;
  margin: 0 auto;
}

.weekday {
  text-align: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 4px 0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 44px);
  width: fit-content;
  margin: 0 auto;
}

.price-legend {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 0.78rem;
  color: #64748b;
  padding: 8px 12px;
  background: #fef9ee;
  border-radius: 6px;
  border: 1px solid #fde68a;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-dot--price {
  background: white;
  border: 1px solid #e2e8f0;
  border-bottom: 2px solid #d97706;
}
</style>
