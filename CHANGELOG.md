# Changelog

## v2.0.0

### Breaking Changes

- **`CalendarDate` class replaced by `CalendarDay<T>` interface.** Days are now plain objects with a `date: Date` property instead of classes extending `Date`. Access date methods via `day.date.getDate()` instead of `day.getDate()`.

- **Reactive state consolidated into `day.state`.** Individual refs (`day.isSelected.value`, `day.isBetween.value`, `day.isHovered.value`, `day.disabled.value`) replaced by a single `shallowReactive` object: `day.state.selected`, `day.state.between`, `day.state.hovered`, `day.state.disabled`.

- **`day.dayId` renamed to `day.id`.**

- **`factory` option replaced by `meta`.** Instead of subclassing `CalendarDate`, pass a `meta: (date: Date) => T` function. Custom data is accessible via `day.meta`. The generic `T` flows through all composable return types.

- **`selectedDates` type changed.** Now `ComputedRef<CalendarDay<T>[]>` instead of a reactive array of `Date` objects.

- **`months` type changed.** Now `ComputedRef<Month<T>[]>` instead of `ShallowReactive<Month[]>`.

- **`currentWeekIndex` removed.** Use `currentWeek.value.id` instead.

- **Peer dependency bumped.** Vue `>=3.4` required (was `>=3`).

- **`generateCalendarFactory` removed.** Use `createCalendarDay()` for advanced use cases.

- **`_copied` flag removed.** Padding days are identified by `day.otherMonth` only.

### New Features

- **Generic `meta` option.** Attach arbitrary typed metadata to each day without subclassing.

- **`useMonthsList` composable.** Returns translated month names in any format.

- **`useYearsList` composable.** Returns a configurable range of formatted year strings.

- **Shared state across otherMonth copies.** When using `fullWeeks: true`, padding days from adjacent months share the same reactive state reference as the original. Selecting a day in one month instantly reflects in the other — no manual sync needed.

- **Lazy navigation cache.** Months and weeks are generated on demand and stored in a `shallowReactive(Map)`. Cache evicts the farthest-from-current entry when exceeding the max size (default 13).

- **Direct month jumping.** Mutate `currentMonthAndYear.month` and `.year` to jump to any month without navigating through intermediate ones.

- **Utility exports.** `monthIdFromDate`, `dayIdFromDate`, `weekIdFromYearWeek`, and other ID conversion functions are now public exports.

### Bug Fixes

- **`isWeekend` now detects Saturday.** Previously only checked Sunday (`getDay() === 0`); now checks `day === 0 || day === 6`.

- **No more shared refs on copied dates.** The old `copy()` mechanism shared `Ref` instances between original and copy, causing subtle state corruption. The new shared-state registry approach uses a single `shallowReactive` state object per day ID.

- **Disabled dates enforce `minDate`/`maxDate` bounds.** Out-of-range dates are now always marked as disabled during day creation.

- **No side-effects in computed properties.** Cache population moved from computed getters to imperative `next()`/`prev()`/`jumpTo()` calls.

- **Between/hover range immune to duplicate day entries.** Range computation uses lexicographic `"YYYY-MM-DD"` string comparison over the `stateMap` keys instead of array indices. Previously, when the previous month was cached and an otherMonth padding day appeared twice in the flat day list, `findIndex` would pick the wrong occurrence and produce incorrect highlight ranges.

### Dependency Updates

| Package | v1 | v2 |
|---------|----|----|
| date-fns | `^2.27.0` | `^4.1.0` |
| typescript | `^4.5.5` | `^5.7.0` |
| vitest | `^0.24.4` | `^3.0.0` |
| vite | `^2.8.4` | `^6.0.0` |
| tsup | `^5.12.1` | `^8.3.0` |
| vue (peer) | `>=3` | `>=3.4` |

### Internal

- Replaced `CalendarDate` class (`lib/models/CalendarDate.ts`) with `createCalendarDay()` factory (`lib/core/calendar-day.ts`).
- Replaced per-day `Ref` booleans with centralized `selectedIds`/`hoveredIds` Sets and a shared `stateMap` (`lib/core/selection.ts`).
- Replaced `shallowReactive` array + index navigation with generic `createNavigation()` using a `shallowReactive(Map)` cache (`lib/core/navigation.ts`).
- Moved pure date utilities to `lib/utils/date.ts`.
- All 67 tests rewritten for the new API.
