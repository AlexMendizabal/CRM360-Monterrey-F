import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { ComercialRelatoriosComissoesRepresentantesComponent } from './lista/lista.component';
const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'lista', component: ComercialRelatoriosComissoesRepresentantesComponent },
      {
        path: '',
        redirectTo: 'lista',
        pathMatch: 'full',
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComercialRelatoriosComissoesRepresentantesRoutingModule {}
