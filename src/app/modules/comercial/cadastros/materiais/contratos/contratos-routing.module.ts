import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialCadastrosMateriaisContratoFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialCadastrosMateriaisContratoListaComponent } from './lista/lista.component';
import { ComercialCadastrosMateriaisContratoFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  { path: 'lista', component: ComercialCadastrosMateriaisContratoListaComponent },
  {
    path: 'novo',
    component: ComercialCadastrosMateriaisContratoFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosMateriaisContratoFormularioResolverGuard,
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: 'editar/:id',
    component: ComercialCadastrosMateriaisContratoFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosMateriaisContratoFormularioResolverGuard,
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
export class ComercialCadastrosMateriaisContratoRoutingModule {}
