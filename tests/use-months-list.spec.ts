import { describe, it, expect, vi, beforeAll } from 'vitest';
import { enUS } from 'date-fns/locale';
import { useCalendar } from '../lib';

describe('useMonthsList', () => {
  const locale = enUS;

  beforeAll(() => {
    vi.setSystemTime(new Date(2023, 5, 16));
  });

  it('should generate the 12 months with the default format.', () => {
    const { useMonthsList } = useCalendar({ locale });
    const monthsList = useMonthsList();

    expect(monthsList).toEqual(
      ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    );
  });

  it('should generate the 12 months with a custom format.', () => {
    const { useMonthsList } = useCalendar({ locale });
    const monthsList = useMonthsList({ format: 'MMM'});

    expect(monthsList).toEqual(
      ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    );
  });

});