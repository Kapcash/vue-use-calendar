import { describe, expect, it } from 'vitest';
import { fr } from 'date-fns/locale';
import { FirstDayOfWeek } from '../lib/types';
import { useCalendar } from '../lib/use-calendar';

const defaultOptions = { startOn: new Date() };

describe('use-weekdays', () => {
  it('should returns 7 days', () => {
    const { useWeekdays } = useCalendar(defaultOptions);

    const weekdays = useWeekdays();

    expect(weekdays).toHaveLength(7);
  });

  const firstDayOfWeekInputs: Array<FirstDayOfWeek> = [1, 2, 6];
  firstDayOfWeekInputs.map((firstDayOfWeek) => {
    return it(`should offset days by firstDayOfWeek when it's ${firstDayOfWeek}`, () => {
      const { useWeekdays } = useCalendar({ ...defaultOptions, firstDayOfWeek });
      const weekdays = useWeekdays();

      const defaultExpected = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      const offsetArray = [...defaultExpected.slice(firstDayOfWeek), ...defaultExpected.slice(0, firstDayOfWeek)];
      expect(weekdays).toEqual(offsetArray);
    });
  });

  describe('default locale (en)', () => {
    it('should returns 7 days in default format', () => {
      const { useWeekdays } = useCalendar(defaultOptions);
      const weekdays = useWeekdays();
  
      expect(weekdays).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S']);
    });

    it('should returns 7 days with custom format', () => {
      const { useWeekdays } = useCalendar(defaultOptions);
      const weekdays = useWeekdays('iii');
  
      expect(weekdays).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    });
  });

  describe('additional firstDayOfWeek values', () => {
    it('should start on Sunday when firstDayOfWeek is 0 (default)', () => {
      const { useWeekdays } = useCalendar({ ...defaultOptions, firstDayOfWeek: 0 });
      const weekdays = useWeekdays();

      expect(weekdays[0]).toEqual('S'); // Sunday
    });

    it('should start on Wednesday when firstDayOfWeek is 3', () => {
      const { useWeekdays } = useCalendar({ ...defaultOptions, firstDayOfWeek: 3 });
      const weekdays = useWeekdays();

      const defaultOrder = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      const expected = [...defaultOrder.slice(3), ...defaultOrder.slice(0, 3)];
      expect(weekdays).toEqual(expected);
    });

    it('should start on Saturday when firstDayOfWeek is 6', () => {
      const { useWeekdays } = useCalendar({ ...defaultOptions, firstDayOfWeek: 6 });
      const weekdays = useWeekdays('iiii');

      expect(weekdays[0]).toEqual('Saturday');
    });
  });

  describe('custom locale (fr)', () => {
    const frenchOptions = { ...defaultOptions, locale: fr };

    it('should returns 7 days in default format', () => {
      const { useWeekdays } = useCalendar(frenchOptions);
      const weekdays = useWeekdays();
  
      expect(weekdays).toEqual(['D', 'L', 'M', 'M', 'J', 'V', 'S']);
    });

    it('should returns 7 days with custom format', () => {
      const { useWeekdays } = useCalendar(frenchOptions);
      const weekdays = useWeekdays('iii');
  
      expect(weekdays).toEqual(['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.']);
    });
  });
});