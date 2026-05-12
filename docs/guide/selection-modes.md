# Selection Modes

Pass `mode` to `useCalendar()` to configure how date selection works. The value also **narrows the TypeScript type** of `listeners` — only the handlers valid for that mode are present.

## Single Selection

Each click replaces the current selection with the clicked date.

```ts
const { useMonthlyCalendar } = useCalendar({ mode: 'single' });
const { listeners } = useMonthlyCalendar();

// listeners.selectSingle  ✅
// listeners.selectRange   ❌ (TypeScript error — not in type)
// listeners.selectMultiple ❌
```

```vue
<button
  v-for="day in currentMonth.days"
  :key="day.id"
  @click="listeners.selectSingle(day)"
>
  {{ day.date.getDate() }}
</button>
```

<DemoBasicMonth />

---

## Range Selection

Two clicks define the start and end of a range. Between the first and second click, hovering over days previews the range with `between` and `hovered` states. A third click resets and starts a new range.

```ts
const { useMonthlyCalendar } = useCalendar({ mode: 'range' });
const { listeners } = useMonthlyCalendar();

// listeners.selectRange  ✅
// listeners.hoverRange   ✅
// listeners.resetHover   ✅
```

```vue
<button
  v-for="day in currentMonth.days"
  :key="day.id"
  @click="listeners.selectRange(day)"
  @mouseover="listeners.hoverRange(day)"
  @mouseleave="listeners.resetHover()"
>
  {{ day.date.getDate() }}
</button>
```

<DemoRangePicker />

---

## Multiple Selection

Each click toggles an individual date — already selected dates are deselected. No range logic.

```ts
const { useMonthlyCalendar } = useCalendar({ mode: 'multiple' });
const { listeners } = useMonthlyCalendar();

// listeners.selectMultiple ✅
```

```vue
<button
  v-for="day in currentMonth.days"
  :key="day.id"
  @click="listeners.selectMultiple(day)"
>
  {{ day.date.getDate() }}
</button>
```

<DemoMultiple />

---

## No Mode (Untyped)

Omitting `mode` gives you all handlers on `listeners` but without the TypeScript narrowing. Useful for dynamic mode-switching, but you lose the compile-time safety.

```ts
const { useMonthlyCalendar } = useCalendar({}); // no mode
const { listeners } = useMonthlyCalendar();
// All handlers present, typed as the full union
```

---

## Programmatic API

Both composables also expose `selectDate(date: Date)` and `clearSelection()` for external triggers (e.g. a "Today" button or a "Clear" button):

```ts
const { selectDate, clearSelection } = useMonthlyCalendar();

// Select today
selectDate(new Date());

// Reset everything
clearSelection();
```

---

## Reading the Selection

`selectedDates` is a `ComputedRef<CalendarDay<T>[]>` sorted by date. For ranges the first element is always the start date and the last is the end date:

```ts
const { selectedDates } = useMonthlyCalendar();

// Single
const selected = selectedDates.value[0]; // CalendarDay<T> | undefined

// Range
const from = selectedDates.value[0];
const to   = selectedDates.value[selectedDates.value.length - 1];

// Multiple
const all  = selectedDates.value; // CalendarDay<T>[]
```
