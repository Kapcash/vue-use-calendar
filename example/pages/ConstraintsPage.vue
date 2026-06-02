<template>
  <div class="example-layout">
    <section class="example-main">
      <div class="example-header">
        <h2 class="example-title">Selection Constraints</h2>
        <p class="example-desc">
          Demonstrates <code>minRange</code>, <code>maxRange</code>, function-based <code>disabled</code>,
          <code>onSelect</code> callback, and <code>isRangeStart</code>/<code>isRangeEnd</code> visual markers.
        </p>
      </div>
      <div class="calendar-card">
        <ConstrainedRangeDisplay
          :key="reinitKey"
          :first-day-of-week="firstDayOfWeek"
          :min-range="minRange || undefined"
          :max-range="maxRange || undefined"
          :disabled-fn="disabledFn"
        />
      </div>
    </section>

    <ControlPanel>
      <div class="control-group">
        <label class="control-label">Min range (days)</label>
        <div class="number-row">
          <input type="number" v-model.number="minRange" min="0" max="30" class="control-input control-input--number" />
          <span class="hint-text">0 = no limit</span>
        </div>
      </div>

      <div class="control-group">
        <label class="control-label">Max range (days)</label>
        <div class="number-row">
          <input type="number" v-model.number="maxRange" min="0" max="90" class="control-input control-input--number" />
          <span class="hint-text">0 = no limit</span>
        </div>
      </div>

      <div class="control-group">
        <label class="control-label">Disabled dates</label>
        <label class="toggle-label">
          <input type="checkbox" v-model="disabledFn" />
          <span>Disable weekends (function predicate)</span>
        </label>
      </div>

      <div class="control-group">
        <label class="control-label">First day of week</label>
        <div class="radio-group">
          <label class="radio-label"><input type="radio" v-model.number="firstDayOfWeek" :value="0" /> Sunday</label>
          <label class="radio-label"><input type="radio" v-model.number="firstDayOfWeek" :value="1" /> Monday</label>
        </div>
      </div>

      <div class="feature-list">
        <div class="feature-title">Features shown:</div>
        <ul>
          <li><code>minRange</code> / <code>maxRange</code> — rejects out-of-bound ranges</li>
          <li><code>disabled</code> as function — <code>(date) =&gt; isWeekend(date)</code></li>
          <li><code>onSelect</code> callback — logged below calendar</li>
          <li><code>isRangeStart</code> / <code>isRangeEnd</code> — rounded pill ends</li>
        </ul>
      </div>
    </ControlPanel>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { FirstDayOfWeek } from '../../lib/types';
import ConstrainedRangeDisplay from '../displays/ConstrainedRangeDisplay.vue';
import ControlPanel from '../components/ControlPanel.vue';

const firstDayOfWeek = ref<FirstDayOfWeek>(1);
const minRange = ref(3);
const maxRange = ref(14);
const disabledFn = ref(false);

const reinitKey = computed(() =>
  [firstDayOfWeek.value, minRange.value, maxRange.value, disabledFn.value].join('|'),
);
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

.calendar-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.control-group { display: flex; flex-direction: column; gap: 8px; }
.control-label { font-size: 0.78rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.06em; }
.control-input { border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px; font-size: 0.85rem; outline: none; }
.control-input:focus { border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99,102,241,0.15); }
.control-input--number { width: 80px; }
.number-row { display: flex; align-items: center; gap: 8px; }
.hint-text { font-size: 0.75rem; color: #94a3b8; }
.toggle-label { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer; }
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
