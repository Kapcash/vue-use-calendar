import { describe, it, expect, vi, beforeAll } from 'vitest';
import { enUS } from 'date-fns/locale';
import { ref } from 'vue';
import { YearInputFormat } from '../lib/types';
import { useCalendar } from '../lib';

describe('useYearsList', () => {
  const locale = enUS;

  beforeAll(() => {
    vi.setSystemTime(new Date(2023, 5, 16));
  });

  it('should generate 10 years by default, from the current year to 10 years in the future.', () => {
    const { useYearsList } = useCalendar({ locale });
    const yearsList = useYearsList();

    expect(yearsList.value).toEqual(
      ["2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030", "2031", "2032", "2033"],
    );
  });

  it('should generate a list of years with custom format', () => {
    const { useYearsList } = useCalendar({ locale });
    const yearsList = useYearsList({ format: 'yy' });

    expect(yearsList.value).toEqual(
      ["23","24","25","26","27","28","29","30","31","32", "33"],
    );
  });

  it('should generate a list of years within a custom range', () => {
    const { useYearsList } = useCalendar({ locale });
    const fromYear = 2000;
    const toYear = 2009;
    const yearsList = useYearsList({ fromYear, toYear });
    expect(yearsList.value).toEqual(
      ["2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009"],
    );
  });

  it('should handle a single year range', () => {
    const { useYearsList } = useCalendar({ locale });
    const fromYear = 2020;
    const toYear = 2021;
    const yearsList = useYearsList({ fromYear, toYear });
    const expectedYears = ['2020', '2021'];

    expect(yearsList.value).toEqual(expectedYears);
  });

  it('should handle an empty range', () => {
    const { useYearsList } = useCalendar({ locale });
    const fromYear = 2020;
    const toYear = 2020;

    const yearsList = useYearsList({ fromYear, toYear });
    expect(yearsList.value).toEqual(["2020"]);
  });

  it('should handle reversed bounds', () => {
    const { useYearsList } = useCalendar({ locale });
    const fromYear = 2030;
    const toYear = 2025;

    const yearsList = useYearsList({ fromYear, toYear });
    expect(yearsList.value).toEqual(["2025", "2026", "2027", "2028", "2029", "2030"]);
  });

  it('should generate the given amount of years', () => {
    const { useYearsList } = useCalendar({ locale });
    const fromYear = 2025;
    const amount = 4;

    const yearsList = useYearsList({ fromYear, amount });
    expect(yearsList.value).toEqual(["2025", "2026", "2027", "2028"]);
    expect(yearsList.value).toHaveLength(amount);
  });

  it('should discard the amount of years if the target year is given', () => {
    const { useYearsList } = useCalendar({ locale });
    const fromYear = 2023;
    const toYear = 2028;
    const amount = 4;

    const yearsList = useYearsList({ fromYear, toYear, amount });
    expect(yearsList.value).toEqual(["2023", "2024", "2025", "2026", "2027", "2028"]);
  });

  it('should generate a list of years with default format', () => {
    const { useYearsList } = useCalendar({ locale });
    const yearsList = useYearsList({ fromYear: 2020, toYear: 2025 });

    expect(yearsList.value).toEqual(
      ["2020", "2021", "2022", "2023", "2024", "2025"],
    );
  });

  describe('reactivity', () => {
    it('should update when fromYear ref changes', () => {
      const { useYearsList } = useCalendar({ locale });
      const fromYear = ref(2020);
      const yearsList = useYearsList({ fromYear, toYear: 2022 });

      expect(yearsList.value[0]).toEqual('2020');

      fromYear.value = 2021;
      expect(yearsList.value[0]).toEqual('2021');
      expect(yearsList.value).toHaveLength(2); // 2021–2022
    });

    it('should update when toYear ref changes', () => {
      const { useYearsList } = useCalendar({ locale });
      const toYear = ref(2025);
      const yearsList = useYearsList({ fromYear: 2023, toYear });

      expect(yearsList.value).toHaveLength(3); // 2023–2025

      toYear.value = 2027;
      expect(yearsList.value).toHaveLength(5); // 2023–2027
      expect(yearsList.value[4]).toEqual('2027');
    });

    it('should update when format ref changes', () => {
      const { useYearsList } = useCalendar({ locale });
      const format = ref<YearInputFormat>('yyyy');
      const yearsList = useYearsList({ fromYear: 2020, toYear: 2021, format });

      expect(yearsList.value).toEqual(['2020', '2021']);

      format.value = 'yy';
      expect(yearsList.value).toEqual(['20', '21']);
    });

    it('should update when amount ref changes', () => {
      const { useYearsList } = useCalendar({ locale });
      const amount = ref(3);
      const yearsList = useYearsList({ fromYear: 2020, amount });

      expect(yearsList.value).toHaveLength(3);

      amount.value = 5;
      expect(yearsList.value).toHaveLength(5);
    });

    it('should work with getter functions', () => {
      const { useYearsList } = useCalendar({ locale });
      const yearsList = useYearsList({
        fromYear: () => 2030,
        toYear: () => 2032,
        format: () => 'yy' as YearInputFormat,
      });

      expect(yearsList.value).toEqual(['30', '31', '32']);
    });
  });
});