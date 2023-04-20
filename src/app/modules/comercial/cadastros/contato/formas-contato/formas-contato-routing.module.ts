import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialCadastrosContatoFormasContatoFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialCadastrosContatoFormasContatoListaComponent } from './lista/lista.component';
import { ComercialCadastrosContatoFormasContatoFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  {
    path: 'lista',
    component: ComercialCadastrosContatoFormasContatoListaComponent,
  },
  {
    path: 'novo',
    component: ComercialCadastrosContatoFormasContatoFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosContatoFormasContatoFormularioResolverGuard,
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: 'editar/:id',
    component: ComercialCadastrosContatoFormasContatoFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosContatoFormasContatoFormularioResolverGuard,
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
export class ComercialCadastrosContatoFormasContatoRoutingModule {}
