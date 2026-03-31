import { Routes } from '@angular/router';

export const REPORTE_AGENDA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./reporte-agenda.component').then(m => m.ReporteAgendaComponent)
  }
];
