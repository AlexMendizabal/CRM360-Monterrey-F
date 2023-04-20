import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ComercialIntegracoesDagdaComponent } from './dagda/dagda.component';

const routes: Routes = [
  {
    path: 'dagda/:idSubModulo',
    loadChildren: () =>
      import('./dagda/dagda.module').then(
        (m) => m.ComercialIntegracoesDagdaModule
      ),
  },
  {
    path: 'arcelor-mittal/:idSubModulo',
    loadChildren: () =>
      import('./arcelor-mittal/arcelor-mittal.module').then(
        (m) => m.ComercialIntegracoesArcelorMittalModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComercialIntegracoesRoutingModule {}
