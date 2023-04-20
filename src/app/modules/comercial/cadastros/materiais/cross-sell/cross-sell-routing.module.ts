import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialCadastrosMateriaisCrossSellFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialCadastrosMateriaisCrossSellListaComponent } from './lista/lista.component';
import { ComercialCadastrosMateriaisCrossSellFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  {
    path: 'lista',
    component: ComercialCadastrosMateriaisCrossSellListaComponent,
  },
  {
    path: 'novo',
    component: ComercialCadastrosMateriaisCrossSellFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosMateriaisCrossSellFormularioResolverGuard,
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: 'editar/:id',
    component: ComercialCadastrosMateriaisCrossSellFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosMateriaisCrossSellFormularioResolverGuard,
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
export class ComercialCadastrosMateriaisCrossSellRoutingModule {}
