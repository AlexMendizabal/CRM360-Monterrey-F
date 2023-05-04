import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialCadastrosTipoOperadorFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialCadastrosTipoOperadorListaComponent } from './lista/lista.component';
import { ComercialCadastrosTipoOperadorFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  { path: 'lista', component: ComercialCadastrosTipoOperadorListaComponent },
  {
    path: 'novo',
    component: ComercialCadastrosTipoOperadorFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosTipoOperadorFormularioResolverGuard
    },
    canDeactivate: [FormDeactivateGuard]
  },
  {
    path: 'editar/:id',
    component: ComercialCadastrosTipoOperadorFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosTipoOperadorFormularioResolverGuard
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
export class ComercialCadastrosTipoOperadorModuleRoutingModule {}
