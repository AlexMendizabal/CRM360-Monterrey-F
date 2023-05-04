import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//components
import { TecnologiaInformacaoEstoqueMarcasListaComponent } from './lista/lista.component';
import { TecnologiaInformacaoEstoqueMarcasCadastroComponent } from './cadastro/cadastro.component';

const routes: Routes = [
  {
    path: '',
    component: TecnologiaInformacaoEstoqueMarcasListaComponent,
  },
  {
    path: 'novo',
    component: TecnologiaInformacaoEstoqueMarcasCadastroComponent,
  },
  {
    path: ':id',
    component: TecnologiaInformacaoEstoqueMarcasCadastroComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TecnologiaInformacaoEstoqueMarcasModuleRoutingModule {}
