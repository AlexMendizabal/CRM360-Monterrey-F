import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { ComercialDashboardVendedorComponent } from './vendedor.component';

const routes: Routes = [
  { path: '', component: ComercialDashboardVendedorComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComercialDashboardVendedorRoutingModule {}
