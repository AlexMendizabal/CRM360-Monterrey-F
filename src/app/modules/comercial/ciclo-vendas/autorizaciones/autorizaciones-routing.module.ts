import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';


import {AutorizacionesComponent} from './autorizaciones.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: AutorizacionesComponent
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
})
export class ComercialCicloVendasAutorizacionesRoutingModule {
}
