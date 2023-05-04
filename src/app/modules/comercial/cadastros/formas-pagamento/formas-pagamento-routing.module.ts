import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialCadastrosFormasPagamentoFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialCadastrosFormasPagamentoListaComponent } from './lista/lista.component';
import { ComercialCadastrosFormasPagamentoFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  {
    path: 'lista',
    component: ComercialCadastrosFormasPagamentoListaComponent,
  },
  {
    path: 'novo',
    component: ComercialCadastrosFormasPagamentoFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosFormasPagamentoFormularioResolverGuard,
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: 'editar/:id',
    component: ComercialCadastrosFormasPagamentoFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosFormasPagamentoFormularioResolverGuard,
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
export class ComercialCadastrosFormasPagamentoModuleRoutingModule {}
