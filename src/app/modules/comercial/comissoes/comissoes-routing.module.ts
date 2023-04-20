import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


// Components
import { ComercialComissoesComponent } from './comissoes.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ComercialComissoesComponent,
      },
      {
        path: 'vendedores-internos',
        children: [
          {
            path: '',
            loadChildren: () =>
              import(
                './vendedores-internos/vendedores-internos.module'
              ).then(
                (m) =>
                  m.ComercialComissoesVendedoresInternosModule
              ),
          },
        ],
      },
      {
        path: 'representantes',
        children: [
          {
            path: '',
            loadChildren: () =>
              import(
                './representantes/representantes.module'
              ).then(
                (m) =>
                  m.ComercialComissoesRepresentantesModule
              ),
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComercialComissoesRoutingModule {}
