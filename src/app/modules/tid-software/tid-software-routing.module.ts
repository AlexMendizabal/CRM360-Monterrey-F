import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Componentes
import { TidSoftwareComponent } from './tid-software.component';
import { TidSoftwareHomeComponent } from './home/home.component';
import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';
import { TidSoftwareEmpresasComponent } from './empresas/empresas.component';

const routes: Routes = [
  {
    path: '',
    component: TidSoftwareComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        component: TidSoftwareHomeComponent
      },
      {
        path: 'empresas/:nomeEmpresa/:cdEmpresa',
        component: TidSoftwareEmpresasComponent
      },
      {
        path: '**',
        component: NotFoundComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TidSoftwareRoutingModule {}
