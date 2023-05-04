import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { FinanceiroComponent } from './financeiro.component';
import { FinanceiroHomeComponent } from './home/home.component';
import { FinanceiroRelatorioDuplicatasComponent } from './relatorio-duplicatas/relatorio-duplicatas.component';
import { FinanceiroDuplicataNaoAceitaBolDescComponent } from './duplicata-nao-aceita-bol-desc/duplicata-nao-aceita-bol-desc.component';

const routes: Routes = [
  {
    path: '',
    component: FinanceiroComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      { path: 'home', component: FinanceiroHomeComponent },
      {
        path: 'relatorio-duplicatas',
        component: FinanceiroRelatorioDuplicatasComponent,
      },
      {
        path: 'duplicata-nao-aceita-bol-desc',
        component: FinanceiroDuplicataNaoAceitaBolDescComponent,
      },
      {
        path: 'relatorios/:idSubModulo',
        loadChildren: () =>
          import('./relatorios/relatorios.module').then(
            (m) => m.FinanceiroRelatoriosModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinanceiroRoutingModule {}
