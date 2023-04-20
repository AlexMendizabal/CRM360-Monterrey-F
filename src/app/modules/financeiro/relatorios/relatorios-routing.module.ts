import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { FinanceiroRelatoriosComponent } from './relatorios.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: FinanceiroRelatoriosComponent,
      },
      {
        path: 'inadimplentes',
        loadChildren: () =>
          import('./inadimplentes/inadimplentes.module').then(
            (m) => m.FinanceiroRelatoriosInadimplentesModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinanceiroRelatoriosRoutingModule {}
