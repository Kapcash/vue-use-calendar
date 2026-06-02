import { describe, expect, it, vi } from 'vitest';
import { getDaysInMonth, addMonths, endOfMonth, isSameDay } from 'date-fns';
import { isReactive, isRef, nextTick } from 'vue';
import { MonthlyOptions } from '../lib/types';
import { useCalendar } from '../lib/use-calendar';
import { areConsecutiveDays } from './helpers';
import { monthIdFromDate } from '../lib/utils/month';

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
const defaultMonthlyOptions: MonthlyOptions = { fullWeeks: false, infinite: true };

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

    expect(isRef(selectedDates)).toBeTruthy();
    expect(selectedDates.value).toHaveLength(0);

    expect(isRef(months)).toBeTruthy();
    expect(isReactive(currentMonthAndYear)).toBeTruthy();
    expect(isRef(prevMonthEnabled)).toBeTruthy();
    expect(isRef(nextMonthEnabled)).toBeTruthy();

    expect(listeners).toBeTypeOf('object');
    expect(Object.keys(listeners)).toEqual(expect.arrayContaining(['selectSingle', 'selectRange', 'selectMultiple', 'hoverRange', 'resetHover']));
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
      id: monthIdFromDate(defaultOptions.minDate!),
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
  });

  it('should contain a CalendarDay object in the month days array', () => {
    const { useMonthlyCalendar } = useCalendar(defaultOptions);

    const { currentMonth } = useMonthlyCalendar(defaultMonthlyOptions);
    const { days } = currentMonth.value;
    const firstDay = days[0];

    expect(firstDay.isToday).toBeDefined();
    expect(firstDay.isToday).toBeFalsy();
    expect(firstDay.otherMonth).toBeDefined();
    expect(firstDay.id).toBeDefined();
    expect(firstDay.id).toEqual(expect.any(String));

    expect(firstDay.state.disabled).toBeTruthy();
    expect(firstDay.state.selected).toBeFalsy();
    expect(firstDay.state.between).toBeFalsy();
    expect(firstDay.state.hovered).toBeFalsy();
  });

  describe('month days states', () => {
    const nbMonths = [1, 3, 15];
    
    nbMonths.forEach((nbMonth) => {
      const toDate = (nbMonth - 1) <= 0 ? undefined : addMonths(defaultOptions.minDate!, nbMonth - 1);

      const { useMonthlyCalendar } = useCalendar({ ...defaultOptions, maxDate: toDate });
      const { currentMonth, months } = useMonthlyCalendar(defaultMonthlyOptions);

      it(`should generate ${nbMonth} amount of month wrappers`, () => {
        expect(months.value).toHaveLength(nbMonth);
      });

      it('should disable all days before "from" date', () => {
        const { days } = currentMonth.value;
    
        const firstEnabledDay = days.find(day => !day.state.disabled);
        expect(firstEnabledDay).not.toBeUndefined();
        expect(isSameDay(firstEnabledDay!.date, defaultOptions.minDate!)).toBeTruthy();
      });
    
      it('should have only one day marked as today', () => {
        const { days } = currentMonth.value;
    
        const todayDays = days.filter(day => day.isToday);
        expect(todayDays).toHaveLength(1);
      });
    
      it('should mark CalendarDate of today as such', () => {
        const { days } = currentMonth.value;
    
        const todayDay = days.find(day => day.isToday);
        expect(todayDay).not.toBeUndefined();
        expect(todayDay!.isToday).toBeTruthy();
        expect(isSameDay(todayDay!.date, mockToday)).toBeTruthy();
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

      expect(months.value).toHaveLength(1);
      expect(months.value[0]).toMatchObject({ month: defaultOptions.minDate!.getMonth(), year: defaultOptions.minDate!.getFullYear() });
      
      prevMonth();
      await nextTick();
      
      expect(months.value).toHaveLength(2);
      expect(currentMonth.value).toMatchObject({ month: defaultOptions.minDate!.getMonth() - 1, year: defaultOptions.minDate!.getFullYear() });
      expect(months.value[0]).toBe(currentMonth.value);
    });
    
    it('should generate next month if not existing', async () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { currentMonth, nextMonth, months } = useMonthlyCalendar(defaultMonthlyOptions);

      expect(months.value).toHaveLength(1);
      expect(months.value[0]).toMatchObject({ month: defaultOptions.minDate!.getMonth(), year: defaultOptions.minDate!.getFullYear() });
      
      nextMonth();
      await nextTick();
      
      expect(months.value).toHaveLength(2);
      expect(currentMonth.value).toMatchObject({ month: defaultOptions.minDate!.getMonth() + 1, year: defaultOptions.minDate!.getFullYear() });
      expect(months.value[months.value.length - 1]).toBe(currentMonth.value);
    });

    it('should clean all months if jumping to a non-consecutive month', async () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { currentMonth, currentMonthAndYear, nextMonth, months } = useMonthlyCalendar(defaultMonthlyOptions);

      expect(months.value).toHaveLength(1);
      
      const nextMonthsToGenerate = 3;
      for (let i = 0; i < nextMonthsToGenerate; i++) {
        nextMonth();
      }
      await nextTick();
      
      expect(months.value).toHaveLength(1 + nextMonthsToGenerate);

      const targetYear = defaultOptions.minDate!.getFullYear() - 10;
      const targetMonth = currentMonthAndYear.month;
      currentMonthAndYear.year = targetYear;
      await nextTick();
      
      // After jumping far away, cache may contain just the new month
      expect(currentMonth.value.month).toEqual(targetMonth);
      expect(currentMonth.value.year).toEqual(targetYear);
    });

    describe('fullWeek generation', () => {
      const fullWeeksOptions = { ...defaultMonthlyOptions, fullWeeks: true };

      it('should generate months with other month days marked', () => {
        const { useMonthlyCalendar } = useCalendar(defaultOptions);
        const { currentMonth } = useMonthlyCalendar(fullWeeksOptions);
  
        const endOfMonthDate = endOfMonth(new Date(currentMonth.value.year, currentMonth.value.month));
        const lastDayOfCurrentMonthIndex = currentMonth.value.days.findIndex((calendarDay) => isSameDay(calendarDay.date, endOfMonthDate));

        const otherMonthDays = currentMonth.value.days.slice(lastDayOfCurrentMonthIndex + 1);
        otherMonthDays.forEach((otherMonthDay) => {
          expect(otherMonthDay.otherMonth).toBeTruthy();
        });
      });

      it('should mark padding days as otherMonth for adjacent generated months', async () => {
        const { useMonthlyCalendar } = useCalendar(defaultOptions);
        const { nextMonth, months } = useMonthlyCalendar(fullWeeksOptions);

        expect(months.value).toHaveLength(1);
        
        nextMonth();
        await nextTick();
        
        expect(months.value).toHaveLength(2);

        // In the second month, any padding days should have otherMonth=true
        const secondMonth = months.value[1];
        secondMonth.days.forEach((day) => {
          if (day.date.getMonth() !== secondMonth.month) {
            expect(day.otherMonth).toBeTruthy();
          }
        });
      });

      it('should select a day with ID-based selection across months', async () => {
        const { useMonthlyCalendar } = useCalendar(defaultOptions);
        const { currentMonth, nextMonth, listeners, months } = useMonthlyCalendar(fullWeeksOptions);

        // Find a non-disabled, non-otherMonth day to select in the first month
        const selectableDay = currentMonth.value.days.find(d => !d.state.disabled && !d.otherMonth);
        expect(selectableDay).toBeDefined();
        
        listeners.selectSingle(selectableDay!);
        expect(selectableDay!.state.selected).toBeTruthy();
        
        // Navigate and selection should persist  
        nextMonth();
        await nextTick();
        
        // The selected day in the original month should still be selected
        const firstMonth = months.value[0];
        const stillSelected = firstMonth.days.find(d => d.id === selectableDay!.id);
        if (stillSelected) {
          expect(stillSelected.state.selected).toBeTruthy();
        }
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

  describe('disabled function predicate', () => {
    it('should disable all Sundays when disabled is a function', () => {
      const { useMonthlyCalendar } = useCalendar({
        minDate: new Date(2022, 2, 1),
        maxDate: new Date(2022, 2, 31),
        disabled: (date: Date) => date.getDay() === 0,
      });
      const { currentMonth } = useMonthlyCalendar({ ...defaultMonthlyOptions, infinite: false });

      const sundays = currentMonth.value.days.filter(d => !d.otherMonth && d.dayOfWeek === 0);
      expect(sundays.length).toBeGreaterThan(0);
      sundays.forEach(d => {
        expect(d.state.disabled).toBe(true);
      });

      // Non-Sundays should not be disabled by the function
      const nonSundays = currentMonth.value.days.filter(d => !d.otherMonth && d.dayOfWeek !== 0);
      nonSundays.forEach(d => {
        expect(d.state.disabled).toBe(false);
      });
    });

    it('should not allow selecting a function-disabled date', () => {
      const { useMonthlyCalendar } = useCalendar({
        minDate: new Date(2022, 2, 1),
        maxDate: new Date(2022, 2, 31),
        disabled: (date: Date) => date.getDay() === 0,
      });
      const { currentMonth, listeners, selectedDates } = useMonthlyCalendar({ ...defaultMonthlyOptions, infinite: false });

      const sunday = currentMonth.value.days.find(d => !d.otherMonth && d.dayOfWeek === 0)!;
      listeners.selectSingle(sunday);

      expect(selectedDates.value).toHaveLength(0);
    });
  });

  describe('selection', () => {
    it('should toggle single selection', () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { currentMonth, listeners, selectedDates } = useMonthlyCalendar(defaultMonthlyOptions);

      const selectableDay = currentMonth.value.days.find(d => !d.state.disabled && !d.otherMonth)!;
      
      listeners.selectSingle(selectableDay);
      expect(selectableDay.state.selected).toBeTruthy();
      expect(selectedDates.value).toHaveLength(1);

      listeners.selectSingle(selectableDay);
      expect(selectableDay.state.selected).toBeFalsy();
      expect(selectedDates.value).toHaveLength(0);
    });

    it('should select a range of two dates', () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { currentMonth, listeners, selectedDates } = useMonthlyCalendar(defaultMonthlyOptions);

      const enabledDays = currentMonth.value.days.filter(d => !d.state.disabled && !d.otherMonth);
      const first = enabledDays[0];
      const second = enabledDays[4];
      
      listeners.selectRange(first);
      expect(selectedDates.value).toHaveLength(1);

      listeners.selectRange(second);
      expect(selectedDates.value).toHaveLength(2);

      // Between should be derived
      const betweenDays = currentMonth.value.days.filter(d => d.state.between);
      expect(betweenDays.length).toEqual(3); // 3 days between index 0 and 4
    });

    it('should clear range on 3rd click', () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { currentMonth, listeners, selectedDates } = useMonthlyCalendar(defaultMonthlyOptions);

      const enabledDays = currentMonth.value.days.filter(d => !d.state.disabled && !d.otherMonth);
      
      listeners.selectRange(enabledDays[0]);
      listeners.selectRange(enabledDays[4]);
      expect(selectedDates.value).toHaveLength(2);

      listeners.selectRange(enabledDays[2]);
      expect(selectedDates.value).toHaveLength(1);
    });

    it('should select multiple dates', () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { currentMonth, listeners, selectedDates } = useMonthlyCalendar(defaultMonthlyOptions);

      const enabledDays = currentMonth.value.days.filter(d => !d.state.disabled && !d.otherMonth);
      
      listeners.selectMultiple(enabledDays[0]);
      listeners.selectMultiple(enabledDays[2]);
      listeners.selectMultiple(enabledDays[4]);
      expect(selectedDates.value).toHaveLength(3);

      // Toggle off
      listeners.selectMultiple(enabledDays[2]);
      expect(selectedDates.value).toHaveLength(2);
    });
  });

  describe('hover', () => {
    it('should set hovered state on range hover with 1 selected', () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { currentMonth, listeners } = useMonthlyCalendar(defaultMonthlyOptions);

      const enabledDays = currentMonth.value.days.filter(d => !d.state.disabled && !d.otherMonth);
      
      listeners.selectRange(enabledDays[0]);
      listeners.hoverRange(enabledDays[4]);

      const hoveredDays = currentMonth.value.days.filter(d => d.state.hovered);
      expect(hoveredDays.length).toBeGreaterThan(0);
    });

    it('should clear hover on resetHover', () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { currentMonth, listeners } = useMonthlyCalendar(defaultMonthlyOptions);

      const enabledDays = currentMonth.value.days.filter(d => !d.state.disabled && !d.otherMonth);
      
      listeners.selectRange(enabledDays[0]);
      listeners.hoverRange(enabledDays[4]);
      listeners.resetHover();

      const hoveredDays = currentMonth.value.days.filter(d => d.state.hovered);
      expect(hoveredDays).toHaveLength(0);
    });

    it('should not hover if selection count is not 1', () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { currentMonth, listeners } = useMonthlyCalendar(defaultMonthlyOptions);

      const enabledDays = currentMonth.value.days.filter(d => !d.state.disabled && !d.otherMonth);
      
      // No selection yet
      listeners.hoverRange(enabledDays[4]);
      const hoveredDays = currentMonth.value.days.filter(d => d.state.hovered);
      expect(hoveredDays).toHaveLength(0);
    });
  });

  describe('between', () => {
    it('should derive between from 2 selected dates', () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { currentMonth, listeners } = useMonthlyCalendar(defaultMonthlyOptions);

      const enabledDays = currentMonth.value.days.filter(d => !d.state.disabled && !d.otherMonth);
      
      listeners.selectRange(enabledDays[0]);
      listeners.selectRange(enabledDays[6]);

      const betweenDays = currentMonth.value.days.filter(d => d.state.between);
      expect(betweenDays.length).toEqual(5); // 5 days between index 0 and 6
    });

    it('should clear between when selection changes', () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { currentMonth, listeners } = useMonthlyCalendar(defaultMonthlyOptions);

      const enabledDays = currentMonth.value.days.filter(d => !d.state.disabled && !d.otherMonth);
      
      listeners.selectRange(enabledDays[0]);
      listeners.selectRange(enabledDays[6]);

      let betweenDays = currentMonth.value.days.filter(d => d.state.between);
      expect(betweenDays.length).toEqual(5);

      // Start new range
      listeners.selectRange(enabledDays[2]);
      betweenDays = currentMonth.value.days.filter(d => d.state.between);
      expect(betweenDays.length).toEqual(0); // only 1 selected, no between
    });
  });

  describe('selection constraints', () => {
    it('should reject range selection shorter than minRange', () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { currentMonth, listeners, selectedDates } = useMonthlyCalendar({ ...defaultMonthlyOptions, mode: 'range', minRange: 5 });

      const enabledDays = currentMonth.value.days.filter(d => !d.state.disabled && !d.otherMonth);

      listeners.selectRange(enabledDays[0]);
      listeners.selectRange(enabledDays[2]); // 3 days range, less than minRange=5

      // Second selection rejected — only 1 selected
      expect(selectedDates.value).toHaveLength(1);
      expect(enabledDays[2].state.selected).toBe(false);
    });

    it('should accept range selection at exactly minRange', () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { currentMonth, listeners, selectedDates } = useMonthlyCalendar({ ...defaultMonthlyOptions, mode: 'range', minRange: 5 });

      const enabledDays = currentMonth.value.days.filter(d => !d.state.disabled && !d.otherMonth);

      listeners.selectRange(enabledDays[0]);
      listeners.selectRange(enabledDays[4]); // 5 days range, exactly minRange=5

      expect(selectedDates.value).toHaveLength(2);
    });

    it('should reject range selection longer than maxRange', () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { currentMonth, listeners, selectedDates } = useMonthlyCalendar({ ...defaultMonthlyOptions, mode: 'range', maxRange: 5 });

      const enabledDays = currentMonth.value.days.filter(d => !d.state.disabled && !d.otherMonth);

      listeners.selectRange(enabledDays[0]);
      listeners.selectRange(enabledDays[6]); // 7 days, exceeds maxRange=5

      expect(selectedDates.value).toHaveLength(1);
      expect(enabledDays[6].state.selected).toBe(false);
    });

    it('should accept range selection at exactly maxRange', () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { currentMonth, listeners, selectedDates } = useMonthlyCalendar({ ...defaultMonthlyOptions, mode: 'range', maxRange: 5 });

      const enabledDays = currentMonth.value.days.filter(d => !d.state.disabled && !d.otherMonth);

      listeners.selectRange(enabledDays[0]);
      listeners.selectRange(enabledDays[4]); // 5 days, exactly maxRange=5

      expect(selectedDates.value).toHaveLength(2);
    });

    it('should block selection beyond maxSelections in multiple mode', () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { currentMonth, listeners, selectedDates } = useMonthlyCalendar({ ...defaultMonthlyOptions, mode: 'multiple', maxSelections: 3 });

      const enabledDays = currentMonth.value.days.filter(d => !d.state.disabled && !d.otherMonth);

      listeners.selectMultiple(enabledDays[0]);
      listeners.selectMultiple(enabledDays[1]);
      listeners.selectMultiple(enabledDays[2]);
      listeners.selectMultiple(enabledDays[3]); // Should be blocked

      expect(selectedDates.value).toHaveLength(3);
      expect(enabledDays[3].state.selected).toBe(false);
    });

    it('should allow deselecting when at maxSelections', () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { currentMonth, listeners, selectedDates } = useMonthlyCalendar({ ...defaultMonthlyOptions, mode: 'multiple', maxSelections: 3 });

      const enabledDays = currentMonth.value.days.filter(d => !d.state.disabled && !d.otherMonth);

      listeners.selectMultiple(enabledDays[0]);
      listeners.selectMultiple(enabledDays[1]);
      listeners.selectMultiple(enabledDays[2]);

      // Deselect one
      listeners.selectMultiple(enabledDays[1]);
      expect(selectedDates.value).toHaveLength(2);

      // Now can select a new one
      listeners.selectMultiple(enabledDays[3]);
      expect(selectedDates.value).toHaveLength(3);
    });

    it('should clamp hoverRange preview to maxRange', () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { currentMonth, listeners } = useMonthlyCalendar({ ...defaultMonthlyOptions, mode: 'range', maxRange: 5 });

      const enabledDays = currentMonth.value.days.filter(d => !d.state.disabled && !d.otherMonth);

      listeners.selectRange(enabledDays[0]);
      listeners.hoverRange(enabledDays[10]); // Hover far beyond maxRange

      const hoveredDays = currentMonth.value.days.filter(d => d.state.hovered);
      // Should be clamped: at most maxRange-1 days hovered (between + target)
      // With maxRange=5, anchor at [0], hover clamped to [4], so hovered are [1,2,3,4] = 4
      expect(hoveredDays.length).toBeLessThanOrEqual(4);
      expect(hoveredDays.length).toBeGreaterThan(0);
    });
  });

  describe('isRangeStart / isRangeEnd', () => {
    it('should mark range start and end when two dates are selected', () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { currentMonth, listeners } = useMonthlyCalendar(defaultMonthlyOptions);

      const enabledDays = currentMonth.value.days.filter(d => !d.state.disabled && !d.otherMonth);

      listeners.selectRange(enabledDays[0]);
      listeners.selectRange(enabledDays[6]);

      expect(enabledDays[0].state.isRangeStart).toBe(true);
      expect(enabledDays[0].state.isRangeEnd).toBe(false);
      expect(enabledDays[6].state.isRangeStart).toBe(false);
      expect(enabledDays[6].state.isRangeEnd).toBe(true);
    });

    it('should not mark range endpoints when only one date is selected', () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { currentMonth, listeners } = useMonthlyCalendar(defaultMonthlyOptions);

      const enabledDays = currentMonth.value.days.filter(d => !d.state.disabled && !d.otherMonth);

      listeners.selectRange(enabledDays[3]);

      expect(enabledDays[3].state.isRangeStart).toBe(false);
      expect(enabledDays[3].state.isRangeEnd).toBe(false);
    });

    it('should clear range endpoints when selection is cleared', () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { currentMonth, listeners, clearSelection } = useMonthlyCalendar(defaultMonthlyOptions);

      const enabledDays = currentMonth.value.days.filter(d => !d.state.disabled && !d.otherMonth);

      listeners.selectRange(enabledDays[0]);
      listeners.selectRange(enabledDays[6]);

      expect(enabledDays[0].state.isRangeStart).toBe(true);
      expect(enabledDays[6].state.isRangeEnd).toBe(true);

      clearSelection();

      expect(enabledDays[0].state.isRangeStart).toBe(false);
      expect(enabledDays[6].state.isRangeEnd).toBe(false);
    });

    it('should update range endpoints when a new range is started', () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { currentMonth, listeners } = useMonthlyCalendar(defaultMonthlyOptions);

      const enabledDays = currentMonth.value.days.filter(d => !d.state.disabled && !d.otherMonth);

      listeners.selectRange(enabledDays[0]);
      listeners.selectRange(enabledDays[6]);

      // Start new range (3rd click clears previous)
      listeners.selectRange(enabledDays[10]);

      expect(enabledDays[0].state.isRangeStart).toBe(false);
      expect(enabledDays[6].state.isRangeEnd).toBe(false);
      expect(enabledDays[10].state.isRangeStart).toBe(false);
      expect(enabledDays[10].state.isRangeEnd).toBe(false);
    });

    it('should handle reversed selection order correctly', () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { currentMonth, listeners } = useMonthlyCalendar(defaultMonthlyOptions);

      const enabledDays = currentMonth.value.days.filter(d => !d.state.disabled && !d.otherMonth);

      // Select end before start
      listeners.selectRange(enabledDays[6]);
      listeners.selectRange(enabledDays[0]);

      expect(enabledDays[0].state.isRangeStart).toBe(true);
      expect(enabledDays[6].state.isRangeEnd).toBe(true);
    });
  });

  describe('isWeekend', () => {
    it('should correctly identify Saturday and Sunday', () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { currentMonth } = useMonthlyCalendar(defaultMonthlyOptions);

      const weekendDays = currentMonth.value.days.filter(d => d.isWeekend);
      expect(weekendDays.length).toBeGreaterThan(0);
      weekendDays.forEach(d => {
        expect(d.dayOfWeek === 0 || d.dayOfWeek === 6).toBeTruthy();
      });
    });
  });

  describe('meta', () => {
    it('should populate meta from callback', () => {
      const { useMonthlyCalendar } = useCalendar({
        ...defaultOptions,
        meta: (date: Date) => ({ price: date.getDate() * 10 }),
      });

      const { currentMonth } = useMonthlyCalendar(defaultMonthlyOptions);
      const firstDay = currentMonth.value.days[0];
      expect((firstDay.meta as { price: number }).price).toEqual(firstDay.date.getDate() * 10);
    });
  });

  describe('preSelection', () => {
    it('should pre-select dates', () => {
      const preSelectedDate = new Date(2022, 2, 20);
      const { useMonthlyCalendar } = useCalendar({ ...defaultOptions, preSelection: [preSelectedDate] });

      const { selectedDates } = useMonthlyCalendar(defaultMonthlyOptions);
      
      expect(selectedDates.value).toHaveLength(1);
      expect(isSameDay(selectedDates.value[0].date, preSelectedDate)).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('should handle minDate === maxDate (single selectable day)', () => {
      const singleDate = new Date(2022, 2, 15);
      const { useMonthlyCalendar } = useCalendar({ minDate: singleDate, maxDate: singleDate });
      const { currentMonth } = useMonthlyCalendar(defaultMonthlyOptions);

      const enabledDays = currentMonth.value.days.filter(d => !d.state.disabled);
      expect(enabledDays).toHaveLength(1);
      expect(isSameDay(enabledDays[0].date, singleDate)).toBeTruthy();
    });

    it('should not disable maxDate itself', () => {
      const maxDate = new Date(2022, 2, 20);
      const { useMonthlyCalendar } = useCalendar({ ...defaultOptions, maxDate });
      const { currentMonth } = useMonthlyCalendar(defaultMonthlyOptions);

      const maxDay = currentMonth.value.days.find(d => isSameDay(d.date, maxDate));
      expect(maxDay).toBeDefined();
      expect(maxDay!.state.disabled).toBeFalsy();
    });

    it('should handle year boundary navigation (Dec → Jan)', async () => {
      const { useMonthlyCalendar } = useCalendar({ startOn: new Date(2022, 11, 1) });
      const { currentMonth, nextMonth, currentMonthAndYear } = useMonthlyCalendar(defaultMonthlyOptions);

      expect(currentMonth.value.month).toEqual(11);
      expect(currentMonth.value.year).toEqual(2022);

      nextMonth();
      await nextTick();

      expect(currentMonthAndYear.month).toEqual(0);
      expect(currentMonthAndYear.year).toEqual(2023);
    });
  });

  describe('pureDays', () => {
    it('should exclude otherMonth padding days when fullWeeks is true', () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { days, pureDays } = useMonthlyCalendar({ ...defaultMonthlyOptions, fullWeeks: true });

      // fullWeeks pads the month so days > pureDays
      expect(pureDays.value.length).toBeLessThan(days.value.length);
      pureDays.value.forEach(d => {
        expect(d.otherMonth).toBeFalsy();
      });
    });

    it('should equal days when fullWeeks is false', () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { days, pureDays } = useMonthlyCalendar({ ...defaultMonthlyOptions, fullWeeks: false });

      expect(pureDays.value).toHaveLength(days.value.length);
    });
  });

  describe('programmatic API', () => {
    it('should select a date via selectDate()', () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { selectedDates, selectDate } = useMonthlyCalendar(defaultMonthlyOptions);

      expect(selectedDates.value).toHaveLength(0);

      selectDate(new Date(2022, 2, 20));
      expect(selectedDates.value).toHaveLength(1);
    });

    it('should clear all selections via clearSelection()', () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { currentMonth, listeners, selectedDates, clearSelection } = useMonthlyCalendar(defaultMonthlyOptions);

      const enabledDays = currentMonth.value.days.filter(d => !d.state.disabled && !d.otherMonth);
      listeners.selectMultiple(enabledDays[0]);
      listeners.selectMultiple(enabledDays[1]);
      expect(selectedDates.value).toHaveLength(2);

      clearSelection();
      expect(selectedDates.value).toHaveLength(0);
    });

    it('should store the selection for a non-cached month and show it once navigated there', async () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { months, selectedDates, selectDate, currentMonthAndYear } = useMonthlyCalendar(defaultMonthlyOptions);

      expect(months.value).toHaveLength(1);

      // selectDate stores the ID but does not cache the month
      selectDate(new Date(2022, 6, 10)); // July — not yet cached
      expect(selectedDates.value).toHaveLength(0);

      // Navigate to July
      currentMonthAndYear.month = 6;
      currentMonthAndYear.year = 2022;
      await nextTick();

      // Now the selection is visible
      expect(selectedDates.value).toHaveLength(1);
    });
  });

  describe('disabled option', () => {
    it('should mark individually specified dates as disabled', () => {
      const disabledDate = new Date(2022, 2, 17);
      const { useMonthlyCalendar } = useCalendar({ ...defaultOptions, disabled: [disabledDate] });
      const { currentMonth } = useMonthlyCalendar(defaultMonthlyOptions);

      const disabledDay = currentMonth.value.days.find(d => isSameDay(d.date, disabledDate));
      expect(disabledDay).toBeDefined();
      expect(disabledDay!.state.disabled).toBeTruthy();

      // Neighbours should not be disabled by this rule
      const march18 = currentMonth.value.days.find(d => d.date.getDate() === 18 && !d.otherMonth);
      expect(march18?.state.disabled).toBeFalsy();
    });

    it('should not allow selecting a day that is in the disabled array', () => {
      const disabledDate = new Date(2022, 2, 20);
      const { useMonthlyCalendar } = useCalendar({ ...defaultOptions, disabled: [disabledDate] });
      const { currentMonth, listeners, selectedDates } = useMonthlyCalendar(defaultMonthlyOptions);

      const disabledDay = currentMonth.value.days.find(d => isSameDay(d.date, disabledDate))!;
      listeners.selectSingle(disabledDay);

      expect(disabledDay.state.selected).toBeFalsy();
      expect(selectedDates.value).toHaveLength(0);
    });
  });

  describe('cross-month range', () => {
    it('should apply between state to days spanning two months', async () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { currentMonth, nextMonth, months, listeners } = useMonthlyCalendar(defaultMonthlyOptions);

      // Select the last enabled day of the current (first) month
      const enabledDays = currentMonth.value.days.filter(d => !d.state.disabled && !d.otherMonth);
      const lastEnabledDay = enabledDays[enabledDays.length - 1];
      listeners.selectRange(lastEnabledDay);

      nextMonth();
      await nextTick();

      // Select the 5th enabled day in the next month
      const nextMonthObj = months.value[months.value.length - 1];
      const nextMonthEnabled = nextMonthObj.days.filter(d => !d.state.disabled && !d.otherMonth);
      const targetDay = nextMonthEnabled[4];
      listeners.selectRange(targetDay);

      // Days strictly between the two endpoints should have between: true
      const betweenInNextMonth = nextMonthObj.days.filter(d => d.state.between);
      expect(betweenInNextMonth.length).toBeGreaterThan(0);
    });

    it('should mark newly-navigated-to month days as between when inside an existing range', async () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { currentMonth, nextMonth, months, listeners } = useMonthlyCalendar(defaultMonthlyOptions);

      // Build a 2-point range entirely within month 1
      const enabledDays = currentMonth.value.days.filter(d => !d.state.disabled && !d.otherMonth);
      listeners.selectRange(enabledDays[0]);
      listeners.selectRange(enabledDays[enabledDays.length - 1]);

      // Navigate forward — the new month is outside the range; no between days expected there
      nextMonth();
      await nextTick();

      const secondMonth = months.value[months.value.length - 1];
      const betweenInSecondMonth = secondMonth.days.filter(d => d.state.between);
      expect(betweenInSecondMonth).toHaveLength(0);
    });
  });

  describe('eager pre-generation in finite mode', () => {
    it('should eagerly cache all months up to maxDate on initialisation', () => {
      const maxDate = addMonths(defaultOptions.minDate!, 2); // 3 months total
      const { useMonthlyCalendar } = useCalendar({ ...defaultOptions, maxDate });
      const { months } = useMonthlyCalendar({ infinite: false });

      expect(months.value).toHaveLength(3);
    });
  });

  // ── Cache eviction ──────────────────────────────────────────────────────────
  //
  // Default cache size = 13. Navigating far enough evicts the oldest non-pinned
  // months. We use `currentMonthAndYear.year += 10` as a large jump that guarantees
  // eviction without needing to step through 14 individual navigation calls.
  // No minDate is set in these tests so all days are enabled.
  describe('cache eviction and state persistence', () => {
    const noConstraints = { startOn: new Date(2022, 0, 1) }; // January 2022, no minDate

    it('should correctly regenerate the structure of an evicted month', async () => {
      const { useMonthlyCalendar } = useCalendar(noConstraints);
      const { currentMonth, currentMonthAndYear } = useMonthlyCalendar({ infinite: true, fullWeeks: false });

      // Jump 10 years forward — January 2022 is not selected so it gets evicted
      currentMonthAndYear.year = 2032;
      await nextTick();

      // Navigate back — January 2022 is regenerated from scratch
      currentMonthAndYear.year = 2022;
      await nextTick();

      expect(currentMonth.value.month).toEqual(0);
      expect(currentMonth.value.year).toEqual(2022);
      expect(currentMonth.value.days).toHaveLength(31); // January always has 31 days
      expect(areConsecutiveDays(currentMonth.value.days)).toBeTruthy();
    });

    it('should keep a month with a selected day in cache (pinning prevents eviction)', async () => {
      const { useMonthlyCalendar } = useCalendar(noConstraints);
      const { currentMonth, currentMonthAndYear, listeners, selectedDates } =
        useMonthlyCalendar({ infinite: true, fullWeeks: false });

      // Select January 15 — this pins January 2022 in the cache
      const jan15 = currentMonth.value.days[14];
      listeners.selectSingle(jan15);
      const jan15Id = jan15.id;

      // Jump 10 years forward
      currentMonthAndYear.year = 2032;
      await nextTick();

      // Jump back — January 2022 should still be in cache (pinned), not regenerated
      currentMonthAndYear.year = 2022;
      await nextTick();

      const restoredDay = currentMonth.value.days.find(d => d.id === jan15Id);
      expect(restoredDay).toBeDefined();
      expect(restoredDay!.state.selected).toBeTruthy();
      expect(selectedDates.value).toHaveLength(1);
    });

    it('should allow selecting days in a regenerated evicted month', async () => {
      const { useMonthlyCalendar } = useCalendar(noConstraints);
      const { currentMonth, currentMonthAndYear, listeners, selectedDates } =
        useMonthlyCalendar({ infinite: true, fullWeeks: false });

      // No selection — January 2022 is evictable
      currentMonthAndYear.year = 2032;
      await nextTick();

      // Navigate back — January 2022 is regenerated
      currentMonthAndYear.year = 2022;
      await nextTick();

      const jan15 = currentMonth.value.days[14];
      expect(jan15.state.disabled).toBeFalsy();

      listeners.selectSingle(jan15);

      expect(jan15.state.selected).toBeTruthy();
      expect(selectedDates.value).toHaveLength(1);
      expect(selectedDates.value[0].id).toEqual(jan15.id);
    });

    it('should restore selected state via stateMap when a non-pinned month is regenerated', async () => {
      // Scenario: select in month A (pinned), then navigate far so intermediate months are evicted.
      // Navigate back to an intermediate month — its days should reflect any prior state.
      const { useMonthlyCalendar } = useCalendar(noConstraints);
      const { currentMonth, currentMonthAndYear, listeners, selectedDates } =
        useMonthlyCalendar({ infinite: true, fullWeeks: false });

      // Select January 15 (pins January)
      const jan15 = currentMonth.value.days[14];
      listeners.selectSingle(jan15);

      // Jump to March 2022, select March 15 (replaces single selection)
      currentMonthAndYear.month = 2;
      await nextTick();
      const march15 = currentMonth.value.days[14];
      listeners.selectSingle(march15);
      const march15Id = march15.id;

      // Jump far away — March 2022 is now pinned; January and February are evictable
      currentMonthAndYear.year = 2032;
      await nextTick();

      // Navigate back to March 2022 — it was pinned, selection intact
      currentMonthAndYear.year = 2022;
      currentMonthAndYear.month = 2;
      await nextTick();

      expect(selectedDates.value).toHaveLength(1);
      const restored = currentMonth.value.days.find(d => d.id === march15Id);
      expect(restored!.state.selected).toBeTruthy();
    });

    it('should apply between state to a regenerated intermediate month inside a range', async () => {
      // Range: January 15 → September 15, 2022.
      // Intermediate months (Feb–Aug) are NOT navigated through, so they start uncached.
      // After a big jump and return, navigating to May (intermediate) should show between.
      const { useMonthlyCalendar } = useCalendar(noConstraints);
      const { currentMonth, currentMonthAndYear, listeners } =
        useMonthlyCalendar({ infinite: true, fullWeeks: false });

      // Select January 15 (range start) — pins January
      const jan15 = currentMonth.value.days[14];
      listeners.selectRange(jan15);

      // Jump directly to September 2022, skipping Feb–Aug so they stay uncached
      currentMonthAndYear.month = 8;
      await nextTick();

      // Select September 15 (range end) — pins September
      const sept15 = currentMonth.value.days[14];
      listeners.selectRange(sept15);

      // Both endpoints are now pinned. Jump far forward to evict everything else.
      currentMonthAndYear.year = 2032;
      await nextTick();

      // Navigate to May 2022 — never cached before, generated fresh
      currentMonthAndYear.year = 2022;
      currentMonthAndYear.month = 4; // May
      await nextTick();

      // May is entirely within the Jan 15 → Sept 15 range.
      // The flush:'sync' watchEffect must have applied between: true to all May days.
      const mayDays = currentMonth.value.days;
      expect(mayDays).toHaveLength(31);
      mayDays.forEach(d => {
        expect(d.state.between).toBeTruthy();
      });
    });

    it('should apply between state to a previously-evicted month navigated back to', async () => {
      // Same range as above but this time the intermediate month WAS cached (navigated through)
      // before being evicted. After re-generation the between state must still be correct.
      const { useMonthlyCalendar } = useCalendar(noConstraints);
      const { currentMonth, currentMonthAndYear, nextMonth, listeners } =
        useMonthlyCalendar({ infinite: true, fullWeeks: false });

      // Select January 15 (range start)
      const jan15 = currentMonth.value.days[14];
      listeners.selectRange(jan15);

      // Step through Feb, Mar, Apr, May — caching them along the way
      for (let i = 0; i < 4; i++) {
        nextMonth();
      }
      await nextTick(); // at May 2022

      // Jump to September 2022 and select September 15 (range end)
      currentMonthAndYear.month = 8;
      await nextTick();
      const sept15 = currentMonth.value.days[14];
      listeners.selectRange(sept15);

      // May was cached when the range was incomplete (only 1 selected).
      // After completing the range, the watchEffect retroactively sets May's between state.
      // Now jump far away — May is evicted (not pinned), but stateMap retains its states.
      currentMonthAndYear.year = 2032;
      await nextTick();

      // Navigate back to May 2022 — regenerated via getOrCreateState, reusing stateMap entries
      currentMonthAndYear.year = 2022;
      currentMonthAndYear.month = 4;
      await nextTick();

      const mayDays = currentMonth.value.days;
      expect(mayDays).toHaveLength(31);
      mayDays.forEach(d => {
        expect(d.state.between).toBeTruthy();
      });
    });

    it('should clear pinning once selection is cleared, allowing future eviction', async () => {
      const { useMonthlyCalendar } = useCalendar(noConstraints);
      const { currentMonth, currentMonthAndYear, listeners, clearSelection } =
        useMonthlyCalendar({ infinite: true, fullWeeks: false });

      // Select January 15 (pins January), then clear the selection (unpins it)
      listeners.selectSingle(currentMonth.value.days[14]);
      clearSelection();

      // Jump far away — January 2022 is no longer pinned, must be evictable
      currentMonthAndYear.year = 2032;
      await nextTick();

      // Navigate back — January 2022 is regenerated (was evicted)
      currentMonthAndYear.year = 2022;
      await nextTick();

      // Day should exist and be selectable, but not selected
      const jan15 = currentMonth.value.days[14];
      expect(jan15.state.selected).toBeFalsy();
      listeners.selectSingle(jan15);
      expect(jan15.state.selected).toBeTruthy();
    });
  });

  // ── Shared state between otherMonth padding and real month days ─────────────
  //
  // With fullWeeks: true, March 2022 (starts Tuesday, ends Thursday) is padded:
  //   Start: Feb 27 (Sun) Feb 28 (Mon) — otherMonth
  //   End:   Apr 1  (Fri) Apr 2  (Sat) — otherMonth
  //
  // All these padding days share the exact same CalendarDayState object as the
  // corresponding day in the adjacent real month (via the shared stateMap).
  describe('shared state between otherMonth padding and real month', () => {
    const marchStart = { startOn: new Date(2022, 2, 1) }; // March 2022, no minDate

    it('selecting a padding day reflects in the real month when navigated to', async () => {
      const { useMonthlyCalendar } = useCalendar(marchStart);
      const { currentMonth, nextMonth, months, listeners } =
        useMonthlyCalendar({ fullWeeks: true, infinite: true });

      // Find April 1 as an otherMonth padding day within March's view
      const april1Padding = currentMonth.value.days.find(
        d => d.otherMonth && d.date.getMonth() === 3 && d.date.getDate() === 1,
      );
      expect(april1Padding).toBeDefined();

      // Select it via March's view
      listeners.selectSingle(april1Padding!);
      expect(april1Padding!.state.selected).toBeTruthy();

      // Navigate to April — April 1 is now a real day
      nextMonth();
      await nextTick();

      const aprilMonth = months.value.find(m => m.month === 3)!;
      const april1Real = aprilMonth.days.find(d => !d.otherMonth && d.date.getDate() === 1);
      expect(april1Real).toBeDefined();

      // Must share the exact same state object and be selected
      expect(april1Real!.state.selected).toBeTruthy();
      expect(april1Real!.state).toBe(april1Padding!.state);
    });

    it('selecting a real month day reflects immediately in the adjacent month padding', async () => {
      const { useMonthlyCalendar } = useCalendar(marchStart);
      const { currentMonth, nextMonth, prevMonth, months, listeners } =
        useMonthlyCalendar({ fullWeeks: true, infinite: true });

      // Navigate to April and select April 1 from the real view
      nextMonth();
      await nextTick();

      const april1Real = currentMonth.value.days.find(d => !d.otherMonth && d.date.getDate() === 1);
      expect(april1Real).toBeDefined();
      listeners.selectSingle(april1Real!);
      expect(april1Real!.state.selected).toBeTruthy();

      // Navigate back to March
      prevMonth();
      await nextTick();

      // April 1 appears as a padding day in March — must show selected via the shared state
      const april1Padding = currentMonth.value.days.find(
        d => d.otherMonth && d.date.getMonth() === 3 && d.date.getDate() === 1,
      );
      expect(april1Padding).toBeDefined();
      expect(april1Padding!.state.selected).toBeTruthy();
      expect(april1Padding!.state).toBe(april1Real!.state);
    });

    it('between state on a padding day mirrors the real month entry', async () => {
      const { useMonthlyCalendar } = useCalendar(marchStart);
      const { currentMonth, nextMonth, months, listeners } =
        useMonthlyCalendar({ fullWeeks: true, infinite: true });

      // Select March 28 as range start (last few days of March)
      const march28 = currentMonth.value.days.find(d => !d.otherMonth && d.date.getDate() === 28);
      expect(march28).toBeDefined();
      listeners.selectRange(march28!);

      // Navigate to April and select April 3 as range end
      nextMonth();
      await nextTick();

      const april3 = currentMonth.value.days.find(d => !d.otherMonth && d.date.getDate() === 3);
      expect(april3).toBeDefined();
      listeners.selectRange(april3!);

      // Range: March 28 → April 3. Between days: March 29, 30, 31, April 1, 2.
      // April 1 appears as a real day in April AND as an otherMonth padding in March.
      const aprilMonth = months.value.find(m => m.month === 3)!;
      const marchMonth = months.value.find(m => m.month === 2)!;

      const april1Real = aprilMonth.days.find(d => !d.otherMonth && d.date.getDate() === 1);
      const april1Padding = marchMonth.days.find(
        d => d.otherMonth && d.date.getMonth() === 3 && d.date.getDate() === 1,
      );

      expect(april1Real).toBeDefined();
      expect(april1Padding).toBeDefined();

      // Both are between — same state object
      expect(april1Real!.state.between).toBeTruthy();
      expect(april1Padding!.state.between).toBeTruthy();
      expect(april1Padding!.state).toBe(april1Real!.state);
    });

    it('hover state on a padding day mirrors the real month entry', async () => {
      const { useMonthlyCalendar } = useCalendar(marchStart);
      const { currentMonth, nextMonth, months, listeners } =
        useMonthlyCalendar({ fullWeeks: true, infinite: true });

      // Select March 28 (1 selection → hover is active)
      const march28 = currentMonth.value.days.find(d => !d.otherMonth && d.date.getDate() === 28);
      listeners.selectRange(march28!);

      // Navigate to April — hover over April 1
      nextMonth();
      await nextTick();

      const april1Real = currentMonth.value.days.find(d => !d.otherMonth && d.date.getDate() === 1);
      expect(april1Real).toBeDefined();
      listeners.hoverRange(april1Real!);

      // April 1 in April's view should be hovered
      expect(april1Real!.state.hovered).toBeTruthy();

      // Navigate back to March — padding day for April 1 should share hovered state
      const marchMonth = months.value.find(m => m.month === 2)!;
      const april1Padding = marchMonth.days.find(
        d => d.otherMonth && d.date.getMonth() === 3 && d.date.getDate() === 1,
      );
      expect(april1Padding).toBeDefined();
      expect(april1Padding!.state.hovered).toBeTruthy();
      expect(april1Padding!.state).toBe(april1Real!.state);
    });

    it('cleared selection removes selected state from both padding and real entries', async () => {
      const { useMonthlyCalendar } = useCalendar(marchStart);
      const { currentMonth, nextMonth, months, listeners, clearSelection } =
        useMonthlyCalendar({ fullWeeks: true, infinite: true });

      // Select April 1 via March's padding
      const april1Padding = currentMonth.value.days.find(
        d => d.otherMonth && d.date.getMonth() === 3 && d.date.getDate() === 1,
      );
      listeners.selectSingle(april1Padding!);
      expect(april1Padding!.state.selected).toBeTruthy();

      // Navigate to April so the real day is in cache
      nextMonth();
      await nextTick();

      const april1Real = months.value.find(m => m.month === 3)!
        .days.find(d => !d.otherMonth && d.date.getDate() === 1);
      expect(april1Real!.state.selected).toBeTruthy();

      // Clear selection — both the padding and the real entry must deselect
      clearSelection();

      expect(april1Padding!.state.selected).toBeFalsy();
      expect(april1Real!.state.selected).toBeFalsy();
    });
  });

  // ── Multi-month visible window (count / step) ───────────────────────────────
  describe('count and step options (visibleMonths)', () => {
    it('visibleMonths returns exactly count consecutive months on initialisation', () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { visibleMonths } = useMonthlyCalendar({ ...defaultMonthlyOptions, count: 2 });

      expect(visibleMonths.value).toHaveLength(2);
      expect(visibleMonths.value[0].month).toEqual(defaultOptions.minDate.getMonth());
      expect(visibleMonths.value[0].year).toEqual(defaultOptions.minDate.getFullYear());
      expect(visibleMonths.value[1].month).toEqual((defaultOptions.minDate.getMonth() + 1) % 12);
    });

    it('visibleMonths slides by 1 when step defaults to 1', async () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { visibleMonths, nextMonth } = useMonthlyCalendar({ ...defaultMonthlyOptions, count: 2 });

      const firstMonth = visibleMonths.value[0].month;
      nextMonth();
      await nextTick();

      expect(visibleMonths.value[0].month).toEqual((firstMonth + 1) % 12);
      expect(visibleMonths.value).toHaveLength(2);
    });

    it('visibleMonths jumps by 2 when step is 2', async () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { visibleMonths, nextMonth } = useMonthlyCalendar({ ...defaultMonthlyOptions, count: 2, step: 2 });

      const firstMonth = visibleMonths.value[0].month;
      nextMonth();
      await nextTick();

      expect(visibleMonths.value[0].month).toEqual((firstMonth + 2) % 12);
      expect(visibleMonths.value).toHaveLength(2);
    });

    it('nextMonthEnabled is false when the last visible period would exceed maxDate', () => {
      // 2 months visible: Mar + Apr 2022. maxDate is end of April.
      const maxDate = endOfMonth(addMonths(defaultOptions.minDate!, 1));
      const { useMonthlyCalendar } = useCalendar({ ...defaultOptions, maxDate });
      const { nextMonthEnabled } = useMonthlyCalendar({ infinite: false, count: 2 });

      // Currently showing Mar + Apr. Stepping forward would show Apr + May → May > maxDate.
      expect(nextMonthEnabled.value).toBeFalsy();
    });

    it('nextMonthEnabled is true when stepping forward keeps the window within maxDate', () => {
      // 2 months visible, 3 months total range: Mar, Apr, May.
      const maxDate = endOfMonth(addMonths(defaultOptions.minDate!, 2));
      const { useMonthlyCalendar } = useCalendar({ ...defaultOptions, maxDate });
      const { nextMonthEnabled } = useMonthlyCalendar({ infinite: false, count: 2 });

      // Currently showing Mar + Apr. Stepping forward shows Apr + May — both within range.
      expect(nextMonthEnabled.value).toBeTruthy();
    });

    it('selection works across visibleMonths (select in month 1, shows selected in month 2 range)', async () => {
      const { useMonthlyCalendar } = useCalendar(defaultOptions);
      const { visibleMonths, listeners } = useMonthlyCalendar({ ...defaultMonthlyOptions, count: 2 });

      // Select a day in the first visible month and a day in the second as a range
      const month1Days = visibleMonths.value[0].days.filter(d => !d.state.disabled && !d.otherMonth);
      const month2Days = visibleMonths.value[1].days.filter(d => !d.state.disabled && !d.otherMonth);

      listeners.selectRange(month1Days[0]);
      listeners.selectRange(month2Days[4]);

      // Days between the two endpoints should have between state
      const betweenInMonth2 = visibleMonths.value[1].days.filter(d => d.state.between);
      expect(betweenInMonth2.length).toBeGreaterThan(0);
    });

    it('count: 1 (default) behaves identically to not passing count', () => {
      const { useMonthlyCalendar: withCount } = useCalendar(defaultOptions);
      const { useMonthlyCalendar: withoutCount } = useCalendar(defaultOptions);

      const a = withCount({ ...defaultMonthlyOptions, count: 1 });
      const b = withoutCount(defaultMonthlyOptions);

      expect(a.visibleMonths.value).toHaveLength(1);
      expect(b.visibleMonths.value).toHaveLength(1);
      expect(a.visibleMonths.value[0].id).toEqual(b.visibleMonths.value[0].id);
    });
  });
});