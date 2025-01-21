# Vue use-calendar

A vue 3 composable to create any kind of calendar!

* Open source
* SSR compliant
* Fully typed with Typescript
* Full customize your calendar style without thinking about the logic
* Extendable
* Uses [`date-fns`](https://date-fns.org/v2.28.0/docs) functions internally for lightweight and consistent Dates operations

This can be used to hold the dates logic for your calendar components.

## \>\>\> See the [DEMO](https://kapcash.github.io/vue-use-calendar/) <<<

## Install it

```bash
# npm
npm install vue-use-calendar

# yarn
yarn add vue-use-calendar
```

## Basic example

```typescript
// Considering today is the 15th of March 2022
const { useMontlyCalendar } = useCalendar()
const {
  nextMonth,
  prevMonth,
  currentMonthAndYear,
  currentMonth,
  selectedDates,
  listeners,
} = useMonthlyCalendar({ fullWeeks: false, infinite: true });

/*
  currentMonthAndYear === { year: 2022, month: 2 }
  currentMonth === { month: 2, year: 2022, days: [...], index: 24266 }
  selectedDates === []
*/ 

// Go to next month
nextMonth()

/*
  currentMonthAndYear === { year: 2022, month: 3 }
  currentMonth === { month: 3, year: 2022, days: [...], index: 24267 }
  selectedDates === []
*/

listeners.selectSingle(currentMonth.days[3])

/*
  selectedDates === [{ date: <4th March 2020>, isSelected: true, ... }]
*/
```

# The composables

The entry point of the library is `use-calendar`.

## use-calendar

```typescript
import { isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

const pricesByDay = [
      { price: 55, date: '2022-05-12' },
]

const { useMontlyCalendar } = useCalendar({
      startOn: new Date(2025, 5, 1),
      minDate: '2025-05-12',
      maxDate: new Date(2025, 5, 18),
      disabled: [new Date(2025, 5, 15)],
      firstDayOfWeek: 1, // Monday
      locale: es, // Spanish
      preSelection: [new Date(2025, 5, 13)],
      factory: (calendarDate) => {
            // Extends the generated date by adding the associated price
            const correspondingPrice = pricesByDay.find(({ date }) => isSameDay(date, calendarDate.date));
            const customDate: CustomDate = {
                  ...calendarDate,
                  price: correspondingPrice?.price || 0,
            };
            return customDate;
      }
})

const { currentMonth } = useMontlyCalendar()
```

## Parameters

| name | type | optional | default | description |
|------|------|----------|---------|-------------|
| startOn       | `string \| Date`                      | true | `undefined` | The date to initiate the calendar on |
| minDate       | `string \| Date`                      | true | `undefined` | The minimum selectionable date. All dates before will be disabled |
| maxDate       | `string \| Date`                      | true | `undefined` | The maximum selectionable date. All dates after will be disabled |
| disabled      | `Array\<string \| Date>`              | true | `[]`        | A date or array of date to disable |
| firstDayOfWeek | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6`    | true | `0`         | Tells on which day the week starts. 0 being Sunday. |
| locale        | date-fns's `Locale`                   | true | `undefined` | The locale object to use for translating weekdays.<br>Import like `import { fr } from 'date-fns/locale';`. See [date-fns](https://date-fns.org/v2.28.0/docs/Locale) |
| preSelection  | `Array\<Date> \| Date`                | true | `[]` | A date or array of date to be preselected on calendar generation |
| factory       | `(date: ICalendarDate) => \<extends ICalendarDate\>` | true | `undefined` | A custom factory function to extend the default `ICalendarDate` objects. See [exemple](TODO example link) |

### Outputs

The composable returns the following sub-composables

| name | description |
|------|-------------|
| [useMonthlyCalendar](#user-content-use-monthly-calendar)  | Generate a calendar where days are grouped by months |
| [useWeeklyCalendar](#user-content-use-weekly-calendar)   | Generate a calendar where days are grouped by weeks |
| [useWeekdays](#user-content-use-weekdays)         | Gets the list of weekdays, translated and formatted |

## use-monthly-calendar

```typescript
const { useMontlyCalendar } = useCalendar()

const { currentMonth } = useMonthlyCalendar({ infinite: false, fullWeeks: false, fixedWeeks: false })
```

### Parameters
| name | type | optional | default | description |
|------|------|----------|---------|-------------|
| infinite   | `boolean` | true | `true`  | Indicates if navigating throught the calendar should generate new months on the fly                                     |
| fullWeeks  | `boolean` | true | `true`  | Indicates if each month should display the "other month" days to complete each week                                     |
| fixedWeeks | `boolean` | true | `false` | Indicates if each month should display the "other month" days to display a fixed number of weeks in the month (6 weeks) |

### Outputs

| name | type | description |
|------|------|-------------|
| days | `ComputedRef<Array<C>>` | An array of all days currently generated in the calendar. Excludes copied days so the array is sorted by day without duplicates |
| selectedDates | `Array<Date>` | Reactive array of current dates selection. |
| listeners | `Listeners<C>` | Object of methods for changing dates states (see [##listeners](#user-content-listeners)) |
| currentMonthAndYear | `ShallowReactive<{ month: number; year: number }>;` | Reactive object containing the current month and year displayed. Can be mutated. |
| currentMonth | `ComputedRef<Month<C>>;` | The current month displayed. Contains data about this month and the array of days it includes. |
| months | `ShallowReactive<Month<C>[]>;` | An array of all the months generated in the calendar. |
| nextMonth | `() => void;` | Method to navigate to the next month |
| prevMonth | `() => void;` | Method to navigate to the previous month |
| nextMonthEnabled | `ComputedRef<boolean>;` | A computed boolean that indicates if it is allowed to go to the next month  |
| prevMonthEnabled | `ComputedRef<boolean>;` | A computed boolean that indicates if it is allowed to go to the previous month |

## use-weekly-calendar

```typescript
const { useWeeklyCalendar } = useCalendar()

const { currentWeek } = useWeeklyCalendar({ infinite: false })
```

### Parameters

| name | type | optional | default | description |
|------|------|----------|---------|-------------|
| infinite  | `boolean` | true | `true` | Indicates if navigating throught the calendar should generate new weeks on the fly |

### Outputs

| name | type | description |
|------|------|-------------|
| days | `ComputedRef<Array<C>>` | An array of all days currently generated in the calendar. Excludes copied days so the array is sorted by day without duplicates |
| selectedDates | `Array<Date>` | Reactive array of current dates selection. |
| listeners | `Listeners<C>` | Object of methods for changing dates states (see [##listeners](#user-content-listeners)). |
| weeks | `Array<Week<C>>;` | A reactive array of all generated weeks in the calendar. |
| currentWeekIndex | `Ref<number>;` | The current week index displayed. |
| currentWeek | `ComputedRef<Week<C>>;` | The current week wrapper. Contains data about this week and the array of days it includes. |
| nextWeek | `() => void;` | Method to navigate to the next week |
| prevWeek | `() => void;` | Method to navigate to the previous week |
| nextWeekEnabled | `ComputedRef<boolean>;` | A computed boolean that indicates if it is allowed to go to the next week  |
| prevWeekEnabled | `ComputedRef<boolean>;` | A computed boolean that indicates if it is allowed to go to the previous week |

## use-weekdays

```typescript
const { useWeekdays } = useCalendar()

// [Mon, Tue, Wed, ..., Sun]
const weekDays = useWeekdays('iii')
```

### Parameters

| name | type | optional | default | description |
|------|------|----------|---------|-------------|
| weekdayFormat | `'i' \| 'io' \| 'ii' \| 'iii' \| 'iiii' \| 'iiiii' \| 'iiiiii'` | true | `'iiiii'` | The format to use while translating the weekdays. See [date-fns ISO day of week](https://date-fns.org/v2.28.0/docs/format) |

### Outputs

| name | reactive | description |
|------|----------|-------------|
|      | `false`  | The array of week days, translated and formatted. |

## Listeners

The `listeners` object returned by the sub composables contains the following methods:

### `selectSingle`

Call this method to select a single date. It will unselect all currently selected dates.

<details style="margin-bottom: 16px">
<summary>Example:</summary>

```typescript
const { useMontlyCalendar } = useCalendar()
const { currentMonth, listeners: { selectSingle } } = useMonthlyCalendar()

/*
         March 2022     
 Su  Mo  Tu  We  Th  Fr  Sa
          1   2   3   4   5
  6   7   8   9  10  11  12
 13  14  15  16  17  18  19
 20  21  22  23  24  25  26
 27  28  29  30  31 
*/

selectSingle(currentMonth.days[10])

/*
         March 2022     
 Su  Mo  Tu  We  Th  Fr  Sa
          1   2   3   4   5
  6   7   8   9  10 [11] 12
 13  14  15  16  17  18  19
 20  21  22  23  24  25  26
 27  28  29  30  31 
*/

selectSingle(currentMonth.days[20])

/*
Selecting another date resets all previously selected dates
         March 2022     
 Su  Mo  Tu  We  Th  Fr  Sa
          1   2   3   4   5
  6   7   8   9  10  11  12
 13  14  15  16  17  18  19
 20 [21] 22  23  24  25  26
 27  28  29  30  31 
*/
```
</details>

### `selectRange`

Use this method to select a range of two dates.

Selecting a third date will remove the previous selected dates.

Selecting an already selected date will unselect it. It won't unselect any other date, only the one in parameter. 

<details style="margin-bottom: 16px">
<summary>Example:</summary>

```typescript
const { useMontlyCalendar } = useCalendar()
const { currentMonth, listeners: { selectRange } } = useMonthlyCalendar()

/*
         March 2022     
 Su  Mo  Tu  We  Th  Fr  Sa
          1   2   3   4   5
  6   7   8   9  10  11  12
 13  14  15  16  17  18  19
 20  21  22  23  24  25  26
 27  28  29  30  31 
*/

selectRange(currentMonth.days[10])
selectRange(currentMonth.days[20])

/*
The 11th and the 21st are marked as `selected`
         March 2022     
 Su  Mo  Tu  We  Th  Fr  Sa
          1   2   3   4   5
  6   7   8   9  10 [11] 12
 13  14  15  16  17  18  19
 20 [21] 22  23  24  25  26
 27  28  29  30  31 
*/

selectRange(currentMonth.days[27])

/*
A third date is selected. All previously selected date are reset and we select the new date only (the 28th here)
         March 2022     
 Su  Mo  Tu  We  Th  Fr  Sa
          1   2   3   4   5
  6   7   8   9  10  11  12
 13  14  15  16  17  18  19
 20  21  22  23  24  25  26
 27 [28] 29  30  31 
*/

selectRange(currentMonth.days[27])

/*
Selecting an already selected date reset its state
         March 2022     
 Su  Mo  Tu  We  Th  Fr  Sa
          1   2   3   4   5
  6   7   8   9  10  11  12
 13  14  15  16  17  18  19
 20  21  22  23  24  25  26
 27  28  29  30  31 
*/
```
</details>

### `selectMultiple`

Select multiple dates without limitation.

Selecting an already selected date will unselect it.

<details style="margin-bottom: 16px">
<summary>Example:</summary>

```typescript
const { useMontlyCalendar } = useCalendar()
const { currentMonth, listeners: { selectMultiple } } = useMonthlyCalendar()

/*
         March 2022     
 Su  Mo  Tu  We  Th  Fr  Sa
          1   2   3   4   5
  6   7   8   9  10  11  12
 13  14  15  16  17  18  19
 20  21  22  23  24  25  26
 27  28  29  30  31 
*/

selectMultiple(currentMonth.days[10])
selectMultiple(currentMonth.days[20])

/*
The 11th and the 21st are marked as `selected`
         March 2022     
 Su  Mo  Tu  We  Th  Fr  Sa
          1   2   3   4   5
  6   7   8   9  10 [11] 12
 13  14  15  16  17  18  19
 20 [21] 22  23  24  25  26
 27  28  29  30  31 
*/

selectMultiple(currentMonth.days[27])

/*
A third date is selected. It just adds it to the selected date without wiping out the others
         March 2022     
 Su  Mo  Tu  We  Th  Fr  Sa
          1   2   3   4   5
  6   7   8   9  10 [11] 12
 13  14  15  16  17  18  19
 20 [21] 22  23  24  25  26
 27 [28] 29  30  31 
*/

selectMultiple(currentMonth.days[27])

/*
Selecting an already selected date reset its state
         March 2022     
 Su  Mo  Tu  We  Th  Fr  Sa
          1   2   3   4   5
  6   7   8   9  10 [11] 12
 13  14  15  16  17  18  19
 20 [21] 22  23  24  25  26
 27  28  29  30  31 
*/
```
</details>

### `hoverMultiple`

Set the hover status on all dates between the first selected date and the one passed in parameter.
It can be used to style the dates in between two selected dates while you hover them.

<details style="margin-bottom: 16px">
<summary>Example:</summary>

```typescript
const { useMontlyCalendar } = useCalendar()
const { currentMonth, listeners: { hoverMultiple } } = useMonthlyCalendar()

/*
         March 2022     
 Su  Mo  Tu  We  Th  Fr  Sa
          1   2   3   4   5
  6   7   8   9  10  11  12
 13  14  15  16  17  18  19
 20  21  22  23  24  25  26
 27  28  29  30  31 
*/

hoverMultiple(currentMonth.days[10])
hoverMultiple(currentMonth.days[20])

/*
All the days between the 11th and 21st are marked as `hovered`
         March 2022     
 Su  Mo  Tu  We  Th  Fr  Sa
          1   2   3   4   5
  6   7   8   9  10 [11  12
 13  14  15  16  17  18  19
 20  21] 22  23  24  25  26
 27  28  29  30  31 
*/
```
</details>

### `resetHover`

Reset the `hover` state to `false` for all dates.

<details style="margin-bottom: 16px">
<summary>Example:</summary>

```typescript
const { useMontlyCalendar } = useCalendar()
const { currentMonth, listeners: { hoverMultiple, resetHover } } = useMonthlyCalendar()

hoverMultiple(currentMonth.days[10])
hoverMultiple(currentMonth.days[20])

/*
All the days between the 11th and 21st are marked as `hovered`
         March 2022     
 Su  Mo  Tu  We  Th  Fr  Sa
          1   2   3   4   5
  6   7   8   9  10 [11  12
 13  14  15  16  17  18  19
 20  21] 22  23  24  25  26
 27  28  29  30  31 
*/

resetHover()

/*
All days marked as `hovered` are reset to normal state
         March 2022     
 Su  Mo  Tu  We  Th  Fr  Sa
          1   2   3   4   5
  6   7   8   9  10  11  12
 13  14  15  16  17  18  19
 20  21  22  23  24  25  26
 27  28  29  30  31 
*/
```
</details>

# How does it work?

Each date is represented by a custom object called `CalendarDate`.

## CalendarDate object

|    Property     |      Type       |   Description    |
|-----------------|-----------------|------------------|
| date            | `Date`          | The real javascript `Date` object |
| isToday         | `boolean`       | True if is the same day as today  |
| isWeekend       | `boolean`       | True if is saturday or sunday     |
| otherMonth      | `boolean`       | True if the date is included      |
| disabled        | `Ref<boolean>`  | Reactive boolean if the date is disabled |
| isSelected      | `Ref<boolean>`  | Reactive boolean if the date is selected |
| isBetween       | `Ref<boolean>`  | Reactive boolean if the date is between two selected dates |
| isHovered       | `Ref<boolean>`  | Reactive boolean if the date is currently hovered |
| monthYearIndex  | `number`        | The date's month index. See [What's the monthYear index?](#user-content-whats-the-monthyear-index) |
| dayId           | `${year}-${month}-${day}` | A string representing a uniq id for this day. In the form `${year}-${month}-${day}`. Mainly used internally. |
| _copied         | `boolean`       | True if the day is a copy from another day. See [## Linked dates](#user-content-linked-dates) |

## Extending the `CalendarDate` objects

You can provide an optional custom function in the `useCalendar` composable to add extra properties to your date objects.

```typescript
// Imagine you have this kind of array somewhere in your app / components
const pricesByDay = [
      { price: 55, date: '2022-05-12' },
]

// If you want the calendar to use this object, you can provide a function to make the mapping yourself.

const { useMontlyCalendar } = useCalendar({
      factory: (calendarDate) => {
            // Find the price object related to the generated date
            const correspondingPrice = pricesByDay.find(({ date }) => isSameDay(date, calendarDate.date));
            // Creates a custom date object, with an additionnal `price` property.
            const customDate: CustomDate = {
                  ...calendarDate,
                  price: correspondingPrice?.price || 0,
            };
            // Return the new object date created from the original one + the price
            return customDate;
      }
})
```

It's a function that takes as a parameter a `CalendarDate` object generated by the composable.
Anytime the composable generates a new date, it will trigger this function.

You must return an object containing the same properties as the original, eventually with extra ones.

> **Careful with this function!** If you don't return the complete original object, it may break the composables.
> Be sure that you don't touch the existing properties of the CalendarDate object!

## What's the monthYear index?

What we call the "monthYear" index is **not a real concept**.
We use this index to identify every month with a number having the following properties:
* All monthYearIndex is uniq for a given month in a year.
* Two consecutives months should have a consecutive number (also true between "december year 1" and "january year 2")

The formula to compute it is as simple as : `<month index> + <year> * 12`

Example:
```
2020/08/18 => (08 - 1) + 2020 * 12 => 24247
2020/12/25 => (12 - 1) + 2020 * 12 => 24251
2021/01/21 => (01 - 1) + 2021 * 12 => 24252
```

This is internally used to easily navigate thought months (and years) with an classical index as an iterator.

## Linked dates

The composable use a mechanism to link two identical dates so that when the state of one changes, the other is updated too.

For instance, when using `fullWeeks` prop on the `use-monthly-calendar` composable, you will have duplicates dates across your months.
Month 1 will show some dates from Month 2, because they are part of its last week.
On Month 2, these dates are the first dates of the month. But it also shows the last dates from Month 1.

```
      March 2022            April 2022       
 Su Mo Tu We Th Fr Sa  Su Mo Tu We Th  Fr Sa  
        1  2  3  4  5  [27 28 29 30 31] 1  2  
  6  7  8  9 10 11 12   3  4  5  6  7   8  9  
 13 14 15 16 17 18 19  10 11 12 13 14  15 16  
 20 21 22 23 24 25 26  17 18 19 20 21  22 23  
 27 28 29 30 31 [1 2]  24 25 26 27 28  29 30 
```

In the calendars above, the dates between squared brackets are copies from the dates in the original month.
There are **linked.**

So when the date 30 in "March 2022" is selected, so is the [30th] in "April 2022".

> Technical note: A date linked to another is marked by the internal attribute `_copied`

# Contributing

## Run the project

You can fork and clone the project on [github](https://github.com/Kapcash/vue-use-calendar).

Then install the dependencies:

```
yarn install
```

Start the example on localhost:3000:

```
yarn example
```

## Submit changes

If you're willing to participate in the development of this library, you are warmly welcome!

Here are the steps to follow:
1. Fork the repository on github
2. Clone your fork (or update your remote target branch to your fork)
3. Open a branch, name it according the changes you are planning on doing.
4. Submit a PullRequest.

I'll review it as soon as possible! 👐

# Todos

* Try a LinkedList implementation to simplify the code (without class instance for SSR)
* avoid updating currentMonthAndYear if `infinite === false`
* use date-fns locale's weekStartOn by default
* weekly calendar selection
* move `otherMonth` and `monthYearIndex` attribute of the default CalendarDate object. Should be a custom one for month-calendar only.
