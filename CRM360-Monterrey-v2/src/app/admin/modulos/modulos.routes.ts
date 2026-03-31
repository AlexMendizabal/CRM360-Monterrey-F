import { Routes } from '@angular/router';
import { AdminModulosListaComponent } from './lista/lista.component';
import { AdminModulosCadastroComponent } from './cadastro/cadastro.component';

export const MODULOS_ROUTES: Routes = [
  {
    path: '',
    component: AdminModulosListaComponent
  },
  {
    path: 'novo',
    component: AdminModulosCadastroComponent
  },
  {
    path: ':id',
    component: AdminModulosCadastroComponent
  }
];
