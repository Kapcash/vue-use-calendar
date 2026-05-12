# What is vue-use-calendar?

`vue-use-calendar` is a Vue 3 set of composables that handles the logic to build calendar and date pickers for you.

It's completely headless: it doesn't provide anything related to the presentation (no styles, no components).
This is your responsibility, use the exported data and functions to create your own components on top of it.

## What exactly does it provide

You get:
- A reactive, stateful, `CalendarDay` object per day.
- Navigation composables (`nextMonth()`, `prevWeek()`…)
- Selection handlers for date pickers (handles hover, selection modes `single`, `range`, `multiple`)
- Formatted weekday names and month names (locale-aware)

You write:
- The layout (row, grid, flat…)
- The visual states (classes, inline styles, Tailwind utilities…)
- Any animations or transitions

## What It Is Not

- Not a component library (no `<Calendar />` component shipped)
- Not a date formatting utility — use `date-fns` directly for formatting (which is already a peer dependency)

## Requirements

| | |
|---|---|
| **Vue** | `>=3.4` (peer dep) |
| **date-fns** | `^4` (direct dep) |
| **TypeScript** | Recommended, strict mode supported |
