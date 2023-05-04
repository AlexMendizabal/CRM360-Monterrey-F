import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards


// Components
import { ComercialComissoesRepresentantesProgramacaoPagamentosListaComponent } from './lista/lista.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'lista', component: ComercialComissoesRepresentantesProgramacaoPagamentosListaComponent },
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
export class ComercialComissoesRepresentantesProgramacaoPagamentosRoutingModule {}
