import { describe, expect, it, vi } from 'vitest';
import { getDaysInMonth, addMonths, endOfMonth, isSameDay } from 'date-fns';
import { isReactive, isRef, isShallow, nextTick } from 'vue';
import { dateToMonthYear } from '../lib/models/CalendarDate';
import { MontlyOptions } from '../lib/types';
import { useCalendar } from '../lib/use-calendar';
import { areConsecutiveDays } from './helpers';

/*
 * $ cal -H 2022-03-15
 *
 *       March 2022       
 *  Su Mo Tu We Th Fr Sa  
 *        1  2  3  4  5  
 *  6  7  8  9 10 11 12  
 *  13 14 15 16 17 18 19  
 *  20 21 22 23 24 25 26  
 *  27 28 29 30 31      
*/
const mockToday = new Date(2022, 2, 8);
const defaultOptions = { minDate: new Date(2022, 2, 15) };
const defaultMonthlyOptions: MontlyOptions = { fullWeeks: false, infinite: true };

// Avoid inconsistent tests depending on the day
vi.setSystemTime(mockToday);

describe('use-monthly-calendar', () => {
  it('should get the default initial calendar state', () => {
    const { useMonthlyCalendar } = useCalendar(defaultOptions);

    const {
      currentMonth,
      currentMonthAndYear,
      days,
      months,
      prevMonthEnabled,
      nextMonthEnabled,
      selectedDates,
      listeners,
    } = useMonthlyCalendar(defaultMonthlyOptions);

    expect(isRef(currentMonth)).toBeTruthy();
    expect(currentMonthAndYear).toEqual({
      year: defaultOptions.minDate.getFullYear(),
      month: defaultOptions.minDate.getMonth(),
    });
    expect(isRef(days)).toBeTruthy();
    expect(areConsecutiveDays(days.value)).toBeTruthy();

    expect(isReactive(selectedDates)).toBeTruthy();
    expect(selectedDates).toHaveLength(0);

    expect(isShallow(months)).toBeTruthy();
    expect(isReactive(currentMonthAndYear)).toBeTruthy();
    expect(isRef(prevMonthEnabled)).toBeTruthy();
    expect(isRef(nextMonthEnabled)).toBeTruthy();

    expect(listeners).toBeTypeOf('object');
    expect(Object.keys(listeners)).toEqual(expect.arrayContaining(['selectSingle', 'selectRange', 'selectMultiple', 'hoverMultiple', 'resetHover']));
    Object.values(listeners).forEach((listener) => {
      expect(listener).toBeTypeOf('function');
    });
  });

  it('should return the initial current month object', () => {
    const { useMonthlyCalendar } = useCalendar(defaultOptions);

    const { currentMonth, currentMonthAndYear } = useMonthlyCalendar(defaultMonthlyOptions);

    expect(isRef(currentMonth)).toBeTruthy();
    expect(currentMonth.value).toMatchObject({
      month: defaultOptions.minDate!.getMonth(),
      year: defaultOptions.minDate!.getFullYear(),
      index: dateToMonthYear(defaultOptions.minDate!),
      days: expect.any(Array),
    });
    expect(currentMonth.value.days).toHaveLength(getDaysInMonth(defaultOptions.minDate));
    expect(areConsecutiveDays(currentMonth.value.days)).toBeTruthy();

    expect(isReactive(currentMonthAndYear)).toBeTruthy();
    expect(currentMonthAndYear.year).toEqual(defaultOptions.minDate!.getFullYear());
    expect(currentMonthAndYear.month).toEqual(defaultOptions.minDate!.getMonth());
  });

  it('should return the initial current month object with fullWeeks on', () => {
    const { useMonthlyCalendar } = useCalendar(defaultOptions);

    const { currentMonth } = useMonthlyCalendar({ ...defaultMonthlyOptions, fullWeeks: true });

    // Is multiple of 7 means complete lines of 7 items
    expect(currentMonth.value.days.length % 7).toEqual(0);

    const otherMonthDays = currentMonth.value.days.filter(day => day.otherMonth);
    expect(otherMonthDays.length).toBeGreaterThan(0);
    otherMonthDays.forEach(day => {
      expect(day._copied).toBeFalsy();
    });
  });

  it('should contain a CalendarDate object in the month days array', () => {
    const { useMonthlyCalendar } = useCalendar(defaultOptions);

    const { currentMonth } = useMonthlyCalendar(defaultMonthlyOptions);
    const { days } = currentMonth.value;
    const { date, isToday, otherMonth, disabled, isSelected, isBetween, isHovered, monthYearIndex, dayId } = days[0];

    expect(isRef(isToday)).toBeFalsy();
    expect(isToday).toBeFalsy();
    expect(isRef(otherMonth)).toBeFalsy();
    expect(isToday).toBeFalsy();
    expect(isRef(monthYearIndex)).toBeFalsy();
    expect(monthYearIndex).toEqual(dateToMonthYear(date));
    expect(isRef(dayId)).toBeFalsy();
    expect(dayId).toEqual(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`);

    expect(isRef(disabled)).toBeTruthy();
    expect(disabled.value).toBeTruthy();
    expect(isRef(isSelected)).toBeTruthy();
    expect(isSelected.value).toBeFalsy();
    expect(isRef(isBetween)).toBeTruthy();
    expect(isBetween.value).toBeFalsy();
    expect(isRef(isHovered)).toBeTruthy();
    expect(isHovered.value).toBeFalsy();
  });

  describe('month days states', () => {
    const nbMonths = [1, 3, 15];
    
    nbMonths.forEach((nbMonth) => {
      const toDate = (nbMonth - 1) <= 0 ? undefined : addMonths(defaultOptions.minDate!, nbMonth - 1);

      const { useMonthlyCalendar } = useCalendar({ ...defaultOptions, maxDate: toDate });
      const { currentMonth, months } = useMonthlyCalendar(defaultMonthlyOptions);

      it(`should generate ${nbMonth} amount of month wrappers`, () => {
        expect(months).toHaveLength(nbMonth);
      });

      it('should disable all days before "from" date', () => {
        const { days } = currentMonth.value;
    
        const firstEnabledDay = days.find(day => !day.disabled.value);
        expect(firstEnabledDay?.date).toEqual(defaultOptions.minDate!);
      });
    
      it('should have only one day marked as today', () => {
        const { days } = currentMonth.value;
    
        const todayDays = days.filter(day => day.isToday);
        expect(todayDays).toHaveLength(1);
      });
    
      it('should mark CalendarDate of today as such', () => {
        const { days } = currentMonth.value;
    
        const todayDay = days.find(day => day.isToday);
        expect(todayDay?.isToday).toBeTruthy();
        expect(todayDay?.date).toEqual(mockToday);
      });
    });
  });

  describe('months navigation', () => {
    it('should go to next month from nextMonth function', async () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
  
      const { currentMonth, currentMonthAndYear, nextMonth } = useMonthlyCalendar(defaultMonthlyOptions);
  
      expect(currentMonth.value.year).toEqual(currentMonthAndYear.year);
      expect(currentMonth.value.month).toEqual(currentMonthAndYear.month);
      expect(currentMonthAndYear).toEqual({
        month: defaultOptions.minDate!.getMonth(),
        year: defaultOptions.minDate!.getFullYear(),
      });
  
      nextMonth();
  
      // why do I need it? My `watch()` triggers too late :(
      await nextTick();
      
      expect(currentMonth.value.year).toEqual(currentMonthAndYear.year);
      expect(currentMonth.value.month).toEqual(currentMonthAndYear.month);
      expect(currentMonthAndYear).toEqual({
        month: defaultOptions.minDate!.getMonth() + 1,
        year: defaultOptions.minDate!.getFullYear(),
      });
    });
  
    it('should go to prev month from prevMonth function', async () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
  
      const { currentMonth, currentMonthAndYear, prevMonth } = useMonthlyCalendar(defaultMonthlyOptions);
  
      expect(currentMonth.value.year).toEqual(currentMonthAndYear.year);
      expect(currentMonth.value.month).toEqual(currentMonthAndYear.month);
      expect(currentMonthAndYear).toEqual({
        month: defaultOptions.minDate!.getMonth(),
        year: defaultOptions.minDate!.getFullYear(),
      });
  
      prevMonth();
  
      // why do I need it? My `watch()` triggers too late :(
      await nextTick();
      
      expect(currentMonth.value.year).toEqual(currentMonthAndYear.year);
      expect(currentMonth.value.month).toEqual(currentMonthAndYear.month);
      expect(currentMonthAndYear).toEqual({
        month: defaultOptions.minDate!.getMonth() - 1,
        year: defaultOptions.minDate!.getFullYear(),
      });
    });

    it('should update current month when mutating current *year* directly', async () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
  
      const { currentMonth, currentMonthAndYear } = useMonthlyCalendar(defaultMonthlyOptions);
  
      currentMonthAndYear.year = currentMonthAndYear.year + 2;
  
      // why do I need it? My `watch()` triggers too late :(
      await nextTick();
      
      expect(currentMonth.value.year).toEqual(currentMonthAndYear.year);
      expect(currentMonth.value.month).toEqual(currentMonthAndYear.month);
      expect(currentMonth.value.days[0].date.getMonth()).toEqual(currentMonthAndYear.month);
      expect(currentMonth.value.days[0].date.getFullYear()).toEqual(currentMonthAndYear.year);
    });

    it('should update current month when mutation current *month* directly', async () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
  
      const { currentMonth, currentMonthAndYear } = useMonthlyCalendar(defaultMonthlyOptions);
  
      currentMonthAndYear.month = currentMonthAndYear.month + 6;
  
      // why do I need it? My `watch()` triggers too late :(
      await nextTick();
      
      expect(currentMonth.value.year).toEqual(currentMonthAndYear.year);
      expect(currentMonth.value.month).toEqual(currentMonthAndYear.month);
      expect(currentMonth.value.days[0].date.getMonth()).toEqual(currentMonthAndYear.month);
      expect(currentMonth.value.days[0].date.getFullYear()).toEqual(currentMonthAndYear.year);
    });

    it('should update current month & year when mutation current *month & year* directly', async () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
  
      const { currentMonth, currentMonthAndYear } = useMonthlyCalendar(defaultMonthlyOptions);
  
      currentMonthAndYear.month = currentMonthAndYear.month + 6;
      currentMonthAndYear.year = currentMonthAndYear.year - 8;
  
      // why do I need it? My `watch()` triggers too late :(
      await nextTick();
      
      expect(currentMonth.value.year).toEqual(currentMonthAndYear.year);
      expect(currentMonth.value.month).toEqual(currentMonthAndYear.month);
      expect(currentMonth.value.days[0].date.getMonth()).toEqual(currentMonthAndYear.month);
      expect(currentMonth.value.days[0].date.getFullYear()).toEqual(currentMonthAndYear.year);
    });
  });

  describe('auto month generation', () => {
    it('should generate previous month if not existing', async () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { currentMonth, prevMonth, months } = useMonthlyCalendar(defaultMonthlyOptions);

      expect(months).toHaveLength(1);
      expect(months[0]).toMatchObject({ month: defaultOptions.minDate!.getMonth(), year: defaultOptions.minDate!.getFullYear() });
      
      prevMonth();
      await nextTick();
      
      expect(months).toHaveLength(2);
      expect(currentMonth.value).toMatchObject({ month: defaultOptions.minDate!.getMonth() - 1, year: defaultOptions.minDate!.getFullYear() });
      expect(months[0]).toBe(currentMonth.value);
    });
    
    it('should generate next month if not existing', async () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { currentMonth, nextMonth, months } = useMonthlyCalendar(defaultMonthlyOptions);

      expect(months).toHaveLength(1);
      expect(months[0]).toMatchObject({ month: defaultOptions.minDate!.getMonth(), year: defaultOptions.minDate!.getFullYear() });
      
      nextMonth();
      await nextTick();
      
      expect(months).toHaveLength(2);
      expect(currentMonth.value).toMatchObject({ month: defaultOptions.minDate!.getMonth() + 1, year: defaultOptions.minDate!.getFullYear() });
      expect(months[months.length - 1]).toBe(currentMonth.value);
    });

    it('should clean all months if jumping to a non-consecutive month', async () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { currentMonth, currentMonthAndYear, nextMonth, months } = useMonthlyCalendar(defaultMonthlyOptions);

      expect(months).toHaveLength(1);
      
      const nextMonthsToGenerate = 3;
      for(let i=0; i < nextMonthsToGenerate; i++) {
        nextMonth();
      }
      await nextTick();
      
      expect(months).toHaveLength(1 + nextMonthsToGenerate);

      const targetYear = defaultOptions.minDate!.getFullYear() - 10;
      const targetMonth = currentMonthAndYear.month;
      currentMonthAndYear.year = targetYear;
      await nextTick();
      
      expect(months).toHaveLength(1);
      expect(currentMonth.value.month).toEqual(targetMonth);
      expect(currentMonth.value.year).toEqual(targetYear);
    });

    describe('fullWeek generation', () => {
      const fullWeeksOptions = { ...defaultMonthlyOptions, fullWeeks: true };

      it('should link last week days to the first week of next month generated', () => {
        const { useMonthlyCalendar } = useCalendar(defaultOptions);
        const { currentMonth, currentMonthAndYear, nextMonth, months } = useMonthlyCalendar(fullWeeksOptions);
  
        expect(months).toHaveLength(1);

        const endOfMonthDate = endOfMonth(new Date(currentMonthAndYear.year, currentMonthAndYear.month));
        const lastDayOfCurrentMonthIndex = currentMonth.value.days.findIndex((calendarDay) => isSameDay(calendarDay.date, endOfMonthDate));

        const otherMonthDays = currentMonth.value.days.slice(lastDayOfCurrentMonthIndex + 1);
        otherMonthDays.forEach((otherMonthDay) => {
          expect(otherMonthDay.otherMonth).toBeTruthy();
          expect(otherMonthDay._copied).toBeFalsy();
        });
        
        nextMonth();
        expect(months).toHaveLength(2);

        const firstWeekCurrentMonth = months[1].days.slice(0, 7);
        const lastWeekNextMonth = months[0].days.slice(-7);

        firstWeekCurrentMonth.forEach((day, i) => {
          expect(day.otherMonth).toEqual(day.date.getMonth() !== currentMonth.value.month);
          expect(day._copied).toEqual(day.otherMonth);

          const originalEquivalentDay = lastWeekNextMonth[i];
          expect(isSameDay(originalEquivalentDay.date, day.date)).toBeTruthy();
          expect(originalEquivalentDay?._copied).toEqual(originalEquivalentDay.otherMonth);
          expect(day.isSelected).toBe(originalEquivalentDay?.isSelected);
          expect(day.isBetween).toBe(originalEquivalentDay?.isBetween);
          expect(day.isHovered).toBe(originalEquivalentDay?.isHovered);
          expect(day.disabled).toBe(originalEquivalentDay?.disabled);
        });
      });
  
      it('should link first week days to the last week of prev month generated', () => {
        const { useMonthlyCalendar } = useCalendar(defaultOptions);
        const { currentMonth, prevMonth, months } = useMonthlyCalendar(fullWeeksOptions);
  
        expect(months).toHaveLength(1);

        const firstDayOfCurrentMonth = currentMonth.value.days.findIndex(calendarDate => !calendarDate.otherMonth);
        const otherMonthDays = currentMonth.value.days.slice(0, firstDayOfCurrentMonth);
        otherMonthDays.forEach((otherMonthDay) => {
          expect(otherMonthDay.otherMonth).toBeTruthy();
          expect(otherMonthDay._copied).toBeFalsy();
        });

        prevMonth();
        expect(months).toHaveLength(2);

        const lastWeekCurrentMonth = months[0].days.slice(-7);
        const firstWeekNextMonth = months[1].days.slice(0, 7);

        lastWeekCurrentMonth.forEach((day, i) => {
          expect(day.otherMonth).toEqual(day.date.getMonth() !== currentMonth.value.month);
          expect(day._copied).toEqual(day.otherMonth);

          const originalEquivalentDay = firstWeekNextMonth[i];
          expect(isSameDay(originalEquivalentDay.date, day.date)).toBeTruthy();
          expect(originalEquivalentDay?._copied).toEqual(originalEquivalentDay.otherMonth);
          expect(day.isSelected).toBe(originalEquivalentDay?.isSelected);
          expect(day.isBetween).toBe(originalEquivalentDay?.isBetween);
          expect(day.isHovered).toBe(originalEquivalentDay?.isHovered);
          expect(day.disabled).toBe(originalEquivalentDay?.disabled);
        });
      });
    });
  });
  
  describe('disabled auto month generation', () => {
    const noAutoGenerationOptions = { ...defaultMonthlyOptions, infinite: false };

    describe('navigation guards', () => {
      it('should mark previous navigation as disabled if on first month', () => {
        const { useMonthlyCalendar } = useCalendar(defaultOptions);
        const { prevMonthEnabled, nextMonthEnabled } = useMonthlyCalendar(noAutoGenerationOptions);
        
        expect(prevMonthEnabled.value).toBeFalsy();
        expect(nextMonthEnabled.value).toBeFalsy();
      });
      
      it('should allow next month if the next month exists', () => {
        const { useMonthlyCalendar } = useCalendar({ ...defaultOptions, maxDate: addMonths(defaultOptions.minDate!, 3)});
        const { prevMonthEnabled, nextMonthEnabled } = useMonthlyCalendar(noAutoGenerationOptions);
        
        expect(prevMonthEnabled.value).toBeFalsy();
        expect(nextMonthEnabled.value).toBeTruthy();
      });
  
      it('should allow prev month if the prev month exists', () => {
        const { useMonthlyCalendar } = useCalendar({ ...defaultOptions, maxDate: addMonths(defaultOptions.minDate!, 2)});
        const { prevMonthEnabled, nextMonthEnabled, nextMonth } = useMonthlyCalendar(noAutoGenerationOptions);
        
        expect(prevMonthEnabled.value).toBeFalsy();
        expect(nextMonthEnabled.value).toBeTruthy();
        
        // 2nd
        nextMonth();
        
        expect(prevMonthEnabled.value).toBeTruthy();
        expect(nextMonthEnabled.value).toBeTruthy();
  
        // 3rd and last
        nextMonth();
        
        expect(prevMonthEnabled.value).toBeTruthy();
        expect(nextMonthEnabled.value).toBeFalsy();
      });

      it('should not do anything to call prevMonth if not allowed', () => {
        const { useMonthlyCalendar } = useCalendar(defaultOptions);
        const { prevMonthEnabled, prevMonth, currentMonthAndYear } = useMonthlyCalendar(noAutoGenerationOptions);
  
        expect(prevMonthEnabled.value).toBeFalsy();
  
        prevMonth();
  
        expect(currentMonthAndYear.month).toEqual(defaultOptions.minDate!.getMonth());
        expect(currentMonthAndYear.year).toEqual(defaultOptions.minDate!.getFullYear());
      });
  
      it('should not do anything to call nextMonth if not allowed', () => {
        const { useMonthlyCalendar } = useCalendar(defaultOptions);
        const { nextMonthEnabled, nextMonth, currentMonthAndYear } = useMonthlyCalendar(noAutoGenerationOptions);
  
        expect(nextMonthEnabled.value).toBeFalsy();
  
        nextMonth();
  
        expect(currentMonthAndYear.month).toEqual(defaultOptions.minDate!.getMonth());
        expect(currentMonthAndYear.year).toEqual(defaultOptions.minDate!.getFullYear());
      });
    });
  });
});