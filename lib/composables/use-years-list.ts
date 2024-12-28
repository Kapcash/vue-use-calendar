import { addYears, format as formatDate } from 'date-fns';
import { GeneratorComposable, NormalizedCalendarOptions, YearInputFormat } from '../types';

const DEFAULT_YEARS_AMOUNT = 10;
const DEFAULT_YEAR_FORMAT = 'yyyy';

interface YearsListOptions {
  /** The generated year format. Defaults to `yyyy`.
   * @see https://date-fns.org/v2.21.3/docs/format
   */
  format?: YearInputFormat;
  /** The initial year of the list. Defaults to 10. */
  fromYear?: number;
  /** The final year of the list. Takes precedence over the `amount` option */
  toYear?: number;
  /** The amount of years to generate. */
  amount?: number;
}

/** Generates a consecutive list of years formatted as strings. */
export function useYearsList ({ locale }: NormalizedCalendarOptions): (options?: YearsListOptions) => GeneratorComposable {
  return ({ format, fromYear, toYear, amount }: YearsListOptions = {}): Array<string> => {
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
