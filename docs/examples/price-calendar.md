# Price Calendar

Attach nightly prices to each day using the `meta` option. The total price of the selected range is computed from `selectedDates`.

<DemoPriceCalendar />

## Key Points

- The `meta` option is typed via `useCalendar<PriceMeta>()` — every `CalendarDay<PriceMeta>` has a fully typed `.meta` property.
- `meta()` is called once per day when it is first generated (on navigation).
- `selectedDates` is a flat array of `CalendarDay<PriceMeta>` sorted chronologically — sum `.meta.price` directly.

## Code

```vue
<template>
  <div>
    <!-- Selection bar -->
    <template v-if="selectedDates.length >= 2">
      {{ fmt(selectedDates[0].date) }} → {{ fmt(selectedDates[selectedDates.length - 1].date) }}
      — Total: ${{ totalPrice }}
    </template>

    <!-- Navigation -->
    <div>
      <button :disabled="!prevMonthEnabled" @click="prevMonth">‹</button>
      <span>{{ monthName }} {{ currentMonthAndYear.year }}</span>
      <button :disabled="!nextMonthEnabled" @click="nextMonth">›</button>
    </div>

    <!-- Grid with price sub-label -->
    <div class="grid">
      <button
        v-for="day in currentMonth.days"
        :key="day.id"
        :class="{
          selected: day.state.selected,
          between:  day.state.between,
          hovered:  day.state.hovered,
          disabled: day.state.disabled,
        }"
        :disabled="day.state.disabled"
        @click="listeners.selectRange(day)"
        @mouseover="listeners.hoverRange(day)"
        @mouseleave="listeners.resetHover()"
      >
        <span>{{ day.date.getDate() }}</span>
        <span class="price" v-if="day.meta.price">${{ day.meta.price }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { addDays } from 'date-fns';
import { useCalendar } from 'vue-use-calendar';

interface PriceMeta { price: number; }

const now = new Date();
const prices: Record<string, number> = {};
[45, 0, 89, 120, 0, 55, 75].forEach((p, i) => {
  if (p) prices[addDays(now, i + 1).toISOString().slice(0, 10)] = p;
});

const { useMonthlyCalendar, useWeekdays, useMonthsList } = useCalendar<PriceMeta>({
  mode: 'range',
  minDate: now,
  meta: (date) => ({ price: prices[date.toISOString().slice(0, 10)] ?? 0 }),
});

const {
  currentMonth,
  currentMonthAndYear,
  prevMonth,
  nextMonth,
  prevMonthEnabled,
  nextMonthEnabled,
  selectedDates,
  listeners,
} = useMonthlyCalendar({ infinite: true, fullWeeks: true });

const weekdays   = useWeekdays('iiiiii');
const monthNames = useMonthsList();
const monthName  = computed(() => monthNames[currentMonthAndYear.month]);
const totalPrice = computed(() => selectedDates.value.reduce((s, d) => s + d.meta.price, 0));

const fmt = (d: Date) => d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
</script>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(7, 1fr); }
button { display: flex; flex-direction: column; align-items: center; }
.price { font-size: 9px; }
button.selected { background: teal; color: white; }
button.between  { background: rgba(13, 148, 136, 0.15); }
</style>
```
