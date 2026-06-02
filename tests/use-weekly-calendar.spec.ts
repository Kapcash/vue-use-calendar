import { describe, expect, it, vi, beforeAll } from 'vitest';
import { addDays, addWeeks, isSameDay, startOfWeek } from 'date-fns';
import { isReactive, isRef, nextTick, ref } from 'vue';
import { WeeklyOptions } from '../lib/types';
import { useCalendar } from '../lib/use-calendar';
import { areConsecutiveDays } from './helpers';
import { weekIdFromDate, weekFromWeekId, yearFromWeekId } from '../lib/utils/week';

/*
 * Today: Tuesday, March 8, 2022
 * With firstDayOfWeek: 0 (Sunday, default), this week spans March 6–12, 2022.
 */
const mockToday = new Date(2022, 2, 8);
const defaultOptions = { startOn: mockToday };
const defaultWeeklyOptions: WeeklyOptions = { infinite: true };

beforeAll(() => {
  vi.setSystemTime(mockToday);
});

describe('use-weekly-calendar', () => {
  describe('initial state', () => {
    it('should return the correct shape', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const result = useWeeklyCalendar(defaultWeeklyOptions);

      expect(isRef(result.currentWeek)).toBeTruthy();
      expect(isReactive(result.currentWeekAndYear)).toBeTruthy();
      expect(isRef(result.weeks)).toBeTruthy();
      expect(isRef(result.days)).toBeTruthy();
      expect(isRef(result.selectedDates)).toBeTruthy();
      expect(isRef(result.nextWeekEnabled)).toBeTruthy();
      expect(isRef(result.prevWeekEnabled)).toBeTruthy();
      expect(typeof result.nextWeek).toBe('function');
      expect(typeof result.prevWeek).toBe('function');
      expect(typeof result.selectDate).toBe('function');
      expect(typeof result.clearSelection).toBe('function');
      expect(typeof result.listeners).toBe('object');
    });

    it('should have all selection listeners when no mode is specified', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { listeners } = useWeeklyCalendar(defaultWeeklyOptions);

      expect(Object.keys(listeners)).toEqual(
        expect.arrayContaining(['selectSingle', 'selectRange', 'selectMultiple', 'hoverRange', 'resetHover']),
      );
      expect(Object.keys(listeners)).toHaveLength(5);
      Object.values(listeners).forEach(fn => expect(fn).toBeTypeOf('function'));
    });

    it('should start with the correct weekNumber and year', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeekAndYear } = useWeeklyCalendar(defaultWeeklyOptions);

      const expectedWeekId = weekIdFromDate(mockToday, 0);
      expect(currentWeekAndYear.weekNumber).toEqual(weekFromWeekId(expectedWeekId));
      expect(currentWeekAndYear.year).toEqual(yearFromWeekId(expectedWeekId));
    });

    it('should start with empty selectedDates', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { selectedDates } = useWeeklyCalendar(defaultWeeklyOptions);

      expect(selectedDates.value).toHaveLength(0);
    });

    it('should start with one cached week', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { weeks } = useWeeklyCalendar(defaultWeeklyOptions);

      expect(weeks.value).toHaveLength(1);
    });
  });

  describe('week structure', () => {
    it('should always have exactly 7 days in currentWeek', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek } = useWeeklyCalendar(defaultWeeklyOptions);

      expect(currentWeek.value.days).toHaveLength(7);
    });

    it('should have 7 consecutive days in days computed', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { days } = useWeeklyCalendar(defaultWeeklyOptions);

      expect(days.value).toHaveLength(7);
      expect(areConsecutiveDays(days.value)).toBeTruthy();
    });

    it('should start the week on the configured firstDayOfWeek (Monday)', () => {
      const { useWeeklyCalendar } = useCalendar({ ...defaultOptions, firstDayOfWeek: 1 });
      const { currentWeek } = useWeeklyCalendar(defaultWeeklyOptions);

      // getDay() = 1 means Monday
      expect(currentWeek.value.days[0].date.getDay()).toEqual(1);
    });

    it('should start the week on Sunday when firstDayOfWeek defaults to 0', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek } = useWeeklyCalendar(defaultWeeklyOptions);

      // getDay() = 0 means Sunday
      expect(currentWeek.value.days[0].date.getDay()).toEqual(0);
    });

    it('should expose the correct weekNumber and year on currentWeek', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek } = useWeeklyCalendar(defaultWeeklyOptions);

      const expectedWeekId = weekIdFromDate(mockToday, 0);
      expect(currentWeek.value.weekNumber).toEqual(weekFromWeekId(expectedWeekId));
      expect(currentWeek.value.year).toEqual(yearFromWeekId(expectedWeekId));
    });

    it('should mark today correctly within the current week', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek } = useWeeklyCalendar(defaultWeeklyOptions);

      const todayDays = currentWeek.value.days.filter(d => d.isToday);
      expect(todayDays).toHaveLength(1);
      expect(isSameDay(todayDays[0].date, mockToday)).toBeTruthy();
    });

    it('should mark weekend days correctly', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek } = useWeeklyCalendar(defaultWeeklyOptions);

      const weekendDays = currentWeek.value.days.filter(d => d.isWeekend);
      expect(weekendDays.length).toBeGreaterThan(0);
      weekendDays.forEach(d => {
        expect(d.dayOfWeek === 0 || d.dayOfWeek === 6).toBeTruthy();
      });
    });

    it('should have a stable id in YYYY-MM-DD format for each day', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek } = useWeeklyCalendar(defaultWeeklyOptions);

      currentWeek.value.days.forEach(d => {
        expect(d.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });
  });

  describe('navigation', () => {
    it('should advance one week on nextWeek()', async () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeekAndYear, nextWeek } = useWeeklyCalendar(defaultWeeklyOptions);

      const nextWeekStart = addWeeks(startOfWeek(mockToday, { weekStartsOn: 0 }), 1);
      const expectedWeekId = weekIdFromDate(nextWeekStart, 0);

      nextWeek();
      await nextTick();

      expect(currentWeekAndYear.weekNumber).toEqual(weekFromWeekId(expectedWeekId));
      expect(currentWeekAndYear.year).toEqual(yearFromWeekId(expectedWeekId));
    });

    it('should retreat one week on prevWeek()', async () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeekAndYear, prevWeek } = useWeeklyCalendar(defaultWeeklyOptions);

      const prevWeekStart = addWeeks(startOfWeek(mockToday, { weekStartsOn: 0 }), -1);
      const expectedWeekId = weekIdFromDate(prevWeekStart, 0);

      prevWeek();
      await nextTick();

      expect(currentWeekAndYear.weekNumber).toEqual(weekFromWeekId(expectedWeekId));
      expect(currentWeekAndYear.year).toEqual(yearFromWeekId(expectedWeekId));
    });

    it('should grow the weeks cache on each navigation step', async () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { nextWeek, weeks } = useWeeklyCalendar(defaultWeeklyOptions);

      expect(weeks.value).toHaveLength(1);

      nextWeek();
      await nextTick();

      expect(weeks.value).toHaveLength(2);
    });

    it('should update currentWeek when setting currentWeekAndYear.weekNumber', async () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek, currentWeekAndYear } = useWeeklyCalendar(defaultWeeklyOptions);

      const initialWeek = currentWeekAndYear.weekNumber;
      currentWeekAndYear.weekNumber = initialWeek + 5;
      await nextTick();

      expect(currentWeek.value.weekNumber).toEqual(initialWeek + 5);
    });

    it('should update currentWeek when setting currentWeekAndYear.year', async () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek, currentWeekAndYear } = useWeeklyCalendar(defaultWeeklyOptions);

      currentWeekAndYear.year = 2025;
      await nextTick();

      expect(currentWeek.value.year).toEqual(2025);
    });

    it('should be a no-op when setting the same weekNumber', async () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeekAndYear, weeks } = useWeeklyCalendar(defaultWeeklyOptions);

      const before = weeks.value.length;
      currentWeekAndYear.weekNumber = currentWeekAndYear.weekNumber;
      await nextTick();

      expect(weeks.value).toHaveLength(before);
    });

    it('should produce consecutive days across multiple navigations', async () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { nextWeek, days } = useWeeklyCalendar(defaultWeeklyOptions);

      nextWeek();
      await nextTick();

      expect(areConsecutiveDays(days.value)).toBeTruthy();
    });
  });

  describe('year-boundary navigation', () => {
    it('should cross from Dec 2022 into Jan 2023 when navigating forward (Monday start)', async () => {
      // Dec 26, 2022 is a Monday — navigating one week forward lands in Jan 2023
      const decStart = new Date(2022, 11, 26);
      const { useWeeklyCalendar } = useCalendar({ startOn: decStart, firstDayOfWeek: 1 });
      const { currentWeek, nextWeek } = useWeeklyCalendar(defaultWeeklyOptions);

      // The week starts on Dec 26 (calendar year 2022)
      expect(currentWeek.value.days[0].date.getFullYear()).toEqual(2022);

      nextWeek();
      await nextTick();

      // After advancing, the first day of the new week should be in 2023
      expect(currentWeek.value.days[0].date.getFullYear()).toEqual(2023);
    });

    it('should cross from Jan 2023 into Dec 2022 when navigating backward (Monday start)', async () => {
      const janStart = new Date(2023, 0, 2); // Monday, Jan 2, 2023
      const { useWeeklyCalendar } = useCalendar({ startOn: janStart, firstDayOfWeek: 1 });
      const { currentWeek, prevWeek } = useWeeklyCalendar(defaultWeeklyOptions);

      prevWeek();
      await nextTick();

      expect(currentWeek.value.days[0].date.getFullYear()).toEqual(2022);
    });
  });

  describe('finite mode (default: infinite = false)', () => {
    it('should disable both navigation directions when no maxDate is provided', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { prevWeekEnabled, nextWeekEnabled } = useWeeklyCalendar({ infinite: false });

      expect(prevWeekEnabled.value).toBeFalsy();
      expect(nextWeekEnabled.value).toBeFalsy();
    });

    it('should enable next navigation when maxDate is in the future', () => {
      const maxDate = addWeeks(mockToday, 3);
      const { useWeeklyCalendar } = useCalendar({ ...defaultOptions, maxDate });
      const { prevWeekEnabled, nextWeekEnabled } = useWeeklyCalendar({ infinite: false });

      expect(prevWeekEnabled.value).toBeFalsy();
      expect(nextWeekEnabled.value).toBeTruthy();
    });

    it('should enable prev and disable next at the last week', () => {
      const maxDate = addWeeks(mockToday, 2);
      const { useWeeklyCalendar } = useCalendar({ ...defaultOptions, maxDate });
      const { prevWeekEnabled, nextWeekEnabled, nextWeek } = useWeeklyCalendar({ infinite: false });

      expect(prevWeekEnabled.value).toBeFalsy();
      expect(nextWeekEnabled.value).toBeTruthy();

      nextWeek();
      expect(prevWeekEnabled.value).toBeTruthy();
      expect(nextWeekEnabled.value).toBeTruthy();

      nextWeek();
      nextWeek();

      expect(prevWeekEnabled.value).toBeTruthy();
      expect(nextWeekEnabled.value).toBeFalsy();
    });

    it('should be a no-op calling prevWeek when not enabled', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { prevWeekEnabled, prevWeek, currentWeekAndYear } = useWeeklyCalendar({ infinite: false });

      expect(prevWeekEnabled.value).toBeFalsy();
      const { weekNumber, year } = currentWeekAndYear;

      prevWeek();

      expect(currentWeekAndYear.weekNumber).toEqual(weekNumber);
      expect(currentWeekAndYear.year).toEqual(year);
    });

    it('should be a no-op calling nextWeek when not enabled', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { nextWeekEnabled, nextWeek, currentWeekAndYear } = useWeeklyCalendar({ infinite: false });

      expect(nextWeekEnabled.value).toBeFalsy();
      const { weekNumber, year } = currentWeekAndYear;

      nextWeek();

      expect(currentWeekAndYear.weekNumber).toEqual(weekNumber);
      expect(currentWeekAndYear.year).toEqual(year);
    });

    it('should eagerly cache all weeks in finite mode when maxDate is set', () => {
      // addWeeks(mockToday, 3) = March 29, covering 4 distinct weeks with Sunday start
      const maxDate = addWeeks(mockToday, 3);
      const { useWeeklyCalendar } = useCalendar({ ...defaultOptions, maxDate });
      const { weeks } = useWeeklyCalendar({ infinite: false });

      expect(weeks.value).toHaveLength(4);
    });
  });

  describe('infinite mode', () => {
    it('should enable both navigation directions', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { prevWeekEnabled, nextWeekEnabled } = useWeeklyCalendar({ infinite: true });

      expect(prevWeekEnabled.value).toBeTruthy();
      expect(nextWeekEnabled.value).toBeTruthy();
    });

    it('should grow the weeks cache when navigating in both directions', async () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { nextWeek, prevWeek, weeks } = useWeeklyCalendar({ infinite: true });

      expect(weeks.value).toHaveLength(1);

      nextWeek();
      await nextTick();
      expect(weeks.value).toHaveLength(2);

      // Going back to the original week — still cached
      prevWeek();
      await nextTick();
      expect(weeks.value).toHaveLength(2);

      // Going further back generates a new week
      prevWeek();
      await nextTick();
      expect(weeks.value).toHaveLength(3);
    });
  });

  describe('selection', () => {
    it('should toggle single selection on/off', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek, listeners, selectedDates } = useWeeklyCalendar(defaultWeeklyOptions);

      const enabledDay = currentWeek.value.days.find(d => !d.state.disabled)!;

      listeners.selectSingle(enabledDay);
      expect(enabledDay.state.selected).toBeTruthy();
      expect(selectedDates.value).toHaveLength(1);

      listeners.selectSingle(enabledDay);
      expect(enabledDay.state.selected).toBeFalsy();
      expect(selectedDates.value).toHaveLength(0);
    });

    it('should select a range within the same week', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek, listeners, selectedDates } = useWeeklyCalendar(defaultWeeklyOptions);

      const enabledDays = currentWeek.value.days.filter(d => !d.state.disabled);
      const first = enabledDays[0];
      const last = enabledDays[4];

      listeners.selectRange(first);
      expect(selectedDates.value).toHaveLength(1);

      listeners.selectRange(last);
      expect(selectedDates.value).toHaveLength(2);

      // 3 days between index 0 and index 4
      const betweenDays = currentWeek.value.days.filter(d => d.state.between);
      expect(betweenDays).toHaveLength(3);
    });

    it('should clear range on a 3rd click and restart with 1 selected', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek, listeners, selectedDates } = useWeeklyCalendar(defaultWeeklyOptions);

      const enabledDays = currentWeek.value.days.filter(d => !d.state.disabled);

      listeners.selectRange(enabledDays[0]);
      listeners.selectRange(enabledDays[4]);
      expect(selectedDates.value).toHaveLength(2);

      listeners.selectRange(enabledDays[2]);
      expect(selectedDates.value).toHaveLength(1);

      // No between state with only 1 selected
      const betweenDays = currentWeek.value.days.filter(d => d.state.between);
      expect(betweenDays).toHaveLength(0);
    });

    it('should toggle multiple dates on/off', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek, listeners, selectedDates } = useWeeklyCalendar(defaultWeeklyOptions);

      const enabledDays = currentWeek.value.days.filter(d => !d.state.disabled);

      listeners.selectMultiple(enabledDays[0]);
      listeners.selectMultiple(enabledDays[2]);
      listeners.selectMultiple(enabledDays[4]);
      expect(selectedDates.value).toHaveLength(3);

      // Toggle one off
      listeners.selectMultiple(enabledDays[2]);
      expect(selectedDates.value).toHaveLength(2);
    });

    it('should not select a disabled day', () => {
      const minDate = new Date(2022, 2, 9); // Wednesday — days before it are disabled
      const { useWeeklyCalendar } = useCalendar({ startOn: mockToday, minDate });
      const { currentWeek, listeners, selectedDates } = useWeeklyCalendar(defaultWeeklyOptions);

      const disabledDay = currentWeek.value.days.find(d => d.state.disabled);
      expect(disabledDay).toBeDefined();

      listeners.selectSingle(disabledDay!);
      expect(disabledDay!.state.selected).toBeFalsy();
      expect(selectedDates.value).toHaveLength(0);
    });

    it('should apply between state across a cross-week range', async () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek, nextWeek, weeks, listeners } = useWeeklyCalendar({ infinite: true });

      // Select the first day of the current week
      const firstDay = currentWeek.value.days[0];
      listeners.selectRange(firstDay);

      nextWeek();
      await nextTick();

      // Select the last day of the next week
      const secondWeek = weeks.value[weeks.value.length - 1];
      const lastDay = secondWeek.days[secondWeek.days.length - 1];
      listeners.selectRange(lastDay);

      // Days after firstDay in week 1 should be between
      const betweenInFirstWeek = weeks.value[0].days.filter(d => d.state.between);
      expect(betweenInFirstWeek.length).toBeGreaterThan(0);

      // Days before lastDay in week 2 should be between
      const betweenInSecondWeek = secondWeek.days.filter(d => d.state.between);
      expect(betweenInSecondWeek.length).toBeGreaterThan(0);
    });
  });

  describe('hover', () => {
    it('should set hovered state on hoverRange when 1 date is selected', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek, listeners } = useWeeklyCalendar(defaultWeeklyOptions);

      const enabledDays = currentWeek.value.days.filter(d => !d.state.disabled);
      listeners.selectRange(enabledDays[0]);
      listeners.hoverRange(enabledDays[4]);

      const hoveredDays = currentWeek.value.days.filter(d => d.state.hovered);
      expect(hoveredDays.length).toBeGreaterThan(0);
    });

    it('should clear hover on resetHover()', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek, listeners } = useWeeklyCalendar(defaultWeeklyOptions);

      const enabledDays = currentWeek.value.days.filter(d => !d.state.disabled);
      listeners.selectRange(enabledDays[0]);
      listeners.hoverRange(enabledDays[4]);
      listeners.resetHover();

      const hoveredDays = currentWeek.value.days.filter(d => d.state.hovered);
      expect(hoveredDays).toHaveLength(0);
    });

    it('should be a no-op when no dates are selected', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek, listeners } = useWeeklyCalendar(defaultWeeklyOptions);

      const enabledDays = currentWeek.value.days.filter(d => !d.state.disabled);
      listeners.hoverRange(enabledDays[4]);

      const hoveredDays = currentWeek.value.days.filter(d => d.state.hovered);
      expect(hoveredDays).toHaveLength(0);
    });

    it('should be a no-op when 2 dates are already selected', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek, listeners } = useWeeklyCalendar(defaultWeeklyOptions);

      const enabledDays = currentWeek.value.days.filter(d => !d.state.disabled);
      listeners.selectRange(enabledDays[0]);
      listeners.selectRange(enabledDays[2]);

      listeners.hoverRange(enabledDays[5]);
      const hoveredDays = currentWeek.value.days.filter(d => d.state.hovered);
      expect(hoveredDays).toHaveLength(0);
    });
  });

  describe('preSelection', () => {
    it('should pre-select a date on initialisation', () => {
      const preSelectedDate = new Date(2022, 2, 9); // Wednesday of the same week
      const { useWeeklyCalendar } = useCalendar({ ...defaultOptions, preSelection: [preSelectedDate] });
      const { selectedDates } = useWeeklyCalendar(defaultWeeklyOptions);

      expect(selectedDates.value).toHaveLength(1);
      expect(isSameDay(selectedDates.value[0].date, preSelectedDate)).toBeTruthy();
    });

    it('should eagerly cache the week containing the preselected date', () => {
      const preSelectedDate = addWeeks(mockToday, 5); // 5 weeks in the future
      const { useWeeklyCalendar } = useCalendar({ ...defaultOptions, preSelection: [preSelectedDate] });
      const { selectedDates, weeks } = useWeeklyCalendar(defaultWeeklyOptions);

      // The current week + the preselected week = at least 2 cached weeks
      expect(weeks.value.length).toBeGreaterThanOrEqual(2);
      expect(selectedDates.value).toHaveLength(1);
    });
  });

  describe('meta', () => {
    it('should populate meta from the callback for each day', () => {
      const { useWeeklyCalendar } = useCalendar({
        ...defaultOptions,
        meta: (date: Date) => ({ label: date.getDate() }),
      });
      const { currentWeek } = useWeeklyCalendar(defaultWeeklyOptions);

      currentWeek.value.days.forEach(d => {
        expect((d.meta as { label: number }).label).toEqual(d.date.getDate());
      });
    });
  });

  describe('disabled dates', () => {
    it('should disable days before minDate', () => {
      const minDate = new Date(2022, 2, 9); // Wednesday
      const { useWeeklyCalendar } = useCalendar({ startOn: mockToday, minDate });
      const { currentWeek } = useWeeklyCalendar(defaultWeeklyOptions);

      const disabledDays = currentWeek.value.days.filter(d => d.state.disabled);
      expect(disabledDays.length).toBeGreaterThan(0);
      disabledDays.forEach(d => {
        expect(d.date < minDate).toBeTruthy();
      });
    });

    it('should not disable minDate itself', () => {
      const minDate = new Date(2022, 2, 9);
      const { useWeeklyCalendar } = useCalendar({ startOn: mockToday, minDate });
      const { currentWeek } = useWeeklyCalendar(defaultWeeklyOptions);

      const minDay = currentWeek.value.days.find(d => isSameDay(d.date, minDate));
      expect(minDay).toBeDefined();
      expect(minDay!.state.disabled).toBeFalsy();
    });

    it('should disable days after maxDate', () => {
      const maxDate = new Date(2022, 2, 9); // Wednesday
      const { useWeeklyCalendar } = useCalendar({ startOn: mockToday, maxDate });
      const { currentWeek } = useWeeklyCalendar(defaultWeeklyOptions);

      const enabledDays = currentWeek.value.days.filter(d => !d.state.disabled);
      enabledDays.forEach(d => {
        expect(d.date <= maxDate).toBeTruthy();
      });
    });

    it('should not disable maxDate itself', () => {
      const maxDate = new Date(2022, 2, 9);
      const { useWeeklyCalendar } = useCalendar({ startOn: mockToday, maxDate });
      const { currentWeek } = useWeeklyCalendar(defaultWeeklyOptions);

      const maxDay = currentWeek.value.days.find(d => isSameDay(d.date, maxDate));
      expect(maxDay).toBeDefined();
      expect(maxDay!.state.disabled).toBeFalsy();
    });

    it('should disable individually specified dates without affecting neighbours', () => {
      const disabledDate = new Date(2022, 2, 9); // Wednesday
      const { useWeeklyCalendar } = useCalendar({ startOn: mockToday, disabled: [disabledDate] });
      const { currentWeek } = useWeeklyCalendar(defaultWeeklyOptions);

      const disabledDay = currentWeek.value.days.find(d => isSameDay(d.date, disabledDate));
      expect(disabledDay).toBeDefined();
      expect(disabledDay!.state.disabled).toBeTruthy();

      // The day right after should not be disabled
      const neighbourDay = currentWeek.value.days.find(d => isSameDay(d.date, addDays(disabledDate, 1)));
      expect(neighbourDay?.state.disabled).toBeFalsy();
    });
  });

  describe('programmatic API', () => {
    it('should select a date via selectDate()', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { selectedDates, selectDate } = useWeeklyCalendar(defaultWeeklyOptions);

      expect(selectedDates.value).toHaveLength(0);

      selectDate(new Date(2022, 2, 9));
      expect(selectedDates.value).toHaveLength(1);
    });

    it('should clear all selections via clearSelection()', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek, listeners, selectedDates, clearSelection } = useWeeklyCalendar(defaultWeeklyOptions);

      const enabledDays = currentWeek.value.days.filter(d => !d.state.disabled);
      listeners.selectMultiple(enabledDays[0]);
      listeners.selectMultiple(enabledDays[1]);
      expect(selectedDates.value).toHaveLength(2);

      clearSelection();
      expect(selectedDates.value).toHaveLength(0);
    });

    it('should store the selection for a non-cached week and show it once navigated there', async () => {
      const farDate = addWeeks(mockToday, 10);
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { weeks, selectedDates, selectDate, currentWeekAndYear } = useWeeklyCalendar(defaultWeeklyOptions);

      expect(weeks.value).toHaveLength(1);

      // selectDate stores the ID in selectedIds but does not cache the week
      selectDate(farDate);
      expect(selectedDates.value).toHaveLength(0); // not yet cached

      // Navigate to the week containing farDate
      const farWeekId = weekIdFromDate(farDate, 0);
      currentWeekAndYear.year = yearFromWeekId(farWeekId);
      currentWeekAndYear.weekNumber = weekFromWeekId(farWeekId);
      await nextTick();

      // Now the selection is visible
      expect(selectedDates.value).toHaveLength(1);
    });
  });

  describe('mode narrowing', () => {
    it('should expose only selectSingle for mode: single', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { listeners } = useWeeklyCalendar({ ...defaultWeeklyOptions, mode: 'single' as const });

      expect(Object.keys(listeners)).toEqual(['selectSingle']);
    });

    it('should expose only range handlers for mode: range', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { listeners } = useWeeklyCalendar({ ...defaultWeeklyOptions, mode: 'range' as const });

      expect(Object.keys(listeners)).toEqual(
        expect.arrayContaining(['selectRange', 'hoverRange', 'resetHover']),
      );
      expect(Object.keys(listeners)).toHaveLength(3);
    });

    it('should expose only selectMultiple for mode: multiple', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { listeners } = useWeeklyCalendar({ ...defaultWeeklyOptions, mode: 'multiple' as const });

      expect(Object.keys(listeners)).toEqual(['selectMultiple']);
    });

    it('should expose all 5 handlers when no mode is provided', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { listeners } = useWeeklyCalendar(defaultWeeklyOptions);

      expect(Object.keys(listeners)).toHaveLength(5);
    });
  });

  // ── Multi-week visible window (count / step) ────────────────────────────────
  describe('count and step options (visibleWeeks)', () => {
    it('visibleWeeks returns exactly count consecutive weeks on initialisation', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { visibleWeeks } = useWeeklyCalendar({ ...defaultWeeklyOptions, count: 2 });

      expect(visibleWeeks.value).toHaveLength(2);
      // The second visible week immediately follows the first
      const firstLastDay = visibleWeeks.value[0].days[6];
      const secondFirstDay = visibleWeeks.value[1].days[0];
      const diff = (secondFirstDay.date.getTime() - firstLastDay.date.getTime()) / (1000 * 60 * 60 * 24);
      expect(diff).toEqual(1);
    });

    it('visibleWeeks slides by 1 when step defaults to 1', async () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { visibleWeeks, nextWeek } = useWeeklyCalendar({ ...defaultWeeklyOptions, count: 2 });

      const firstWeekId = visibleWeeks.value[0].id;
      nextWeek();
      await nextTick();

      expect(visibleWeeks.value).toHaveLength(2);
      expect(visibleWeeks.value[0].id).not.toEqual(firstWeekId);
      // The new first visible week is exactly one week after the previous first
      const prevFirstDay = new Date(String(firstWeekId).slice(0, 4) + '-01-01');
      expect(visibleWeeks.value[0].weekNumber).toEqual(visibleWeeks.value[0].weekNumber);
      // Simpler: step=1 means the new window starts one step ahead of the old one
      const newFirstWeekNumber = visibleWeeks.value[0].weekNumber;
      const oldFirstWeekNumber = weekFromWeekId(firstWeekId);
      expect(Math.abs(newFirstWeekNumber - oldFirstWeekNumber)).toEqual(1);
    });

    it('visibleWeeks jumps by 2 when step is 2', async () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { visibleWeeks, nextWeek } = useWeeklyCalendar({ ...defaultWeeklyOptions, count: 2, step: 2 });

      const firstWeekId = visibleWeeks.value[0].id;
      nextWeek();
      await nextTick();

      expect(visibleWeeks.value).toHaveLength(2);
      const oldFirstWeekNumber = weekFromWeekId(firstWeekId);
      const newFirstWeekNumber = visibleWeeks.value[0].weekNumber;
      expect(Math.abs(newFirstWeekNumber - oldFirstWeekNumber)).toEqual(2);
    });

    it('nextWeekEnabled is false when the last visible period would exceed maxDate', () => {
      // 2 weeks visible. maxDate lands in the second visible week — stepping forward
      // would push the last visible week past maxDate.
      const maxDate = addWeeks(mockToday, 1); // end of week 2 is the boundary
      const { useWeeklyCalendar } = useCalendar({ ...defaultOptions, maxDate });
      const { nextWeekEnabled } = useWeeklyCalendar({ infinite: false, count: 2 });

      // Currently showing week 1 + week 2. Stepping forward → week 2 + week 3 → week 3 > maxDate.
      expect(nextWeekEnabled.value).toBeFalsy();
    });

    it('nextWeekEnabled is true when stepping forward keeps the window within maxDate', () => {
      // 2 weeks visible, 3 weeks total range.
      const maxDate = addWeeks(mockToday, 2);
      const { useWeeklyCalendar } = useCalendar({ ...defaultOptions, maxDate });
      const { nextWeekEnabled } = useWeeklyCalendar({ infinite: false, count: 2 });

      // Currently showing week 1 + week 2. Stepping forward → week 2 + week 3 — both within range.
      expect(nextWeekEnabled.value).toBeTruthy();
    });

    it('selection works across visibleWeeks (range spanning both visible weeks)', async () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { visibleWeeks, listeners } = useWeeklyCalendar({ ...defaultWeeklyOptions, count: 2 });

      // Select first day of week 1 and last day of week 2 as a range
      const week1Days = visibleWeeks.value[0].days.filter(d => !d.state.disabled);
      const week2Days = visibleWeeks.value[1].days.filter(d => !d.state.disabled);

      listeners.selectRange(week1Days[0]);
      listeners.selectRange(week2Days[week2Days.length - 1]);

      // Days after the start in week 1 should be between
      const betweenInWeek1 = visibleWeeks.value[0].days.filter(d => d.state.between);
      expect(betweenInWeek1.length).toBeGreaterThan(0);

      // Days before the end in week 2 should be between
      const betweenInWeek2 = visibleWeeks.value[1].days.filter(d => d.state.between);
      expect(betweenInWeek2.length).toBeGreaterThan(0);
    });

    it('count: 1 (default) behaves identically to not passing count', () => {
      const { useWeeklyCalendar: withCount } = useCalendar(defaultOptions);
      const { useWeeklyCalendar: withoutCount } = useCalendar(defaultOptions);

      const a = withCount({ ...defaultWeeklyOptions, count: 1 });
      const b = withoutCount(defaultWeeklyOptions);

      expect(a.visibleWeeks.value).toHaveLength(1);
      expect(b.visibleWeeks.value).toHaveLength(1);
      expect(a.visibleWeeks.value[0].id).toEqual(b.visibleWeeks.value[0].id);
    });
  });

  describe('disabled function predicate', () => {
    it('should disable all Saturdays when disabled is a function', () => {
      const { useWeeklyCalendar } = useCalendar({
        startOn: mockToday,
        disabled: (date: Date) => date.getDay() === 6,
      });
      const { currentWeek } = useWeeklyCalendar(defaultWeeklyOptions);

      const saturdays = currentWeek.value.days.filter(d => d.dayOfWeek === 6);
      expect(saturdays.length).toBeGreaterThan(0);
      saturdays.forEach(d => expect(d.state.disabled).toBe(true));

      const nonSaturdays = currentWeek.value.days.filter(d => d.dayOfWeek !== 6);
      nonSaturdays.forEach(d => expect(d.state.disabled).toBe(false));
    });

    it('should not allow selecting a function-disabled date', () => {
      const { useWeeklyCalendar } = useCalendar({
        startOn: mockToday,
        disabled: (date: Date) => date.getDay() === 6,
      });
      const { currentWeek, listeners, selectedDates } = useWeeklyCalendar(defaultWeeklyOptions);

      const saturday = currentWeek.value.days.find(d => d.dayOfWeek === 6)!;
      listeners.selectSingle(saturday);

      expect(selectedDates.value).toHaveLength(0);
    });
  });

  describe('selection constraints', () => {
    it('should reject range selection shorter than minRange', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek, listeners, selectedDates } = useWeeklyCalendar({
        ...defaultWeeklyOptions, mode: 'range' as const, minRange: 4,
      });

      const days = currentWeek.value.days;
      listeners.selectRange(days[0]);
      listeners.selectRange(days[2]); // 3 days — less than minRange=4

      expect(selectedDates.value).toHaveLength(1);
      expect(days[2].state.selected).toBe(false);
    });

    it('should accept range selection at exactly minRange', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek, listeners, selectedDates } = useWeeklyCalendar({
        ...defaultWeeklyOptions, mode: 'range' as const, minRange: 4,
      });

      const days = currentWeek.value.days;
      listeners.selectRange(days[0]);
      listeners.selectRange(days[3]); // 4 days — exactly minRange=4

      expect(selectedDates.value).toHaveLength(2);
    });

    it('should reject range selection longer than maxRange', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek, listeners, selectedDates } = useWeeklyCalendar({
        ...defaultWeeklyOptions, mode: 'range' as const, maxRange: 3,
      });

      const days = currentWeek.value.days;
      listeners.selectRange(days[0]);
      listeners.selectRange(days[5]); // 6 days — exceeds maxRange=3

      expect(selectedDates.value).toHaveLength(1);
      expect(days[5].state.selected).toBe(false);
    });

    it('should accept range selection at exactly maxRange', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek, listeners, selectedDates } = useWeeklyCalendar({
        ...defaultWeeklyOptions, mode: 'range' as const, maxRange: 3,
      });

      const days = currentWeek.value.days;
      listeners.selectRange(days[0]);
      listeners.selectRange(days[2]); // 3 days — exactly maxRange=3

      expect(selectedDates.value).toHaveLength(2);
    });

    it('should block selection beyond maxSelections in multiple mode', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek, listeners, selectedDates } = useWeeklyCalendar({
        ...defaultWeeklyOptions, mode: 'multiple' as const, maxSelections: 2,
      });

      const days = currentWeek.value.days;
      listeners.selectMultiple(days[0]);
      listeners.selectMultiple(days[1]);
      listeners.selectMultiple(days[2]); // Should be blocked

      expect(selectedDates.value).toHaveLength(2);
      expect(days[2].state.selected).toBe(false);
    });

    it('should allow deselecting when at maxSelections', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek, listeners, selectedDates } = useWeeklyCalendar({
        ...defaultWeeklyOptions, mode: 'multiple' as const, maxSelections: 2,
      });

      const days = currentWeek.value.days;
      listeners.selectMultiple(days[0]);
      listeners.selectMultiple(days[1]);

      listeners.selectMultiple(days[0]); // Deselect one
      expect(selectedDates.value).toHaveLength(1);

      listeners.selectMultiple(days[2]); // Now allowed
      expect(selectedDates.value).toHaveLength(2);
    });

    it('should clamp hoverRange preview to maxRange', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek, listeners } = useWeeklyCalendar({
        ...defaultWeeklyOptions, mode: 'range' as const, maxRange: 3,
      });

      const days = currentWeek.value.days;
      listeners.selectRange(days[0]);
      listeners.hoverRange(days[6]); // Hover far beyond maxRange=3

      const hoveredDays = currentWeek.value.days.filter(d => d.state.hovered);
      expect(hoveredDays.length).toBeLessThanOrEqual(2);
      expect(hoveredDays.length).toBeGreaterThan(0);
    });
  });

  describe('onSelect callback', () => {
    it('should fire onSelect when a date is selected', async () => {
      const onSelect = vi.fn();
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek, listeners } = useWeeklyCalendar({ ...defaultWeeklyOptions, onSelect });

      listeners.selectSingle(currentWeek.value.days[0]);
      await nextTick();

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith([currentWeek.value.days[0]]);
    });

    it('should fire onSelect with empty array when selection is cleared', async () => {
      const onSelect = vi.fn();
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek, listeners, clearSelection } = useWeeklyCalendar({ ...defaultWeeklyOptions, onSelect });

      listeners.selectSingle(currentWeek.value.days[0]);
      await nextTick();
      onSelect.mockClear();

      clearSelection();
      await nextTick();

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith([]);
    });

    it('should fire onSelect for each selection in multiple mode', async () => {
      const onSelect = vi.fn();
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek, listeners } = useWeeklyCalendar({
        ...defaultWeeklyOptions, mode: 'multiple' as const, onSelect,
      });

      listeners.selectMultiple(currentWeek.value.days[0]);
      listeners.selectMultiple(currentWeek.value.days[1]);
      await nextTick();

      expect(onSelect).toHaveBeenCalledTimes(2);
      expect(onSelect).toHaveBeenLastCalledWith(
        expect.arrayContaining([currentWeek.value.days[0], currentWeek.value.days[1]]),
      );
    });
  });

  describe('isRangeStart / isRangeEnd', () => {
    it('should mark range start and end when two dates are selected', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek, listeners } = useWeeklyCalendar(defaultWeeklyOptions);

      const days = currentWeek.value.days;
      listeners.selectRange(days[0]);
      listeners.selectRange(days[5]);

      expect(days[0].state.isRangeStart).toBe(true);
      expect(days[0].state.isRangeEnd).toBe(false);
      expect(days[5].state.isRangeStart).toBe(false);
      expect(days[5].state.isRangeEnd).toBe(true);
    });

    it('should not mark range endpoints when only one date is selected', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek, listeners } = useWeeklyCalendar(defaultWeeklyOptions);

      const days = currentWeek.value.days;
      listeners.selectRange(days[2]);

      expect(days[2].state.isRangeStart).toBe(false);
      expect(days[2].state.isRangeEnd).toBe(false);
    });

    it('should clear range endpoints when selection is cleared', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek, listeners, clearSelection } = useWeeklyCalendar(defaultWeeklyOptions);

      const days = currentWeek.value.days;
      listeners.selectRange(days[0]);
      listeners.selectRange(days[5]);

      clearSelection();

      expect(days[0].state.isRangeStart).toBe(false);
      expect(days[5].state.isRangeEnd).toBe(false);
    });

    it('should update range endpoints when a new range is started', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek, listeners } = useWeeklyCalendar(defaultWeeklyOptions);

      const days = currentWeek.value.days;
      listeners.selectRange(days[0]);
      listeners.selectRange(days[5]);

      // 3rd click clears the previous range and starts fresh
      listeners.selectRange(days[3]);

      expect(days[0].state.isRangeStart).toBe(false);
      expect(days[5].state.isRangeEnd).toBe(false);
    });

    it('should handle reversed selection order correctly', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek, listeners } = useWeeklyCalendar(defaultWeeklyOptions);

      const days = currentWeek.value.days;
      // Select the chronologically later day first
      listeners.selectRange(days[5]);
      listeners.selectRange(days[1]);

      expect(days[1].state.isRangeStart).toBe(true);
      expect(days[5].state.isRangeEnd).toBe(true);
    });
  });

  describe('modelValue (v-model support)', () => {
    it('should sync internal selection to external modelValue ref', () => {
      const model = ref<Date[]>([]);
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek, listeners } = useWeeklyCalendar({ ...defaultWeeklyOptions, modelValue: model });

      const day = currentWeek.value.days[2];
      listeners.selectSingle(day);

      expect(model.value).toHaveLength(1);
      expect(isSameDay(model.value[0], day.date)).toBe(true);
    });

    it('should sync external modelValue changes to internal selection', async () => {
      const model = ref<Date[]>([]);
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { selectedDates, currentWeek } = useWeeklyCalendar({ ...defaultWeeklyOptions, modelValue: model });

      model.value = [currentWeek.value.days[3].date];
      await nextTick();

      expect(selectedDates.value).toHaveLength(1);
      expect(isSameDay(selectedDates.value[0].date, currentWeek.value.days[3].date)).toBe(true);
    });

    it('should clear internal selection when modelValue is set to empty', async () => {
      const model = ref<Date[]>([]);
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek, listeners, selectedDates } = useWeeklyCalendar({ ...defaultWeeklyOptions, modelValue: model });

      listeners.selectSingle(currentWeek.value.days[2]);
      expect(selectedDates.value).toHaveLength(1);

      model.value = [];
      await nextTick();

      expect(selectedDates.value).toHaveLength(0);
    });

    it('should not cause an infinite loop when modelValue is used', async () => {
      const model = ref<Date[]>([]);
      const onSelect = vi.fn();
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { currentWeek, listeners } = useWeeklyCalendar({ ...defaultWeeklyOptions, modelValue: model, onSelect });

      listeners.selectSingle(currentWeek.value.days[0]);
      await nextTick();

      expect(onSelect.mock.calls.length).toBeLessThan(10);
    });
  });

  describe('keyboard navigation', () => {
    it('should start with null focusedDayId', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { focusedDayId } = useWeeklyCalendar(defaultWeeklyOptions);

      expect(focusedDayId.value).toBeNull();
    });

    it('should focus first visible day on initial moveFocus', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { focusedDayId, moveFocus, currentWeek } = useWeeklyCalendar(defaultWeeklyOptions);

      moveFocus('right');

      expect(focusedDayId.value).toBe(currentWeek.value.days[0].id);
    });

    it('should move focus right by 1 day', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { focusedDayId, moveFocus, currentWeek } = useWeeklyCalendar(defaultWeeklyOptions);

      const days = currentWeek.value.days;
      focusedDayId.value = days[0].id;

      moveFocus('right');

      expect(focusedDayId.value).toBe(days[1].id);
    });

    it('should move focus left by 1 day', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { focusedDayId, moveFocus, currentWeek } = useWeeklyCalendar(defaultWeeklyOptions);

      const days = currentWeek.value.days;
      focusedDayId.value = days[4].id;

      moveFocus('left');

      expect(focusedDayId.value).toBe(days[3].id);
    });

    it('should select the focused day with selectFocused', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { focusedDayId, selectFocused, currentWeek, selectedDates } = useWeeklyCalendar(defaultWeeklyOptions);

      const days = currentWeek.value.days;
      focusedDayId.value = days[2].id;

      selectFocused();

      expect(selectedDates.value).toHaveLength(1);
      expect(selectedDates.value[0].id).toBe(days[2].id);
    });

    it('should skip disabled days when moving right', () => {
      const { useWeeklyCalendar } = useCalendar({
        startOn: mockToday,
        disabled: [new Date(2022, 2, 8)], // Tuesday = days[2]
      });
      const { focusedDayId, moveFocus, currentWeek } = useWeeklyCalendar(defaultWeeklyOptions);

      const days = currentWeek.value.days;
      focusedDayId.value = days[1].id; // Monday

      moveFocus('right');

      // Should skip Tuesday (disabled) and land on Wednesday
      expect(focusedDayId.value).toBe(days[3].id);
    });

    it('should expose focusToday as a function', () => {
      const { useWeeklyCalendar } = useCalendar(defaultOptions);
      const { focusToday } = useWeeklyCalendar(defaultWeeklyOptions);

      expect(typeof focusToday).toBe('function');
    });
  });
});
