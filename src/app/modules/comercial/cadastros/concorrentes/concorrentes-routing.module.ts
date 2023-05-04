import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialCadastrosTransportadoraFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialCadastrosConcorrenteListaComponent } from './lista/lista.component';
import { ComercialCadastrosConcorrenteFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  { path: 'lista', component: ComercialCadastrosConcorrenteListaComponent },
  {
    path: 'novo',
    component: ComercialCadastrosConcorrenteFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosTransportadoraFormularioResolverGuard
    },
    canDeactivate: [FormDeactivateGuard]
  },
  {
    path: 'editar/:id',
    component: ComercialCadastrosConcorrenteFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosTransportadoraFormularioResolverGuard
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
export class ComercialCadastrosConcorrenteRoutingModule {}
