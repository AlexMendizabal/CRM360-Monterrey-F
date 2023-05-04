import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialCadastrosCnaesFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialCadastrosCnaesListaComponent } from './lista/lista.component';
import { ComercialCadastrosCnaesFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  {
    path: 'lista',
    component: ComercialCadastrosCnaesListaComponent,
  },
  {
    path: 'novo',
    component: ComercialCadastrosCnaesFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosCnaesFormularioResolverGuard,
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: 'editar/:id',
    component: ComercialCadastrosCnaesFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosCnaesFormularioResolverGuard,
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
export class ComercialCadastrosCnaesRoutingModule {}
