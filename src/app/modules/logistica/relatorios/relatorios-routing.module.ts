import { LogisticaRelatoriosAmbComponent } from './amb/amb.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { LogisticaRelatoriosComponent } from './relatorios.component';
import { LogisticaRelatoriosRomaneiosComponent } from './romaneios/romaneios.component';

const routes = [
  {
    path: '',
    component: LogisticaRelatoriosComponent
  },
  {
    path: 'romaneios',
    component: LogisticaRelatoriosRomaneiosComponent
  },
  {
    path: 'amb',
    component: LogisticaRelatoriosAmbComponent
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LogisticaRelatoriosRoutingModule { }