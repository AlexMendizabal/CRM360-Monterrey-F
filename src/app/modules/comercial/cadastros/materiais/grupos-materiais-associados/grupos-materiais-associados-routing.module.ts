import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialCadastrosMateriaisGrupoMateriaisAssociadosFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialCadastrosMateriaisGrupoMateriaisAssociadosListaComponent } from './lista/lista.component';
import { ComercialCadastrosMateriaisGrupoMateriaisAssociadosFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  { path: 'lista', component: ComercialCadastrosMateriaisGrupoMateriaisAssociadosListaComponent },
  {
    path: 'novo',
    component: ComercialCadastrosMateriaisGrupoMateriaisAssociadosFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosMateriaisGrupoMateriaisAssociadosFormularioResolverGuard,
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: 'editar/:id',
    component: ComercialCadastrosMateriaisGrupoMateriaisAssociadosFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosMateriaisGrupoMateriaisAssociadosFormularioResolverGuard,
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
export class ComercialCadastrosMateriaisGrupoMateriaisAssociadosRoutingModule {}
