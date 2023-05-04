import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//components
import { TecnologiaInformacaoCadastrosTipoContratoListaComponent } from './lista/lista.component';
import { TecnologiaInformacaoCadastrosTipoContratoCadastroComponent } from './cadastro/cadastro.component';

const routes: Routes = [
  {
    path: '',
    component: TecnologiaInformacaoCadastrosTipoContratoListaComponent,
  },
  {
    path: 'novo',
    component: TecnologiaInformacaoCadastrosTipoContratoCadastroComponent,
  },
  {
    path: ':id',
    component: TecnologiaInformacaoCadastrosTipoContratoCadastroComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TecnologiaInformacaoCadastrosTipoContratoModuleRoutingModule { }
