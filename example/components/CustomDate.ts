import { CalendarDate } from './../../lib/CalendarDate';

export class CustomDate extends CalendarDate {
  price = 0;

  setPrice(p: number) {
    this.price = p;
  }
}