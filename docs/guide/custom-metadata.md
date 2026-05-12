# Custom Metadata

The `meta` option lets you attach arbitrary data to each `CalendarDay`. The generic type `T` flows through all composable return types so you get full TypeScript inference.

## Defining Metadata

```ts
interface PriceMeta {
  price: number;
  available: boolean;
}

const { useMonthlyCalendar } = useCalendar<PriceMeta>({
  mode: 'range',
  meta: (date: Date) => ({
    price: getPriceForDate(date),
    available: isDateAvailable(date),
  }),
});

const { currentMonth } = useMonthlyCalendar();

// day.meta is fully typed as PriceMeta
currentMonth.value.days[0].meta.price;     // number
currentMonth.value.days[0].meta.available; // boolean
```

The `meta` function is called **once per calendar day** when that day is first generated (lazy, on navigation). The return value is stored on `day.meta` and is not reactive — treat it as static data.

## Usage in Templates

```vue
<div
  v-for="day in currentMonth.days"
  :key="day.id"
  :class="{ 'day--unavailable': !day.meta.available }"
>
  <span>{{ day.date.getDate() }}</span>
  <span class="price" v-if="day.meta.price">${{ day.meta.price }}</span>
</div>
```

## Common Patterns

### Availability calendar

```ts
interface AvailabilityMeta {
  available: boolean;
  spots: number;
}

const { useMonthlyCalendar } = useCalendar<AvailabilityMeta>({
  meta: (date) => ({
    available: checkAvailability(date),
    spots: getRemainingSpots(date),
  }),
  // Optionally disable unavailable dates too
  disabled: getUnavailableDates(),
});
```

### Event count per day

```ts
interface EventMeta {
  count: number;
  hasUrgent: boolean;
}

const { useMonthlyCalendar } = useCalendar<EventMeta>({
  meta: (date) => {
    const events = getEventsForDate(date);
    return { count: events.length, hasUrgent: events.some(e => e.urgent) };
  },
});
```

### Custom date label

```ts
interface LabelMeta {
  label: string;
}

const { useMonthlyCalendar } = useCalendar<LabelMeta>({
  meta: (date) => ({
    label: holidays.get(date.toISOString().slice(0, 10)) ?? '',
  }),
});
```

```vue
<div v-for="day in currentMonth.days" :key="day.id">
  {{ day.date.getDate() }}
  <small v-if="day.meta.label">{{ day.meta.label }}</small>
</div>
```

## Live Demo — Price Calendar

<DemoPriceCalendar />
