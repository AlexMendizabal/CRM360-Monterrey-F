import { Routes } from '@angular/router';

export const ATIVIDADES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./lista/lista').then(m => m.AdminAtividadesListaComponent)
  },
  {
    path: 'novo',
    loadComponent: () => import('./cadastro/cadastro').then(m => m.AdminAtividadesCadastroComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./cadastro/cadastro').then(m => m.AdminAtividadesCadastroComponent)
  }
];
