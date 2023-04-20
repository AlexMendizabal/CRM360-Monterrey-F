import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { ComercialLiberacoesDetalhesResolverGuard } from './detalhes/detalhes-resolver.guard';

//components
import { ComercialGestaoLiberacoesListaComponent } from './lista/lista.component';
import { ComercialGestaoLiberacoesDetalhesComponent } from './detalhes/detalhes.component';

const routes: Routes = [
  {
    path: 'lista',
    component: ComercialGestaoLiberacoesListaComponent,
  },
  {
    path: 'detalhes/:id/:empresa',
    component: ComercialGestaoLiberacoesDetalhesComponent,
    resolve: {
      detalhes: ComercialLiberacoesDetalhesResolverGuard,
    },
  },

  {
    path: '',
    redirectTo: 'lista',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComercialGestaoLiberacoesModuleRoutingModule {}
