import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchText: string, complexFilter?: any): any[] {
    if (!items) return [];
    if (!searchText && !complexFilter) return items;

    searchText = searchText.toLowerCase();

    if (complexFilter) {
      return items.filter((item) => {
        // Customize this condition based on your object's structure
        const distMatch = complexFilter.district
          ? item.district === complexFilter.district
          : true;
        const locationMatch =
          complexFilter.location && item.location
            ? item.location
                .toLowerCase()
                .includes(complexFilter.location.toLowerCase())
            : true;
        const groupMatch = complexFilter.group
          ? item.group === complexFilter.group
          : true;
        const availableStatusMatch = complexFilter.availableStatus
          ? item.availableStatus === complexFilter.availableStatus
          : true;

        return distMatch && locationMatch && groupMatch && availableStatusMatch;
      });
    }

    return items.filter((item) => {
      // Customize this condition based on your object's structure
      return (
        item.name?.toLowerCase().includes(searchText) ||
        item.district?.toLowerCase().includes(searchText) ||
        item.location?.toLowerCase().includes(searchText) ||
        item.displayName?.toLowerCase().includes(searchText) ||
        item.email?.toLowerCase().includes(searchText) ||
        item.group?.toLowerCase().includes(searchText)
      );
    });
  }
}
