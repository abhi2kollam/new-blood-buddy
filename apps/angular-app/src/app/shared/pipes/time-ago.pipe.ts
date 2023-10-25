import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo'
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: string): string {
    const currentDate = new Date();
    const previousDate = new Date(value);
    const timeDiff = Math.abs(currentDate.getTime() - previousDate.getTime());
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    const monthsDiff = Math.floor(daysDiff / 30);
    const remainingDays = daysDiff % 30;

    let result = '';

    if (monthsDiff > 0) {
      result += `${monthsDiff} month${monthsDiff > 1 ? 's' : ''}`;
    }

    if (remainingDays > 0) {
      if (result !== '') {
        result += ' ';
      }
      result += `${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
    }

    result += ' ago';

    return result;
  }
}
