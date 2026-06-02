<template>
  <div class="constrained-display">
    <!-- Selection summary -->
    <div class="selection-bar">
      <template v-if="selectedDates.length === 0">
        <span class="no-selection">Click a start date</span>
      </template>
      <template v-else-if="selectedDates.length === 1">
        <span class="selection-label">From:</span>
        <span class="chip">{{ formatDate(selectedDates[0].date) }}</span>
        <span class="hint">← pick end date</span>
      </template>
      <template v-else>
        <span class="selection-label">From:</span>
        <span class="chip chip--start">{{ formatDate(selectedDates[0].date) }}</span>
        <span class="selection-arrow">→</span>
        <span class="chip chip--end">{{ formatDate(selectedDates[selectedDates.length - 1].date) }}</span>
        <span class="days-count">({{ rangeLength }} days)</span>
      </template>
    </div>

    <!-- Navigation -->
    <div class="calendar-nav">
      <button class="nav-btn" :disabled="!prevMonthEnabled" @click="prevMonth">‹</button>
      <div class="nav-center">
        <span class="nav-title">{{ monthNames[currentMonthAndYear.month] }} {{ currentMonthAndYear.year }}</span>
      </div>
      <button class="nav-btn" :disabled="!nextMonthEnabled" @click="nextMonth">›</button>
    </div>

    <!-- Weekday headers -->
    <div class="weekday-row">
      <span v-for="wd in weekdays" :key="wd" class="weekday">{{ wd }}</span>
    </div>

    <!-- Calendar grid -->
    <div class="calendar-grid">
      <CalendarCell
        v-for="(day, i) in currentMonth.days"
        :key="day.id"
        :day="day"
        :style="i === 0 && gridOffset ? { gridColumnStart: gridOffset + 1 } : undefined"
        @click="handleClick(day)"
        @mouseover="listeners.hoverRange(day)"
        @mouseleave="listeners.resetHover()"
      />
    </div>

    <!-- onSelect event log -->
    <div class="event-log">
      <div class="event-log-header">onSelect log</div>
      <div v-if="eventLog.length === 0" class="event-log-empty">No events yet</div>
      <div v-for="(entry, i) in eventLog" :key="i" class="event-entry">
        <span class="event-index">#{{ eventLog.length - i }}</span>
        <span class="event-text">{{ entry }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { format, differenceInCalendarDays } from 'date-fns';
import type { Locale } from 'date-fns';
import { useCalendar } from '../../lib/use-calendar';
import CalendarCell from '../components/CalendarCell.vue';
import type { FirstDayOfWeek, CalendarDay } from '../../lib/types';

const props = defineProps<{
  minDate?: Date;
  maxDate?: Date;
  disabledFn?: boolean;
  firstDayOfWeek: FirstDayOfWeek;
  locale?: Locale;
  minRange?: number;
  maxRange?: number;
}>();

const eventLog = ref<string[]>([]);

const disabledProp = computed(() =>
  props.disabledFn
    ? (date: Date) => date.getDay() === 0 || date.getDay() === 6 // weekends
    : undefined,
);

// We key the composable on the disabled function identity, but since
// the display is remounted via :key on the page side, we read props directly.
const { useMonthlyCalendar, useWeekdays, useMonthsList } = useCalendar({
  minDate: props.minDate,
  maxDate: props.maxDate,
  disabled: disabledProp,
  firstDayOfWeek: props.firstDayOfWeek,
  locale: props.locale,
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
} = useMonthlyCalendar({
  infinite: true,
  fullWeeks: false,
  mode: 'range',
  minRange: props.minRange,
  maxRange: props.maxRange,
  onSelect: (days) => {
    const msg = days.length === 0
      ? 'Selection cleared'
      : days.length === 1
        ? `Start: ${formatDate(days[0].date)}`
        : `${formatDate(days[0].date)} → ${formatDate(days[days.length - 1].date)} (${differenceInCalendarDays(days[days.length - 1].date, days[0].date) + 1} days)`;
    eventLog.value.unshift(msg);
    if (eventLog.value.length > 5) eventLog.value.pop();
  },
});

const weekdays = useWeekdays();
const monthNames = useMonthsList();

const gridOffset = computed(() => {
  const days = currentMonth.value.days;
  if (!days.length) return 0;
  return (days[0].dayOfWeek - props.firstDayOfWeek + 7) % 7;
});

const rangeLength = computed(() => {
  if (selectedDates.value.length < 2) return 0;
  return differenceInCalendarDays(
    selectedDates.value[selectedDates.value.length - 1].date,
    selectedDates.value[0].date,
  ) + 1;
});

function handleClick(day: CalendarDay) {
  listeners.selectRange(day as Parameters<typeof listeners.selectRange>[0]);
}

function formatDate(date: Date) {
  return format(date, 'MMM d, yyyy');
}
</script>

<style scoped>
.constrained-display {
  display: flex;
  flex-direction: column;
  gap: 14px;
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

.no-selection { color: #94a3b8; font-style: italic; }
.selection-label { color: #64748b; font-weight: 500; }
.hint { color: #94a3b8; font-style: italic; }
.selection-arrow { color: #94a3b8; }
.days-count { color: #64748b; font-size: 0.78rem; }

.chip {
  background: #6366f1;
  color: white;
  padding: 2px 10px;
  border-radius: 99px;
  font-size: 0.8rem;
  font-weight: 600;
}

.chip--start { background: #6366f1; }
.chip--end { background: #4f46e5; }

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-title {
  font-size: 0.95rem;
  font-weight: 700;
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

.nav-btn:hover:not(:disabled) { background: #f1f5f9; border-color: #6366f1; color: #6366f1; }
.nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.weekday-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
}

.weekday {
  text-align: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  padding: 4px 0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
}

.event-log {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  font-size: 0.8rem;
}

.event-log-header {
  background: #f1f5f9;
  padding: 6px 12px;
  font-weight: 700;
  color: #475569;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.event-log-empty {
  padding: 8px 12px;
  color: #94a3b8;
  font-style: italic;
}

.event-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-top: 1px solid #f1f5f9;
}

.event-index {
  color: #94a3b8;
  font-size: 0.7rem;
  flex-shrink: 0;
  width: 20px;
}

.event-text { color: #334155; }
</style>
