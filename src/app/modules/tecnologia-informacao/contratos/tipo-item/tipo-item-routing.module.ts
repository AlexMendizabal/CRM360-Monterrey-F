import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//components
import { TecnologiaInformacaoCadastrosTipoItemListaComponent } from './lista/lista.component';
import { TecnologiaInformacaoCadastrosTipoItemCadastroComponent } from './cadastro/cadastro.component';

const routes: Routes = [
  {
    path: '',
    component: TecnologiaInformacaoCadastrosTipoItemListaComponent,
  },
  {
    path: 'novo',
    component: TecnologiaInformacaoCadastrosTipoItemCadastroComponent,
  },
  {
    path: ':id',
    component: TecnologiaInformacaoCadastrosTipoItemCadastroComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TecnologiaInformacaoCadastrosTipoItemModuleRoutingModule { }
