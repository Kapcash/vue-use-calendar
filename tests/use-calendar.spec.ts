import { describe, expect, it, vi, beforeAll } from 'vitest';
import { isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ref, nextTick } from 'vue';
import { useCalendar } from '../lib/use-calendar';
import type { FirstDayOfWeek } from '../lib/types';

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
      const { useMonthlyCalendar } = useCalendar({ startOn: new Date(2022, 2, 1) });
      const { listeners } = useMonthlyCalendar({ infinite: true, mode: 'single' as const });

      expect(Object.keys(listeners)).toEqual(['selectSingle']);
    });

    it('should expose only range handlers for mode: range', () => {
      const { useMonthlyCalendar } = useCalendar({ startOn: new Date(2022, 2, 1) });
      const { listeners } = useMonthlyCalendar({ infinite: true, mode: 'range' as const });

      expect(Object.keys(listeners)).toEqual(
        expect.arrayContaining(['selectRange', 'hoverRange', 'resetHover']),
      );
      expect(Object.keys(listeners)).toHaveLength(3);
    });

    it('should expose only selectMultiple for mode: multiple', () => {
      const { useMonthlyCalendar } = useCalendar({ startOn: new Date(2022, 2, 1) });
      const { listeners } = useMonthlyCalendar({ infinite: true, mode: 'multiple' as const });

      expect(Object.keys(listeners)).toEqual(['selectMultiple']);
    });

    it('should expose all 5 handlers when no mode is provided', () => {
      const { useMonthlyCalendar } = useCalendar({ startOn: new Date(2022, 2, 1) });
      const { listeners } = useMonthlyCalendar({ infinite: true });

      expect(Object.keys(listeners)).toHaveLength(5);
    });
  });
});

describe('reactive top-level parameters', () => {
  describe('useWeekdays with firstDayOfWeek ref', () => {
    it('reorders weekdays immediately when firstDayOfWeek ref changes', async () => {
      const firstDayOfWeek = ref<FirstDayOfWeek>(0); // Sunday
      const { useWeekdays } = useCalendar({ firstDayOfWeek });
      const weekdays = useWeekdays('iiii');

      expect(weekdays.value[0]).toBe('Sunday');

      firstDayOfWeek.value = 1; // Monday
      await nextTick();

      expect(weekdays.value[0]).toBe('Monday');
      expect(weekdays.value[6]).toBe('Sunday');
    });
  });

  describe('useMonthsList with locale ref', () => {
    it('updates month names immediately when locale ref changes', async () => {
      const locale = ref<typeof fr | undefined>(undefined);
      const { useMonthsList } = useCalendar({ locale });
      const months = useMonthsList();

      expect(months.value[0]).toBe('January'); // English default

      locale.value = fr;
      await nextTick();

      expect(months.value[0]).toBe('janvier'); // French
      expect(months.value[1]).toBe('février');
    });
  });

  describe('useWeekdays with locale ref', () => {
    it('updates weekday names immediately when locale ref changes', async () => {
      const locale = ref<typeof fr | undefined>(undefined);
      const { useWeekdays } = useCalendar({ locale });
      const weekdays = useWeekdays('iiii');

      expect(weekdays.value[0]).toBe('Sunday'); // English default

      locale.value = fr;
      await nextTick();

      expect(weekdays.value[0]).toBe('dimanche'); // French
    });
  });

  describe('monthly calendar with disabled ref', () => {
    it('applies updated disabled dates to newly navigated months', async () => {
      const disabled = ref<Date[]>([]);
      const { useMonthlyCalendar } = useCalendar({
        startOn: new Date(2022, 2, 1), // March 2022
        disabled,
      });
      const { days, nextMonth } = useMonthlyCalendar({ infinite: true, fullWeeks: false });

      // No disabled dates in March initially
      expect(days.value.every(d => !d.state.disabled)).toBeTruthy();

      // Add April 10 as a disabled date before navigating to April
      disabled.value = [new Date(2022, 3, 10)];
      nextMonth(); // generates April using the updated ref
      await nextTick();

      const april10 = days.value.find(d => d.date.getDate() === 10 && d.date.getMonth() === 3);
      expect(april10).toBeDefined();
      expect(april10!.state.disabled).toBeTruthy();

      const april11 = days.value.find(d => d.date.getDate() === 11 && d.date.getMonth() === 3);
      expect(april11).toBeDefined();
      expect(april11!.state.disabled).toBeFalsy();
    });
  });

  describe('monthly calendar with minDate ref', () => {
    it('applies updated minDate to newly navigated months', async () => {
      const minDate = ref<Date>(new Date(2022, 2, 1)); // March 1 — all March days enabled
      const { useMonthlyCalendar } = useCalendar({
        startOn: new Date(2022, 2, 1),
        minDate,
      });
      const { days, nextMonth } = useMonthlyCalendar({ infinite: true, fullWeeks: false });

      // All days in March are enabled (minDate is March 1)
      expect(days.value.every(d => !d.state.disabled)).toBeTruthy();

      // Move minDate to April 15 before navigating to April
      minDate.value = new Date(2022, 3, 15);
      nextMonth(); // generates April using the updated minDate
      await nextTick();

      const april14 = days.value.find(d => d.date.getDate() === 14 && d.date.getMonth() === 3);
      expect(april14).toBeDefined();
      expect(april14!.state.disabled).toBeTruthy();

      const april15 = days.value.find(d => d.date.getDate() === 15 && d.date.getMonth() === 3);
      expect(april15).toBeDefined();
      expect(april15!.state.disabled).toBeFalsy();
    });
  });

  describe('weekly calendar with disabled ref', () => {
    it('applies updated disabled dates to newly navigated weeks', async () => {
      const disabled = ref<Date[]>([]);
      const { useWeeklyCalendar } = useCalendar({
        startOn: new Date(2022, 2, 6), // week of March 6–12, 2022 (firstDayOfWeek=0)
        disabled,
      });
      const { days, nextWeek } = useWeeklyCalendar({ infinite: true });

      // No disabled days in the first week
      expect(days.value.every(d => !d.state.disabled)).toBeTruthy();

      // Add March 15 as disabled before navigating to the next week (March 13–19)
      disabled.value = [new Date(2022, 2, 15)];
      nextWeek();
      await nextTick();

      const march15 = days.value.find(d => d.date.getDate() === 15 && d.date.getMonth() === 2);
      expect(march15).toBeDefined();
      expect(march15!.state.disabled).toBeTruthy();

      const march14 = days.value.find(d => d.date.getDate() === 14 && d.date.getMonth() === 2);
      expect(march14).toBeDefined();
      expect(march14!.state.disabled).toBeFalsy();
    });
  });

  describe('monthly calendar — already-cached days update when disabled ref changes', () => {
    it('updates disabled state for already-generated days in the current month', async () => {
      const disabled = ref<Date[]>([]);
      const { useMonthlyCalendar } = useCalendar({
        startOn: new Date(2022, 2, 1),
        disabled,
      });
      const { days } = useMonthlyCalendar({ infinite: true, fullWeeks: false });

      const march10 = days.value.find(d => d.date.getDate() === 10 && d.date.getMonth() === 2);
      expect(march10).toBeDefined();
      expect(march10!.state.disabled).toBeFalsy();

      disabled.value = [new Date(2022, 2, 10)];
      await nextTick();

      expect(march10!.state.disabled).toBeTruthy();

      const march11 = days.value.find(d => d.date.getDate() === 11 && d.date.getMonth() === 2);
      expect(march11!.state.disabled).toBeFalsy();
    });

    it('clears disabled state when a date is removed from the disabled ref', async () => {
      const disabled = ref<Date[]>([new Date(2022, 2, 10)]);
      const { useMonthlyCalendar } = useCalendar({
        startOn: new Date(2022, 2, 1),
        disabled,
      });
      const { days } = useMonthlyCalendar({ infinite: true, fullWeeks: false });

      const march10 = days.value.find(d => d.date.getDate() === 10 && d.date.getMonth() === 2);
      expect(march10!.state.disabled).toBeTruthy();

      disabled.value = [];
      await nextTick();

      expect(march10!.state.disabled).toBeFalsy();
    });
  });

  describe('weekly calendar — already-cached days update when disabled ref changes', () => {
    it('updates disabled state for already-generated days in the current week', async () => {
      const disabled = ref<Date[]>([]);
      const { useWeeklyCalendar } = useCalendar({
        startOn: new Date(2022, 2, 6),
        disabled,
      });
      const { days } = useWeeklyCalendar({ infinite: true });

      const march8 = days.value.find(d => d.date.getDate() === 8 && d.date.getMonth() === 2);
      expect(march8).toBeDefined();
      expect(march8!.state.disabled).toBeFalsy();

      disabled.value = [new Date(2022, 2, 8)];
      await nextTick();

      expect(march8!.state.disabled).toBeTruthy();

      const march7 = days.value.find(d => d.date.getDate() === 7 && d.date.getMonth() === 2);
      expect(march7!.state.disabled).toBeFalsy();
    });

    it('clears disabled state when a date is removed from the disabled ref', async () => {
      const disabled = ref<Date[]>([new Date(2022, 2, 8)]);
      const { useWeeklyCalendar } = useCalendar({
        startOn: new Date(2022, 2, 6),
        disabled,
      });
      const { days } = useWeeklyCalendar({ infinite: true });

      const march8 = days.value.find(d => d.date.getDate() === 8 && d.date.getMonth() === 2);
      expect(march8!.state.disabled).toBeTruthy();

      disabled.value = [];
      await nextTick();

      expect(march8!.state.disabled).toBeFalsy();
    });
  });
});