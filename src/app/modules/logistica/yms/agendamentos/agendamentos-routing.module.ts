import { LogisticaYmsAgendamentosDragAndDropComponent } from './drag-and-drop/drag-and-drop.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';
import { LogisticaYmsAgendamentosCadastroComponent } from './cadastro/cadastro.component';
import { LogisticaYmsAgendamentosListaComponent } from './lista/lista.component';


const routes: Routes = [
  {
    path: '',
    component: LogisticaYmsAgendamentosListaComponent,
  },
  {
    path: 'novo',
    component: LogisticaYmsAgendamentosCadastroComponent,
  },
  {
    path: 'drag',
    component: LogisticaYmsAgendamentosDragAndDropComponent,
  },
  {
    path: ':id',
    component: LogisticaYmsAgendamentosCadastroComponent,
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LogisticaYmsAgendamentosRoutingModule {}
