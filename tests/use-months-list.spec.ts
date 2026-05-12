import { describe, it, expect, vi, beforeAll } from 'vitest';
import { enUS, fr } from 'date-fns/locale';
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

  it('should generate months as zero-padded numbers with format MM', () => {
    const { useMonthsList } = useCalendar({ locale });
    const monthsList = useMonthsList({ format: 'MM' });

    expect(monthsList).toEqual(
      ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
    );
  });

  it('should generate months as plain numbers with format M', () => {
    const { useMonthsList } = useCalendar({ locale });
    const monthsList = useMonthsList({ format: 'M' });

    expect(monthsList).toEqual(
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    );
  });

  it('should generate month names in French with the fr locale', () => {
    const { useMonthsList } = useCalendar({ locale: fr });
    const monthsList = useMonthsList();

    expect(monthsList).toHaveLength(12);
    expect(monthsList[0]).toEqual('janvier');
    expect(monthsList[11]).toEqual('décembre');
  });

  it('should generate abbreviated French month names', () => {
    const { useMonthsList } = useCalendar({ locale: fr });
    const monthsList = useMonthsList({ format: 'MMM' });

    expect(monthsList).toHaveLength(12);
    expect(monthsList[0]).toEqual('janv.');
  });

});