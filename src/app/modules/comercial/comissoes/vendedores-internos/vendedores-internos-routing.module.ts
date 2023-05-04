import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
// import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';

// Components
import { ComercialComissoesVendedoresInternosComponent } from './vendedores-internos.component';
import { ComercialComissoesVendedoresInternosLancamentoMetasComponent } from './lancamento-metas/lancamento-metas.component';
import { ComercialComissoesVendedoresInternosProgramacaoPagamentosComponent } from './programacao-pagamentos/programacao-pagamentos.component';


const routes: Routes = [
  {
    path: '',
    component: ComercialComissoesVendedoresInternosComponent,
  },
  {
    path: 'lancamento-metas',
    component: ComercialComissoesVendedoresInternosLancamentoMetasComponent,
  },
  {
    path: 'gestao-comissionamentos',
    children: [
      {
        path: '',
        loadChildren: () =>
          import(
            './gestao-comissionamentos/gestao-comissionamentos.module'
          ).then(
            (m) =>
              m.ComercialComissoesVendedoresInternosGestaoComissionamentosModule
          ),
      },
    ],
  },
  {
    path: 'programacao-pagamentos',
    component: ComercialComissoesVendedoresInternosProgramacaoPagamentosComponent,
  },
  
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComercialComissoesVendedoresInternosRoutingModule {}
