<template>
  <div class="example-layout">
    <section class="example-main">
      <div class="example-header">
        <h2 class="example-title">v-model / External Control</h2>
        <p class="example-desc">
          <code>modelValue</code> wires an external <code>Ref&lt;Date[]&gt;</code> to the calendar's selection.
          Mutating the ref from outside updates the calendar, and selecting inside updates the ref.
        </p>
      </div>

      <div class="two-panel">
        <!-- Calendar -->
        <div class="calendar-card">
          <div class="card-label">Calendar (internal)</div>
          <div class="month-nav">
            <button class="nav-btn" :disabled="!prevMonthEnabled" @click="prevMonth">‹</button>
            <span class="nav-title">{{ monthNames[currentMonthAndYear.month] }} {{ currentMonthAndYear.year }}</span>
            <button class="nav-btn" :disabled="!nextMonthEnabled" @click="nextMonth">›</button>
          </div>
          <div class="weekday-row">
            <span v-for="wd in weekdays" :key="wd" class="weekday">{{ wd }}</span>
          </div>
          <div class="calendar-grid">
            <CalendarCell
              v-for="(day, i) in currentMonth.days"
              :key="day.id"
              :day="day"
              :style="i === 0 && gridOffset ? { gridColumnStart: gridOffset + 1 } : undefined"
              @click="handleClick(day)"
            />
          </div>
        </div>

        <!-- External control panel -->
        <div class="external-card">
          <div class="card-label">External ref (v-model)</div>

          <div class="model-value-box">
            <div class="model-label">Current <code>model.value</code>:</div>
            <div v-if="model.length === 0" class="model-empty">[]</div>
            <div v-else class="model-dates">
              <span v-for="(d, i) in model" :key="i" class="date-chip">{{ formatDate(d) }}</span>
            </div>
          </div>

          <div class="external-actions">
            <div class="action-label">Set from outside:</div>
            <button class="action-btn" @click="setToday">Set today</button>
            <button class="action-btn" @click="setNextWeek">Set today + 7</button>
            <button class="action-btn" @click="setRange">Set 5-day range</button>
            <button class="action-btn action-btn--danger" @click="clearExternal">Clear</button>
          </div>

          <div class="mode-selector">
            <div class="action-label">Selection mode:</div>
            <div class="radio-group">
              <label class="radio-label"><input type="radio" v-model="mode" value="single" /> Single</label>
              <label class="radio-label"><input type="radio" v-model="mode" value="multiple" /> Multiple</label>
            </div>
          </div>

          <div class="explanation">
            <p>Changes to <code>model</code> propagate into the calendar via a <code>watch</code> on <code>modelValue</code>.</p>
            <p>Selection changes inside the calendar write back to <code>model</code> via a <code>watch</code> on <code>selectedDates</code>.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { format, addDays } from 'date-fns';
import { useCalendar } from '../../lib/use-calendar';
import CalendarCell from '../components/CalendarCell.vue';
import type { CalendarDay, SelectionMode } from '../../lib/types';

// The external model ref — this is what consumers would bind with v-model
const model = ref<Date[]>([]);
const mode = ref<SelectionMode>('single');

const { useMonthlyCalendar, useWeekdays, useMonthsList } = useCalendar({});

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
  modelValue: model,
});

const weekdays = useWeekdays();
const monthNames = useMonthsList();

// When mode changes, clear selection so state is consistent
watch(mode, () => { model.value = []; });

const gridOffset = computed(() => {
  const days = currentMonth.value.days;
  return days.length ? days[0].dayOfWeek % 7 : 0;
});

function handleClick(day: CalendarDay) {
  if (mode.value === 'single') {
    listeners.selectSingle(day as Parameters<typeof listeners.selectSingle>[0]);
  } else {
    listeners.selectMultiple(day as Parameters<typeof listeners.selectMultiple>[0]);
  }
}

// ── External controls ──────────────────────────────────────────────
function setToday() {
  model.value = [new Date()];
}

function setNextWeek() {
  model.value = [addDays(new Date(), 7)];
}

function setRange() {
  const start = new Date();
  model.value = Array.from({ length: 5 }, (_, i) => addDays(start, i));
}

function clearExternal() {
  model.value = [];
}

function formatDate(date: Date) {
  return format(date, 'MMM d');
}
</script>

<style scoped>
.example-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.example-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.example-header { display: flex; flex-direction: column; gap: 4px; }
.example-title { margin: 0; font-size: 1.3rem; font-weight: 700; color: #1e293b; }
.example-desc { margin: 0; font-size: 0.875rem; color: #64748b; }

code {
  background: #f1f5f9;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 0.85em;
  color: #6366f1;
}

.two-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
}

@media (max-width: 700px) {
  .two-panel { grid-template-columns: 1fr; }
}

.calendar-card,
.external-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.month-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-title { flex: 1; text-align: center; font-size: 0.9rem; font-weight: 700; color: #1e293b; }

.nav-btn {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  width: 30px;
  height: 30px;
  font-size: 1.1rem;
  cursor: pointer;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.12s;
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
  font-size: 0.65rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  padding: 3px 0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
}

.model-label { font-size: 0.8rem; font-weight: 600; color: #475569; }
.model-empty { font-size: 0.8rem; color: #94a3b8; font-family: monospace; }

.model-dates {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.date-chip {
  background: #6366f1;
  color: white;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
}

.action-label { font-size: 0.78rem; font-weight: 700; color: #475569; }

.external-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.action-btn {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.12s;
  text-align: left;
}

.action-btn:hover { background: #f1f5f9; border-color: #6366f1; color: #6366f1; }
.action-btn--danger { color: #dc2626; }
.action-btn--danger:hover { background: #fef2f2; border-color: #dc2626; color: #dc2626; }

.mode-selector { display: flex; flex-direction: column; gap: 6px; }
.radio-group { display: flex; gap: 12px; }
.radio-label { font-size: 0.82rem; display: flex; align-items: center; gap: 5px; cursor: pointer; }

.explanation {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 0.78rem;
  color: #64748b;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.explanation p { margin: 0; }
</style>
