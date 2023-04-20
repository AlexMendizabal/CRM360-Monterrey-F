import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { ComercialRelatoriosFaturamentoDetalhadoDuqueComponent } from './faturamento-detalhado-duque.component';

const routes: Routes = [
  { path: '', component: ComercialRelatoriosFaturamentoDetalhadoDuqueComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComercialRelatoriosFaturamentoDetalhadoDuqueRoutingModule {}
