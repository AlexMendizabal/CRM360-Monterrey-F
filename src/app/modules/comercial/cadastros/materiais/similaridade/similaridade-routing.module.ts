import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialCadastrosMateriaisSimilaridadeFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialCadastrosMateriaisSimilaridadeListaComponent } from './lista/lista.component';
import { ComercialCadastrosMateriaisSimilaridadeFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  {
    path: 'lista',
    component: ComercialCadastrosMateriaisSimilaridadeListaComponent,
  },
  {
    path: 'novo',
    component: ComercialCadastrosMateriaisSimilaridadeFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosMateriaisSimilaridadeFormularioResolverGuard,
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: 'editar/:id',
    component: ComercialCadastrosMateriaisSimilaridadeFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosMateriaisSimilaridadeFormularioResolverGuard,
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
export class ComercialCadastrosMateriaisSimilaridadeRoutingModule {}
