import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class SulFluminensePainelDecisaoFilterPipe implements PipeTransform {

  transform(value: any, arg: any): any {
    if (arg === '') return value;
    let aux = false;
    for(const unidade of value){
      if(unidade.CodigoNivelCritico == arg) {
        aux = true;
      };
    };

    return aux ? value : [];
  }

}
