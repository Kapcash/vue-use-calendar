# Date Bounds & Disabled Dates

Control which dates are navigable and selectable by passing `minDate`, `maxDate`, and `disabled` to `useCalendar()`.

## minDate and maxDate

```ts
import { addMonths } from 'date-fns';

const { useMonthlyCalendar } = useCalendar({
  minDate: new Date(),                  // today — nothing before
  maxDate: addMonths(new Date(), 3),    // 3 months from now
  mode: 'single',
});
```

- Days **before `minDate`** and **after `maxDate`** get `day.state.disabled = true`.
- Navigation buttons (`prevMonthEnabled`, `nextMonthEnabled`) are automatically disabled when the boundary is reached.
- When `infinite: false` (default), the calendar pre-generates all months between start and `maxDate`.

::: warning Note on `infinite: false`
When `infinite` is `false`, the calendar is bounded by `minDate` (defaults to `startOn`) and `maxDate`. If neither is provided, only the starting month is generated. Set `infinite: true` to allow free navigation.
:::

## Disabled Dates

Pass an array of specific dates to disable:

```ts
import { addDays } from 'date-fns';

const { useMonthlyCalendar } = useCalendar({
  disabled: [
    addDays(new Date(), 3),
    addDays(new Date(), 7),
    new Date('2026-12-25'), // Christmas
  ],
  mode: 'single',
});
```

Disabled days have `day.state.disabled = true`. They are excluded from `minDate`/`maxDate` — meaning a day can be within bounds but still explicitly disabled.

Internally, disabled dates are stored as a `Set<string>` of `"YYYY-MM-DD"` IDs for O(1) lookup:

```ts
// This is what happens under the hood:
const disabledIds = new Set(disabled.map(d => dayIdFromDate(d)));
// isDateDisabled(date, disabledIds, minDate, maxDate) → O(1)
```

## Handling Disabled Days in the Template

Always guard against clicks on disabled days:

```vue
<button
  v-for="day in currentMonth.days"
  :key="day.id"
  :disabled="day.state.disabled"
  @click="!day.state.disabled && listeners.selectSingle(day)"
>
  {{ day.date.getDate() }}
</button>
```

Or, since `listeners.selectSingle` is a no-op for disabled days, you can rely on the `disabled` HTML attribute to block clicks:

```vue
<button
  v-for="day in currentMonth.days"
  :key="day.id"
  :disabled="day.state.disabled"
  @click="listeners.selectSingle(day)"
>
```

## Live Demo — Bounded Date Picker

The demo below is bounded to today → today + 2 months, with one disabled date (today + 3 days) and today + 7 days pre-selected.

<DemoDatePicker />

## Pre-Selecting Dates

`preSelection` accepts an array of dates that are selected on mount:

```ts
const { useMonthlyCalendar } = useCalendar({
  preSelection: [addDays(new Date(), 5)],
  mode: 'single',
});
```

For range mode, pass two dates:

```ts
const { useMonthlyCalendar } = useCalendar({
  preSelection: [addDays(new Date(), 2), addDays(new Date(), 9)],
  mode: 'range',
});
```

Pre-selected months are eagerly cached so `selectedDates` is accurate even before the user navigates there.
