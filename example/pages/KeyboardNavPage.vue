<template>
  <div class="example-layout">
    <section class="example-main">
      <div class="example-header">
        <h2 class="example-title">Keyboard Navigation</h2>
        <p class="example-desc">
          Click the calendar to focus it, then navigate with arrow keys and press
          <kbd>Enter</kbd> to select. <kbd>T</kbd> jumps to today.
        </p>
      </div>
      <div class="calendar-card">
        <KeyboardDisplay
          :key="reinitKey"
          :first-day-of-week="firstDayOfWeek"
          :locale="localeObj"
        />
      </div>
    </section>

    <ControlPanel>
      <div class="control-group">
        <label class="control-label">First day of week</label>
        <div class="radio-group">
          <label class="radio-label"><input type="radio" v-model.number="firstDayOfWeek" :value="0" /> Sunday</label>
          <label class="radio-label"><input type="radio" v-model.number="firstDayOfWeek" :value="1" /> Monday</label>
          <label class="radio-label"><input type="radio" v-model.number="firstDayOfWeek" :value="6" /> Saturday</label>
        </div>
      </div>

      <div class="control-group">
        <label class="control-label">Locale</label>
        <select v-model="localeKey" class="control-select">
          <option v-for="opt in LOCALE_OPTIONS" :key="opt.key" :value="opt.key">{{ opt.label }}</option>
        </select>
      </div>

      <div class="feature-list">
        <div class="feature-title">How it works:</div>
        <ul>
          <li><code>focusedDayId</code> — reactive ref tracking focused day</li>
          <li><code>moveFocus(dir)</code> — moves ±1 or ±7 days, skips disabled</li>
          <li><code>focusToday()</code> — jumps focus to today</li>
          <li><code>selectFocused()</code> — selects the focused day</li>
          <li>CalendarCell receives <code>:focused</code> prop for outline styling</li>
        </ul>
      </div>
    </ControlPanel>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { enGB, fr, de, es, ja } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import type { FirstDayOfWeek } from '../../lib/types';
import KeyboardDisplay from '../displays/KeyboardDisplay.vue';
import ControlPanel from '../components/ControlPanel.vue';

const LOCALE_OPTIONS = [
  { key: '', label: 'Default (en-US)' },
  { key: 'enGB', label: 'English (GB)' },
  { key: 'fr', label: 'Français' },
  { key: 'de', label: 'Deutsch' },
  { key: 'es', label: 'Español' },
  { key: 'ja', label: '日本語' },
] as const;

const LOCALE_MAP: Record<string, Locale | undefined> = { '': undefined, enGB, fr, de, es, ja };

const firstDayOfWeek = ref<FirstDayOfWeek>(1);
const localeKey = ref('');

const localeObj = computed<Locale | undefined>(() => LOCALE_MAP[localeKey.value]);

const reinitKey = computed(() => [firstDayOfWeek.value, localeKey.value].join('|'));
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

kbd {
  background: #1e293b;
  color: #f1f5f9;
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 0.75rem;
  font-family: monospace;
  font-weight: 600;
}

code {
  background: #f1f5f9;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 0.85em;
  color: #6366f1;
}

.calendar-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.control-group { display: flex; flex-direction: column; gap: 8px; }
.control-label { font-size: 0.78rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.06em; }
.control-select { width: 100%; }
.radio-group { display: flex; flex-direction: column; gap: 6px; }
.radio-label { font-size: 0.85rem; display: flex; align-items: center; gap: 6px; cursor: pointer; }

.feature-list {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  font-size: 0.8rem;
}

.feature-title {
  font-weight: 700;
  color: #475569;
  margin-bottom: 6px;
}

.feature-list ul {
  margin: 0;
  padding-left: 16px;
  color: #64748b;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
