import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ComercialAknaLogBoasVindasComponent } from './log-boas-vindas.component';



const routes: Routes = [
  {
    path: '',
    component: ComercialAknaLogBoasVindasComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComercialAknaLogBoasVindasRoutingModule { }
