import { TecnologiaInformacaoTermoDevolucaoComponent } from './termo-devolucao/termo-devolucao.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { TecnologiaInformacaoContratosComponent } from './contratos.component';
import { TecnologiaInformacaoTermoResponsabilidadeComponent } from './termo-responsabilidade/termo-responsabilidade.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: TecnologiaInformacaoContratosComponent,
      },
      {
        path: 'contratos',
        loadChildren: () =>
          import('./contrato/contrato.module').then(
            (m) => m.TecnologiaInformacaoContratoModule
          ),
      },
      {
        path: 'tipo-contrato',
        loadChildren: () =>
          import('./tipo-contrato/tipo-contrato.module').then(
            (m) => m.TecnologiaInformacaoTipoContratoModule
          ),
      },
      {
        path: 'tipo-item',
        loadChildren: () =>
          import('./tipo-item/tipo-item.module').then(
            (m) => m.TecnologiaInformacaoTipoItemModule
          ),
      },
      {
        path: 'modelos',
        loadChildren: () =>
          import('./modelo/modelo.module').then(
            (m) => m.TecnologiaInformacaoModeloModule
          ),
      },
      {
        path: 'item',
        loadChildren: () =>
          import('./item/item.module').then(
            (m) => m.TecnologiaInformacaoItemModule
          ),
      },
      {
        path: 'ocorrencias',
        loadChildren: () =>
          import('./ocorrencia/ocorrencia.module').then(
            (m) => m.TecnologiaInformacaoOcorrenciaModule
          ),
      },
    ],
  },
  {
    path: 'termo-responsabilidade/:item',
    component: TecnologiaInformacaoTermoResponsabilidadeComponent,
  },
  {
    path: 'termo-devolucao/:ocorrencia',
    component: TecnologiaInformacaoTermoDevolucaoComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TecnologiaInformacaoCadastrosRoutingModule { }
