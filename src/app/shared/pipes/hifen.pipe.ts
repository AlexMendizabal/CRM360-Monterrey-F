import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'hifen' })
export class HifenPipe implements PipeTransform {
  transform(value) {
    return value ? value : '-';
  }
}
