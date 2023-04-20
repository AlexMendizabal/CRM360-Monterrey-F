import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//components
import { TecnologiaInformacaoCadastrosItemListaComponent } from './lista/lista.component';
import { TecnologiaInformacaoCadastrosItemCadastroComponent } from './cadastro/cadastro.component';

const routes: Routes = [
  {
    path: '',
    component: TecnologiaInformacaoCadastrosItemListaComponent,
  },
  {
    path: 'novo',
    component: TecnologiaInformacaoCadastrosItemCadastroComponent,
  },
  {
    path: ':id',
    component: TecnologiaInformacaoCadastrosItemCadastroComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TecnologiaInformacaoCadastrosItemModuleRoutingModule { }
