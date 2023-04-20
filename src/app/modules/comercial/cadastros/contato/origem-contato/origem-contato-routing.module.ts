import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialCadastrosContatoOrigemContatoFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialCadastrosContatoOrigemContatoListaComponent } from './lista/lista.component';
import { ComercialCadastrosContatoOrigemContatoFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  {
    path: 'lista',
    component: ComercialCadastrosContatoOrigemContatoListaComponent,
  },
  {
    path: 'novo',
    component: ComercialCadastrosContatoOrigemContatoFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosContatoOrigemContatoFormularioResolverGuard,
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: 'editar/:id',
    component: ComercialCadastrosContatoOrigemContatoFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosContatoOrigemContatoFormularioResolverGuard,
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
export class ComercialCadastrosContatoOrigemContatoRoutingModule {}
