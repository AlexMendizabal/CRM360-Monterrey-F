import { Routes, RouterModule } from '@angular/router';
import { NgModule } from "@angular/core";

import { LogisticaSenhasListaComponent } from './lista/lista.component';
import { LogisticaSenhasCadastroComponent } from './cadastro/cadastro.component';

const routes: Routes = [
  {
    path: '',
    component: LogisticaSenhasListaComponent
  },
  {
    path: 'novo',
    component: LogisticaSenhasCadastroComponent
  },
  {
    path: ':id',
    component: LogisticaSenhasCadastroComponent
  }
]

@NgModule({
  imports:[RouterModule.forChild(routes)],
  exports:[RouterModule]
})
export class LogisticaSenhasModuleRouting{};