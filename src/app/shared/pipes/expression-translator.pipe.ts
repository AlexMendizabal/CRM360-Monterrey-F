import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'expressionTranslator'
})
export class ExpressionTranslatorPipe implements PipeTransform {

  transform(value: string, ...args: any[]): string{

    if(value === undefined)
      return value

    args.map(arg => value = value.replace('@valor', arg));

    return value;
  
  }

}
