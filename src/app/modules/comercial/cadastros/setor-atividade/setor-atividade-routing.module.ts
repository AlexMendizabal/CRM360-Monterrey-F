import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialCadastrosSetorAtividadeFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialCadastrosSetorAtividadeListaComponent } from './lista/lista.component';
import { ComercialCadastrosSetorAtividadeFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  {
    path: 'lista',
    component: ComercialCadastrosSetorAtividadeListaComponent,
  },
  {
    path: 'novo',
    component: ComercialCadastrosSetorAtividadeFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosSetorAtividadeFormularioResolverGuard,
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: 'editar/:id',
    component: ComercialCadastrosSetorAtividadeFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosSetorAtividadeFormularioResolverGuard,
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
export class ComercialCadastrosSetorAtividadeModuleRoutingModule {}
