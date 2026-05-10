# AGENTS.md — vue-use-calendar

## Project Overview

**vue-use-calendar** is a Vue 3 composable library for managing calendar and date-picker state. It is designed for renderless/headless calendar components — it handles all date logic and selection state, leaving rendering entirely to the consumer.

- **Runtime dependency:** `date-fns` (date manipulation and formatting)
- **Peer dependency:** Vue 3 (`>=3`)
- **Language:** TypeScript (strict mode)
- **Build tool:** tsup (outputs ESM + CJS + `.d.ts`)
- **Test framework:** Vitest
- **Linter:** ESLint with `@typescript-eslint` and `eslint-plugin-vue`

## Repository Structure

```
lib/                        # Library source (published to npm)
  index.ts                  # Public entry point — re-exports everything
  use-calendar.ts           # Main composable: useCalendar()
  types.ts                  # All shared TypeScript types and interfaces
  models/
    CalendarDate.ts         # CalendarDate class (extends Date) + factory
  composables/
    reactiveDates.ts        # Selection/hover/between computed state
    use-monthly-calendar.ts # Monthly calendar composable
    use-weekly-calendar.ts  # Weekly calendar composable
    use-navigation.ts       # Shared navigation logic (next/prev/jump)
    use-weekdays.ts         # Weekday names composable
    use-months-list.ts      # Month names list composable
    use-years-list.ts       # Year list composable
  utils/
    utils.ts                # General utilities (chunk, date ranges, etc.)
    utils.month.ts          # Month-specific generation & wrapping
    utils.week.ts           # Week-specific generation & wrapping

tests/                      # Vitest test files
  helpers.ts                # Test utilities (areConsecutiveDays)
  use-calendar.spec.ts
  use-monthly-calendar.spec.ts
  use-months-list.spec.ts
  use-weekdays.spec.ts
  use-years-list.spec.ts

example/                    # Vue 3 + Vite demo app (deployed to GitHub Pages)
  components/               # Example calendar components (Vue SFCs)
```

## Key Commands

| Task | Command |
|------|---------|
| Run tests (watch mode) | `yarn test` |
| Build library | `yarn build` |
| Lint | `yarn lint` |
| Lint + autofix | `yarn lint:fix` |
| Run example dev server | `yarn dev:example` |
| Build example | `yarn build:example` |

## Architecture & Key Concepts

### Entry Point

`useCalendar(options)` is the single entry point. It accepts global options (start date, min/max, disabled dates, locale, factory, first day of week, pre-selection) and returns sub-composables:

- `useMonthlyCalendar(opts)` — monthly view with navigation, selection, days grouped by month
- `useWeeklyCalendar(opts)` — weekly view with navigation, selection, days grouped by week
- `useWeekdays(format)` — translated weekday names
- `useMonthsList(format)` — translated month names
- `useYearsList(opts)` — range of formatted year strings

### CalendarDate Model

`CalendarDate` extends native `Date` with reactive Vue properties: `isSelected`, `isBetween`, `isHovered`, `disabled`, `otherMonth`. It supports a `copy()` method for "full weeks" duplicates. A factory pattern (`generateCalendarFactory`) allows consumers to extend `CalendarDate` with custom properties (e.g., prices, availability).

### Reactivity Model

- Navigation state uses `shallowReactive` arrays and `ref` for indices.
- Date boolean flags (`isSelected`, `isHovered`, etc.) are individual `Ref<boolean>` on each `CalendarDate` instance.
- Computed properties in `reactiveDates.ts` derive filtered lists (pure dates, selected, hovered, between).
- Selection listeners (`selectSingle`, `selectRange`, `selectMultiple`, `hoverRange`, `resetHover`) mutate the reactive refs on the CalendarDate instances directly.

### Navigation

`use-navigation.ts` provides shared navigation logic for both monthly and weekly views. It supports finite or infinite mode — infinite mode generates new months/weeks on-the-fly as the user navigates.

## Coding Conventions

### TypeScript

- Strict mode enabled (`strict: true` in tsconfig).
- Use generics with `C extends CalendarDate` throughout the library to support the factory pattern.
- Types and interfaces live in `lib/types.ts`; model classes live in `lib/models/`.
- Semicolons are required (`@typescript-eslint/semi: error`).
- Trailing commas required on multiline (`comma-dangle: always-multiline`).
- Class members separated by blank lines (except single-line members).

### Composable Pattern

- All composables follow the `useX` naming convention.
- Sub-composable constructors (e.g., `monthlyCalendar`, `weeklyCalendar`) are higher-order functions: they accept normalized global options and return the actual `useX` composable function.
- Options are normalized in `normalizeGlobalParameters()` before being passed to sub-composables.

### Date Handling

- All date manipulation uses `date-fns` — never use raw Date methods for calculations.
- Date inputs (`DateInput`) accept both `Date` objects and ISO strings; normalization happens in `normalizeGlobalParameters`.
- `MonthYear` is a numeric index (`month + year * 12`) used to uniquely identify and compare months.

## Testing Conventions

- Tests use Vitest with `describe`/`it`/`expect`.
- Deterministic dates: use `vi.setSystemTime()` (usually in `beforeAll`) to freeze the current date.
- Test file naming: `<composable-name>.spec.ts` in the `tests/` directory.
- Helper utilities for tests live in `tests/helpers.ts`.
- Tests validate both structure (correct return types) and behavior (navigation, selection, boundary conditions).

## Common Pitfalls

- `CalendarDate` extends `Date`, which has quirks — be careful with `instanceof` checks and serialization.
- The `_copied` flag on `CalendarDate` distinguishes original dates from "full week" copies that belong to adjacent months. The `pureDates` computed filters these out.
- `isWeekend` getter has a bug: `weekDay > 6` can never be true for `getDay()` (returns 0–6). It only checks Sunday (`=== 0`), not Saturday (`=== 6`).
- When adding new composables, remember to wire them through `useCalendar()` and export from `lib/index.ts`.
