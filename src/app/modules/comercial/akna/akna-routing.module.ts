import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { ComercialAknaComponent } from './akna.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ComercialAknaComponent,
      },
      {
        path: 'contatos',
        loadChildren: () =>
          import('./contatos/contatos.module').then(
            (m) => m.ComercialAknaContatosModule
          ),
      },
      {
        path: 'mensagens',
        loadChildren: () =>
          import('./mensagens/mensagens.module').then(
            (m) => m.ComercialAknaMensagensModule
          ),
      },
      {
        path: 'acoes',
        loadChildren: () =>
          import('./acoes/acoes.module').then(
            (m) => m.ComercialAknaAcoesModule
          ),
      },
      {
        path: 'log-boas-vindas',
        loadChildren: () =>
          import('./log-boas-vindas/log-boas-vindas.module').then(
            (m) => m.ComercialAknaLogBoasVindasModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComercialAknaRoutingModule {}
