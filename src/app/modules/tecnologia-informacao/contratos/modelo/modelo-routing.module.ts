import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//components
import { TecnologiaInformacaoCadastrosModeloListaComponent } from './lista/lista.component';
import { TecnologiaInformacaoCadastrosModeloCadastroComponent } from './cadastro/cadastro.component';

const routes: Routes = [
  {
    path: '',
    component: TecnologiaInformacaoCadastrosModeloListaComponent,
  },
  {
    path: 'novo',
    component: TecnologiaInformacaoCadastrosModeloCadastroComponent,
  },
  {
    path: ':id',
    component: TecnologiaInformacaoCadastrosModeloCadastroComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TecnologiaInformacaoCadastrosModeloModuleRoutingModule { }
