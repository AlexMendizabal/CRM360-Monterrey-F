import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialIntegracoesArcelorMittalVendedoresFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialIntegracoesArcelorMittalVendedoresListaComponent } from './lista/lista.component';
import { ComercialIntegracoesArcelorMittalVendedoresFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  {
    path: 'lista',
    component: ComercialIntegracoesArcelorMittalVendedoresListaComponent,
  },
  {
    path: 'novo',
    component: ComercialIntegracoesArcelorMittalVendedoresFormularioComponent,
    resolve: {
      detalhes: ComercialIntegracoesArcelorMittalVendedoresFormularioResolverGuard,
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: 'editar/:id',
    component: ComercialIntegracoesArcelorMittalVendedoresFormularioComponent,
    resolve: {
      detalhes: ComercialIntegracoesArcelorMittalVendedoresFormularioResolverGuard,
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
export class ComercialIntegracoesArcelorMittalVendedoresRoutingModule {}
