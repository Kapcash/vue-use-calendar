# Changelog

## v2.1.0

### New Features

- **`mode` option on `useCalendar`.** Pass `mode: 'single' | 'range' | 'multiple'` to constrain which selection handlers are available. The TypeScript type of `listeners` is narrowed to only the methods valid for that mode via `ModeHandlers<T, M>`. Runtime object also only contains the relevant functions.

- **`pureDays` exposed on `useMonthlyCalendar`.** `pureDays: ComputedRef<CalendarDay<T>[]>` is now returned alongside `days`, filtering out `otherMonth` padding. Previously consumers had to filter manually.

- **`currentWeekAndYear` on `useWeeklyCalendar`.** Mirrors the monthly `currentMonthAndYear` API. `{ year: number; weekNumber: number }` reactive object backed by getter/setters \u2014 mutate directly to jump to any week without navigating through intermediate ones.

- **Programmatic selection API.** Both `useMonthlyCalendar` and `useWeeklyCalendar` now return `selectDate(date: Date)` and `clearSelection()` for external triggers that don\u2019t have a `CalendarDay` object (form resets, URL-driven state, etc.).

- **Pre-selected dates always reflected in `selectedDates`.** Both composables now eagerly cache the period(s) containing each `preSelection` date after navigation is set up, so `selectedDates` is accurate immediately \u2014 even if the user hasn\u2019t navigated to that month/week yet.

### Breaking Changes

- **`Listeners<T>` renamed to `SelectionHandlers<T>`.** The interface and all references have been updated. If you imported `Listeners` directly from `vue-use-calendar`, update to `SelectionHandlers`.

- **`infinite` now defaults to `false` for both `useMonthlyCalendar` and `useWeeklyCalendar`.** Previously monthly defaulted to `true`. Pass `infinite: true` explicitly to restore the old behaviour.

- **`disabled` in `NormalizedCalendarOptions` replaced by `disabledIds: Set<string>`.** Internal change only \u2014 affects custom composables that accept `NormalizedCalendarOptions` directly. Public `CalendarOptions.disabled` API is unchanged.

### Bug Fixes

- **`between` state now updates when navigating into a new month mid-range.** `stateMap` is now `shallowReactive`, so `betweenIds` reacts to new entries added by navigation. Previously, days in a newly navigated-to month that fell within a selected range were never flagged as `between: true` until the next selection event.

- **O(n) full-state sync eliminated.** Replaced `syncAllStates()` (which iterated the entire `stateMap` on every interaction) with targeted delta updates. Only the specific state entries that change are written. `between` propagation uses `watchEffect({ flush: 'sync' })` to apply only the diff between previous and next `betweenIds`.

- **`hoverRange` no longer allocates an array to read one Set element.** `Array.from(selectedIds)[0]` replaced with `selectedIds.values().next().value`.

- **`useWeekdays` no longer anchors to the current date.** The internal reference Sunday is now a fixed date (`2000-01-02`) instead of `nextSunday(new Date())`, making output deterministic regardless of when the composable is called.

- **`currentMonthAndYear` bidirectional watch loop eliminated.** The reactive object now uses getter/setter properties backed directly by `nav.currentPeriodId` \u2014 no `watch` calls, no guard conditions.

- **`disabled` check in `isDateDisabled` is now O(1).** Disabled dates are normalized to a `Set<string>` of `\"YYYY-MM-DD\"` IDs at the `normalizeGlobalParameters` boundary, replacing an O(n) `isSameDay` array scan per generated day.

### Internal

- `createSelectionState<T, M>()` now accepts `mode` and returns `ModeHandlers<T, M>` as `listeners`.
- `stateMap` promoted from plain `Map` to `shallowReactive(Map)` in `lib/core/selection.ts`.
- `syncAllStates()` removed entirely from `lib/core/selection.ts`.
- `NormalizedCalendarOptions.disabled: Date[]` \u2192 `disabledIds: Set<string>`.
- `GeneratorComposable` type alias renamed to `StringList`.
- Fixed `lib/utils/week.ts` importing `FirstDayOfWeek` from `../../dist` (build output) instead of `../types`.

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
