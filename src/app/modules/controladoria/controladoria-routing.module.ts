import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';

import { ControladoriaComponent } from './controladoria.component';
import { ControladoriaHomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '',
    component: ControladoriaComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        component: ControladoriaHomeComponent,
      },
      {
        path: 'pluser',
        loadChildren: () =>
          import('./associacoes/associacoes.module').then(
            (m) => m.ControladoriaAssociacoesModule
          ),
      },
      {
        path: 'fluxo-caixa',
        loadChildren: () =>
          import('./fluxo-caixa/fluxo-caixa.module').then(
            (m) => m.ControladoriaFluxoCaixaModule
          ),
      },
      {
        path: 'saldos-bancos',
        loadChildren: () =>
          import('./saldos-bancos/saldos-bancos.module').then(
            (m) => m.ControladoriaSaldosBancosModule
          ),
      },
      {
        path: '**',
        component: NotFoundComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ControladoriaRoutingModule {}
