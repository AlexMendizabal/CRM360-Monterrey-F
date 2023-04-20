import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { FinanceiroRelatoriosInadimplentesComponent } from './inadimplentes.component';

const routes: Routes = [
  { path: '', component: FinanceiroRelatoriosInadimplentesComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinanceiroRelatoriosInadimplentesRoutingModule {}
