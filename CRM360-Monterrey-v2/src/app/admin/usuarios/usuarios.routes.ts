import { Routes } from '@angular/router';

export const USUARIOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./lista/lista.component').then(m => m.AdminUsuariosListaComponent)
  },
  {
    path: 'novo',
    loadComponent: () => import('./cadastro/cadastro.component').then(m => m.AdminUsuariosCadastroComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./cadastro/cadastro.component').then(m => m.AdminUsuariosCadastroComponent)
  }
];
