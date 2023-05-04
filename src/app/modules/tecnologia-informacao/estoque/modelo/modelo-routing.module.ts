import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//components
import { TecnologiaInformacaoEstoqueModeloListaComponent } from './lista/lista.component';
import { TecnologiaInformacaoEstoqueModeloCadastroComponent } from './cadastro/cadastro.component';

const routes: Routes = [
  {
    path: '',
    component: TecnologiaInformacaoEstoqueModeloListaComponent,
  },
  {
    path: 'novo',
    component: TecnologiaInformacaoEstoqueModeloCadastroComponent,
  },
  {
    path: ':id',
    component: TecnologiaInformacaoEstoqueModeloCadastroComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TecnologiaInformacaoEstoqueModeloModuleRoutingModule {}
