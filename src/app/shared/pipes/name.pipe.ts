import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'name'
})
export class NamePipe implements PipeTransform {
  transform(value: string): string {
    let valueSplit: any = value.split(' ');

    for (let i = 0; i < valueSplit.length; i++) {
      if (this.isInArray(valueSplit[i])) {
        valueSplit[i] = valueSplit[i].toLowerCase();
      } else {
        valueSplit[i] =
          valueSplit[i].charAt(0).toUpperCase() +
          valueSplit[i].slice(1).toLowerCase();
      }
    }

    valueSplit = valueSplit.join(' ');

    return valueSplit;
  }

  isInArray(str: string) {
    const forbiddenStr = ['da', 'das', 'de', 'do', 'dos'];

    return forbiddenStr.indexOf(str.toLowerCase()) > -1;
  }
}
