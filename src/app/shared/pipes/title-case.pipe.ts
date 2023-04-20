import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'titleCase'
})
export class TitleCasePipe implements PipeTransform {
  transform(value: string): string {
    if (value === null || value === undefined || typeof value === 'undefined')
      return value;

    value = value.toLocaleLowerCase();
    let valueSplit: any = value.split(' ');

    for (let i = 0; i < valueSplit.length; i++) {
      if (!this.forbiddenWords(valueSplit[i]) && valueSplit[i].length <= 3) {
        valueSplit[i] = valueSplit[i].toUpperCase();
      } else {
        valueSplit[i] = this.exceptionWords(valueSplit[i]);
      }
    }

    valueSplit = valueSplit.join(' ');

    return valueSplit.charAt(0).toUpperCase() + valueSplit.slice(1);
  }

  forbiddenWords(string: string) {
    const strings = ['da', 'das', 'de', 'do', 'dos', 'com'];

    return strings.indexOf(string) > -1;
  }

  exceptionWords(string: string) {
    const strings = ['manetoni', 'arcelor', 'mittal', 'software', 'duque'];

    if (strings.indexOf(string) > -1) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    return string;
  }
}
