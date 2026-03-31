import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) 
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./core/layout/layout').then(m => m.LayoutComponent),
    children: [
      { 
        path: 'dashboard', 
        redirectTo: 'admin', // Temporal route catch-all to jump to admin for test
        pathMatch: 'full'
      },
      {
        path: 'admin',
        loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
      },
      {
        path: 'reporte-agenda',
        loadChildren: () => import('./reporte-agenda/reporte-agenda.routes').then(m => m.REPORTE_AGENDA_ROUTES)
      },
      {
        path: 'comercial/agenda',
        loadChildren: () => import('./comercial/agenda/agenda.routes').then(m => m.AGENDA_ROUTES)
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
