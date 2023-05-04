import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialCadastrosMateriaisGrupoFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialCadastrosMateriaisGrupoListaComponent } from './lista/lista.component';
import { ComercialCadastrosMateriaisGrupoFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  { path: 'lista', component: ComercialCadastrosMateriaisGrupoListaComponent },
  {
    path: 'novo',
    component: ComercialCadastrosMateriaisGrupoFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosMateriaisGrupoFormularioResolverGuard,
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: 'editar/:id',
    component: ComercialCadastrosMateriaisGrupoFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosMateriaisGrupoFormularioResolverGuard,
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
export class ComercialCadastrosMateriaisGrupoRoutingModule {}
