import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
// import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';

// Components
import { ComercialComissoesRepresentantesComponent } from './representantes.component';


const routes: Routes = [
  {
    path: '',
    component: ComercialComissoesRepresentantesComponent,
  },
  {
    path: '',
    children: [
      {
        path: 'programacao-pagamentos',
        loadChildren: () =>
          import(
            './programacao-pagamentos/programacao-pagamentos.module'
          ).then(
            (m) =>
              m.ComercialComissoesRepresentantesProgramacaoPagamentosModule
          ),
      },
    ],
  },
  {
    path: '',
    children: [
      {
        path: 'gestao-comissionamentos',
        loadChildren: () =>
          import(
            './gestao-comissionamentos/gestao-comissionamentos.module'
          ).then(
            (m) =>
              m.ComercialComissoesRepresentantesGestaoComissionamentosModule
          ),
      },
    ],
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComercialComissoesRepresentantesRoutingModule {}
