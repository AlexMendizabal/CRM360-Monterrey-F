import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialClientesResolverGuard } from '../clientes-resolver.guard';
import { ComercialClientesCadastroDadosFaturamentoResolverGuard } from './dados-faturamento/formulario/formulario-data-resolver.guard';
import { ComercialClientesCadastroDadosFaturamentoRulesResolverGuard } from './dados-faturamento/formulario/formulario-rules-resolver.guard';
import { ComercialClientesCadastroEnderecosResolverGuard } from './enderecos/formulario/formulario-data-resolver.guard';
import { ComercialClientesCadastroEnderecosRulesResolverGuard } from './enderecos/formulario/formulario-rules-resolver.guard';
import { ComercialClientesCadastroContatosResolverGuard } from './contatos/formulario/formulario-resolver.guard';
import { ComercialClientesCadastroDadosRelacionamentoResolverGuard } from './dados-relacionamento/formulario/formulario-resolver.guard';
import { ComercialClientesCadastroPotencialCompraResolverGuard } from './potencial-compra/formulario/formulario-resolver.guard';

// Components
import { ComercialClientesCadastroComponent } from './cadastro.component';
import { ComercialClientesCadastroDadosFaturamentoDetalhesComponent } from './dados-faturamento/detalhes/detalhes.component';
import { ComercialClientesCadastroDadosFaturamentoFormularioComponent } from './dados-faturamento/formulario/formulario.component';
import { ComercialClientesCadastroEnderecosDetalhesComponent } from './enderecos/detalhes/detalhes.component';
import { ComercialClientesCadastroEnderecosFormularioComponent } from './enderecos/formulario/formulario.component';
import { ComercialClientesCadastroContatosDetalhesComponent } from './contatos/detalhes/detalhes.component';
import { ComercialClientesCadastroContatosFormularioComponent } from './contatos/formulario/formulario.component';
import { ComercialClientesCadastroDadosRelacionamentoDetalhesComponent } from './dados-relacionamento/detalhes/detalhes.component';
import { ComercialClientesCadastroDadosRelacionamentoFormularioComponent } from './dados-relacionamento/formulario/formulario.component';
import { ComercialClientesCadastroPotencialCompraDetalhesComponent } from './potencial-compra/detalhes/detalhes.component';
import { ComercialClientesCadastroPotencialCompraFormularioComponent } from './potencial-compra/formulario/formulario.component';
import { ComercialClientesCadastroAnexosDetalhesComponent } from './anexos/detalhes/detalhes.component';
import { ComercialClientesCadastroAnexosFormularioComponent } from './anexos/formulario/formulario.component';
import { ComercialClientesCadastroFilialDetalhesComponent } from './filial/detalhes/detalhes.component';
import { ComercialClientesCadastroTravasDetalhesComponent } from './travas/detalhes/detalhes.component';
import { ComercialClientesCadastroInfosFinanceirasDetalhesComponent } from './informacoes-financeiras/detalhes/detalhes.component';
import { ComercialClientesCadastroInfosComerciaisDetalhesComponent } from './informacoes-comerciais/detalhes/detalhes.component';

const routes: Routes = [
  {
    path: ':id',
    component: ComercialClientesCadastroComponent,
    resolve: {
      response: ComercialClientesResolverGuard
    },
    children: [
      {
        path: '',
        redirectTo: 'dados-faturamento',
        pathMatch: 'full'
      },
      {
        path: 'dados-faturamento',
        children: [
          {
            path: '',
            component: ComercialClientesCadastroDadosFaturamentoDetalhesComponent
          },
          {
            path: 'editar',
            component: ComercialClientesCadastroDadosFaturamentoFormularioComponent,
            resolve: {
              data: ComercialClientesCadastroDadosFaturamentoResolverGuard,
              rules: ComercialClientesCadastroDadosFaturamentoRulesResolverGuard
            },
            canDeactivate: [FormDeactivateGuard]
          }
        ]
      },
      {
        path: 'enderecos',
        children: [
          {
            path: '',
            component: ComercialClientesCadastroEnderecosDetalhesComponent
          },
          {
            path: 'novo',
            component: ComercialClientesCadastroEnderecosFormularioComponent,
            resolve: {
              data: ComercialClientesCadastroEnderecosResolverGuard,
              rules: ComercialClientesCadastroEnderecosRulesResolverGuard
            },
            canDeactivate: [FormDeactivateGuard]
          },
          {
            path: 'editar/:idEndereco/:idSituacao',
            component: ComercialClientesCadastroEnderecosFormularioComponent,
            resolve: {
              data: ComercialClientesCadastroEnderecosResolverGuard,
              rules: ComercialClientesCadastroEnderecosRulesResolverGuard
            },
            canDeactivate: [FormDeactivateGuard]
          }
        ]
      },
      {
        path: 'contatos',
        children: [
          {
            path: '',
            component: ComercialClientesCadastroContatosDetalhesComponent
          },
          {
            path: 'novo',
            component: ComercialClientesCadastroContatosFormularioComponent,
            resolve: {
              data: ComercialClientesCadastroContatosResolverGuard
            },
            canDeactivate: [FormDeactivateGuard]
          },
          {
            path: 'editar/:idContato',
            component: ComercialClientesCadastroContatosFormularioComponent,
            resolve: {
              data: ComercialClientesCadastroContatosResolverGuard
            },
            canDeactivate: [FormDeactivateGuard]
          }
        ]
      },
      {
        path: 'dados-relacionamento',
        children: [
          {
            path: '',
            component: ComercialClientesCadastroDadosRelacionamentoDetalhesComponent
          },
          {
            path: 'editar',
            component: ComercialClientesCadastroDadosRelacionamentoFormularioComponent,
            resolve: {
              data: ComercialClientesCadastroDadosRelacionamentoResolverGuard
            },
            canDeactivate: [FormDeactivateGuard]
          }
        ]
      },
      {
        path: 'potencial-compra',
        children: [
          {
            path: '',
            component: ComercialClientesCadastroPotencialCompraDetalhesComponent
          },
          {
            path: 'editar',
            component: ComercialClientesCadastroPotencialCompraFormularioComponent,
            resolve: {
              data: ComercialClientesCadastroPotencialCompraResolverGuard
            },
            canDeactivate: [FormDeactivateGuard]
          }
        ]
      },
      {
        path: 'anexos',
        children: [
          {
            path: '',
            component: ComercialClientesCadastroAnexosDetalhesComponent
          },
          {
            path: 'novo',
            component: ComercialClientesCadastroAnexosFormularioComponent
          }
        ]
      },
      {
        path: 'filial',
        children: [
          {
            path: '',
            component: ComercialClientesCadastroFilialDetalhesComponent
          }
        ]
      },
      {
        path: 'travas',
        children: [
          {
            path: '',
            component: ComercialClientesCadastroTravasDetalhesComponent
          }
        ]
      },
      {
        path: 'informacoes-financeiras',
        children: [
          {
            path: '',
            component: ComercialClientesCadastroInfosFinanceirasDetalhesComponent
          }
        ]
      },
      {
        path: 'informacoes-comerciais',
        children: [
          {
            path: '',
            component: ComercialClientesCadastroInfosComerciaisDetalhesComponent
          }
        ]
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/comercial/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComercialCadastrosRoutingModule {}
