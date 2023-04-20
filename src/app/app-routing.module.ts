import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { AbastecimentoGuard } from './modules/abastecimento/abastecimento.guard';
import { AdminGuard } from './modules/admin/admin.guard';
import { ComercialGuard } from './modules/comercial/comercial.guard';
import { CorteDobraGuard } from './modules/corte-dobra/corte-dobra.guard';
import { FinanceiroGuard } from './modules/financeiro/financeiro.guard';
import { FiscalGuard } from './modules/fiscal/fiscal.guard';
import { LogisticaGuard } from './modules/logistica/logistica.guard';
import { PowerBiGuard } from './modules/power-bi/power-bi.guard';
import { SistemasGuard } from './modules/sistemas/sistemas.guard';
import { SulFluminenseGuard } from './modules/sul-fluminense/sul-fluminense.guard';
import { TecnologiaInformacaoGuard } from './modules/tecnologia-informacao/tecnologia-informacao.guard';
import { TidSoftwareGuard } from './modules/tid-software/tid-software.guard';

// Components
import { LoginComponent } from './modules/login/login.component';
import { ControladoriaGuard } from './modules/controladoria/controladoria.guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () =>
      import('./modules/core/core.module').then((m) => m.CoreModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'abastecimento',
    loadChildren: () =>
      import('./modules/abastecimento/abastecimento.module').then(
        (m) => m.AbastecimentoModule
      ),
    canActivate: [AuthGuard, AbastecimentoGuard],
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./modules/admin/admin.module').then((m) => m.AdminModule),
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'comercial',
    loadChildren: () =>
      import('./modules/comercial/comercial.module').then(
        (m) => m.ComercialModule
      ),
    canActivate: [AuthGuard, ComercialGuard],
  },
  {
    path: 'controladoria',
    loadChildren: () =>
      import('./modules/controladoria/controladoria.module').then(
        (m) => m.ControladoriaModule
      ),
    canActivate: [AuthGuard, ControladoriaGuard],
  },
  {
    path: 'corte-dobra',
    loadChildren: () =>
      import('./modules/corte-dobra/corte-dobra.module').then(
        (m) => m.CorteDobraModule
      ),
    canActivate: [AuthGuard, CorteDobraGuard],
  },
  {
    path: 'financeiro',
    loadChildren: () =>
      import('./modules/financeiro/financeiro.module').then(
        (m) => m.FinanceiroModule
      ),
    canActivate: [AuthGuard, FinanceiroGuard],
  },
  {
    path: 'fiscal',
    loadChildren: () =>
      import('./modules/fiscal/fiscal.module').then((m) => m.FiscalModule),
    canActivate: [AuthGuard, FiscalGuard],
  },
  {
    path: 'logistica',
    loadChildren: () =>
      import('./modules/logistica/logistica.module').then(
        (m) => m.LogisticaModule
      ),
    canActivate: [AuthGuard, LogisticaGuard],
  },
  {
    path: 'power-bi',
    loadChildren: () =>
      import('./modules/power-bi/power-bi.module').then((m) => m.PowerBiModule),
    canActivate: [AuthGuard, PowerBiGuard],
  },
  {
    path: 'sistemas',
    loadChildren: () =>
      import('./modules/sistemas/sistemas.module').then(
        (m) => m.SistemasModule
      ),
    canActivate: [AuthGuard, SistemasGuard],
  },
  {
    path: 'sul-fluminense',
    loadChildren: () =>
      import('./modules/sul-fluminense/sul-fluminense.module').then(
        (m) => m.SulFluminenseModule
      ),
    canActivate: [AuthGuard, SulFluminenseGuard],
  },
  {
    path: 'tid-software',
    loadChildren: () =>
      import('./modules/tid-software/tid-software.module').then(
        (m) => m.TidSoftwareModule
      ),
    canActivate: [AuthGuard, TidSoftwareGuard],
  },
  {
    path: 'tecnologia-informacao',
    loadChildren: () =>
      import(
        './modules/tecnologia-informacao/tecnologia-informacao.module'
      ).then((m) => m.TecnologiaInformacaoModule),
    canActivate: [AuthGuard, TecnologiaInformacaoGuard],
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      onSameUrlNavigation: 'reload',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
