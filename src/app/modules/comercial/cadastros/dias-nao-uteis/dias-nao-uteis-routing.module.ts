import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialCadastrosDiaNaoUtilFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialCadastrosDiaNaoUtilListaComponent } from './lista/lista.component';
import { ComercialCadastrosDiaNaoUtilFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  { path: 'lista', component: ComercialCadastrosDiaNaoUtilListaComponent },
  {
    path: 'novo',
    component: ComercialCadastrosDiaNaoUtilFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosDiaNaoUtilFormularioResolverGuard
    },
    canDeactivate: [FormDeactivateGuard]
  },
  {
    path: 'editar/:id',
    component: ComercialCadastrosDiaNaoUtilFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosDiaNaoUtilFormularioResolverGuard
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
export class ComercialCadastrosDiaNaoUtilModuleRoutingModule {}
