import { describe, expect, it } from 'vitest';
import { useCalendar } from '../lib/use-calendar';

describe('use-calendar main composable', () => {
  it('returns main sub composables', () => {
    const calendar = useCalendar({
      from: new Date(),
    });

    expect(Object.keys(calendar)).toEqual(expect.arrayContaining(['useWeekdays', 'useMonthlyCalendar', 'useWeeklyCalendar']));
  });
});