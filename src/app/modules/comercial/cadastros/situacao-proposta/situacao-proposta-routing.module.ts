import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialCadastrosSituacaoPropostaFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialCadastrosSituacaoPropostaListaComponent } from './lista/lista.component';
import { ComercialCadastrosSituacaoPropostaFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  {
    path: 'lista',
    component: ComercialCadastrosSituacaoPropostaListaComponent,
  },
  {
    path: 'novo',
    component: ComercialCadastrosSituacaoPropostaFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosSituacaoPropostaFormularioResolverGuard,
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: 'editar/:id',
    component: ComercialCadastrosSituacaoPropostaFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosSituacaoPropostaFormularioResolverGuard,
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
export class ComercialCadastrosSituacaoPropostaModuleRoutingModule {}
