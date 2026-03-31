import { Routes } from '@angular/router';

export const SUBMODULOS_ROUTES: Routes = [
  {
    path: 'lista',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: '',
    loadComponent: () => import('./lista/lista.component').then(m => m.AdminSubmodulosListaComponent)
  },
  {
    path: 'novo',
    loadComponent: () => import('./cadastro/cadastro.component').then(m => m.AdminSubmodulosCadastroComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./cadastro/cadastro.component').then(m => m.AdminSubmodulosCadastroComponent)
  }
];

