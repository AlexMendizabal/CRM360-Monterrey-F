import { NumberIntPipe } from './number-int.pipe';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


@NgModule({
  declarations: [ NumberIntPipe ],
  imports: [
    CommonModule
  ],
  exports:[
    NumberIntPipe
  ]
})
export class TecnologiaInformacaoEstoquePipesModule { 

}
