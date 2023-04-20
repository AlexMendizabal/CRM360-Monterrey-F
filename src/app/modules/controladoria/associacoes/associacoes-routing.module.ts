//angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//components
import { ControladoriaAssociacoesComponent } from './associacoes.component';
import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';
import { ControladoriaAssociacoesPluserCentroCustoEmpresasListaComponent } from './pluser/empresas/lista/lista.component';
import { ControladoriaAssociacoesPluserTipoDespesaListaComponent } from './pluser/tipo-despesa/lista/lista.component';

const routes: Routes = [
  {
    path: 'associacoes/:idSubModulo',
    children: [
      {
        path: '',
        component: ControladoriaAssociacoesComponent
      },
      {
        path: 'tid-empresa-tms-plano-custo',
        component: ControladoriaAssociacoesPluserCentroCustoEmpresasListaComponent
      },
      {
        path: 'tid-tipo-despesa-tms-plano-conta',
        component: ControladoriaAssociacoesPluserTipoDespesaListaComponent
      }
    ]
  },
  {
    path: '',
    redirectTo: 'associacoes/:idSubModulo',
    pathMatch: 'full'
  },
  {
    path: '**',
    component: NotFoundComponent,
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ControladoriaAssociacoesRoutingModule { }