import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'notas-fiscais-suprimentos',
    loadChildren: () =>
      import(
        './notas-fiscais-suprimentos/notas-fiscais-suprimentos.module'
      ).then(m => m.NotasFiscaisSuprimentosModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FiscalRelatoriosRoutingModule {}
