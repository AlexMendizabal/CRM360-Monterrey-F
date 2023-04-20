import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';

import { CorteDobraComponent } from './corte-dobra.component';
import { CorteDobraHomeComponent } from './home/home.component';
import { CorteDobraDashboardComponent } from './dashboard/dashboard.component';
import { CorteDobraDashboardFiltroComponent } from './dashboard/filtro/filtro.component';

const routes: Routes = [
  {
    path: '',
    component: CorteDobraComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      { path: 'home', component: CorteDobraHomeComponent },
      {
        path: 'dashboard',
        component: CorteDobraDashboardComponent
      },
      {
        path: 'dashboard/filtro',
        component: CorteDobraDashboardFiltroComponent
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
export class CorteDobraRoutingModule {}
