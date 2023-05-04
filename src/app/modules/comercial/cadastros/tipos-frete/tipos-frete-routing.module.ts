import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialCadastrosTiposFreteFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialCadastrosTiposFreteListaComponent } from './lista/lista.component';
import { ComercialCadastrosTiposFreteFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  {
    path: 'lista',
    component: ComercialCadastrosTiposFreteListaComponent,
  },
  {
    path: 'novo',
    component: ComercialCadastrosTiposFreteFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosTiposFreteFormularioResolverGuard,
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: 'editar/:id',
    component: ComercialCadastrosTiposFreteFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosTiposFreteFormularioResolverGuard,
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
export class ComercialCadastrosTiposFreteModuleRoutingModule {}
