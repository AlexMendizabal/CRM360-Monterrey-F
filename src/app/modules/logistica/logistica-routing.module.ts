import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';

import { LogisticaComponent } from './logistica.component';
import { LogisticaHomeComponent } from './home/home.component';
import { LogisticaBaixaTitulosComponent } from './baixa-de-titulos/baixa-titulos.component';
import { LogisticaCertificadoQualidadeComponent } from './certificado-qualidade/certificado-qualidade.component';
import { LogisticaEstoqueEstoqueDivergenteComponent } from './estoque/estoque-divergente/estoque-divergente.component';
import { LogisticaEstoqueEstoqueDivergenteListaComponent } from './estoque/estoque-divergente/lista/lista.component';
import { LogisticaGestaoAssociacaoUsuarioEmpresaComponent } from './gestao/associacao-usuario-empresa/associacao-usuario-empresa.component';
import { LogisticaRenderizadorIframeComponent } from './renderizador/iframe/iframe.component';
import { LogisticaRenderizadorComponent } from './renderizador/renderizador.component';

const routes: Routes = [
  {
    path: '',
    component: LogisticaComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        component: LogisticaHomeComponent,
      },
      {
        path: 'relatorios/:idSubModulo',
        loadChildren: () =>
          import('./relatorios/relatorios.module').then(
            (m) => m.LogisticaRelatoriosModule
          ),
      },
      { path: 'baixa-titulo', component: LogisticaBaixaTitulosComponent },
      {
        path: 'certificado-qualidade',
        component: LogisticaCertificadoQualidadeComponent,
      },
      {
        path: 'estoque/estoque-divergente',
        component: LogisticaEstoqueEstoqueDivergenteComponent,
      },
      {
        path: 'estoque/estoque-divergente/lista',
        component: LogisticaEstoqueEstoqueDivergenteListaComponent,
      },
      {
        path: 'associacao-usuario-empresa',
        component: LogisticaGestaoAssociacaoUsuarioEmpresaComponent,
      }
      ,
      {
        path: 'renderizador/submodulos/:nomeSubmodulo/:idSubModulo',
        component: LogisticaRenderizadorComponent,
      },
      {
        path: 'renderizador/:nomeAtividade/:idAtividade',
        component: LogisticaRenderizadorIframeComponent,
      },
      {
        path: 'dashboards/:idSubModulo',
        loadChildren: () =>
          import('./dashboards/dashboards.module').then(
            (m) => m.LogisticaDashboardsModule
          ),
      },
      {
        path: 'cadastros/:idSubModulo',
        loadChildren: () =>
          import('./cadastros/cadastros.module').then(
            (m) => m.CadastrosModule
          )
      },
      {
        path: 'entrada-materiais/:idSubModulo',
        loadChildren: () =>
          import('./entrada-materiais/entrada-materiais.module').then(
            (m) => m.LogisticaEntradaMateriaisModule
          )
      },
      {
        path: 'yms/:idSubModulo',
        loadChildren: () =>
          import('./yms/yms.module').then(
            (m) => m.LogisticaYmsModule
          )
      },
      {
        path: 'estoque/inventario',
        loadChildren: () =>
          import('./estoque/inventario/inventario.module').then(
            (m) => m.LogisticaEstoqueInventarioModule
          ),
      },
      {
        path: 'estoque/painel-inventario',
        loadChildren: () =>
          import('./estoque/painel-inventario/painel-inventario.module').then(
            (m) => m.LogisticaEstoquePainelInventarioModule
          ),
      },
      {
        path: 'entrega/:idSubModulo',
        loadChildren: () =>
          import('./entrega/entrega.module').then(
            (m) => m.LogisticaEntregaModule
          ),
      },
      {
        path: 'integracoes',
        loadChildren: () =>
          import('./integracao/integracao.module').then(m => m.LogisticaIntegracaoModule)
      },
      {
        path: 'peacao',
        loadChildren: () =>
          import('./peacao/peacao.module').then(m => m.LogisticaPeacaoModule)
      },
      {
        path: 'pedagio',
        loadChildren: () =>
          import('./pedagio/pedagio.module').then(m => m.PedadioModule)
      },
      {
        path: 'senhas',
        loadChildren: () =>
          import('./senhas/senhas.module').then(m => m.SenhasModule)
      },
      {
        path: '**',
        component: NotFoundComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LogisticaRoutingModule { }
