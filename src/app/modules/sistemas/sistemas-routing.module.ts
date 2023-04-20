import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { SistemasComponent } from './sistemas.component';
import { SistemasHomeComponent } from './home/home.component';
import { SistemasRenderizadorComponent } from './renderizador/renderizador.component';
import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';

const routes: Routes = [
  {
    path: '',
    component: SistemasComponent,
    children: [
      { path: 'home', component: SistemasHomeComponent },
      {
        path: 'akna-software/:idAtividade',
        component: SistemasRenderizadorComponent
      },
      {
        path: 'apisullog/:idAtividade',
        component: SistemasRenderizadorComponent
      },
      {
        path: 'comercio-servicos-cs/:idAtividade',
        component: SistemasRenderizadorComponent
      },
      {
        path: 'fatorh/:idAtividade',
        component: SistemasRenderizadorComponent
      },
      {
        path: 'frete-brasil/:idAtividade',
        component: SistemasRenderizadorComponent
      },
      {
        path: 'gestao-ponto/:idAtividade',
        component: SistemasRenderizadorComponent
      },
      {
        path: 'octopus/:idAtividade',
        component: SistemasRenderizadorComponent
      },
      {
        path: 'pluser/:idAtividade',
        component: SistemasRenderizadorComponent
      },
      {
        path: 'sgq-corte-dobra/:idAtividade',
        component: SistemasRenderizadorComponent
      },
      {
        path: 'sgq-distribuidora/:idAtividade',
        component: SistemasRenderizadorComponent
      },
      {
        path: 'sgq-qualidade/:idAtividade',
        component: SistemasRenderizadorComponent
      },
      {
        path: 'sgq-steellog/:idAtividade',
        component: SistemasRenderizadorComponent
      },
      {
        path: 'tarifador/:idAtividade',
        component: SistemasRenderizadorComponent
      },
      {
        path: 'teletrend/:idAtividade',
        component: SistemasRenderizadorComponent
      },
      {
        path: 'top-desk/:idAtividade',
        component: SistemasRenderizadorComponent
      },
      {
        path: 'zabbix/:idAtividade',
        component: SistemasRenderizadorComponent
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
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
export class SistemasRoutingModule {}
