import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialCadastrosTitulosAgendaFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialCadastrosTitulosAgendaListaComponent } from './lista/lista.component';
import { ComercialCadastrosTitulosAgendaFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  {
    path: 'lista',
    component: ComercialCadastrosTitulosAgendaListaComponent,
  },
  {
    path: 'novo',
    component: ComercialCadastrosTitulosAgendaFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosTitulosAgendaFormularioResolverGuard,
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: 'editar/:id',
    component: ComercialCadastrosTitulosAgendaFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosTitulosAgendaFormularioResolverGuard,
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
export class ComercialCadastrosTitulosAgendaModuleRoutingModule {}
