import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'segmentedFilter',
})
export class SegmentedFilterPipe implements PipeTransform {
  transform(items: any[], searchList: string[], property: string): any[] {
    if (!items.length) return [];
    if (!searchList.length) return items;

    return items.filter((item) => {
      // Customize this condition based on your object's structure
      return searchList.includes(item[property]);
    });
  }
}
