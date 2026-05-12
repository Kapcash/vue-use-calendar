# useYearsList

Returns a list of year strings for use in year-selection dropdowns.

## Signature (simplified)

```ts
function useYearsList(opts?: YearsListOptions): string[]
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `format` | `YearInputFormat` | `'yyyy'` | A date-fns format token for year rendering. |
| `fromYear` | `number` | current year | Start of the year range (inclusive). |
| `toYear` | `number` | `fromYear + 10` | End of the year range (inclusive). Mutually exclusive with `amount`. |
| `amount` | `number` | `10` | Number of years to generate. Used when `toYear` is not provided. |

### `YearInputFormat`

Any date-fns format string starting with `y`, `Y`, `R`, or `u`. Common values:

| Token | Output |
|-------|--------|
| `'yyyy'` | `'2026'` |
| `'yy'` | `'26'` |
| `'RRRR'` | ISO week-numbering year |

## Return Value

`string[]` — year strings from `fromYear` to `toYear` (or `amount` years from `fromYear`).

## Usage

```ts
const { useYearsList } = useCalendar({});

// Default: current year through current year + 10
const years = useYearsList();
// ['2026', '2027', '2028', …, '2036']

// Custom range
const customYears = useYearsList({ fromYear: 2020, toYear: 2030 });
// ['2020', '2021', …, '2030']
```

```vue
<select v-model.number="currentMonthAndYear.year">
  <option v-for="y in years" :key="y" :value="Number(y)">{{ y }}</option>
</select>
```

::: tip
`useYearsList` returns plain strings, not numbers. Use `Number(y)` or `parseInt(y)` when binding to `currentMonthAndYear.year` (which expects a number).
:::
