import { LogisticaEntradaMateriaisParecerCadastroComponent } from './parecer/cadastro/cadastro.component';
import { LogisticaEntradaMateriaisParecerListaComponent } from './parecer/lista/lista.component';
import { LogisticaEntradaMateriaisFichasConformidadeOcorrenciasComponent } from './ficha-conformidade/ocorrencias/ocorrencias.component';
import { LogisticaEntradaMateriaisFichasConformidadeCadastroComponent } from './ficha-conformidade/cadastro/cadastro.component';
import { LogisticaEntradaMateriaisFichaConformidadeListaComponent } from './ficha-conformidade/lista/lista.component';
import { LogisticaEntradaMateriaisTiposConformidadeCadastroComponent } from './tipos-conformidade/cadastro/cadastro.component';
import { LogisticaEntradaMateriaisTiposConformidadeListaComponent } from './tipos-conformidade/lista/lista.component';
import { LogisticaEntradaMateriaisPainelAprovacaoListaComponent } from './painel-aprovacao/lista/lista.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';

import { LogisticaEntradaMateriaisComponent } from './entrada-materiais.component';
import { LogisticaEntradaMateriaisNotasFiscaisCadastroComponent } from './notas-fiscais/cadastro/cadastro.component';
import { LogisticaEntradaMateriaisNotasFiscaisListaComponent } from './notas-fiscais/lista/lista.component';
import { LogisticaEntradaMateriaisStatusRecebimentoListaComponent } from './status-recebimento/lista/lista.component';
import { LogisticaEntradaMateriaisStatusRecebimentoCadastroComponent } from './status-recebimento/cadastro/cadastro.component';
import { LogisticaEntradaMateriaisMotivosListaComponent } from './motivos/lista/lista.component';
import { LogisticaEntradaMateriaisMotivosCadastroComponent } from './motivos/cadastro/cadastro.component';


const routes: Routes = [
  {
    path: '',
    component: LogisticaEntradaMateriaisComponent,
  },
  {
    path: 'notas-fiscais',
    children: [
      {
        path: '',
        component: LogisticaEntradaMateriaisNotasFiscaisListaComponent,
      },
      {
        path: 'novo',
        component: LogisticaEntradaMateriaisNotasFiscaisCadastroComponent,
      },
      {
        path: ':id',
        component: LogisticaEntradaMateriaisNotasFiscaisCadastroComponent,
      },
    ],
  },
  {
    path: 'status-recebimento',
    children: [
      {
        path: '',
        component: LogisticaEntradaMateriaisStatusRecebimentoListaComponent,
      },
      {
        path: 'novo',
        component: LogisticaEntradaMateriaisStatusRecebimentoCadastroComponent,
      },
      {
        path: ':id',
        component: LogisticaEntradaMateriaisStatusRecebimentoCadastroComponent,
      },
    ],
  },
  {
    path: 'parecer',
    children: [
      {
        path: '',
        component: LogisticaEntradaMateriaisParecerListaComponent,
      },
      {
        path: 'novo',
        component: LogisticaEntradaMateriaisParecerCadastroComponent,
      },
      {
        path: ':id',
        component: LogisticaEntradaMateriaisParecerCadastroComponent,
      },
    ],
  },
  {
    path: 'motivos',
    children: [
      {
        path: '',
        component: LogisticaEntradaMateriaisMotivosListaComponent,
      },
      {
        path: 'novo',
        component: LogisticaEntradaMateriaisMotivosCadastroComponent,
      },
      {
        path: ':id',
        component: LogisticaEntradaMateriaisMotivosCadastroComponent,
      },
    ],
  },
  {
    path: 'tipos-nao-conformidade',
    children: [
      {
        path: '',
        component: LogisticaEntradaMateriaisTiposConformidadeListaComponent,
      },
      {
        path: 'novo',
        component: LogisticaEntradaMateriaisTiposConformidadeCadastroComponent,
      },
      {
        path: ':id',
        component: LogisticaEntradaMateriaisTiposConformidadeCadastroComponent,
      },
    ],
  },
  {
    path: 'fichas-nao-conformidade',
    children: [
      {
        path: '',
        component: LogisticaEntradaMateriaisFichaConformidadeListaComponent,
      },
      {
        path: 'novo',
        component: LogisticaEntradaMateriaisFichasConformidadeCadastroComponent,
      },
      {
        path: ':id',
        component: LogisticaEntradaMateriaisFichasConformidadeCadastroComponent,
      },
      {
        path: 'ocorrencias/novo',
        component: LogisticaEntradaMateriaisFichasConformidadeOcorrenciasComponent,
      },
      {
        path: 'ocorrencias/:id',
        component: LogisticaEntradaMateriaisFichasConformidadeOcorrenciasComponent,
      },
    ],
  },
  {
    path: 'painel-aprovacao',
    children: [
      {
        path: '',
        component: LogisticaEntradaMateriaisPainelAprovacaoListaComponent,
      },
      {
        path: 'lista',
        component: LogisticaEntradaMateriaisPainelAprovacaoListaComponent,
      },
    ],
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LogisticaEntradaMateriaisRoutingModule {}
