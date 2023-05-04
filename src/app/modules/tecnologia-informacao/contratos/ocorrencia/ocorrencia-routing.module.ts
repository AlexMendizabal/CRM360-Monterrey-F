import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//components
import { TecnologiaInformacaoCadastrosOcorrenciaListaComponent } from './lista/lista.component';
import { TecnologiaInformacaoCadastrosOcorrenciaCadastroComponent } from './cadastro/cadastro.component';

const routes: Routes = [
  {
    path: '',
    component: TecnologiaInformacaoCadastrosOcorrenciaListaComponent,
  },
  {
    path: 'novo',
    component: TecnologiaInformacaoCadastrosOcorrenciaCadastroComponent,
  },
  {
    path: ':id',
    component: TecnologiaInformacaoCadastrosOcorrenciaCadastroComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TecnologiaInformacaoCadastrosOcorrenciaModuleRoutingModule { }
