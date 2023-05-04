import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { ComercialMateriaisPerdidosListaComponent } from './lista/lista.component';

const routes: Routes = [
  {
    path: 'lista',
    component: ComercialMateriaisPerdidosListaComponent
  },
  {
    path: '',
    redirectTo: 'lista',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComercialMateriaisPerdidosRoutingModule {}
