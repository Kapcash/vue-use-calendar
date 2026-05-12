<template>
  <div class="example-layout">
    <section class="example-main">
      <div class="example-header">
        <h2 class="example-title">Price Calendar</h2>
        <p class="example-desc">
          Custom metadata attached to each day via the <code>meta</code> option. Range selection with per-day pricing.
        </p>
      </div>
      <div class="calendar-card">
        <PriceDisplay
          :key="reinitKey"
          :min-date="minDateObj"
          :max-date="maxDateObj"
          :disabled="disabledDates"
          :first-day-of-week="firstDayOfWeek"
          :locale="localeObj"
          :pre-selection="[]"
          :infinite="false"
          :full-weeks="fullWeeks"
          :prices="priceEntries"
        />
      </div>
    </section>

    <ControlPanel>
      <div class="control-group">
        <label class="control-label">First day of week</label>
        <div class="radio-group">
          <label class="radio-label"><input type="radio" v-model.number="firstDayOfWeek" :value="0" /> Sunday</label>
          <label class="radio-label"><input type="radio" v-model.number="firstDayOfWeek" :value="1" /> Monday</label>
        </div>
      </div>

      <div class="control-group">
        <label class="control-label">Locale</label>
        <select v-model="localeKey" class="control-select">
          <option v-for="opt in LOCALE_OPTIONS" :key="opt.key" :value="opt.key">{{ opt.label }}</option>
        </select>
      </div>

      <div class="control-group">
        <label class="control-label">Min date</label>
        <input type="date" v-model="minDateStr" class="control-input" />
      </div>

      <div class="control-group">
        <label class="control-label">Max date</label>
        <input type="date" v-model="maxDateStr" class="control-input" />
      </div>

      <div class="control-group">
        <label class="control-label">Full weeks</label>
        <label class="toggle-label">
          <input type="checkbox" v-model="fullWeeks" />
          <span>Show padding days from adjacent months</span>
        </label>
      </div>

      <!-- Price editor -->
      <div class="control-group">
        <label class="control-label">Prices</label>
        <div class="price-list">
          <div v-for="(entry, i) in priceEntries" :key="i" class="price-item">
            <span class="price-date">{{ toInputDate(entry.date) }}</span>
            <span class="price-value">{{ entry.price }}€</span>
            <button class="remove-btn" @click="priceEntries.splice(i, 1)">×</button>
          </div>
          <p v-if="priceEntries.length === 0" class="empty-hint">No prices configured</p>
        </div>
        <div class="add-price">
          <input type="date" v-model="newPriceDate" class="control-input" />
          <input type="number" v-model.number="newPriceAmount" placeholder="€" min="0" class="control-input price-input" />
          <button class="add-btn" :disabled="!newPriceDate || !newPriceAmount" @click="addPrice">Add</button>
        </div>
      </div>

      <div class="control-group">
        <label class="control-label">Disabled dates</label>
        <div class="disabled-list">
          <div v-for="(d, i) in disabledDateStrs" :key="i" class="disabled-item">
            <span>{{ d }}</span>
            <button class="remove-btn" @click="removeDisabled(i)">×</button>
          </div>
          <p v-if="disabledDateStrs.length === 0" class="empty-hint">None</p>
        </div>
        <div class="add-disabled">
          <input type="date" v-model="newDisabledStr" class="control-input" />
          <button class="add-btn" :disabled="!newDisabledStr" @click="addDisabled">Add</button>
        </div>
      </div>
    </ControlPanel>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { addDays, addMonths } from 'date-fns';
import { enGB, fr, de, es, ja } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import type { FirstDayOfWeek } from '../../lib/types';
import PriceDisplay from '../displays/PriceDisplay.vue';
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
const fullWeeks = ref(true);
const minDateStr = ref(toInputDate(new Date()));
const maxDateStr = ref(toInputDate(addMonths(new Date(), 2)));
const disabledDateStrs = ref<string[]>([]);
const newDisabledStr = ref('');
const newPriceDate = ref('');
const newPriceAmount = ref<number>(0);

// Default price entries (relative to today)
const priceEntries = reactive([
  { date: addDays(new Date(), 3), price: 89 },
  { date: addDays(new Date(), 4), price: 89 },
  { date: addDays(new Date(), 5), price: 120 },
  { date: addDays(new Date(), 6), price: 145 },
  { date: addDays(new Date(), 7), price: 145 },
  { date: addDays(new Date(), 10), price: 75 },
  { date: addDays(new Date(), 11), price: 75 },
  { date: addDays(new Date(), 14), price: 99 },
  { date: addDays(new Date(), 15), price: 220 },
]);

const localeObj = computed<Locale | undefined>(() => LOCALE_MAP[localeKey.value]);
const minDateObj = computed(() => minDateStr.value ? new Date(minDateStr.value + 'T00:00:00') : undefined);
const maxDateObj = computed(() => maxDateStr.value ? new Date(maxDateStr.value + 'T00:00:00') : undefined);
const disabledDates = computed(() => disabledDateStrs.value.map(s => new Date(s + 'T00:00:00')));

// Include price entries length in reinitKey so adding prices triggers remount
const reinitKey = computed(() =>
  [firstDayOfWeek.value, localeKey.value, minDateStr.value, maxDateStr.value, fullWeeks.value, disabledDateStrs.value.join(','), priceEntries.map(p => `${toInputDate(p.date)}=${p.price}`).join(',')].join('|')
);

function addPrice() {
  if (newPriceDate.value && newPriceAmount.value) {
    priceEntries.push({ date: new Date(newPriceDate.value + 'T00:00:00'), price: newPriceAmount.value });
    newPriceDate.value = '';
    newPriceAmount.value = 0;
  }
}

function addDisabled() {
  if (newDisabledStr.value && !disabledDateStrs.value.includes(newDisabledStr.value)) {
    disabledDateStrs.value.push(newDisabledStr.value);
    newDisabledStr.value = '';
  }
}

function removeDisabled(i: number) {
  disabledDateStrs.value.splice(i, 1);
}

function toInputDate(d: Date): string {
  return d.toISOString().split('T')[0];
}
</script>

<style scoped>
.example-layout { display: flex; gap: 24px; align-items: flex-start; }
.example-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 16px; }
.example-header { display: flex; flex-direction: column; gap: 4px; }
.example-title { margin: 0; font-size: 1.3rem; font-weight: 700; color: #1e293b; }
.example-desc { margin: 0; font-size: 0.875rem; color: #64748b; }

.example-desc code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  background: #f1f5f9;
  padding: 1px 5px;
  border-radius: 4px;
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
.radio-group { display: flex; flex-direction: column; gap: 6px; }
.radio-label { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; color: #334155; cursor: pointer; }
.toggle-label { display: flex; align-items: flex-start; gap: 8px; font-size: 0.875rem; color: #334155; cursor: pointer; line-height: 1.4; }

.control-select, .control-input {
  width: 100%;
  padding: 7px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #1e293b;
  background: white;
  outline: none;
  transition: border-color 0.12s;
}
.control-select:focus, .control-input:focus { border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15); }

.price-list { display: flex; flex-direction: column; gap: 4px; max-height: 140px; overflow-y: auto; }

.price-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #fef9ee;
  border: 1px solid #fde68a;
  border-radius: 5px;
  font-size: 0.82rem;
}

.price-date { flex: 1; color: #78350f; }
.price-value { font-weight: 700; color: #d97706; }

.add-price { display: flex; gap: 6px; }
.add-price .control-input { flex: 1; }
.price-input { width: 60px !important; flex: 0 0 60px !important; }

.disabled-list { display: flex; flex-direction: column; gap: 4px; max-height: 100px; overflow-y: auto; }

.disabled-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 5px;
  font-size: 0.82rem;
  color: #991b1b;
}

.remove-btn { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1rem; line-height: 1; padding: 0 2px; }
.remove-btn:hover { color: #b91c1c; }

.add-disabled { display: flex; gap: 6px; }
.add-disabled .control-input { flex: 1; }

.add-btn {
  padding: 7px 12px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.12s;
}
.add-btn:hover:not(:disabled) { background: #4f46e5; }
.add-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.empty-hint { margin: 0; font-size: 0.8rem; color: #94a3b8; font-style: italic; }

@media (max-width: 768px) {
  .example-layout { flex-direction: column; }
}
</style>
