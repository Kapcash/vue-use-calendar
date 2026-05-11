# Vue use-calendar

A Vue 3 composable to create any kind of calendar!

* Open source
* SSR compliant
* Fully typed with TypeScript
* Fully customize your calendar style without thinking about the logic
* Extendable via the generic `meta` option
* Uses [`date-fns`](https://date-fns.org/) internally for lightweight and consistent date operations

This can be used to hold the dates logic for your calendar components.

## \>\>\> See the [DEMO](https://kapcash.github.io/vue-use-calendar/) <<<

## Install it

```bash
# npm
npm install vue-use-calendar

# yarn
yarn add vue-use-calendar
```

**Peer dependencies:** Vue 3 (`>=3.4`), `date-fns` (`^4`)

## Basic example

```typescript
import { useCalendar } from 'vue-use-calendar';

const { useMonthlyCalendar } = useCalendar({});
const {
  nextMonth,
  prevMonth,
  currentMonthAndYear,
  currentMonth,
  selectedDates,
  listeners,
} = useMonthlyCalendar({ fullWeeks: false, infinite: true });

/*
  currentMonthAndYear === { year: 2026, month: 4 }
  currentMonth.value === { month: 4, year: 2026, days: [...], id: 24316 }
  selectedDates.value === []
*/

// Go to next month
nextMonth();

/*
  currentMonthAndYear === { year: 2026, month: 5 }
  currentMonth.value === { month: 5, year: 2026, days: [...], id: 24317 }
*/

listeners.selectSingle(currentMonth.value.days[3]);

/*
  selectedDates.value === [{ date: <4th June 2026>, id: '2026-06-04', state: { selected: true, ... }, ... }]
*/
```

# The composables

The entry point of the library is `useCalendar`.

## useCalendar

```typescript
import { useCalendar } from 'vue-use-calendar';
import { es } from 'date-fns/locale';

interface PriceMeta {
  price: number;
}

const pricesByDay = [
  { price: 55, date: '2025-06-12' },
];

const { useMonthlyCalendar } = useCalendar<PriceMeta>({
  startOn: new Date(2025, 5, 1),
  minDate: '2025-05-12',
  maxDate: new Date(2025, 5, 18),
  disabled: [new Date(2025, 5, 15)],
  firstDayOfWeek: 1, // Monday
  locale: es, // Spanish
  preSelection: [new Date(2025, 5, 13)],
  meta: (date: Date) => {
    const priceObj = pricesByDay.find(p => p.date === date.toISOString().slice(0, 10));
    return { price: priceObj?.price || 0 };
  },
});

const { currentMonth } = useMonthlyCalendar();
// Access custom data: currentMonth.value.days[0].meta.price
```

## Parameters

| name | type | optional | default | description |
|------|------|----------|---------|-------------|
| startOn       | `string \| Date`                      | true | `undefined` | The date to initiate the calendar on |
| minDate       | `string \| Date`                      | true | `undefined` | The minimum selectable date. All dates before will be disabled |
| maxDate       | `string \| Date`                      | true | `undefined` | The maximum selectable date. All dates after will be disabled |
| disabled      | `Array<string \| Date>`               | true | `[]`        | A date or array of dates to disable |
| firstDayOfWeek | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6`  | true | `0`         | Tells on which day the week starts. 0 is Sunday. |
| locale        | date-fns `Locale`                     | true | `undefined` | The locale object for translating weekdays/months.<br>Import like `import { fr } from 'date-fns/locale';`. See [date-fns](https://date-fns.org/docs/Locale) |
| preSelection  | `Array<Date> \| Date`                 | true | `[]` | A date or array of dates to be preselected on calendar generation |
| meta          | `(date: Date) => T`                   | true | `undefined` | A function to attach custom metadata to each day. The generic `T` flows through all composable return types. |
| mode          | `'single' \| 'range' \| 'multiple'`   | true | `undefined` | Constrains which selection handlers are available. When set, the `listeners` type is narrowed to only the methods valid for that mode. |

### Outputs

The composable returns the following sub-composables:

| name | description |
|------|-------------|
| [useMonthlyCalendar](#use-monthly-calendar)  | Generate a calendar where days are grouped by months |
| [useWeeklyCalendar](#use-weekly-calendar)    | Generate a calendar where days are grouped by weeks |
| [useWeekdays](#use-weekdays)                 | Get the list of weekday names, translated and formatted |
| [useMonthsList](#use-months-list)            | Get the list of month names, translated and formatted |
| [useYearsList](#use-years-list)              | Get a list of year strings |

## useMonthlyCalendar

```typescript
const { useMonthlyCalendar } = useCalendar({});

const { currentMonth } = useMonthlyCalendar({ infinite: false, fullWeeks: false });
```

### Parameters

| name | type | optional | default | description |
|------|------|----------|---------|-------------|
| infinite  | `boolean` | true | `false` | If true, navigating generates new months on the fly |
| fullWeeks | `boolean` | true | `true` | If true, each month includes padding days from adjacent months to complete each week |

### Outputs

| name | type | description |
|------|------|-------------|
| days | `ComputedRef<CalendarDay<T>[]>` | All days across cached months, including `otherMonth` padding. |
| pureDays | `ComputedRef<CalendarDay<T>[]>` | All days across cached months, excluding `otherMonth` padding. |
| selectedDates | `ComputedRef<CalendarDay<T>[]>` | Currently selected days. |
| listeners | `ModeHandlers<T, M>` | Methods for changing date states (see [Selection Handlers](#selection-handlers)). Narrowed to mode-appropriate methods when `mode` is set. |
| selectDate | `(date: Date) => void` | Programmatically select a date without needing a `CalendarDay` object. Respects the configured `mode`. |
| clearSelection | `() => void` | Programmatically clear all selected and hovered dates. |
| currentMonthAndYear | `Reactive<{ month: number; year: number }>` | Reactive object of the current month/year. Backed by getter/setter — mutating it directly calls `jumpTo()` with no risk of watch loops. |
| currentMonth | `ComputedRef<Month<T>>` | The current month. Contains `month`, `year`, `id`, and `days` array. |
| months | `ComputedRef<Month<T>[]>` | All months currently in the cache, sorted chronologically. |
| nextMonth | `() => void` | Navigate to the next month. |
| prevMonth | `() => void` | Navigate to the previous month. |
| nextMonthEnabled | `ComputedRef<boolean>` | Whether navigating forward is allowed (always true in infinite mode). |
| prevMonthEnabled | `ComputedRef<boolean>` | Whether navigating backward is allowed (always true in infinite mode). |

## useWeeklyCalendar

```typescript
const { useWeeklyCalendar } = useCalendar({});

const { currentWeek } = useWeeklyCalendar({ infinite: false });
```

### Parameters

| name | type | optional | default | description |
|------|------|----------|---------|-------------|
| infinite  | `boolean` | true | `false` | If true, navigating generates new weeks on the fly |

### Outputs

| name | type | description |
|------|------|-------------|
| days | `ComputedRef<CalendarDay<T>[]>` | All days across cached weeks, sorted chronologically. |
| selectedDates | `ComputedRef<CalendarDay<T>[]>` | Currently selected days. |
| listeners | `ModeHandlers<T, M>` | Methods for changing date states (see [Selection Handlers](#selection-handlers)). Narrowed to mode-appropriate methods when `mode` is set. |
| selectDate | `(date: Date) => void` | Programmatically select a date without needing a `CalendarDay` object. Respects the configured `mode`. |
| clearSelection | `() => void` | Programmatically clear all selected and hovered dates. |
| currentWeekAndYear | `Reactive<{ year: number; weekNumber: number }>` | Reactive object of the current week/year. Backed by getter/setter — mutating it directly calls `jumpTo()` with no risk of watch loops. |
| currentWeek | `ComputedRef<Week<T>>` | The current week. Contains `weekNumber`, `month`, `year`, `id`, and `days` array. |
| weeks | `ComputedRef<Week<T>[]>` | All weeks currently in the cache, sorted chronologically. |
| nextWeek | `() => void` | Navigate to the next week. |
| prevWeek | `() => void` | Navigate to the previous week. |
| nextWeekEnabled | `ComputedRef<boolean>` | Whether navigating forward is allowed. |
| prevWeekEnabled | `ComputedRef<boolean>` | Whether navigating backward is allowed. |

## useWeekdays

```typescript
const { useWeekdays } = useCalendar({ locale: enGB, firstDayOfWeek: 1 });

// ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const weekDays = useWeekdays('iiiii');
```

### Parameters

| name | type | optional | default | description |
|------|------|----------|---------|-------------|
| weekdayFormat | `'i' \| 'io' \| 'ii' \| 'iii' \| 'iiii' \| 'iiiii' \| 'iiiiii'` | true | `'iiiii'` | The format for weekday names. See [date-fns ISO day of week](https://date-fns.org/docs/format). |

### Output

Returns `string[]` — the array of weekday names, translated and formatted.

## useMonthsList

```typescript
const { useMonthsList } = useCalendar({ locale: fr });

// ['janvier', 'février', 'mars', ...]
const months = useMonthsList({ format: 'MMMM' });
```

### Parameters

| name | type | optional | default | description |
|------|------|----------|---------|-------------|
| format | `MonthInputFormat` | true | `'MMMM'` | The format for month names. |

### Output

Returns `string[]` — the array of month names, translated and formatted.

## useYearsList

```typescript
const { useYearsList } = useCalendar({});

// ['2020', '2021', ..., '2030']
const years = useYearsList({ fromYear: 2020, toYear: 2030 });
```

### Parameters

| name | type | optional | default | description |
|------|------|----------|---------|-------------|
| format | `YearInputFormat` | true | `'yyyy'` | The format for year strings. |
| fromYear | `number` | true | 100 years ago | Start year. |
| toYear | `number` | true | 100 years from now | End year. |
| amount | `number` | true | — | If set, generate this many years starting from `fromYear`. |

### Output

Returns `string[]` — the array of year strings.

## Selection Handlers

The `listeners` object returned by the sub-composables contains the following methods. When a `mode` is passed to `useCalendar`, the TypeScript type of `listeners` is narrowed — only the methods valid for that mode are exposed:

| mode | exposed methods |
|------|-----------------|
| `'single'` | `selectSingle` |
| `'range'` | `selectRange`, `hoverRange`, `resetHover` |
| `'multiple'` | `selectMultiple` |
| _(none)_ | all methods |

### `selectSingle`

Select a single date. Unselects all previously selected dates.

<details style="margin-bottom: 16px">
<summary>Example:</summary>

```typescript
const { useMonthlyCalendar } = useCalendar({});
const { currentMonth, listeners: { selectSingle } } = useMonthlyCalendar();

selectSingle(currentMonth.value.days[10]);
// days[10].state.selected === true, all others are false

selectSingle(currentMonth.value.days[20]);
// days[20].state.selected === true, days[10].state.selected === false
```
</details>

### `selectRange`

Select a range of two dates. Selecting a third date clears the previous range and starts a new one. Selecting an already selected date toggles it off.

<details style="margin-bottom: 16px">
<summary>Example:</summary>

```typescript
const { useMonthlyCalendar } = useCalendar({});
const { currentMonth, listeners: { selectRange } } = useMonthlyCalendar();

selectRange(currentMonth.value.days[10]);
selectRange(currentMonth.value.days[20]);
// days[10] and days[20]: state.selected === true
// days between them: state.between === true

selectRange(currentMonth.value.days[27]);
// Previous range cleared, only days[27].state.selected === true
```
</details>

### `selectMultiple`

Select any number of dates. Selecting an already selected date toggles it off.

<details style="margin-bottom: 16px">
<summary>Example:</summary>

```typescript
const { useMonthlyCalendar } = useCalendar({});
const { currentMonth, listeners: { selectMultiple } } = useMonthlyCalendar();

selectMultiple(currentMonth.value.days[10]);
selectMultiple(currentMonth.value.days[20]);
selectMultiple(currentMonth.value.days[27]);
// All three days: state.selected === true

selectMultiple(currentMonth.value.days[20]);
// days[20].state.selected === false, others unchanged
```
</details>

### `hoverRange`

Set hover state on all dates between the first selected date and the hovered day. Typically bound to `@mouseover` for range-picker UIs.

<details style="margin-bottom: 16px">
<summary>Example:</summary>

```typescript
const { useMonthlyCalendar } = useCalendar({});
const { currentMonth, listeners: { selectRange, hoverRange } } = useMonthlyCalendar();

selectRange(currentMonth.value.days[10]);
// One date selected — hovering now previews the range

hoverRange(currentMonth.value.days[20]);
// All days between 10 and 20: state.hovered === true
```
</details>

### `resetHover`

Reset hover state on all dates. Typically bound to `@mouseleave`.

## Programmatic API

### `selectDate(date: Date)`

Select a date programmatically without needing a rendered `CalendarDay` object. Useful for responding to external state (form resets, URL params, etc.). Respects the `mode` and disabled state.

```typescript
const { useMonthlyCalendar } = useCalendar({ mode: 'single' });
const { selectDate, clearSelection } = useMonthlyCalendar();

selectDate(new Date(2026, 5, 15));
clearSelection();
```

### `clearSelection()`

Clear all selected and hovered dates.

# CalendarDay object

Each date is represented by a `CalendarDay<T>` object — a plain object (not a class) with reactive state.

| Property    | Type              | Description |
|-------------|-------------------|-------------|
| `date`      | `Date`            | The underlying Date object. Treat as read-only. |
| `id`        | `string`          | Stable identity key, e.g. `"2026-05-10"`. |
| `state`     | `CalendarDayState` | Reactive UI state object (see below). |
| `otherMonth`| `boolean`         | True if the day is padding from an adjacent month (fullWeeks mode). |
| `meta`      | `T`               | Custom metadata provided via the `meta` option. |
| `isToday`   | `boolean`         | True if this date is today. |
| `isWeekend` | `boolean`         | True if Saturday or Sunday. |
| `dayOfWeek` | `number`          | 0 = Sunday … 6 = Saturday. |

### CalendarDayState

The `state` property is a `shallowReactive` object shared across all instances of the same day (including otherMonth padding copies):

| Property   | Type      | Description |
|------------|-----------|-------------|
| `selected` | `boolean` | Whether the day is currently selected. |
| `hovered`  | `boolean` | Whether the day is currently hovered. |
| `between`  | `boolean` | Whether the day is between two selected dates. |
| `disabled` | `boolean` | Whether the day is disabled. |

**Usage in templates:**

```vue
<template>
  <button
    :class="{
      active: day.state.selected,
      hover: day.state.hovered,
      between: day.state.between,
      light: day.otherMonth,
      today: day.isToday,
    }"
    :disabled="day.state.disabled"
    @click="listeners.selectRange(day)"
    @mouseover="listeners.hoverRange(day)"
    @mouseleave="listeners.resetHover()"
  >
    {{ day.date.getDate() }}
  </button>
</template>
```

## Extending days with `meta`

Instead of subclassing a date object, use the generic `meta` option to attach custom data:

```typescript
interface PriceMeta {
  price: number;
}

const { useMonthlyCalendar } = useCalendar<PriceMeta>({
  meta: (date: Date) => ({
    price: getPriceForDate(date),
  }),
});

const { currentMonth } = useMonthlyCalendar();
// currentMonth.value.days[0].meta.price
```

The `meta` callback runs once per day at creation time. It is **not** reactive — if the underlying data changes, you should use a separate `computed` or `watch` in your component.

## Month & Week containers

### Month\<T\>

| Property | Type | Description |
|----------|------|-------------|
| `id`     | `MonthId` (number) | Unique month index: `year * 12 + month`. |
| `month`  | `number` | 0-indexed month (0 = January). |
| `year`   | `number` | Full year. |
| `days`   | `CalendarDay<T>[]` | All days in this month (including otherMonth padding if fullWeeks). |

### Week\<T\>

| Property     | Type | Description |
|--------------|------|-------------|
| `id`         | `WeekId` (number) | Unique week index: `year * 100 + weekNumber`. |
| `weekNumber` | `number` | ISO week number. |
| `month`      | `number` | Month of the first day in the week. |
| `year`       | `number` | Year of the first day in the week. |
| `days`       | `CalendarDay<T>[]` | The 7 days in this week. |

## How navigation works

Months and weeks are generated lazily and stored in a reactive cache. When you navigate (`nextMonth`, `prevMonth`, `jumpTo`), only the target period is generated — not every period in between.

The cache has a configurable maximum size (default 13). When exceeded, the period farthest from the current view is evicted. In finite mode (with `minDate`/`maxDate`), all periods are pre-generated and the cache is sized to hold them all.

You can jump directly to any month by mutating `currentMonthAndYear`. The object uses getter/setter properties backed by the navigation state — no watch loops, no intermediate navigation:

```typescript
currentMonthAndYear.month = 2;  // March
currentMonthAndYear.year = 2027;
```

For weekly calendars, `currentWeekAndYear` works the same way:

```typescript
currentWeekAndYear.weekNumber = 3;
currentWeekAndYear.year = 2027;
```

## Shared state across months

When using `fullWeeks: true`, padding days from adjacent months share the **same reactive state** as their counterparts in the original month. Selecting May 31 in June's padding will also select May 31 in May's view — no manual syncing needed.

## Utility exports

The library exports helper functions for working with period IDs:

```typescript
import {
  monthIdFromDate,    // Date → MonthId
  monthIdFromYearMonth, // (year, month) → MonthId
  yearFromMonthId,    // MonthId → year
  monthFromMonthId,   // MonthId → month (0-indexed)
  dayIdFromDate,      // Date → "yyyy-MM-dd"
  weekIdFromYearWeek, // (year, week) → WeekId
  yearFromWeekId,     // WeekId → year
  weekFromWeekId,     // WeekId → week number
} from 'vue-use-calendar';
```

# Contributing

## Run the project

You can fork and clone the project on [github](https://github.com/Kapcash/vue-use-calendar).

Then install the dependencies:

```
yarn install
```

Run tests:

```
yarn test
```

Start the example on localhost:

```
yarn dev:example
```

Build the library:

```
yarn build
```

## Submit changes

If you're willing to participate in the development of this library, you are warmly welcome!

1. Fork the repository on GitHub
2. Clone your fork
3. Create a branch named after the changes you're making
4. Submit a Pull Request
