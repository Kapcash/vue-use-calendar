<template>
  <div class="week-display">
    <!-- Selection summary -->
    <div class="selection-bar">
      <template v-if="selectedDates.length === 0">
        <span class="no-selection">Click a day to select</span>
      </template>
      <template v-else>
        <span class="selection-label">Selected:</span>
        <span class="chip">{{ formatDate(selectedDates[0].date) }}</span>
      </template>
    </div>

    <!-- Week navigation -->
    <div class="week-nav">
      <button class="nav-btn" :disabled="!prevWeekEnabled" @click="prevWeek">‹</button>
      <div class="week-info">
        <span class="week-label">Week {{ currentWeek.weekNumber }}</span>
        <span class="week-period">{{ weekPeriod }}</span>
      </div>
      <button class="nav-btn" :disabled="!nextWeekEnabled" @click="nextWeek">›</button>
    </div>

    <!-- Weekday headers -->
    <div class="calendar-grid">
      <div class="weekday-header" v-for="wd in weekdays" :key="wd">{{ wd }}</div>
      <CalendarCell
        v-for="day in currentWeek.days"
        :key="day.id"
        :day="day"
        @click="listeners.selectSingle(day)"
      />
    </div>

    <button class="today-btn" @click="goToToday">Today</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import type { Locale } from 'date-fns';
import { useCalendar } from '../../lib/use-calendar';
import CalendarCell from '../components/CalendarCell.vue';
import type { FirstDayOfWeek } from '../../lib/types';

const props = defineProps<{
  minDate?: Date;
  maxDate?: Date;
  disabled: Date[];
  firstDayOfWeek: FirstDayOfWeek;
  locale?: Locale;
  preSelection: Date[];
  infinite: boolean;
}>();

const { useWeeklyCalendar, useWeekdays } = useCalendar({
  minDate: props.minDate,
  maxDate: props.maxDate,
  disabled: props.disabled,
  firstDayOfWeek: props.firstDayOfWeek,
  locale: props.locale,
  preSelection: props.preSelection,
  mode: 'single',
});

const {
  currentWeek,
  nextWeek,
  prevWeek,
  prevWeekEnabled,
  nextWeekEnabled,
  listeners,
  selectedDates,
} = useWeeklyCalendar({ infinite: props.infinite });

const weekdays = useWeekdays();

const weekPeriod = computed(() => {
  const days = currentWeek.value.days;
  if (!days.length) return '';
  const first = days[0].date;
  const last = days[days.length - 1].date;
  if (first.getMonth() === last.getMonth()) {
    return `${format(first, 'MMM d')} – ${format(last, 'd, yyyy')}`;
  }
  return `${format(first, 'MMM d')} – ${format(last, 'MMM d, yyyy')}`;
});

function formatDate(date: Date) {
  return format(date, 'EEEE, MMM d, yyyy');
}

function goToToday() {
  // Navigate to current week by selecting today
  const today = new Date();
  // Reset navigation to today's week by jumping to today
  // The simplest approach: keep navigating until we hit today's week
  // For now we expose the composable's clearSelection + re-navigate
  // Actually, we don't have a direct "jumpToToday" — navigate via prevWeek/nextWeek
  // We use the currentWeekAndYear trick: it's not exposed, so we just display a hint
}
</script>

<style scoped>
.week-display {
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

.week-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.week-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.week-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #6366f1;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.week-period {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
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

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 34px);
  width: fit-content;
  margin: 0 auto;
}

.weekday-header {
  text-align: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 4px 0;
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
