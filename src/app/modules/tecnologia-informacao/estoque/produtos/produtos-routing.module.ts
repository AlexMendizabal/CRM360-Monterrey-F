import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//components
import { TecnologiaInformacaoEstoqueProdutosListaComponent } from './lista/lista.component';
import { TecnologiaInformacaoEstoqueProdutosCadastroComponent } from './cadastro/cadastro.component';

const routes: Routes = [
  {
    path: '',
    component: TecnologiaInformacaoEstoqueProdutosListaComponent,
  },
  {
    path: 'novo',
    component: TecnologiaInformacaoEstoqueProdutosCadastroComponent,
  },
  {
    path: ':id',
    component: TecnologiaInformacaoEstoqueProdutosCadastroComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TecnologiaInformacaoEstoqueProdutosModuleRoutingModule {}
