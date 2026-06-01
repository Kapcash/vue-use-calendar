import { addMonths, format as dateFormat } from 'date-fns';
import { computed, ComputedRef, MaybeRefOrGetter, toValue } from 'vue';
import { NormalizedCalendarOptions, MonthInputFormat } from '../types';

const NB_OF_MONTHS = 12;
const DEFAULT_MONTH_FORMAT = 'MMMM';

interface MonthsListOptions {
  format?: MaybeRefOrGetter<MonthInputFormat>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useMonthsList (opts: NormalizedCalendarOptions<any>): (options?: MonthsListOptions) => ComputedRef<string[]> {
  return (options: MonthsListOptions = {}): ComputedRef<string[]> => {
    const anyJanuary = new Date(2000, 0, 1);
    const months = Array.from(Array(NB_OF_MONTHS).keys()).map(i => addMonths(anyJanuary, i));

    return computed<string[]>(() => {
      return months.map(day => dateFormat(day, toValue(options.format) || DEFAULT_MONTH_FORMAT, { locale: opts.locale }));
    });
  };
}
