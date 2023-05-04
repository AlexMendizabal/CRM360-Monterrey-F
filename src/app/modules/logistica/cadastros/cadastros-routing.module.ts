import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';

import { LogisticaCadastrosComponent } from './cadastros.component';

const routes: Routes = [
  {
    path: '',
    component: LogisticaCadastrosComponent,
  },
  {
    path: 'veiculos',
    loadChildren: () =>import('./veiculos/veiculos.module').then((m) => m.LogisticaVeiculosModule), 
  },
  {
    path: 'motoristas',
    loadChildren: () =>import('./motoristas/motoristas.module').then((m) => m.MotoristasModule), 
  },
  {
    path: 'tipo-veiculo',
    loadChildren: () =>import('./tipo-veiculo/tipo-veiculo.module').then((m) => m.LogisticaTipoVeiculoModule),
  },
  {
    path: 'tipo-motorista',
    loadChildren: () =>import('./tipo-motorista/tipo-motorista.module').then((m) => m.LogisticaTipoMotoristaModule),
  },
  {
    path: 'sucursais',
    loadChildren: () =>import('./filiais/filiais.module').then((m) => m.LogisticaFiliaisModule),
  },
  {
    path: 'turnos',
    loadChildren: () =>import('./turnos/turnos.module').then((m) => m.LogisticaTurnosModule),
  },
  {
    path: 'transportadoras',
    loadChildren: () =>import('./transportadoras/transportadoras.module').then((m) => m.LogisticaTransportadorasModule),
  },
  {
    path: 'restricoes-transporte',
    loadChildren: () =>import('./restricoes-transporte/restricoes-transporte.module').then((m) => m.LogisticaRestricoesTransporteModule),
  },
  {
    path: 'prazos-entrega',
    loadChildren: () =>import('./prazo-entrega/prazo-entrega.module').then((m) => m.PrazoEntregaModule),
  },
  {
    path: 'regioes-entrega',
    loadChildren: () =>import('./regioes-entrega/regioes-entrega.module').then((m) => m.RegioesEntregaModule),
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LogisticaCadastrosRoutingModule {}
