import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//components
import { TecnologiaInformacaoEstoqueTipoProdutosListaComponent } from './lista/lista.component';
import { TecnologiaInformacaoEstoqueTipoProdutosCadastroComponent } from './cadastro/cadastro.component';

const routes: Routes = [
  {
    path: '',
    component: TecnologiaInformacaoEstoqueTipoProdutosListaComponent,
  },
  {
    path: 'novo',
    component: TecnologiaInformacaoEstoqueTipoProdutosCadastroComponent,
  },
  {
    path: ':id',
    component: TecnologiaInformacaoEstoqueTipoProdutosCadastroComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TecnologiaInformacaoEstoqueTipoProdutosModuleRoutingModule {}
