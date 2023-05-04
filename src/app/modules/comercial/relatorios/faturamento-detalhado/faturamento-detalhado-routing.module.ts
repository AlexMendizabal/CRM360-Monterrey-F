import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { ComercialRelatoriosFaturamentoDetalhadoComponent } from './faturamento-detalhado.component';

const routes: Routes = [
  { path: '', component: ComercialRelatoriosFaturamentoDetalhadoComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComercialRelatoriosFaturamentoDetalhadoRoutingModule {}
