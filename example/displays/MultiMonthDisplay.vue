<template>
  <div class="multi-month-display">
    <!-- Selection summary -->
    <div class="selection-bar">
      <template v-if="selectedDates.length === 0">
        <span class="no-selection">Click a date to select</span>
      </template>
      <template v-else-if="props.mode === 'single'">
        <span class="selection-label">Selected:</span>
        <span class="chip">{{ formatDate(selectedDates[0].date) }}</span>
      </template>
      <template v-else-if="props.mode === 'range'">
        <span class="selection-label">From:</span>
        <span class="chip">{{ formatDate(selectedDates[0].date) }}</span>
        <template v-if="selectedDates.length >= 2">
          <span class="selection-arrow">→</span>
          <span class="chip">{{ formatDate(selectedDates[selectedDates.length - 1].date) }}</span>
        </template>
        <span v-else class="hint">Pick end date</span>
      </template>
      <template v-else-if="props.mode === 'multiple'">
        <span class="chip">{{ selectedDates.length }} date{{ selectedDates.length !== 1 ? 's' : '' }} selected</span>
      </template>
    </div>

    <!-- Navigation + month panels -->
    <div class="months-wrapper">
      <button class="nav-btn" :disabled="!prevMonthEnabled" @click="prevMonth">‹</button>

      <div class="months-row">
        <div v-for="month in visibleMonths" :key="month.id" class="month-panel">
          <div class="month-title">{{ monthNames[month.month] }} {{ month.year }}</div>
          <div class="weekday-row">
            <span v-for="wd in weekdays" :key="wd" class="weekday">{{ wd }}</span>
          </div>
          <div class="calendar-grid">
            <CalendarCell
              v-for="(day, i) in month.days"
              :key="day.id"
              :day="day"
              :style="i === 0 && gridOffset(month.days) ? { gridColumnStart: gridOffset(month.days) + 1 } : undefined"
              @click="handleClick(day)"
              @mouseover="handleHover(day)"
              @mouseleave="handleHoverLeave"
            />
          </div>
        </div>
      </div>

      <button class="nav-btn" :disabled="!nextMonthEnabled" @click="nextMonth">›</button>
    </div>

    <button class="today-btn" @click="goToToday">Today</button>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns';
import type { Locale } from 'date-fns';
import { useCalendar } from '../../lib/use-calendar';
import CalendarCell from '../components/CalendarCell.vue';
import type { FirstDayOfWeek, SelectionMode, CalendarDay } from '../../lib/types';

const props = defineProps<{
  minDate?: Date;
  maxDate?: Date;
  disabled: Date[];
  firstDayOfWeek: FirstDayOfWeek;
  locale?: Locale;
  preSelection: Date[];
  mode?: SelectionMode;
  infinite: boolean;
  fullWeeks: boolean;
  count: number;
  step: number;
}>();

const { useMonthlyCalendar, useWeekdays, useMonthsList } = useCalendar({
  minDate: props.minDate,
  maxDate: props.maxDate,
  disabled: props.disabled,
  firstDayOfWeek: props.firstDayOfWeek,
  locale: props.locale,
  preSelection: props.preSelection,
});

const {
  visibleMonths,
  nextMonth,
  prevMonth,
  prevMonthEnabled,
  nextMonthEnabled,
  currentMonthAndYear,
  listeners,
  selectedDates,
} = useMonthlyCalendar({
  infinite: props.infinite,
  fullWeeks: props.fullWeeks,
  count: props.count,
  step: props.step,
});

const weekdays = useWeekdays();
const monthNames = useMonthsList();

function handleClick(day: CalendarDay) {
  if (props.mode === 'single') {
    listeners.selectSingle(day as Parameters<typeof listeners.selectSingle>[0]);
  } else if (props.mode === 'range') {
    listeners.selectRange(day as Parameters<typeof listeners.selectRange>[0]);
  } else if (props.mode === 'multiple') {
    listeners.selectMultiple(day as Parameters<typeof listeners.selectMultiple>[0]);
  } else {
    listeners.selectSingle(day as Parameters<typeof listeners.selectSingle>[0]);
  }
}

function handleHover(day: CalendarDay) {
  if (props.mode === 'range') {
    listeners.hoverRange(day as Parameters<typeof listeners.hoverRange>[0]);
  }
}

function handleHoverLeave() {
  if (props.mode === 'range') {
    listeners.resetHover();
  }
}

function formatDate(date: Date) {
  return format(date, 'MMM d, yyyy');
}

function gridOffset(days: typeof visibleMonths.value[0]['days']): number {
  if (!days.length) return 0;
  return (days[0].dayOfWeek - props.firstDayOfWeek + 7) % 7;
}

function goToToday() {
  const now = new Date();
  currentMonthAndYear.month = now.getMonth();
  currentMonthAndYear.year = now.getFullYear();
}
</script>

<style scoped>
.multi-month-display {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 16px;
}

.selection-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.85rem;
  flex-wrap: wrap;
  min-height: 40px;
}

.no-selection {
  color: #94a3b8;
  font-style: italic;
}

.selection-label {
  color: #64748b;
  font-weight: 500;
}

.chip {
  background: #6366f1;
  color: white;
  padding: 2px 10px;
  border-radius: 99px;
  font-size: 0.8rem;
  font-weight: 600;
}

.selection-arrow {
  color: #94a3b8;
}

.hint {
  color: #94a3b8;
  font-style: italic;
}

.months-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.months-row {
  flex: 1;
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
}

.month-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.month-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
  text-align: center;
  min-height: 22px;
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
  margin-top: 2px;
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
  grid-template-columns: repeat(7, 34px);
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
  grid-template-columns: repeat(7, 34px);
}

.today-btn {
  align-self: center;
  font-size: 0.8rem;
  padding: 5px 16px;
  background: transparent;
  border: 1px solid #6366f1;
  border-radius: 6px;
  color: #6366f1;
  cursor: pointer;
  transition: all 0.12s;
  font-weight: 500;
}

.today-btn:hover {
  background: #6366f1;
  color: white;
}
</style>
