import { addYears, format as formatDate } from 'date-fns';
import { StringList, NormalizedCalendarOptions, YearsListOptions } from '../types';

const DEFAULT_YEARS_AMOUNT = 10;
const DEFAULT_YEAR_FORMAT = 'yyyy';

/** Generates a consecutive list of years formatted as strings. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useYearsList ({ locale }: NormalizedCalendarOptions<any, any>): (options?: YearsListOptions) => StringList {
  return ({ format, fromYear, toYear, amount }: YearsListOptions = {}): StringList => {
    const currentYear = new Date().getFullYear();
    fromYear ||= currentYear;

    if (!toYear && !amount) {
      toYear = currentYear + DEFAULT_YEARS_AMOUNT;
      amount = DEFAULT_YEARS_AMOUNT;
    }

    if (toYear && fromYear > toYear) {
      [fromYear, toYear] = [toYear, fromYear];
    }

    const anyJanuary = new Date(fromYear, 0, 1);
    const nbOfYears: number = toYear ? toYear - fromYear + 1 : amount!; // +1 because we include the last year

    const years = Array.from(Array(nbOfYears).keys()).map(i => addYears(anyJanuary, i));

    return years.map(day => formatDate(day, format || DEFAULT_YEAR_FORMAT, { locale }));
  };
}
