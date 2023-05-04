import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialCadastrosAssociacaoLinhasFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialCadastrosAssociacaoLinhasListaComponent } from './lista/lista.component';
import { ComercialCadastrosAssociacaoLinhasFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  {
    path: 'lista',
    component: ComercialCadastrosAssociacaoLinhasListaComponent,
  },
  {
    path: 'novo',
    component: ComercialCadastrosAssociacaoLinhasFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosAssociacaoLinhasFormularioResolverGuard,
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: 'editar/:id',
    component: ComercialCadastrosAssociacaoLinhasFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosAssociacaoLinhasFormularioResolverGuard,
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
export class ComercialCadastrosAssociacaoLinhasRoutingModule {}
