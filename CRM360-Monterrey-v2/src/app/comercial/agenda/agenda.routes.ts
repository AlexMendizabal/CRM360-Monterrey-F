import { Routes } from '@angular/router';

export const AGENDA_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'compromissos',
    pathMatch: 'full'
  },
  {
    path: 'compromissos',
    loadComponent: () =>
      import('./compromissos/compromissos.component').then(m => m.ComercialAgendaCompromissosComponent)
  },
  {
    path: 'novo',
    loadComponent: () =>
      import('./formulario/formulario.component').then(m => m.ComercialAgendaFormularioComponent)
  },
  {
    path: 'novo/:codCliente',
    loadComponent: () =>
      import('./formulario/formulario.component').then(m => m.ComercialAgendaFormularioComponent)
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./formulario/formulario.component').then(m => m.ComercialAgendaFormularioComponent)
  },
  {
    path: 'finalizar/:id',
    loadComponent: () =>
      import('./formulario/formulario.component').then(m => m.ComercialAgendaFormularioComponent)
  },
  {
    path: 'reagendar/:id',
    loadComponent: () =>
      import('./formulario/formulario.component').then(m => m.ComercialAgendaFormularioComponent)
  }
];
