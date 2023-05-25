import { ComercialKanbanComercialModule } from './kanban/kanban-comercial.module';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { ComercialComponent } from './comercial.component';
import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';

const routes: Routes = [
  {
    path: '',
    component: ComercialComponent,
    children: [
      {
        path: 'agenda',
        loadChildren: () =>
          import('./agenda/agenda.module').then((m) => m.ComercialAgendaModule),
      },
      {
        path: 'akna/:idSubModulo',
        loadChildren: () =>
          import('./akna/akna.module').then((m) => m.ComercialAknaModule),
      },
      {
        path: 'cadastros',
        loadChildren: () =>
          import('./cadastros/cadastros.module').then(
            (m) => m.ComercialCadastrosModule
          ),
      },
      {
        path: 'ciclo-vendas',
        loadChildren: () =>
          import('./ciclo-vendas/ciclo-vendas.module').then(
            (m) => m.ComercialCicloVendasModule
          ),
      },
      {
        path: 'clientes',
        loadChildren: () =>
          import('./clientes/clientes.module').then(
            (m) => m.ComercialClientesModule
          ),
      },
      {
        path: 'reporte-agenda',
        loadChildren: () =>
          import('./reporte/reportes.module').then(
            (m) => m.ComercialReportesModule
          ),
      },
      {
        path: 'controle-entregas',
        loadChildren: () =>
          import('./controle-entregas/controle-entregas.module').then(
            (m) => m.ComercialControleEntregasModule
          ),
      },
      {
        path: 'dashboard/vendedor',
        loadChildren: () =>
          import('./dashboard/vendedor/vendedor.module').then(
            (m) => m.ComercialDashboardVendedorModule
          ),
      },
      {
        path: 'disponibilidade-material',
        loadChildren: () =>
          import(
            './disponibilidade-material/disponibilidade-material.module'
          ).then((m) => m.ComercialDisponibilidadeMaterialModule),
      },
      {
        path: 'estoque',
        loadChildren: () =>
          import('./estoque/estoque.module').then(
            (m) => m.ComercialEstoqueModule
          ),
      },
      {
        path: 'kanban/:idSubModulo',
        loadChildren: () =>
          import('./kanban/kanban-comercial.module').then(
            (m) => m.ComercialKanbanComercialModule
          ),
      },
      {
        path: 'comissoes/:idSubModulo',
        loadChildren: () =>
          import('./comissoes/comissoes.module').then(
            (m) => m.ComercialComissoesModule
          ),
      },
      {
        path: 'gestao/:idSubModulo',
        loadChildren: () =>
          import('./gestao/gestao.module').then((m) => m.ComercialGestaoModule),
      },
      {
        path: 'home',
        loadChildren: () =>
          import('./home/home.module').then((m) => m.ComercialHomeModule),
      },
      {
        path: 'integracoes',
        loadChildren: () =>
          import('./integracoes/integracoes.module').then(
            (m) => m.ComercialIntegracoesModule
          ),
      },
      {
        path: 'materiais-perdidos',
        loadChildren: () =>
          import('./materiais-perdidos/materiais-perdidos.module').then(
            (m) => m.ComercialMateriaisPerdidosModule
          ),
      },
      {
        path: 'reenvio-xml',
        loadChildren: () =>
          import('./reenvio-xml/reenvio-xml.module').then(
            (m) => m.ComercialReenvioXmlModule
          ),
      },
      {
        path: 'relatorios/:idSubModulo',
        loadChildren: () =>
          import('./relatorios/relatorios.module').then(
            (m) => m.ComercialRelatoriosModule
          ),
      },
      {
        path: 'tid-software/:idSubModulo',
        loadChildren: () =>
          import('./tid-software/tid-software.module').then(
            (m) => m.ComercialTidSoftwareModule
          ),
      },
      {
        path: 'auditoria/:idSubModulo',
        loadChildren: () =>
          import('./auditoria/auditoria.module').then(
            (m) => m.ComercialAuditoriaModule
          ),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
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
export class ComercialRoutingModule {}
