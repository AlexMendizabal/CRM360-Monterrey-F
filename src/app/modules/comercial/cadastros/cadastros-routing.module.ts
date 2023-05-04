import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { ComercialCadastrosComponent } from './cadastros.component';

const routes: Routes = [
  {
    path: ':idSubModulo',
    children: [
      {
        path: '',
        component: ComercialCadastrosComponent,
      },
      {
        path: 'concorrentes',
        loadChildren: () =>
          import('./concorrentes/concorrentes.module').then(
            (m) => m.ComercialCadastrosConcorrenteModule
          ),
      },
      {
        path: 'dias-nao-uteis',
        loadChildren: () =>
          import('./dias-nao-uteis/dias-nao-uteis.module').then(
            (m) => m.ComercialCadastrosDiaNaoUtilModule
          ),
      },
      {
        path: 'equipe-venda',
        loadChildren: () =>
          import('./equipe-venda/equipe-venda.module').then(
            (m) => m.ComercialCadastrosEquipeVendaModule
          ),
      },
      {
        path: 'tipos-comissionamento',
        loadChildren: () =>
          import('./tipos-comissionamento/tipo-comissionamento.module').then(
            (m) => m.ComercialCadastrosTipoComissionamentoModule
          ),
      },
      {
        path: 'escritorios',
        loadChildren: () =>
          import('./escritorios/escritorios.module').then(
            (m) => m.ComercialCadastrosEscritorioModule
          ),
      },
      {
        path: 'formas-pagamento',
        loadChildren: () =>
          import('./formas-pagamento/formas-pagamento.module').then(
            (m) => m.ComercialCadastrosFormasPagamentoModule
          ),
      },
      {
        path: 'associacao-linhas',
        loadChildren: () =>
          import('./associacao-linhas/associacao-linhas.module').then(
            (m) => m.ComercialCadastrosAssociacaoLinhasModule
          ),
      },
      {
        path: 'materiais/combos',
        loadChildren: () =>
          import('./materiais/combos/combos.module').then(
            (m) => m.ComercialCadastrosMateriaisComboModule
          ),
      },
      {
        path: 'materiais/contratos',
        loadChildren: () =>
          import('./materiais/contratos/contratos.module').then(
            (m) => m.ComercialCadastrosMateriaisContratoModule
          ),
      },
      {
        path: 'materiais/grupos',
        loadChildren: () =>
          import('./materiais/grupos/grupos.module').then(
            (m) => m.ComercialCadastrosMateriaisGrupoModule
          ),
      },
      {
        path: 'materiais/grupos-materiais-associados',
        loadChildren: () =>
          import('./materiais/grupos-materiais-associados/grupos-materiais-associados.module').then(
            (m) => m.ComercialCadastrosMateriaisGrupoMateriaisAssociadosModule
          ),
      },
      {
        path: 'materiais/similaridade',
        loadChildren: () =>
          import('./materiais/similaridade/similaridade.module').then(
            (m) => m.ComercialCadastrosMateriaisSimilaridadeModule
          ),
      },
      {
        path: 'materiais/ficha-cadastral',
        loadChildren: () =>
          import('./materiais/ficha-cadastral/ficha-cadastral.module').then(
            (m) => m.ComercialCadastrosMateriaisFichaCadastralModule
          ),
      },
      {
        path: 'materiais/cross-sell',
        loadChildren: () =>
          import('./materiais/cross-sell/cross-sell.module').then(
            (m) => m.ComercialCadastrosMateriaisCrossSellModule
          ),
      },
      {
        path: 'propostas/associacao-situacoes-proposta',
        loadChildren: () =>
          import(
            './propostas/associacao-situacoes-proposta/associacao-situacoes-proposta.module'
          ).then(
            (m) =>
              m.ComercialCadastrosPropostasAssociacaoSituacoesPropostaModule
          ),
      },
      {
        path: 'representantes',
        loadChildren: () =>
          import('./representantes/representantes.module').then(
            (m) => m.ComercialCadastrosRepresentantesModule
          ),
      },
      {
        path: 'contato/origem-contato',
        loadChildren: () =>
          import('./contato/origem-contato/origem-contato.module').then(
            (m) => m.ComercialCadastrosContatoOrigemContatoModule
          ),
      },
      {
        path: 'contato/formas-contato',
        loadChildren: () =>
          import('./contato/formas-contato/formas-contato.module').then(
            (m) => m.ComercialCadastrosContatoFormasContatoModule
          ),
      },
      {
        path: 'motivo-associacao',
        loadChildren: () =>
          import('./motivo-associacao/motivo-associacao.module').then(
            (m) => m.ComercialCadastrosMotivoAssociacaoModule
          ),
      },
      {
        path: 'titulos-agenda',
        loadChildren: () =>
          import('./titulos-agenda/titulos-agenda.module').then(
            (m) => m.ComercialCadastrosTitulosAgendaModule
          ),
      },
      {
        path: 'cnaes',
        loadChildren: () =>
          import('./cnaes/cnaes.module').then(
            (m) => m.ComercialCadastrosCnaesModule
          ),
      },
      {
        path: 'tipos-frete',
        loadChildren: () =>
          import('./tipos-frete/tipos-frete.module').then(
            (m) => m.ComercialCadastrosTiposFreteModule
          ),
      },
      {
        path: 'operadores-comerciais',
        loadChildren: () =>
          import('./operadores-comerciais/operadores-comerciais.module').then(
            (m) => m.ComercialCadastrosOperadorComercialModule
          ),
      },
      {
        path: 'setor-atividade',
        loadChildren: () =>
          import('./setor-atividade/setor-atividade.module').then(
            (m) => m.ComercialCadastrosSetorAtividadeModule
          ),
      },
      {
        path: 'situacao-propostas',
        loadChildren: () =>
          import('./situacao-proposta/situacao-proposta.module').then(
            (m) => m.ComercialCadastrosSituacaoPropostaModule
          ),
      },
      {
        path: 'tipo-operadores',
        loadChildren: () =>
          import('./tipo-operadores/tipo-operadores.module').then(
            (m) => m.ComercialCadastrosTipoOperadorModule
          ),
      },
      {
        path: 'transportadoras',
        loadChildren: () =>
          import('./transportadoras/transportadoras.module').then(
            (m) => m.ComercialCadastrosTransportadoraModule
          ),
      },
      {
        path: 'contratos-comerciais/situacoes-contratos',
        loadChildren: () =>
          import(
            './contratos-comerciais/situacoes-contratos-comerciais/situacoes-contratos-comerciais.module'
          ).then(
            (m) =>
              m.ComercialCadastrosContratosComerciaisSituacoesContratosComerciaisModule
          ),
      },
      {
        path: 'painel-custos',
        loadChildren: () =>
          import('./painel-custos/painel-custos.module').then(
            (m) => m.ComercialCadastroPainelCustosModule
          ),
      },
    ],
  },
  {
    path: '',
    children: [
      {
        path: 'concorrentes',
        loadChildren: () =>
          import('./concorrentes/concorrentes.module').then(
            (m) => m.ComercialCadastrosConcorrenteModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComercialCadastrosRoutingModule {}
