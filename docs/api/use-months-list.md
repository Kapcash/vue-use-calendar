# useMonthsList

Returns an array of 12 month-name strings for the current locale.

## Signature (simplified)

```ts
function useMonthsList(opts?: { format?: MonthInputFormat }): string[]
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `format` | `MonthInputFormat` | `'MMMM'` | A [date-fns format token](https://date-fns.org/v4/docs/format) for month names. |

### Format Options

| Token | Output (English) |
|-------|-----------------|
| `'M'` | `'1'`–`'12'` (numeric) |
| `'MM'` | `'01'`–`'12'` (padded) |
| `'MMM'` | `'Jan'`, `'Feb'`… |
| `'MMMM'` | `'January'`, `'February'`… |
| `'MMMMM'` | `'J'`, `'F'`… |
| `'LLL'` | Stand-alone abbreviated |
| `'LLLL'` | Stand-alone full name |

## Return Value

`string[]` — 12 month name strings (index 0 = January, index 11 = December).

## Usage

```ts
const { useMonthsList } = useCalendar({ locale: fr });
const monthNames = useMonthsList({ format: 'MMMM' });
// ['janvier', 'février', 'mars', …]
```

```vue
<select v-model.number="currentMonthAndYear.month">
  <option v-for="(name, i) in monthNames" :key="i" :value="i">
    {{ name }}
  </option>
</select>
```
