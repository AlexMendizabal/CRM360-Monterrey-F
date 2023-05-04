import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialCadastrosMateriaisComboFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialCadastrosMateriaisComboListaComponent } from './lista/lista.component';
import { ComercialCadastrosMateriaisComboFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  { path: 'lista', component: ComercialCadastrosMateriaisComboListaComponent },
  {
    path: 'novo',
    component: ComercialCadastrosMateriaisComboFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosMateriaisComboFormularioResolverGuard,
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: 'editar/:id',
    component: ComercialCadastrosMateriaisComboFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosMateriaisComboFormularioResolverGuard,
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
export class ComercialCadastrosMateriaisComboRoutingModule {}
