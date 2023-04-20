import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//components
import { TecnologiaInformacaoEstoquePainelAprovacaoListaComponent } from './lista/lista.component';

const routes: Routes = [
  {
    path: '',
    component: TecnologiaInformacaoEstoquePainelAprovacaoListaComponent,
  },
  {
    path: 'lista',
    component: TecnologiaInformacaoEstoquePainelAprovacaoListaComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TecnologiaInformacaoEstoquePainelAprovacaoRoutingModule {}
