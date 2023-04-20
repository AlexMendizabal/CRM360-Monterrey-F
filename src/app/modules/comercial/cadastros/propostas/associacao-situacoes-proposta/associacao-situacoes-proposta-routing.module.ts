import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialCadastrosPropostasAssociacaoSituacoesPropostaFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialCadastrosPropostasAssociacaoSituacoesPropostaListaComponent } from './lista/lista.component';
import { ComercialCadastrosPropostasAssociacaoSituacoesPropostaFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  {
    path: 'lista',
    component: ComercialCadastrosPropostasAssociacaoSituacoesPropostaListaComponent,
  },
  {
    path: 'novo',
    component: ComercialCadastrosPropostasAssociacaoSituacoesPropostaFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosPropostasAssociacaoSituacoesPropostaFormularioResolverGuard,
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: 'editar/:id',
    component: ComercialCadastrosPropostasAssociacaoSituacoesPropostaFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosPropostasAssociacaoSituacoesPropostaFormularioResolverGuard,
    },
    canDeactivate: [FormDeactivateGuard],
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
export class ComercialCadastrosPropostasAssociacaoSituacoesPropostaRoutingModule {}
