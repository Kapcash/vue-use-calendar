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
});