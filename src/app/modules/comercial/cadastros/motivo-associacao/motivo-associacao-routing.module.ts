import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialCadastrosMotivoAssociacaoFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialCadastrosMotivoAssociacaoListaComponent } from './lista/lista.component';
import { ComercialCadastrosMotivoAssociacaoFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  {
    path: 'lista',
    component: ComercialCadastrosMotivoAssociacaoListaComponent
  },
  {
    path: 'novo',
    component: ComercialCadastrosMotivoAssociacaoFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosMotivoAssociacaoFormularioResolverGuard
    },
    canDeactivate: [FormDeactivateGuard]
  },
  {
    path: 'editar/:id',
    component: ComercialCadastrosMotivoAssociacaoFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosMotivoAssociacaoFormularioResolverGuard
    },
    canDeactivate: [FormDeactivateGuard]
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
export class ComercialCadastrosMotivoAssociacaoModuleRoutingModule {}
