import { addMonths, format as dateFormat } from 'date-fns';
import { GeneratorComposable, NormalizedCalendarOptions, MonthInputFormat } from '../types';

const NB_OF_MONTHS = 12;
const DEFAULT_YEAR_FORMAT = 'MMMM';

interface MonthsListOptions {
  format?: MonthInputFormat;
}

export function useMonthsList ({ locale }: NormalizedCalendarOptions): (options?: MonthsListOptions) => GeneratorComposable {
  return ({ format }: MonthsListOptions = {}): Array<string> => {
    const anyJanuary = new Date(2000, 0, 1);
    const months = Array.from(Array(NB_OF_MONTHS).keys()).map(i => addMonths(anyJanuary, i));

    return months.map(day => dateFormat(day, format || DEFAULT_YEAR_FORMAT, { locale }));
  };
}
