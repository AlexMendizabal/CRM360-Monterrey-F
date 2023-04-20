import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { ComercialRelatoriosPosicaoDiariaComponent } from './posicao-diaria.component';

const routes: Routes = [
  { path: '', component: ComercialRelatoriosPosicaoDiariaComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComercialRelatoriosPosicaoDiariaRoutingModule {}
