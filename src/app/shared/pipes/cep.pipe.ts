import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'cep' })
export class CEPPipe implements PipeTransform {
  transform(value) {

    return value.replace(
      /(\d{1})(\d{2})(\d{3})/g,
      '$1.$2-$3'
    );
  }
}
