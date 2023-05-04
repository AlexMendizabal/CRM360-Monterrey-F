import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialCadastrosTipoComissionamentoFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialCadastrosTipoComissionamentoListaComponent } from './lista/lista.component';
import { ComercialCadastrosTipoComissionamentoFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  { path: 'lista', component: ComercialCadastrosTipoComissionamentoListaComponent },
  {
    path: 'novo',
    component: ComercialCadastrosTipoComissionamentoFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosTipoComissionamentoFormularioResolverGuard
    },
    canDeactivate: [FormDeactivateGuard]
  },
  {
    path: 'editar/:id',
    component: ComercialCadastrosTipoComissionamentoFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosTipoComissionamentoFormularioResolverGuard
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
export class ComercialCadastrosTipoComissionamentoModuleRoutingModule {}
