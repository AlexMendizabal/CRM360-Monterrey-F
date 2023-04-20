import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialCadastrosEquipeVendaFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialCadastrosEquipeVendaListaComponent } from './lista/lista.component';
import { ComercialCadastrosEquipeVendaFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  { path: 'lista', component: ComercialCadastrosEquipeVendaListaComponent },
  {
    path: 'novo',
    component: ComercialCadastrosEquipeVendaFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosEquipeVendaFormularioResolverGuard
    },
    canDeactivate: [FormDeactivateGuard]
  },
  {
    path: 'editar/:id',
    component: ComercialCadastrosEquipeVendaFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosEquipeVendaFormularioResolverGuard
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
export class ComercialCadastrosEquipeVendaModuleRoutingModule {}
