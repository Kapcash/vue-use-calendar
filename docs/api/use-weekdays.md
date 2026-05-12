# useWeekdays

Returns an array of 7 day-name strings for the current locale, starting from `firstDayOfWeek`.

## Signature (simplified)

```ts
function useWeekdays(format?: WeekdayInputFormat): string[]
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `format` | `WeekdayInputFormat` | `'iiiiii'` | A [date-fns format token](https://date-fns.org/v4/docs/format) for day names. |

### Format Options

| Token | Output (English) | Output (French) |
|-------|-----------------|----------------|
| `'i'` | `'1'`–`'7'` | — (numeric) |
| `'ii'` | `'01'`–`'07'` | — (padded numeric) |
| `'iii'` | `'Mon'`, `'Tue'`… | `'lun.'`, `'mar.'`… |
| `'iiii'` | `'Monday'`, `'Tuesday'`… | `'lundi'`, `'mardi'`… |
| `'iiiii'` | `'M'`, `'T'`… | `'L'`, `'M'`… |
| `'iiiiii'` | `'Mo'`, `'Tu'`… | `'lu'`, `'ma'`… |

## Return Value

`string[]` — array of 7 day name strings starting from `firstDayOfWeek`.

## Usage

```ts
import { useCalendar } from 'vue-use-calendar';

const { useWeekdays } = useCalendar({ firstDayOfWeek: 1 }); // Monday first
const weekdays = useWeekdays('iii'); // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
```

```vue
<div class="grid" style="grid-template-columns: repeat(7, 1fr)">
  <span v-for="wd in weekdays" :key="wd">{{ wd }}</span>
</div>
```
