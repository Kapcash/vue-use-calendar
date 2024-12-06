import { CalendarDate, DateConstructorParameters } from '../../lib/models/CalendarDate';

export class CustomDate extends CalendarDate {
  price: number = 0;

  constructor(...args: DateConstructorParameters) {
    super(...args);
    this.price = 0;
  }
}