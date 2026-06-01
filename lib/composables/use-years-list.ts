import { addYears, format as formatDate } from 'date-fns';
import { computed, ComputedRef, toValue } from 'vue';
import { NormalizedCalendarOptions, YearsListOptions } from '../types';

const DEFAULT_YEARS_AMOUNT = 10;
const DEFAULT_YEAR_FORMAT = 'yyyy';

/** Generates a consecutive list of years formatted as strings. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useYearsList (opts: NormalizedCalendarOptions<any>): (options?: YearsListOptions) => ComputedRef<string[]> {
  return (options: YearsListOptions = {}): ComputedRef<string[]> => {
    const currentYear = new Date().getFullYear();

    // Compute normalized parameters with defaults applied
    const normalizedParams = computed<{ fromYear: number; toYear: number | undefined; amount: number }>(() => {
      let fromYear = toValue(options.fromYear) || currentYear;
      let toYear = toValue(options.toYear);
      let amount = toValue(options.amount);

      if (!toYear && !amount) {
        toYear = currentYear + DEFAULT_YEARS_AMOUNT;
        amount = DEFAULT_YEARS_AMOUNT;
      }

       if (toYear && fromYear > toYear) {
        [fromYear, toYear] = [toYear, fromYear];
      }

      return { fromYear, toYear, amount: amount || 0 };
    });

    // Compute number of years to generate
    const yearsCount = computed<number>(() => {
      const { fromYear, toYear } = normalizedParams.value;
      const { amount } = normalizedParams.value;
      return toYear ? toYear - fromYear + 1 : amount; // +1 because we include the last year
    });

    // Compute array of year dates
    const yearsDates = computed<Date[]>(() => {
      const { fromYear } = normalizedParams.value;
      const nbOfYears = yearsCount.value;
      const anyJanuary = new Date(fromYear, 0, 1);

      return Array.from(Array(nbOfYears).keys()).map(i => addYears(anyJanuary, i));
    });

    // Compute formatted years
    return computed<string[]>(() => {
      return yearsDates.value.map(day =>
        formatDate(day, toValue(options.format) || DEFAULT_YEAR_FORMAT, { locale: opts.locale }),
      );
    });
  };
}
