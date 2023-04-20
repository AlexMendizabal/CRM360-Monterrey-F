import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//components
import { TecnologiaInformacaoEstoqueMovimentacoesListaComponent } from './lista/lista.component';
import { TecnologiaInformacaoEstoqueMovimentacoesCadastroComponent } from './cadastro/cadastro.component';

const routes: Routes = [
  {
    path: '',
    component: TecnologiaInformacaoEstoqueMovimentacoesListaComponent,
  },
  {
    path: 'novo',
    component: TecnologiaInformacaoEstoqueMovimentacoesCadastroComponent,
  },
  {
    path: ':id',
    component: TecnologiaInformacaoEstoqueMovimentacoesCadastroComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TecnologiaInformacaoEstoqueMovimentacoesModuleRoutingModule {}
