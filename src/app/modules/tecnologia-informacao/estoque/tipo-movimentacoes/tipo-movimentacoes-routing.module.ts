import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//components
import { TecnologiaInformacaoEstoqueTipoMovimentacoesListaComponent } from './lista/lista.component';
import { TecnologiaInformacaoEstoqueTipoMovimentacoesCadastroComponent } from './cadastro/cadastro.component';

const routes: Routes = [
  {
    path: '',
    component: TecnologiaInformacaoEstoqueTipoMovimentacoesListaComponent,
  },
  {
    path: 'novo',
    component: TecnologiaInformacaoEstoqueTipoMovimentacoesCadastroComponent,
  },
  {
    path: ':id',
    component: TecnologiaInformacaoEstoqueTipoMovimentacoesCadastroComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TecnologiaInformacaoEstoqueTipoMovimentacoesModuleRoutingModule {}
