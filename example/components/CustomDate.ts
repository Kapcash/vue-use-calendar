import { ICalendarDate } from '../../lib/models/CalendarDate';

export interface CustomDate extends ICalendarDate {
  price: number;
}