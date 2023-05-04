import { PipeTransform, Pipe } from '@angular/core';

@Pipe({ name: 'upperCase' })
export class UpperCasePipe implements PipeTransform {
  constructor() {}

  transform(string: string): string {
    return string.toUpperCase();
  }
}
