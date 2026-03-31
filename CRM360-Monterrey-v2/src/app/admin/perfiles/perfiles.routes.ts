import { Routes } from '@angular/router';

export const PERFILES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./lista/lista.component').then(m => m.AdminPerfilesListaComponent)
  },
  {
    path: 'novo',
    loadComponent: () => import('./cadastro/cadastro.component').then(m => m.AdminPerfilesCadastroComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./cadastro/cadastro.component').then(m => m.AdminPerfilesCadastroComponent)
  }
];
