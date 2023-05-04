import { ComercialIntegracoesDagdaComponent } from './dagda.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: ComercialIntegracoesDagdaComponent,
  },
  {
    path: 'integracao-materiais',
    loadChildren: () =>
      import('./integracao-materiais/integracao-materiais.module').then(
        (m) => m.ComercialIntegracoesDagdaIntegracaoMateriaisModule
      ),
  },
  {
    path: 'integracao-pedidos',
    loadChildren: () =>
      import('./integracao-pedidos/integracao-pedidos.module').then(
        (m) => m.ComercialIntegracoesDagdaIntegracaoPedidosModule
      ),
  },
  {
    path: 'integracao-condicao-pagamento',
    loadChildren: () =>
      import(
        './integracao-condicoes-pagamento/integracao-condicoes-pagamento.module'
      ).then(
        (m) => m.ComercialIntegracoesDagdaIntegracaoCondicoesPagamentoModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComercialIntegracoesDagdaRoutingModule {}
