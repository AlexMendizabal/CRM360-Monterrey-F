import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//components
import { TecnologiaInformacaoEstoqueNivelEstoqueListaComponent } from './lista/lista.component';
import { TecnologiaInformacaoEstoqueNivelEstoqueCadastroComponent } from './cadastro/cadastro.component';

const routes: Routes = [
  {
    path: '',
    component: TecnologiaInformacaoEstoqueNivelEstoqueListaComponent,
  },
  {
    path: 'novo',
    component: TecnologiaInformacaoEstoqueNivelEstoqueCadastroComponent,
  },
  {
    path: ':id',
    component: TecnologiaInformacaoEstoqueNivelEstoqueCadastroComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TecnologiaInformacaoEstoqueNivelEstoqueModuleRoutingModule {}
