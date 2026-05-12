# Localization

## Locale

Pass any [date-fns `Locale`](https://date-fns.org/v4/docs/Locale) object to translate weekday names, month names, and ordinal formats:

```ts
import { fr } from 'date-fns/locale';
import { useCalendar } from 'vue-use-calendar';

const { useWeekdays, useMonthsList } = useCalendar({
  locale: fr,
  firstDayOfWeek: 1, // Monday
});

const weekdays = useWeekdays('iiiiii'); // ['lun.', 'mar.', …]
const months   = useMonthsList();       // ['janvier', 'février', …]
```

All `date-fns` locales are supported:

```ts
import { es } from 'date-fns/locale';  // Spanish
import { de } from 'date-fns/locale';  // German
import { ja } from 'date-fns/locale';  // Japanese
import { ar } from 'date-fns/locale';  // Arabic
```

The default locale is `date-fns`'s built-in English (`enUS`).

## First Day of Week

`firstDayOfWeek` accepts `0`–`6` (0 = Sunday, 1 = Monday, … 6 = Saturday). This affects:

- The order of days in the grid
- Which day appears in the leftmost column
- How `useWeekdays()` orders its output
- How ISO week numbers are calculated for `useWeeklyCalendar`

```ts
const { useMonthlyCalendar } = useCalendar({
  firstDayOfWeek: 1, // Monday first (common in Europe)
});
```

| Value | Week starts on |
|-------|---------------|
| `0` | Sunday (US default) |
| `1` | Monday (ISO 8601, Europe) |
| `6` | Saturday (some Middle East locales) |

## useWeekdays Formats

`useWeekdays(format?)` returns an array of 7 day name strings, starting from `firstDayOfWeek`. The format argument uses [date-fns `format` tokens](https://date-fns.org/v4/docs/format):

| Format | Example (English) | Example (French) |
|--------|------------------|-----------------|
| `'iiiiii'` (default) | `['Su', 'Mo', 'Tu', …]` | `['di', 'lu', 'ma', …]` |
| `'iii'` | `['Sun', 'Mon', 'Tue', …]` | `['dim.', 'lun.', 'mar.', …]` |
| `'iiii'` | `['Sunday', 'Monday', …]` | `['dimanche', 'lundi', …]` |

## Live Demo — French Calendar, Monday First

<DemoLocalization />
