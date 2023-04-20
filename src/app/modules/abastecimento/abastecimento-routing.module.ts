import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';

import { AbastecimentoComponent } from './abastecimento.component';
import { AbastecimentoSimuladorComprasAnalisesRealizadasComponent } from './simulador-compras-analises-realizadas/simulador-compras-analises-realizadas.component';
import { AbastecimentoSimuladorComprasAramesComponent } from './simulador-compras-arames/simulador-compras-arames.component';

const routes: Routes = [
  {
    path: '',
    component: AbastecimentoComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadChildren: () =>
          import('./home/home.module'). then(
            m => m.AbastecimentoHomeModule
          )
      },
      {
        path: 'simulador-compras-arames',
        component: AbastecimentoSimuladorComprasAramesComponent
      },
      {
        path: 'simulador-compras-analises-realizadas',
        component: AbastecimentoSimuladorComprasAnalisesRealizadasComponent
      },
      {
        path: 'cadastros/:idSubModulo',
        loadChildren: () =>
          import('./cadastros/cadastros.module'). then(
            m => m.AbastecimentoCadastrosModule
          )
      },
      {
        path: 'monitores/:idSubModulo',
        loadChildren: () =>
          import('./monitores/monitores.module'). then(
            m => m.AbastecimentoMonitoresModule
          )
      },
      {
        path: 'beneficiador/:idSubModulo',
        loadChildren: () =>
          import('./benificiador/benificiador.module'). then(
            m => m.AbastecimentoBenificiadorModule
          )
      },
      {
        path: '**',
        component: NotFoundComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AbastecimentoRoutingModule {}
