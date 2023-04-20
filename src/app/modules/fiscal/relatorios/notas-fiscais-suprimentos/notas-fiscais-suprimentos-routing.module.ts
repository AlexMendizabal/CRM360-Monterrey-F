import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FiscalRelatoriosNotasFiscaisSuprimentosComponent } from './notas-fiscais-suprimentos.component';

const routes: Routes = [
  { path: '', component: FiscalRelatoriosNotasFiscaisSuprimentosComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotasFiscaisSuprimentosRoutingModule {}
