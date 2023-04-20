import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialCadastrosOperadorComercialFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialCadastrosOperadorComercialListaComponent } from './lista/lista.component';
import { ComercialCadastrosOperadorComercialFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  {
    path: 'lista',
    component: ComercialCadastrosOperadorComercialListaComponent
  },
  {
    path: 'novo',
    component: ComercialCadastrosOperadorComercialFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosOperadorComercialFormularioResolverGuard
    },
    canDeactivate: [FormDeactivateGuard]
  },
  {
    path: 'editar/:id',
    component: ComercialCadastrosOperadorComercialFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosOperadorComercialFormularioResolverGuard
    },
    canDeactivate: [FormDeactivateGuard]
  },
  {
    path: '',
    redirectTo: 'lista',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComercialCadastrosOperadorComercialModuleRoutingModule {}
