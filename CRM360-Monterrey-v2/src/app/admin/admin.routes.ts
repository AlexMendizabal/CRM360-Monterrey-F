import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '', 
    // Redirige la raíz de admin a su home
    redirectTo: 'home', 
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then(m => m.AdminHomeComponent)
  },
  { 
    path: 'usuarios', 
    loadChildren: () => import('./usuarios/usuarios.routes').then(m => m.USUARIOS_ROUTES) 
  },
  {
    path: 'atividades',
    loadChildren: () => import('./atividades/atividades.routes').then(m => m.ATIVIDADES_ROUTES)
  },
  {
    path: 'modulos',
    loadChildren: () => import('./modulos/modulos.routes').then(m => m.MODULOS_ROUTES)
  },
  {
    path: 'perfis',
    loadChildren: () => import('./perfiles/perfiles.routes').then(m => m.PERFILES_ROUTES)
  },
  {
    path: 'submodulos',
    loadChildren: () => import('./submodulos/submodulos.routes').then(m => m.SUBMODULOS_ROUTES)
  }
];
