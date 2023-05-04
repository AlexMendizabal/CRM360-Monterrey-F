import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'v1',
    pathMatch: 'full'
  },
  {
    path: 'v1',
    loadChildren: () => import('./v1/v1.module').then(m => m.V1Module)
  },
  {
    path: 'v2',
    loadChildren: () => import('./v2/v2.module').then(m => m.V2Module)
  }
]

@NgModule({
  imports:[RouterModule.forChild(routes)],
  exports:[RouterModule]
})
export class LogisticaDashboardsAnaliseFreteRoutingModule{}