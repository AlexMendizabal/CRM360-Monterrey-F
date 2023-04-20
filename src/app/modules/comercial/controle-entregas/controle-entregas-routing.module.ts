import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { ComercialControleEntregasListaComponent } from './lista/lista.component';

const routes: Routes = [
  { path: '', component: ComercialControleEntregasListaComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComercialControleEntregasRoutingModule {}
