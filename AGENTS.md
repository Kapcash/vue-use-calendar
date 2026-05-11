# AGENTS.md — vue-use-calendar

## Project Overview

**vue-use-calendar** is a Vue 3 composable library for managing calendar and date-picker state. It is designed for renderless/headless calendar components — it handles all date logic and selection state, leaving rendering entirely to the consumer.

- **Runtime dependency:** `date-fns` v4 (date manipulation and formatting)
- **Peer dependency:** Vue 3 (`>=3.4`)
- **Language:** TypeScript (strict mode)
- **Build tool:** tsup (outputs ESM + CJS + `.d.ts`)
- **Test framework:** Vitest
- **Linter:** ESLint with `@typescript-eslint` and `eslint-plugin-vue`

## Repository Structure

```
lib/                        # Library source (published to npm)
  index.ts                  # Public entry point — re-exports useCalendar, types, ID utils
  use-calendar.ts           # Main composable: useCalendar() + normalizeGlobalParameters()
  types.ts                  # All shared TypeScript types and interfaces
  core/
    calendar-day.ts         # createCalendarDay<T>() factory + generateConsecutiveDays<T>()
    selection.ts            # createSelectionState<T>() — centralized selection/hover/between
    navigation.ts           # createNavigation<TId, TPeriod>() — lazy cache + LRU eviction
  composables/
    use-monthly-calendar.ts # Monthly calendar composable (curried)
    use-weekly-calendar.ts  # Weekly calendar composable (curried)
    use-weekdays.ts         # Weekday names composable
    use-months-list.ts      # Month names list composable
    use-years-list.ts       # Year list composable
  utils/
    date.ts                 # Pure utilities (ID conversions, checks, chunk)
    month.ts                # generateMonth<T>() + padFullWeeks
    week.ts                 # generateWeek<T>() + weekId arithmetic

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

`useCalendar<T, M>(options)` is the single entry point. It accepts global options (start date, min/max, disabled dates, locale, meta factory, first day of week, pre-selection, selection mode) and returns sub-composables:

- `useMonthlyCalendar(opts?)` — monthly view with navigation, selection, days grouped by month
- `useWeeklyCalendar(opts?)` — weekly view with navigation, selection, days grouped by week
- `useWeekdays(format?)` — translated weekday names
- `useMonthsList(opts?)` — translated month names
- `useYearsList(opts?)` — range of formatted year strings

Options are normalized in `normalizeGlobalParameters<T>()` before being passed to sub-composables.

### CalendarDay Model

`CalendarDay<T>` is a plain TypeScript interface (not a class). Each day is a plain object created by `createCalendarDay<T>()` in `lib/core/calendar-day.ts`:

```ts
interface CalendarDay<T> {
  date: Date;              // The underlying Date
  id: string;              // "YYYY-MM-DD" — stable, sortable
  state: CalendarDayState; // { selected, hovered, between, disabled } — shallowReactive
  otherMonth: boolean;     // True for full-week padding days from adjacent months
  meta: T;                 // User-defined metadata via meta option
  isToday: boolean;
  isWeekend: boolean;
  dayOfWeek: number;       // 0=Sun … 6=Sat
}
```

The generic `T` flows from `useCalendar<T>()` through all composable return types and `CalendarDay<T>` instances. Consumers attach custom data via the `meta: (date: Date) => T` option instead of subclassing.

### Shared State Registry (StateProvider)

`CalendarDayState` is a `shallowReactive` object. When `fullWeeks: true`, the same calendar day can appear in multiple months (as otherMonth padding). All copies of a day share the **same** state reference via a `StateProvider`:

- `createSelectionState()` owns a `stateMap: Map<string, CalendarDayState>` — the single source of truth.
- It exposes `getOrCreateState: StateProvider` which is passed to day/month/week generators.
- When `createCalendarDay()` receives a `stateProvider`, it fetches or creates the shared state by day ID. Selecting a day in one month instantly reflects in all months that display it.

### Selection & Range Logic

`createSelectionState<T, M>()` in `lib/core/selection.ts` manages selection centrally:

- **Data structures:** `selectedIds` and `hoveredIds` are `reactive(Set<string>)`. The `stateMap` is a `shallowReactive(Map<string, CalendarDayState>)` — reactive so that `betweenIds` re-runs when new days are added by navigation.
- **Range computation:** `betweenIds` uses **lexicographic comparison** of `"YYYY-MM-DD"` IDs over the `stateMap` keys — not array indices.
- **Between-state propagation:** A `watchEffect({ flush: 'sync' })` applies delta `between` state changes (prev vs. next `betweenIds`) immediately after any selection or navigation change. No global sync — only affected IDs are touched.
- **Targeted updates:** All state mutations (select, hover, reset) are O(affected IDs) — only the specific entries that change are written. No more O(n) full-stateMap scan.
- **Selection mode:** Accepts an optional `mode: SelectionMode` (`'single' | 'range' | 'multiple'`). The returned `listeners` object is narrowed to only the handlers valid for that mode via the `ModeHandlers<T, M>` conditional type. Runtime object also only contains the relevant functions.
- **Handlers:** `selectSingle`, `selectRange`, `selectMultiple`, `hoverRange`, `resetHover` — exposed via the `SelectionHandlers<T>` interface (or a narrowed `ModeHandlers<T, M>` subset).
- **Programmatic API:** `selectDate(date: Date)` and `clearSelection()` are also returned, for external triggers that don't have a `CalendarDay` object.

### Navigation

`createNavigation<TId, TPeriod>()` in `lib/core/navigation.ts` is a generic lazy-cache navigator used by both monthly and weekly composables:

- **Cache:** `shallowReactive(new Map<TId, TPeriod>())` — periods are generated on demand by a `generatePeriod(id)` factory and cached.
- **LRU eviction:** When cache exceeds `maxCacheSize` (default 13), the entry farthest from `currentPeriodId` is evicted.
- **Reactivity:** `shallowReactive(Map)` triggers Vue's dependency tracking on `.set()`, `.delete()`, and `.entries()` natively.
- **Supports:** `next()`, `prev()`, `jumpTo(id)`, `ensureCached(id)`. Finite mode restricts navigation to `[minId, maxId]`.
- **ID schemes:** `MonthId = year * 12 + month` (12 months per year, no collision). `WeekId = year * 100 + isoWeek` — 100 (`WEEK_ID_RADIX`) is the numeric base for packing year and week into one integer; ISO weeks never exceed 53 so there is no collision risk, and the result is human-readable and naturally sortable (e.g. week 3 of 2026 → `202603`). Custom `nextId`/`prevId` functions handle year boundaries for weeks.

### Monthly Composable

`monthlyCalendar<T, M>()` is a curried higher-order function. Key implementation details:

- **`infinite` default:** `false`.
- **Pre-generation:** When `maxDate` is set, all months in range are eagerly cached.
- **Pre-selection cache:** After navigation is set up, each month containing a `preSelection` date is eagerly cached via `nav.ensureCached()`. This ensures `selectedDates` is accurate for pre-selected dates regardless of whether the user has navigated there.
- **`days`:** `computed` flat list of all days across all cached months (includes otherMonth padding).
- **`pureDays`:** `days` filtered by `!otherMonth`. Now exposed in the composable return value.
- **`currentMonthAndYear`:** `reactive` object with getter/setter properties backed directly by `nav.currentPeriodId`. Setting `.month` or `.year` calls `nav.jumpTo()` inline. No `watch` calls, no loop risk.
- **Programmatic API:** `selectDate(date: Date)` and `clearSelection()` are forwarded from `createSelectionState`.

### Weekly Composable

Same curried pattern as monthly. Uses custom `nextWeekId`/`prevWeekId` for year-boundary arithmetic. No otherMonth padding concept.

- **`infinite` default:** `false`.
- **`currentWeekAndYear`:** `reactive` object with getter/setter properties backed by `nav.currentPeriodId`. Setting `.weekNumber` or `.year` calls `nav.jumpTo()` inline. Mirrors `currentMonthAndYear` in the monthly composable.
- **Pre-selection cache:** Same eager `nav.ensureCached()` pattern as monthly.
- **Programmatic API:** `selectDate(date: Date)` and `clearSelection()` forwarded from `createSelectionState`.

## Coding Conventions

### TypeScript

- Strict mode enabled (`strict: true` in tsconfig, `target: ESNext`, `moduleResolution: bundler`).
- Generic `<T>` (metadata type) and `<M extends SelectionMode | undefined>` (mode type) flow through all composables and `CalendarDay<T>`. No class inheritance.
- Types and interfaces live in `lib/types.ts`; core logic in `lib/core/`.
- Semicolons are required (`@typescript-eslint/semi: error`).
- Trailing commas required on multiline (`comma-dangle: always-multiline`).
- `Listeners<T>` is now `SelectionHandlers<T>`. Mode-narrowed variant is `ModeHandlers<T, M>`.
- `disabled: Date[]` in `NormalizedCalendarOptions` is now `disabledIds: Set<string>` for O(1) lookup.

### Composable Pattern

- All composables follow the `useX` naming convention.
- Sub-composable constructors (e.g., `monthlyCalendar`, `weeklyCalendar`) are higher-order functions: they accept normalized global options and return the actual `useX` composable function.

### Date Handling

- All date manipulation uses `date-fns` v4 — never use raw Date methods for calculations.
- Date inputs accept both `Date` objects and ISO strings; normalization happens in `normalizeGlobalParameters`.
- `MonthId` is `year * 12 + month`. `WeekId` is `year * 100 + isoWeek` (see `WEEK_ID_RADIX` in `lib/utils/week.ts`). Day IDs are `"YYYY-MM-DD"` strings.

## Testing Conventions

- Tests use Vitest with `describe`/`it`/`expect`.
- Deterministic dates: use `vi.setSystemTime()` (usually in `beforeAll`) to freeze the current date.
- Test file naming: `<composable-name>.spec.ts` in the `tests/` directory.
- Helper utilities for tests live in `tests/helpers.ts`.
- Tests validate both structure (correct return types) and behavior (navigation, selection, boundary conditions).
- No weekly calendar tests exist yet.

## Common Pitfalls

- **Shared state across months:** When using `fullWeeks: true`, otherMonth days share their `CalendarDayState` with the original month via the `StateProvider`. Always use the shared `getOrCreateState` when creating days — never create standalone state for days that may appear in multiple periods.
- **Range computation uses string comparison, not array indices.** Day IDs (`"YYYY-MM-DD"`) sort lexicographically = chronologically. The `betweenIds` and `hoverRange` logic iterates `stateMap` keys and compares IDs directly, avoiding issues with duplicate entries from otherMonth padding.
- **`between` state is propagated by `watchEffect({ flush: 'sync' })`**, not by a full O(n) sync. The effect runs synchronously after any `selectedIds` or `stateMap` change. Never call `syncAllStates()` — it no longer exists.
- **`stateMap` is `shallowReactive`.** This is what makes `betweenIds` react to new navigation entries. Do not replace it with a plain `Map`.
- **`currentMonthAndYear` and `currentWeekAndYear` use getter/setters** backed by `nav.currentPeriodId`. They are not plain reactive data properties — do not add `watch` calls on top of them.
- **`disabled` dates in `NormalizedCalendarOptions` are stored as `disabledIds: Set<string>`** (YYYY-MM-DD strings), not `Date[]`. Always normalize at the `normalizeGlobalParameters` boundary.
- When adding new composables, wire them through `useCalendar()` and export from `lib/index.ts`.
