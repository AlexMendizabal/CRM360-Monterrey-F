import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { LogisticaEntregaRomaneiosListaComponent } from './lista/lista.component';

const routes: Routes = [
  {
    path: '',
    component: LogisticaEntregaRomaneiosListaComponent
  }
];

@NgModule({
imports: [RouterModule.forChild(routes)],
exports: [RouterModule]
})

export class LogisticaEntregaRomaneiosRoutingModule { }
  