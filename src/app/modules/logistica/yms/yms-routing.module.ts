import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';

import { LogisticaYmsComponent } from './yms.component';

const routes: Routes = [
  {
    path: '',
    component: LogisticaYmsComponent,
  },
  {
    path: 'agendamentos',
    loadChildren: () =>import('./agendamentos/agendamentos.module').then((m) => m.LogisticaYmsAgendamentosModule), 
  },
  {
    path: 'associacao-etapas',
    loadChildren: () =>import('./associacao-etapas/associacao-etapas.module').then((m) => m.LogisticaYmsAssociacaoEtapasModule), 
  },
  {
    path: 'associacao-materiais',
    loadChildren: () =>import('./associacao-materiais/associacao-materiais.module').then((m) => m.LogisticaYmsAssociacaoMateriaisModule), 
  },
  {
    path: 'checklist',
    loadChildren: () =>import('./checklist/checklist.module').then((m) => m.LogisticaYmsChecklistModule), 
  },
  {
    path: 'circuitos',
    loadChildren: () =>import('./circuitos/circuitos.module').then((m) => m.LogisticaYmsCircuitosModule),
  },
  {
    path: 'etapas',
    loadChildren: () =>import('./etapas/etapas.module').then((m) => m.LogisticaYmsEtapasModule),
  },
  {
    path: 'setores',
    loadChildren: () =>import('./setores/setores.module').then((m) => m.LogisticaYmsSetoresModule),
  },
  {
    path: 'tipos-etapa',
    loadChildren: () =>import('./tipos-etapa/tipos-etapa.module').then((m) => m.LogisticaYmsTiposEtapaModule),
  },
  {
    path: 'tipos-circuito',
    loadChildren: () =>import('./tipos-circuito/tipos-circuito.module').then((m) => m.LogisticaYmsTiposCircuitoModule),
  },
  {
    path: 'tipos-setor',
    loadChildren: () =>import('./tipos-setor/tipos-setor.module').then((m) => m.LogisticaYmsTiposSetorModule),
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
export class LogisticaYmsRoutingModule {}
