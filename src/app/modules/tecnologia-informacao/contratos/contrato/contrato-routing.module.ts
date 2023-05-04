import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//components
import { TecnologiaInformacaoCadastrosContratoListaComponent } from './lista/lista.component';
import { TecnologiaInformacaoCadastrosContratoCadastroComponent } from './cadastro/cadastro.component';

const routes: Routes = [
  {
    path: '',
    component: TecnologiaInformacaoCadastrosContratoListaComponent,
  },
  {
    path: 'novo',
    component: TecnologiaInformacaoCadastrosContratoCadastroComponent,
  },
  {
    path: ':id',
    component: TecnologiaInformacaoCadastrosContratoCadastroComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TecnologiaInformacaoCadastrosContratoModuleRoutingModule { }
