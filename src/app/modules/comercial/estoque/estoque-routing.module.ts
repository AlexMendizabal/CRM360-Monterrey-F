import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { ComercialEstoqueListaComponent } from './lista/lista.component';

const routes: Routes = [
  { path: '', component: ComercialEstoqueListaComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComercialEstoqueRoutingModule {}
