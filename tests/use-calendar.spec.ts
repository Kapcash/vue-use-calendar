import { describe, expect, it, vi, beforeAll } from 'vitest';
import { isSameDay } from 'date-fns';
import { useCalendar } from '../lib/use-calendar';

const mockToday = new Date(2022, 2, 8);

beforeAll(() => {
  vi.setSystemTime(mockToday);
});

describe('use-calendar main composable', () => {
  it('returns all sub-composables', () => {
    const calendar = useCalendar({ startOn: new Date() });

    expect(Object.keys(calendar)).toEqual(
      expect.arrayContaining(['useWeekdays', 'useMonthlyCalendar', 'useWeeklyCalendar', 'useMonthsList', 'useYearsList']),
    );
  });

  describe('normalizeGlobalParameters', () => {
    it('should accept startOn as an ISO string', () => {
      const { useMonthlyCalendar } = useCalendar({ startOn: '2022-03-15' });
      const { currentMonthAndYear } = useMonthlyCalendar({ infinite: true });

      expect(currentMonthAndYear.month).toEqual(2); // March = 2
      expect(currentMonthAndYear.year).toEqual(2022);
    });

    it('should accept disabled dates as ISO strings', () => {
      const { useMonthlyCalendar } = useCalendar({
        startOn: new Date(2022, 2, 1),
        disabled: ['2022-03-16'],
      });
      const { currentMonth } = useMonthlyCalendar({ infinite: true, fullWeeks: false });

      const march16 = currentMonth.value.days.find(d => d.date.getDate() === 16);
      expect(march16).toBeDefined();
      expect(march16!.state.disabled).toBeTruthy();

      const march17 = currentMonth.value.days.find(d => d.date.getDate() === 17);
      expect(march17?.state.disabled).toBeFalsy();
    });

    it('should default startOn to minDate when no startOn is provided', () => {
      const minDate = new Date(2023, 5, 1);
      const { useMonthlyCalendar } = useCalendar({ minDate });
      const { currentMonthAndYear } = useMonthlyCalendar({ infinite: true });

      expect(currentMonthAndYear.month).toEqual(5); // June = 5
      expect(currentMonthAndYear.year).toEqual(2023);
    });

    it('should default startOn to today when neither startOn nor minDate is provided', () => {
      const { useMonthlyCalendar } = useCalendar({});
      const { currentMonthAndYear } = useMonthlyCalendar({ infinite: true });

      expect(currentMonthAndYear.month).toEqual(mockToday.getMonth());
      expect(currentMonthAndYear.year).toEqual(mockToday.getFullYear());
    });

    it('should accept preSelection as a single Date (not an array)', () => {
      const preSelected = new Date(2022, 2, 20);
      const { useMonthlyCalendar } = useCalendar({
        startOn: new Date(2022, 2, 1),
        preSelection: preSelected,
      });
      const { selectedDates } = useMonthlyCalendar({ infinite: true, fullWeeks: false });

      expect(selectedDates.value).toHaveLength(1);
      expect(isSameDay(selectedDates.value[0].date, preSelected)).toBeTruthy();
    });
  });

  describe('mode narrowing — monthly calendar', () => {
    it('should expose only selectSingle for mode: single', () => {
      const { useMonthlyCalendar } = useCalendar({ startOn: new Date(2022, 2, 1), mode: 'single' as const });
      const { listeners } = useMonthlyCalendar({ infinite: true });

      expect(Object.keys(listeners)).toEqual(['selectSingle']);
    });

    it('should expose only range handlers for mode: range', () => {
      const { useMonthlyCalendar } = useCalendar({ startOn: new Date(2022, 2, 1), mode: 'range' as const });
      const { listeners } = useMonthlyCalendar({ infinite: true });

      expect(Object.keys(listeners)).toEqual(
        expect.arrayContaining(['selectRange', 'hoverRange', 'resetHover']),
      );
      expect(Object.keys(listeners)).toHaveLength(3);
    });

    it('should expose only selectMultiple for mode: multiple', () => {
      const { useMonthlyCalendar } = useCalendar({ startOn: new Date(2022, 2, 1), mode: 'multiple' as const });
      const { listeners } = useMonthlyCalendar({ infinite: true });

      expect(Object.keys(listeners)).toEqual(['selectMultiple']);
    });

    it('should expose all 5 handlers when no mode is provided', () => {
      const { useMonthlyCalendar } = useCalendar({ startOn: new Date(2022, 2, 1) });
      const { listeners } = useMonthlyCalendar({ infinite: true });

      expect(Object.keys(listeners)).toHaveLength(5);
    });
  });
});