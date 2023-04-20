import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { PowerBiComponent } from './power-bi.component';
import { PowerBiHomeComponent } from './home/home.component';
import { PowerBiRenderizadorComponent } from './renderizador/renderizador.component';
import { PowerBiRenderizadorSubmoduloComponent } from './renderizador/submodulo/submodulo.component';
import { PowerBiRenderizadorAtividadeComponent } from './renderizador/atividade/atividade.component';
import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';

const routes: Routes = [
  {
    path: '',
    component: PowerBiComponent,
    children: [
      {
        path: 'home',
        component: PowerBiHomeComponent
      },
      {
        path: ':nomeModulo/:idSubModulo',
        component: PowerBiRenderizadorComponent,
        children: [
          {
            path: '',
            component: PowerBiRenderizadorSubmoduloComponent
          },
          {
            path: ':nomeAtividade/:idAtividade',
            component: PowerBiRenderizadorAtividadeComponent
          }
        ]
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
export class PowerBiRoutingModule { }
