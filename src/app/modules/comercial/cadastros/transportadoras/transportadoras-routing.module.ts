import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialCadastrosTransportadoraFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialCadastrosTransportadoraListaComponent } from './lista/lista.component';
import { ComercialCadastrosTransportadoraFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  { path: 'lista', component: ComercialCadastrosTransportadoraListaComponent },
  {
    path: 'novo',
    component: ComercialCadastrosTransportadoraFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosTransportadoraFormularioResolverGuard
    },
    canDeactivate: [FormDeactivateGuard]
  },
  {
    path: 'editar/:id',
    component: ComercialCadastrosTransportadoraFormularioComponent,
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
export class ComercialCadastrosTransportadoraRoutingModule {}
