import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialCadastrosSetorAtividadeFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialCadastrosMateriaisFichaCadastralListaComponent } from './lista/lista.component';
import { ComercialCadastrosMateriaisFichaCadastralFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  {
    path: 'lista',
    component: ComercialCadastrosMateriaisFichaCadastralListaComponent,
  },
  {
    path: 'novo',
    component: ComercialCadastrosMateriaisFichaCadastralFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosSetorAtividadeFormularioResolverGuard,
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: 'editar/:id',
    component: ComercialCadastrosMateriaisFichaCadastralFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosSetorAtividadeFormularioResolverGuard,
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
export class ComercialCadastrosMateriaisFichaCadastralModuleRoutingModule {}
