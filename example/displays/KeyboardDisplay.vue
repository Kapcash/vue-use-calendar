<template>
  <div class="keyboard-display">
    <!-- Instructions -->
    <div class="kbd-instructions">
      <span class="kbd-hint">Click the calendar, then use</span>
      <kbd>←</kbd><kbd>→</kbd><kbd>↑</kbd><kbd>↓</kbd>
      <span class="kbd-hint">to navigate,</span>
      <kbd>Enter</kbd>
      <span class="kbd-hint">to select,</span>
      <kbd>T</kbd>
      <span class="kbd-hint">for today.</span>
    </div>

    <!-- Selection summary -->
    <div class="selection-bar">
      <template v-if="selectedDates.length === 0">
        <span class="no-selection">No date selected</span>
      </template>
      <template v-else>
        <span class="selection-label">Selected:</span>
        <span class="chip">{{ formatDate(selectedDates[0].date) }}</span>
      </template>
      <span v-if="focusedDayId" class="focused-badge">Focus: {{ focusedDayId }}</span>
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

    <!-- Calendar grid — captures keyboard events when focused -->
    <div
      class="calendar-grid"
      tabindex="0"
      @keydown="handleKeydown"
      @focus="onGridFocus"
      ref="gridRef"
    >
      <CalendarCell
        v-for="(day, i) in currentMonth.days"
        :key="day.id"
        :day="day"
        :focused="focusedDayId === day.id"
        :style="i === 0 && gridOffset ? { gridColumnStart: gridOffset + 1 } : undefined"
        @click="handleClick(day)"
      />
    </div>

    <button class="today-btn" @click="goToToday">Today</button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { format } from 'date-fns';
import type { Locale } from 'date-fns';
import { useCalendar } from '../../lib/use-calendar';
import CalendarCell from '../components/CalendarCell.vue';
import type { FirstDayOfWeek, CalendarDay } from '../../lib/types';
import type { FocusDirection } from '../../lib/core/keyboard-navigation';

const props = defineProps<{
  minDate?: Date;
  maxDate?: Date;
  firstDayOfWeek: FirstDayOfWeek;
  locale?: Locale;
}>();

const gridRef = ref<HTMLElement | null>(null);

const { useMonthlyCalendar, useWeekdays, useMonthsList } = useCalendar({
  minDate: props.minDate,
  maxDate: props.maxDate,
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
  focusedDayId,
  moveFocus,
  focusToday,
  selectFocused,
} = useMonthlyCalendar({ infinite: true, fullWeeks: false });

const weekdays = useWeekdays();
const monthNames = useMonthsList();

const gridOffset = computed(() => {
  const days = currentMonth.value.days;
  if (!days.length) return 0;
  return (days[0].dayOfWeek - props.firstDayOfWeek + 7) % 7;
});

const KEY_MAP: Record<string, FocusDirection | 'enter' | 'today'> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
  Enter: 'enter',
  t: 'today',
  T: 'today',
};

function handleKeydown(e: KeyboardEvent) {
  const action = KEY_MAP[e.key];
  if (!action) return;
  e.preventDefault();
  if (action === 'enter') {
    selectFocused();
  } else if (action === 'today') {
    focusToday();
    goToToday();
  } else {
    moveFocus(action);
  }
}

function onGridFocus() {
  // Give the grid initial focus when no day is focused yet
  if (!focusedDayId.value) {
    moveFocus('right');
  }
}

function handleClick(day: CalendarDay) {
  listeners.selectSingle(day as Parameters<typeof listeners.selectSingle>[0]);
  focusedDayId.value = day.id;
}

function goToToday() {
  const now = new Date();
  currentMonthAndYear.month = now.getMonth();
  currentMonthAndYear.year = now.getFullYear();
}

function formatDate(date: Date) {
  return format(date, 'EEEE, MMM d, yyyy');
}
</script>

<style scoped>
.keyboard-display {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.kbd-instructions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 0.82rem;
  color: #64748b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 12px;
}

kbd {
  background: #1e293b;
  color: #f1f5f9;
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 0.75rem;
  font-family: monospace;
  font-weight: 600;
}

.kbd-hint { color: #64748b; }

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

.chip {
  background: #6366f1;
  color: white;
  padding: 2px 10px;
  border-radius: 99px;
  font-size: 0.8rem;
  font-weight: 600;
}

.focused-badge {
  margin-left: auto;
  background: #fef9c3;
  color: #713f12;
  border: 1px solid #fde047;
  border-radius: 6px;
  padding: 1px 8px;
  font-size: 0.75rem;
  font-family: monospace;
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-center { flex: 1; display: flex; justify-content: center; }
.nav-title { font-size: 0.95rem; font-weight: 700; color: #1e293b; }

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
  outline: none;
  border-radius: 8px;
}

.calendar-grid:focus-within {
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.today-btn {
  align-self: center;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 6px 16px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #6366f1;
  cursor: pointer;
  transition: all 0.12s;
}

.today-btn:hover { background: #f1f5f9; border-color: #6366f1; }
</style>
