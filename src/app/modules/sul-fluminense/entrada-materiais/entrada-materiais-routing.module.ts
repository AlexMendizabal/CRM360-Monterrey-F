import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { SulFluminenseEntradaMateriaisComponent } from './entrada-materiais.component';
import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';
import { SulFluminensePainelBobinasQualidadeComponent } from './painel-bobinas-qualidade/painel-bobinas-qualidade.component';
import { SulFluminenseConsultaRecebimentoBobinasComponent } from './consulta-recebimento-bobinas/consulta-recebimento-bobinas.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: SulFluminenseEntradaMateriaisComponent
      },
      {
        path: 'painel-bobinas-qualidade',
        component: SulFluminensePainelBobinasQualidadeComponent
      },
      {
        path: 'consulta-recebimento-bobinas',
        component: SulFluminenseConsultaRecebimentoBobinasComponent
      },
      {
        path: '**',
        component: NotFoundComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SulFluminenseEntradaMateriaisRoutingModule { }
