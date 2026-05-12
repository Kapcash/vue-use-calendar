# useCalendar

The single entry point of the library. Call it once in your component to configure global options and get back the sub-composables.

## Signature (simplified)

```ts
/**
 * @generic T Optional type of meta properties to pass to each day object.
 * @param options List of global options for all sub composables
 */
function useCalendar<T = unknown>(options: CalendarOptions<T>): CalendarComposables<T>
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `startOn` | `Date \| string` | `new Date()` | The initial date the calendar opens on. |
| `minDate` | `Date \| string` | — | Earliest selectable/navigable date. Days before this are disabled. |
| `maxDate` | `Date \| string` | — | Latest selectable/navigable date. Days after this are disabled. |
| `disabled` | `(Date \| string)[]` | `[]` | Specific dates to disable regardless of `minDate`/`maxDate`. |
| `firstDayOfWeek` | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6` | `0` | Day the week starts on (0 = Sunday, 1 = Monday…). |
| `locale` | `Locale` | `enUS` | A [date-fns locale](https://date-fns.org/v4/docs/Locale) for weekday/month name translation. |
| `preSelection` | `Date[] \| Date` | `[]` | Dates to pre-select on mount. |
| `meta` | `(date: Date) => T` | `() => undefined` | Factory function called for each day to attach custom metadata. |
| `mode` | `'single' \| 'range' \| 'multiple'` | `undefined` | Selection mode. Narrows the TypeScript type of `listeners`. |

## Return Value

| Property | Type | Description |
|----------|------|-------------|
| `useMonthlyCalendar` | `(opts?: MonthlyOptions) => MonthlyCalendarComposable<T>` | Creates a monthly view composable. |
| `useWeeklyCalendar` | `(opts?: WeeklyOptions) => WeeklyCalendarComposable<T>` | Creates a weekly view composable. |
| `useWeekdays` | `(format?: WeekdayInputFormat) => string[]` | Returns 7 day name strings. |
| `useMonthsList` | `(opts?: MonthsListOptions) => string[]` | Returns 12 month name strings. |
| `useYearsList` | `(opts?: YearsListOptions) => string[]` | Returns a range of year strings. |

## Examples

### Minimal

```ts
import { useCalendar } from 'vue-use-calendar';

const { useMonthlyCalendar } = useCalendar();
const { currentMonth, nextMonth, prevMonth } = useMonthlyCalendar();
```

### With All Options

// TODO Update example to show with reactive options.

```ts
import { fr } from 'date-fns/locale';
import { addMonths } from 'date-fns';
import { useCalendar } from 'vue-use-calendar';

interface BookingMeta {
  price: number;
  available: boolean;
}

const { useMonthlyCalendar, useWeekdays, useMonthsList } = useCalendar<BookingMeta>({
  startOn: new Date(),
  minDate: new Date(),
  maxDate: addMonths(new Date(), 6),
  disabled: [new Date('2026-12-25')],
  firstDayOfWeek: 1,
  locale: fr,
  preSelection: [],
  meta: (date) => ({
    price: getPriceFor(date),
    available: isAvailable(date),
  }),
  mode: 'range',
});
```

::: tip Generic Parameters
- `T` — the metadata type (defaults to `unknown`)
:::
