import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';

import { FiscalComponent } from './fiscal.component';
import { FiscalHomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '',
    component: FiscalComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        component: FiscalHomeComponent
      },
      {
        path: 'relatorios',
        loadChildren: () =>
          import('./relatorios/relatorios.module').then(
            m => m.FiscalRelatoriosModule
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
export class FiscalRoutingModule {}
