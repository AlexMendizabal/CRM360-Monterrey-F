import { TecnologiaInformacaoControleLinhaTermoResponsabilidadeResolverGuard } from './termo-responsabilidade/termo-responsabilidade-resolver.guard';
import { TecnologiaInformacaoControleLinhaTermoResponsabilidadeComponent } from './termo-responsabilidade/termo-responsabilidade.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { TecnologiaInformacaoControleLinhaFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { TecnologiaInformacaoControleLinhaListaComponent } from './lista/lista.component';
import { TecnologiaInformacaoControleLinhaFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  {
    path: 'lista',
    component: TecnologiaInformacaoControleLinhaListaComponent
  },
  {
    path: 'novo',
    component: TecnologiaInformacaoControleLinhaFormularioComponent,
    resolve: {
      detalhes: TecnologiaInformacaoControleLinhaFormularioResolverGuard
    },
    canDeactivate: [FormDeactivateGuard]
  },
  {
    path: 'editar/:id',
    component: TecnologiaInformacaoControleLinhaFormularioComponent,
    resolve: {
      detalhes: TecnologiaInformacaoControleLinhaFormularioResolverGuard
    },
    canDeactivate: [FormDeactivateGuard]
  },
  {
    path: 'termo/:id',
    component: TecnologiaInformacaoControleLinhaTermoResponsabilidadeComponent,
    resolve: {
      detalhes: TecnologiaInformacaoControleLinhaTermoResponsabilidadeResolverGuard
    }
  },

  {
    path: '',
    redirectTo: 'lista',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TecnologiaInformacaoControleLinhaRoutingModule {}
