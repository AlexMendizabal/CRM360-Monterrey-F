import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialCadastrosContratosComerciaisSituacoesContratosComerciaisFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialCadastrosContratosComerciaisSituacoesContratosComerciaisListaComponent } from './lista/lista.component';
import { ComercialCadastrosContratosComerciaisSituacoesContratosComerciaisFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  {
    path: 'lista',
    component: ComercialCadastrosContratosComerciaisSituacoesContratosComerciaisListaComponent,
  },
  {
    path: 'novo',
    component: ComercialCadastrosContratosComerciaisSituacoesContratosComerciaisFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosContratosComerciaisSituacoesContratosComerciaisFormularioResolverGuard,
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: 'editar/:id',
    component: ComercialCadastrosContratosComerciaisSituacoesContratosComerciaisFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosContratosComerciaisSituacoesContratosComerciaisFormularioResolverGuard,
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
export class ComercialCadastrosContratosComerciaisSituacoesContratosComerciaisRoutingModule {}
