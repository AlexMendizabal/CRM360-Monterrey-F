import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberInt'
})
export class NumberIntPipe implements PipeTransform {

  transform(value, ...args) {
    let argumento = args.toString()
    let inteiro = parseInt(value)
    if(argumento == 'UN' || argumento == 'PC' && value != null){
      return inteiro;
    }
    if (Number.isNaN(value)){
      return
    }
    if(!parseFloat(value)){
      return
    }
    if(value < 1 && value > -1){
      let _valor = value.toString()
      return (0 + _valor)
    }
    return value
  }

}
